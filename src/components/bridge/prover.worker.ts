/// <reference lib="webworker" />

import {
  commitmentOf,
  contextFor,
  deriveNote,
  proveWithdrawal,
  rootOf,
  withdrawalFor,
  witnessFor,
  type Groth16,
  type WithdrawProof,
} from "@arcveil/bridge";

/**
 * Builds a withdrawal proof, off the main thread.
 *
 * It runs here for two reasons. Proving pins a core for a couple of seconds,
 * which would freeze the page; and snarkjs keeps worker threads alive after it
 * finishes, so the only clean way to reclaim them is to terminate the worker
 * that owns them.
 *
 * Nothing secret is posted back. The message out carries the proof, the eight
 * public signals and how long it took — the same things a relayer receives.
 */

export type ProverRequest = {
  /** The veil-key signature, or a demonstration seed. Never leaves this worker. */
  readonly seed: `0x${string}`;
  readonly existingValue: string;
  readonly withdrawnValue: string;
  readonly recipient: `0x${string}`;
  readonly entrypoint: `0x${string}`;
  readonly scope: string;
};

export type ProverMessage =
  | { readonly kind: "progress"; readonly stage: string; readonly loaded?: number; readonly total?: number }
  | { readonly kind: "done"; readonly proof: readonly string[][]; readonly signals: readonly string[]; readonly ms: number }
  | { readonly kind: "error"; readonly message: string };

const post = (message: ProverMessage) => (self as unknown as Worker).postMessage(message);

/** Streams a file so a 17 MB download can show progress instead of appearing hung. */
async function load(url: string, stage: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${stage}: ${response.status}. Run \`pnpm veil:artifacts\`.`);

  const total = Number(response.headers.get("content-length") ?? 0);
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array(await response.arrayBuffer());

  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    post({ kind: "progress", stage, loaded, total });
  }

  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

/**
 * A pool with a handful of deposits in it, one of which is ours.
 *
 * This is a demonstration, and it is labelled as one on the page: no pool is
 * deployed yet, so there is no real tree to prove against. Every other part is
 * real — the real circuit, the real ceremony key, the real context binding —
 * so what this measures is what a real withdrawal will cost.
 */
function demoSpend(request: ProverRequest) {
  const note = deriveNote(request.seed, 0);
  const change = deriveNote(request.seed, 1);

  const label = 0x3333333333333333n;
  const existingValue = BigInt(request.existingValue);
  const commitment = commitmentOf(existingValue, label, note.precommitment);

  const stateLeaves = [111n, commitment, 222n, 333n];
  const aspLeaves = [999n, label, 888n];

  const withdrawal = withdrawalFor(request.entrypoint, {
    recipient: request.recipient,
    feeRecipient: request.recipient,
    relayFeeBPS: 25n,
  });

  return {
    note,
    change,
    label,
    existingValue,
    withdrawnValue: BigInt(request.withdrawnValue),
    stateWitness: witnessFor(stateLeaves, commitment),
    aspWitness: witnessFor(aspLeaves, label),
    context: contextFor(withdrawal, BigInt(request.scope)),
    poolSize: stateLeaves.length,
    root: rootOf(stateLeaves),
  };
}

const asStrings = (proof: WithdrawProof): readonly string[][] => [
  proof.pA.map(String),
  proof.pB[0].map(String),
  proof.pB[1].map(String),
  proof.pC.map(String),
];

self.addEventListener("message", (event: MessageEvent<ProverRequest>) => {
  void (async () => {
    try {
      post({ kind: "progress", stage: "witness generator" });
      const wasm = await load("/veil/withdraw.wasm", "witness generator");

      post({ kind: "progress", stage: "proving key" });
      const zkey = await load("/veil/withdraw.zkey", "proving key");

      post({ kind: "progress", stage: "proving" });
      const { groth16 } = (await import("snarkjs")) as unknown as { groth16: Groth16 };

      const started = performance.now();
      const proof = await proveWithdrawal(demoSpend(event.data), { wasm, zkey }, groth16);
      const ms = Math.round(performance.now() - started);

      post({ kind: "done", proof: asStrings(proof), signals: proof.pubSignals.map(String), ms });
    } catch (error) {
      post({ kind: "error", message: error instanceof Error ? error.message : "Proving failed." });
    }
  })();
});
