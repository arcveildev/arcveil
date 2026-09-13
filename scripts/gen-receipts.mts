/**
 * Regenerates the sample receipts served by /verify.
 *   pnpm gen:receipts
 * A fresh signing key is generated on every run and thrown away: only the public
 * key and the signatures are written, so no private material lands in the repo.
 */
import { writeFileSync } from "node:fs";
import { issueReceipt, generateSigner } from "../src/lib/receipt/sign";
import type { ChainState } from "../src/lib/receipt/chain";
import type { Hex, Receipt, ReceiptDraft } from "../src/lib/receipt/types";

const OUT = new URL("../src/data/sample-receipts.json", import.meta.url);

const b = (value: string, bytes: number): Hex => `0x${value.repeat(bytes)}`;

const ACCOUNT = b("8f", 20);
const MANDATE = b("4d", 32);
const ANCHOR = b("0c", 32);

const signer = await generateSigner();

const draft = (overrides: Partial<ReceiptDraft>): ReceiptDraft => ({
  v: 1,
  chain: 4663,
  account: ACCOUNT,
  mandate: { commitment: MANDATE, epoch: 7 },
  agent: { id: b("a7", 32), session: b("22", 16), vision: "relative-only" },
  action: { kind: "swap", userOpHash: b("71", 32), settledTx: b("be", 32), at: "2026-09-13T21:14:02.000Z" },
  checks: ["asset_allowlist", "per_action_cap", "window_spend", "active_hours", "killswitch_clear"],
  counter: { prev: ANCHOR, next: b("7e", 32) },
  proof: { type: "attestation", signer: signer.publicKey },
  ...overrides,
});

const issue = (overrides: Partial<ReceiptDraft>) => issueReceipt(draft(overrides), signer.privateKey);

const first = await issue({});
const second = await issue({
  action: { kind: "transfer", userOpHash: b("72", 32), settledTx: b("bf", 32), at: "2026-09-13T23:02:11.000Z" },
  counter: { prev: first.counter.next, next: b("91", 32) },
});
const orphan = await issue({
  action: { kind: "transfer", userOpHash: b("73", 32), settledTx: b("bf", 32), at: "2026-09-13T23:02:11.000Z" },
  counter: { prev: b("cd", 32), next: b("91", 32) },
});
const pending = await issue({
  action: { kind: "approve", userOpHash: b("74", 32), settledTx: b("c0", 32), at: "2026-09-14T01:40:00.000Z" },
  counter: { prev: first.counter.next, next: b("92", 32) },
});
const clean = await issue({});
/** Edited after issuing: the body no longer hashes to its id, and the signature no longer covers it. */
const tampered: Receipt = { ...clean, action: { ...clean.action, kind: "transfer" } };

const chainState: ChainState = {
  mandates: [{ account: ACCOUNT, commitment: MANDATE, epoch: 7, revoked: false }],
  transactions: { [b("be", 32)]: { status: "success" }, [b("bf", 32)]: { status: "success" } },
  anchors: [ANCHOR, first.counter.next],
};

const samples = [
  { id: "clean", label: "Clean run", note: "Two linked receipts from one night of agent activity.", receipts: [first, second] },
  { id: "tampered", label: "Edited after signing", note: "One field changed by hand after the enclave signed it.", receipts: [tampered] },
  { id: "gap", label: "Missing receipt", note: "A receipt was dropped, so the budget chain no longer joins.", receipts: [first, orphan] },
  { id: "pending", label: "Not settled yet", note: "Valid, but its transaction is not visible on chain yet.", receipts: [pending] },
];

writeFileSync(OUT, `${JSON.stringify({ chainState, samples }, null, 2)}\n`);
console.log(`wrote ${samples.length} samples to ${OUT.pathname}`);
