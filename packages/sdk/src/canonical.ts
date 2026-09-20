import { bytesToHex } from "./hex";
import type { Hex, Proof, Receipt, ReceiptDraft, UnsignedProof } from "./types";

/**
 * Deterministic JSON: object keys sorted, no whitespace, no lossy values.
 * Two parties must serialise the same body to the same bytes, or no hash agrees.
 */
export function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Cannot canonicalize a non-finite number: ${value}`);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
  }
  throw new Error(`Cannot canonicalize a value of type ${typeof value}`);
}

/** Strips the evidence so the hash covers the claim, not the signature over it. */
const stripEvidence = (proof: Proof | UnsignedProof): UnsignedProof =>
  proof.type === "attestation" ? { type: "attestation", signer: proof.signer } : { type: "zk", system: proof.system };

export const receiptBody = (input: Receipt | ReceiptDraft) => ({
  v: input.v,
  chain: input.chain,
  account: input.account,
  mandate: input.mandate,
  agent: input.agent,
  action: input.action,
  checks: input.checks,
  // Omitted rather than nulled when absent, so a receipt with no semantic
  // clauses serialises to exactly the bytes it did before judges existed.
  ...(input.judge === undefined ? {} : { judge: input.judge }),
  counter: input.counter,
  proof: stripEvidence(input.proof),
});

export const canonicalBytes = (input: Receipt | ReceiptDraft): Uint8Array =>
  new TextEncoder().encode(canonicalize(receiptBody(input)));

export async function computeReceiptId(input: Receipt | ReceiptDraft): Promise<Hex> {
  const digest = await crypto.subtle.digest("SHA-256", canonicalBytes(input) as BufferSource);
  return bytesToHex(new Uint8Array(digest));
}
