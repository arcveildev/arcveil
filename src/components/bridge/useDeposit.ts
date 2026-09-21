"use client";

import { approveCall, burnCall, deriveNote, fetchAttestations, type CctpRoute } from "@arcveil/bridge";
import { useCallback, useState } from "react";
import { useConfig } from "wagmi";
import { sendTransaction, waitForTransactionReceipt } from "wagmi/actions";

import { deliverDeposit } from "@/lib/relayClient";
import type { VeilConfig } from "@/lib/veilConfig";

/**
 * A deposit, end to end.
 *
 * Approve, burn, wait for Circle, hand the attestation to the relayer. Four
 * steps, each of which can fail on its own, so each is named — a bridge that
 * says "something went wrong" after taking 25 USDC is not a bridge anyone
 * should use twice.
 *
 * The burn is signed by the depositor's own wallet on the source chain. The
 * delivery is not: on Arc gas is USDC, and the depositor has none there yet —
 * that is the whole reason the relayer exists.
 */

export type DepositStage = "idle" | "approving" | "burning" | "attesting" | "delivering" | "done";

export type DepositState = {
  readonly stage: DepositStage;
  readonly burnHash: `0x${string}` | null;
  readonly deliveryHash: `0x${string}` | null;
  readonly error: string | null;
  /** How long Circle has been asked, so a slow attestation looks like waiting rather than hanging. */
  readonly polls: number;
};

const IDLE: DepositState = { stage: "idle", burnHash: null, deliveryHash: null, error: null, polls: 0 };

/** Standard-finality transfers are free and take minutes, not seconds. */
const POLL_INTERVAL_MS = 6_000;
const POLL_LIMIT = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type DepositRequest = {
  readonly route: CctpRoute;
  readonly amount: bigint;
  readonly signature: `0x${string}`;
  readonly noteIndex: number;
  /** Where the USDC goes if the deposit cannot be made — an address on Arc. */
  readonly refund: `0x${string}`;
};

export function useDeposit(config: VeilConfig | null) {
  const wagmi = useConfig();
  const [state, setState] = useState<DepositState>(IDLE);

  const reset = useCallback(() => setState(IDLE), []);

  const run = useCallback(
    async (request: DepositRequest) => {
      if (!config) return;

      const note = deriveNote(request.signature, request.noteIndex);
      const fail = (error: string) => setState((current) => ({ ...current, stage: "idle", error }));

      try {
        setState({ ...IDLE, stage: "approving" });
        const approve = approveCall({ route: request.route, amount: request.amount });
        const approveHash = await sendTransaction(wagmi, {
          chainId: request.route.chainId,
          to: approve.to,
          data: approve.data,
        });
        await waitForTransactionReceipt(wagmi, { chainId: request.route.chainId, hash: approveHash });

        setState((current) => ({ ...current, stage: "burning" }));
        const burn = burnCall({
          route: request.route,
          amount: request.amount,
          gateway: config.gateway,
          hook: { precommitment: note.precommitment, refund: request.refund },
        });
        const burnHash = await sendTransaction(wagmi, {
          chainId: request.route.chainId,
          to: burn.to,
          data: burn.data,
        });
        await waitForTransactionReceipt(wagmi, { chainId: request.route.chainId, hash: burnHash });

        setState((current) => ({ ...current, stage: "attesting", burnHash }));

        // Circle indexes the burn, then attests it. Both take a while, and
        // "not found" simply means it has not been indexed yet.
        let attestation: { message: `0x${string}`; attestation: `0x${string}` } | undefined;
        for (let poll = 0; poll < POLL_LIMIT && !attestation; poll += 1) {
          setState((current) => ({ ...current, polls: poll + 1 }));
          const [signed] = await fetchAttestations(request.route, burnHash, (url) => fetch(url));
          if (signed) attestation = { message: signed.message, attestation: signed.attestation };
          else await sleep(POLL_INTERVAL_MS);
        }

        if (!attestation) {
          fail("Circle has not attested this burn yet. The USDC is safe; reload and it can be delivered later.");
          return;
        }

        setState((current) => ({ ...current, stage: "delivering" }));
        const { hash } = await deliverDeposit(config.relayer, attestation.message, attestation.attestation);

        setState((current) => ({ ...current, stage: "done", deliveryHash: hash }));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "The deposit could not be completed.";
        fail(/reject|denied/i.test(message) ? "Transaction refused in the wallet." : message);
      }
    },
    [config, wagmi],
  );

  return { state, run, reset };
}
