/// <reference lib="webworker" />

import { proveWithdrawal, type Groth16, type WithdrawProof } from "@arcveil/bridge";

import { spendFromPayload, type SpendPayload } from "@/lib/spend";

/**
 * Builds a withdrawal proof, off the main thread.
 *
 * It runs here for two reasons. Proving pins a core for a couple of seconds,
 * which would freeze the page; and snarkjs keeps worker threads alive after it
 * finishes, so the only clean way to reclaim them is to terminate the worker
 * that owns them.
 *
 * The plan arrives already assembled — which leaf, which siblings, which
 * context — so this file cannot get any of that wrong. It deserialises, proves,
 * and posts back the proof and the eight public signals: exactly what the
 * relayer receives, and nothing that names a deposit.
 *
 * The veil-key signature reaches this worker and stops here.
 */

export type ProverRequest = { readonly payload: SpendPayload };

export type ProverMessage =
  | { readonly kind: "progress"; readonly stage: string; readonly loaded?: number; readonly total?: number }
  | {
      readonly kind: "done";
      readonly proof: { pA: string[]; pB: string[][]; pC: string[]; pubSignals: string[] };
      readonly ms: number;
    }
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

const serialise = (proof: WithdrawProof) => ({
  pA: proof.pA.map(String),
  pB: proof.pB.map((pair) => pair.map(String)),
  pC: proof.pC.map(String),
  pubSignals: proof.pubSignals.map(String),
});

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
      const proof = await proveWithdrawal(spendFromPayload(event.data.payload), { wasm, zkey }, groth16);

      post({ kind: "done", proof: serialise(proof), ms: Math.round(performance.now() - started) });
    } catch (error) {
      post({ kind: "error", message: error instanceof Error ? error.message : "Proving failed." });
    }
  })();
});
