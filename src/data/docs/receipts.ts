/**
 * Copy for /docs/receipts — receipt format v1.
 * Field types here are the ones src/schema.ts enforces; if the schema changes,
 * this table is wrong before anything else is.
 */
export const RECEIPTS_PAGE = {
  label: "Format",
  title: "Receipt.",
  tagline: "One hash, a chain of commitments, and nothing you can read off it.",
  lede:
    "A receipt is what one settled action leaves behind. It proves the action stayed inside the account holder's mandate without revealing the mandate, the balances, or the reasoning. No amount, asset or balance appears anywhere in it — the check names are public, their thresholds are not.",
} as const;

export const FIELD_ROWS = [
  { key: "v", value: "1 — the only version this schema accepts.", code: true },
  { key: "id", value: "sha256 of the canonical body. 32 bytes.", code: true },
  { key: "chain", value: "Chain the action settled on. 5042 is Arc mainnet.", code: true },
  { key: "account", value: "The smart account that acted. Public on chain anyway.", code: true },
  {
    key: "mandate.commitment",
    value: "32-byte hash of the mandate terms. The terms themselves never leave the holder.",
    code: true,
  },
  {
    key: "mandate.epoch",
    value: "Which registration of that mandate. An epoch can be revoked, never overwritten.",
    code: true,
  },
  { key: "agent.id", value: "32 bytes identifying the agent.", code: true },
  { key: "agent.session", value: "16 bytes scoping one run, so two sessions never merge.", code: true },
  {
    key: "agent.vision",
    value: '"relative-only" or "absolute" — whether the model was given real numbers.',
    code: true,
  },
  { key: "action.kind", value: '"transfer", "swap" or "approve".', code: true },
  { key: "action.userOpHash", value: "The user operation this receipt covers. 32 bytes.", code: true },
  { key: "action.settledTx", value: "The transaction it settled in. 32 bytes.", code: true },
  { key: "action.at", value: "ISO 8601 timestamp, UTC.", code: true },
  {
    key: "checks",
    value: "Names of the policy clauses that ran — asset_allowlist, per_action_cap, and so on. Names only.",
    code: true,
  },
  {
    key: "judge",
    value:
      'Present only when some of those checks were semantic — answered by a model rather than by arithmetic. { model, commitment }: who answered, and a commitment binding the clauses and thresholds they were held to. Optional, and a receipt without it hashes to exactly the bytes it did before judges existed.',
    code: true,
  },
  {
    key: "counter.prev / next",
    value: "Budget commitments before and after this action. Consecutive receipts must join.",
    code: true,
  },
  {
    key: "proof",
    value: 'Discriminated union: { type: "attestation", signer, signature } today, { type: "zk", system, data } in v1.',
    code: true,
  },
] as const;

export const SAMPLE = `
{
  "v": 1,
  "chain": 5042,
  "account": "0x96b698308B01473E3A0041634b01f652c4608C2A",
  "mandate": {
    "commitment": "0x378571c07a6295730f1f0a120a955f27770e8c591b6cce7d58b9048192caf4f2",
    "epoch": 1
  },
  "agent": {
    "id": "0xa7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7",
    "session": "0x22222222222222222222222222222222",
    "vision": "relative-only"
  },
  "action": {
    "kind": "swap",
    "userOpHash": "0x7171717171717171717171717171717171717171717171717171717171717171",
    "settledTx": "0x0dde838b393db26421538a9f60129c7c6aa6981fc147b60bfeca51056ce5950e",
    "at": "2026-09-13T21:14:02.000Z"
  },
  "checks": ["asset_allowlist", "per_action_cap", "window_spend", "active_hours", "killswitch_clear"],
  "counter": {
    "prev": "0xcfb1186141e6367d9ef3ab41b5c8aa7eda456da2d947a4806f6fd295b68af2fc",
    "next": "0x882c8a044982210fc414db35aca8ee4811a9a8b65277669bdc22c1265a43220e"
  },
  "proof": {
    "type": "attestation",
    "signer": "0x0411223cd026c5ba53886fc969a4ee7b6c29af4bf17e4d26e5ec8d389410261a8a054ba9faa9c0aee7d9973a6c705bae640600966f6ae7406625d4da5ab50867db",
    "signature": "0xf5a29c862b05ee312699f8a8e59e6160bdfcac01dfe9878378495ef69dc905c5e7cc5da0a2b904921b8f141cd40819c9a88abcd15c19833ad6e15970c4277ffe"
  },
  "id": "0x47b0c8d67600d307103f50eecd386f854c48d353648c503f1c2651895257f3a1"
}
`;

export const CANONICAL_RULES = [
  "Object keys sorted, no whitespace, no non-finite numbers.",
  "The body excludes id itself — a hash cannot cover its own value.",
  "The body excludes the proof evidence: signature for an attestation, data for a zk proof.",
  "It keeps the rest of the proof, so a receipt cannot be re-signed by a different signer and still hash the same.",
] as const;

export const CANONICAL_SNIPPET = `
import { canonicalize, computeReceiptId, receiptBody } from "@arcveildev/sdk";

canonicalize(receiptBody(receipt)); // the exact bytes that get hashed
await computeReceiptId(receipt); // must equal receipt.id
`;

export const COUNTER_SNIPPET = `
// keccak256(previous ++ actionHash ++ spendCommitment)
nextCounter(previous, userOpHash, spendCommitment?);
`;

export const PROOF_ROWS = [
  {
    key: "signer",
    value: "65 bytes: the uncompressed P-256 public key of the policy signer. In production the private half never leaves the enclave.",
    code: true,
  },
  { key: "signature", value: "64 raw bytes, r ‖ s. ECDSA P-256 over the canonical body, SHA-256.", code: true },
  {
    key: "system",
    value: "zk proofs only: names the proving system. The in-browser verifier for these ships with v1, so the signature check reports unknown until then.",
    code: true,
  },
] as const;
