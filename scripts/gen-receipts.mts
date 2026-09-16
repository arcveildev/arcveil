/**
 * Regenerates the sample receipts served by /verify.
 *   pnpm gen:receipts
 * A fresh signing key is generated on every run and thrown away: only the public
 * key and the signatures are written, so no private material lands in the repo.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { keccak256, toHex } from "viem";
import { issueReceipt, generateSigner, type Hex, type Receipt, type ReceiptDraft } from "@arcveil/sdk";

const RPC = "https://rpc.mainnet.arc.io";
const CHAIN_ID = 5042;

/**
 * Samples point at real Arc transactions, so the settlement check on /verify is
 * a genuine chain read rather than a staged one. Everything else about them is
 * synthetic — they demonstrate the format, they are not records of anything.
 */
async function recentArcTransactions(count: number): Promise<Hex[]> {
  const call = async (method: string, params: unknown[]) => {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const body = (await r.json()) as { result?: unknown };
    return body.result;
  };
  const found: Hex[] = [];
  let block = (await call("eth_blockNumber", [])) as string;
  for (let i = 0; i < 12 && found.length < count; i += 1) {
    const b = (await call("eth_getBlockByNumber", [block, false])) as { transactions?: Hex[]; number: string } | null;
    for (const tx of b?.transactions ?? []) if (found.length < count) found.push(tx);
    block = `0x${(BigInt(block) - BigInt(1)).toString(16)}`;
  }
  if (found.length < count) throw new Error(`Arc returned only ${found.length} transactions; need ${count}`);
  return found;
}

const OUT = new URL("../src/data/sample-receipts.json", import.meta.url);
const DEMO_OUT = new URL("../contracts/demo/mandate.json", import.meta.url);

/**
 * The demo mandate is deliberately readable: a real mandate's terms never leave
 * the owner, but for a sample the point is to show that the chain stores only
 * the hash. Anyone can keccak256 this text and get the commitment below.
 */
const DEMO_TERMS = [
  "Arcveil demo mandate v1",
  "assets: USDC only",
  "per action: 250 USDC",
  "per day: 1000 USDC",
  "active hours: 02:00-06:00 UTC",
  "expires: 2026-12-31T00:00:00Z",
].join("\n");

const DEMO_EPOCH = 1;
const COMMITMENT = keccak256(toHex(DEMO_TERMS));
const COUNTER = (n: number): Hex => keccak256(toHex(`arcveil demo counter ${n}`));

/**
 * Whose account the samples belong to. Pass the address that will run the
 * seeding script, and the mandate and budget-chain checks resolve on Arc; leave
 * it unset and the samples stay unowned, so those two checks report unknown.
 */
const ACCOUNT = (process.env.ARC_SAMPLE_ACCOUNT ?? `0x${"8f".repeat(20)}`) as Hex;

const b = (value: string, bytes: number): Hex => `0x${value.repeat(bytes)}`;

const signer = await generateSigner();
const [txA, txB] = await recentArcTransactions(2);

const draft = (overrides: Partial<ReceiptDraft>): ReceiptDraft => ({
  v: 1,
  chain: CHAIN_ID,
  account: ACCOUNT,
  mandate: { commitment: COMMITMENT, epoch: DEMO_EPOCH },
  agent: { id: b("a7", 32), session: b("22", 16), vision: "relative-only" },
  action: { kind: "swap", userOpHash: b("71", 32), settledTx: txA, at: "2026-09-13T21:14:02.000Z" },
  checks: ["asset_allowlist", "per_action_cap", "window_spend", "active_hours", "killswitch_clear"],
  counter: { prev: COUNTER(0), next: COUNTER(1) },
  proof: { type: "attestation", signer: signer.publicKey },
  ...overrides,
});

const issue = (overrides: Partial<ReceiptDraft>) => issueReceipt(draft(overrides), signer.privateKey);

const first = await issue({});
const second = await issue({
  action: { kind: "transfer", userOpHash: b("72", 32), settledTx: txB, at: "2026-09-13T23:02:11.000Z" },
  counter: { prev: first.counter.next, next: COUNTER(2) },
});
const orphan = await issue({
  action: { kind: "transfer", userOpHash: b("73", 32), settledTx: txB, at: "2026-09-13T23:02:11.000Z" },
  counter: { prev: COUNTER(99), next: COUNTER(2) },
});
const pending = await issue({
  action: { kind: "approve", userOpHash: b("74", 32), settledTx: b("c0", 32), at: "2026-09-14T01:40:00.000Z" },
  counter: { prev: first.counter.next, next: COUNTER(3) },
});
const clean = await issue({});
/** Edited after issuing: the body no longer hashes to its id, and the signature no longer covers it. */
const tampered: Receipt = { ...clean, action: { ...clean.action, kind: "transfer" } };

const samples = [
  { id: "clean", label: "Clean run", note: "Two linked receipts, settling in real Arc transactions.", receipts: [first, second] },
  { id: "tampered", label: "Edited after signing", note: "One field changed by hand after the enclave signed it.", receipts: [tampered] },
  { id: "gap", label: "Missing receipt", note: "A receipt was dropped, so the budget chain no longer joins.", receipts: [first, orphan] },
  { id: "pending", label: "Not settled yet", note: "Valid, but its transaction is nowhere on Arc.", receipts: [pending] },
];

writeFileSync(OUT, `${JSON.stringify({ samples }, null, 2)}\n`);

/** The seeding script reads this, so the chain gets exactly what the receipts claim. */
mkdirSync(new URL(".", DEMO_OUT), { recursive: true });
writeFileSync(
  DEMO_OUT,
  `${JSON.stringify(
    {
      note: "Demo only. Generated by pnpm gen:receipts; read by contracts/script/SeedSamples.s.sol.",
      account: ACCOUNT,
      epoch: DEMO_EPOCH,
      terms: DEMO_TERMS,
      commitment: COMMITMENT,
      counters: [COUNTER(0), COUNTER(1), COUNTER(2), COUNTER(3)],
    },
    null,
    2,
  )}\n`,
);

console.log(`wrote ${samples.length} samples to ${OUT.pathname}`);
console.log(`wrote the demo mandate to ${DEMO_OUT.pathname}`);
console.log(`sample account: ${ACCOUNT}${process.env.ARC_SAMPLE_ACCOUNT ? "" : "  (set ARC_SAMPLE_ACCOUNT to make it seedable)"}`);
