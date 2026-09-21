"use client";

import { commitmentOf, deriveNote, poolState, type OwnedDeposit } from "@arcveil/bridge";
import { useEffect, useRef, useState } from "react";

import { FigureLabel } from "@/components/ui/FigureLabel";
import { PROVING_COPY } from "@/data/bridge";
import { planSpend } from "@/lib/spend";
import { shortField } from "@/lib/veil";
import type { ProverMessage, ProverRequest } from "./prover.worker";

/**
 * Builds a real withdrawal proof in the browser, against the real ceremony key.
 *
 * The pool it proves against is a demonstration — nothing is deployed, so
 * there is no live tree — and the panel says so under the result. What is not
 * a demonstration: the circuit, the 17 MB proving key from the Privacy Pools
 * trusted setup, the context binding, the code path, and the time it takes. A
 * proof from this same path is checked against the deployed verifier in
 * `contracts/test/WithdrawalProof.t.sol`.
 */

const SIGNAL_NAMES = [
  "newCommitmentHash",
  "existingNullifierHash",
  "withdrawnValue",
  "stateRoot",
  "stateTreeDepth",
  "ASPRoot",
  "ASPTreeDepth",
  "context",
] as const;

/** A four-deposit pool with one of them ours, built the same way a real one is read. */
function demoPlan() {
  const seed = `0x${"ab".repeat(65)}` as const;
  const note = deriveNote(seed, 0);
  const label = 0x3333333333333333n;
  const value = 25_000_000n;
  const commitment = commitmentOf(value, label, note.precommitment);

  const deposits = [
    { commitment: 111n, label: 10n, value: 1n, precommitment: 1n, blockNumber: 1n, logIndex: 0 },
    { commitment, label, value, precommitment: note.precommitment, blockNumber: 2n, logIndex: 0 },
    { commitment: 222n, label: 20n, value: 1n, precommitment: 2n, blockNumber: 3n, logIndex: 0 },
    { commitment: 333n, label: 30n, value: 1n, precommitment: 3n, blockNumber: 4n, logIndex: 0 },
  ];

  const state = poolState(
    deposits,
    deposits.map((deposit, index) => ({ index: BigInt(index + 1), leaf: deposit.commitment })),
  );
  const owned: OwnedDeposit = { note, deposit: state.deposits[1]! };

  return planSpend(
    state,
    owned,
    10_000_000n,
    {
      entrypoint: "0x00000000000000000000000000000000000000c3",
      recipient: "0x00000000000000000000000000000000000000A1",
      feeRecipient: "0x00000000000000000000000000000000000000b2",
      relayFeeBPS: 25n,
      scope: 777n,
    },
    seed,
    1,
  );
}

type State =
  | { kind: "idle" }
  | { kind: "working"; stage: string; loaded?: number; total?: number }
  | { kind: "done"; signals: readonly string[]; ms: number }
  | { kind: "error"; message: string };

const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

export function ProvePanel() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const worker = useRef<Worker | null>(null);

  useEffect(() => () => worker.current?.terminate(), []);

  const prove = () => {
    worker.current?.terminate();
    setState({ kind: "working", stage: "starting" });

    const created = new Worker(new URL("./prover.worker.ts", import.meta.url), { type: "module" });
    worker.current = created;

    created.addEventListener("message", (event: MessageEvent<ProverMessage>) => {
      const message = event.data;
      if (message.kind === "progress") {
        setState({ kind: "working", stage: message.stage, loaded: message.loaded, total: message.total });
        return;
      }
      if (message.kind === "done") setState({ kind: "done", signals: message.proof.pubSignals, ms: message.ms });
      else setState({ kind: "error", message: message.message });

      // snarkjs leaves threads running; terminating is the only way back.
      created.terminate();
      worker.current = null;
    });

    const request: ProverRequest = { payload: demoPlan().payload };
    created.postMessage(request);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <FigureLabel n={3} />
      <div className="text-xl lg:text-h3-title">{PROVING_COPY.title}</div>
      <p className="text-sm leading-140 text-fg-muted">{PROVING_COPY.body}</p>

      <button
        type="button"
        onClick={prove}
        disabled={state.kind === "working"}
        className="label w-fit border border-border bg-fg/5 px-4 py-2 text-fg transition-colors hover:bg-fg/10 disabled:cursor-not-allowed disabled:text-fg-subtle"
      >
        {state.kind === "working" ? "Proving…" : "Build a proof here"}
      </button>

      {state.kind === "working" && (
        <div className="flex flex-col gap-1">
          <span className="label-2xs text-fg-subtle">{state.stage}</span>
          {state.total !== undefined && state.total > 0 && (
            <>
              <div className="h-px w-full bg-fg/10">
                <div
                  className="h-px bg-accent transition-[width]"
                  style={{ width: `${Math.round(((state.loaded ?? 0) / state.total) * 100)}%` }}
                />
              </div>
              <span className="text-2xs text-fg-faint">
                {megabytes(state.loaded ?? 0)} of {megabytes(state.total)}
              </span>
            </>
          )}
        </div>
      )}

      {state.kind === "error" && <p className="text-xs leading-140 text-chart-5">{state.message}</p>}

      {state.kind === "done" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-accent">
            Proved in {state.ms} ms. These eight numbers are everything the relayer receives.
          </p>
          <dl className="flex flex-col border border-border">
            {state.signals.map((signal, index) => (
              <div
                key={SIGNAL_NAMES[index]}
                className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0"
              >
                <dt className="label-2xs text-fg-subtle">{SIGNAL_NAMES[index]}</dt>
                <dd className="font-mono text-2xs text-fg-muted">
                  {index === 2 || index === 4 || index === 6 ? signal : shortField(BigInt(signal))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-2xs leading-140 text-fg-faint">
            No deposit is named here, and none can be recovered from it. The pool proved against is a demonstration —
            nothing is deployed yet — but the circuit, the proving key and the binding are the real ones.
          </p>
        </div>
      )}
    </div>
  );
}
