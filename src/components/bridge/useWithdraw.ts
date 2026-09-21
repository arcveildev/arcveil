"use client";

import type { OwnedDeposit, PoolState } from "@arcveil/bridge";
import { useCallback, useEffect, useRef, useState } from "react";

import { getQuote, submitWithdrawal } from "@/lib/relayClient";
import { planSpend, type SpendPlan } from "@/lib/spend";
import type { VeilConfig } from "@/lib/veilConfig";
import type { ProverMessage, ProverRequest } from "./prover.worker";

/**
 * A withdrawal, end to end.
 *
 * Ask the relayer its terms, build the proof against them here, hand back the
 * proof. The terms are hashed into the proof, so a relayer that then changes
 * the recipient or raises its fee produces something the pool refuses — which
 * is what makes it safe to hand the proof to a stranger.
 *
 * The proving key is 17 MB and the proof takes seconds, so both happen in a
 * worker. It is terminated afterwards: snarkjs leaves its threads running, and
 * the only way to reclaim them is to end the worker that owns them.
 */

export type WithdrawStage = "idle" | "quoting" | "loading" | "proving" | "submitting" | "done";

export type WithdrawState = {
  readonly stage: WithdrawStage;
  readonly plan: SpendPlan | null;
  readonly stageLabel: string;
  readonly loaded: number;
  readonly total: number;
  readonly provedMs: number | null;
  readonly hash: `0x${string}` | null;
  readonly error: string | null;
};

const IDLE: WithdrawState = {
  stage: "idle",
  plan: null,
  stageLabel: "",
  loaded: 0,
  total: 0,
  provedMs: null,
  hash: null,
  error: null,
};

export type WithdrawRequest = {
  readonly state: PoolState;
  readonly owned: OwnedDeposit;
  readonly amount: bigint;
  readonly recipient: `0x${string}`;
  readonly signature: `0x${string}`;
  readonly changeIndex: number;
};

export function useWithdraw(config: VeilConfig | null) {
  const [state, setState] = useState<WithdrawState>(IDLE);
  const worker = useRef<Worker | null>(null);

  useEffect(
    () => () => {
      worker.current?.terminate();
      worker.current = null;
    },
    [],
  );

  const reset = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
    setState(IDLE);
  }, []);

  const run = useCallback(
    async (request: WithdrawRequest) => {
      if (!config) return;
      const fail = (error: string) => setState((current) => ({ ...current, stage: "idle", error }));

      try {
        setState({ ...IDLE, stage: "quoting" });

        // The fee is part of what the proof commits to, so it has to be known
        // before the proof exists, not after.
        const quote = await getQuote(config.relayer);
        const relayFeeBPS = BigInt(quote.minFeeBPS);

        const plan = planSpend(
          request.state,
          request.owned,
          request.amount,
          {
            entrypoint: quote.entrypoint,
            recipient: request.recipient,
            feeRecipient: quote.feeRecipient,
            relayFeeBPS,
            scope: BigInt(quote.scope),
          },
          request.signature,
          request.changeIndex,
        );

        setState((current) => ({ ...current, stage: "loading", plan }));

        const proof = await new Promise<ProverMessage & { kind: "done" }>((resolve, reject) => {
          worker.current?.terminate();
          const created = new Worker(new URL("./prover.worker.ts", import.meta.url), { type: "module" });
          worker.current = created;

          created.addEventListener("message", (event: MessageEvent<ProverMessage>) => {
            const message = event.data;
            if (message.kind === "progress") {
              setState((current) => ({
                ...current,
                stage: message.stage === "proving" ? "proving" : "loading",
                stageLabel: message.stage,
                loaded: message.loaded ?? 0,
                total: message.total ?? 0,
              }));
              return;
            }

            created.terminate();
            worker.current = null;
            if (message.kind === "done") resolve(message);
            else reject(new Error(message.message));
          });

          const payload: ProverRequest = { payload: plan.payload };
          created.postMessage(payload);
        });

        setState((current) => ({ ...current, stage: "submitting", provedMs: proof.ms }));

        const { hash } = await submitWithdrawal(config.relayer, {
          recipient: request.recipient,
          relayFeeBPS: relayFeeBPS.toString(),
          proof: proof.proof,
        });

        setState((current) => ({ ...current, stage: "done", hash }));
      } catch (cause) {
        fail(cause instanceof Error ? cause.message : "The withdrawal could not be completed.");
      }
    },
    [config],
  );

  return { state, run, reset };
}
