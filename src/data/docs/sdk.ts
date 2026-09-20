/**
 * Copy for /docs/sdk. Every symbol named here is exported from
 * packages/sdk/src/index.ts — check there before adding one.
 */
export const SDK_PAGE = {
  label: "TypeScript",
  title: "SDK.",
  tagline: "Issue receipts, publish mandates, verify both.",
  lede:
    "@arcveil/sdk is the receipt format as code: the canonical hashing, the issuer, the five checks, viem chain definitions for Arc, and typed calls into the registries and the account. It runs in Node and in a browser — the site you are reading is its first consumer.",
} as const;

export const INSTALL = `
# Not published yet. Build it from the repository:
pnpm install
pnpm sdk:build
`;

export const INSTALL_DEP = `
{
  "dependencies": {
    "@arcveil/sdk": "workspace:*",
    "viem": "^2"
  }
}
`;

export const VERIFY_SNIPPET = `
import { arc, ARC_REGISTRIES, createRpcChainReader, parseReceiptInput, verifyReceipts } from "@arcveil/sdk";

// Anything arriving as text is untrusted until the schema says otherwise.
const parsed = parseReceiptInput(json);
if (!parsed.ok) return { error: parsed.errors };

const chain = createRpcChainReader({
  endpoint: arc.rpcUrls.default.http[0],
  chainId: arc.id,
  ...ARC_REGISTRIES[arc.id],
});

const report = await verifyReceipts(parsed.receipts, { chain });
`;

export const MANDATE_SNIPPET = `
import { mandateCommitment, registerMandate, revokeMandate, ARC_REGISTRIES, arc } from "@arcveil/sdk";

const terms = [
  "assets: USDC only",
  "per action: 250 USDC",
  "active hours: 02:00-06:00 UTC",
].join("\\n");

const commitment = mandateCommitment(terms); // keccak256 of the terms
const writer = { client: walletClient, registry: ARC_REGISTRIES[arc.id].mandateRegistry };

await registerMandate(writer, 1, commitment); // epoch 1
await revokeMandate(writer, 1); // stops it; the epoch can never be reused
`;

export const ISSUE_SNIPPET = `
import { createIssuer, generateSigner } from "@arcveil/sdk";

const signer = await generateSigner(); // stand-in: in production this key lives in the enclave

let issuer = createIssuer({
  chainId: arc.id,
  account,
  mandate: { commitment, epoch: 1 },
  agent: { id, session, vision: "relative-only" },
  checks: ["asset_allowlist", "per_action_cap", "window_spend"],
  signer: { publicKey: signer.publicKey, privateKey: signer.privateKey },
  counter: head, // last anchored budget commitment
});

const { receipt, issuer: next } = await issuer.issue({ kind: "swap", userOpHash, settledTx });
issuer = next; // issuing advances the chain — keep the issuer it hands back
`;

export const INTENT_SNIPPET = `
import { encodeExecute, executeIntent, intentTypedData, signIntent } from "@arcveil/sdk";

const intent = { call, nonce, deadline, epoch: 1, mandate: commitment };

// Two of the three keys sign the same EIP-712 payload, from wherever they live.
const first = await signIntent(deviceClient, account, intent);
const second = await signIntent(coSignerClient, account, intent);

await executeIntent(relayClient, account, intent, [first, second]);
`;

export const EXPORT_ROWS = [
  { key: "parseReceiptInput", value: "zod parse of one receipt or a bundle. Returns { ok, receipts } or { ok: false, errors }.", code: true },
  { key: "verifyReceipts", value: "Runs the five checks over a bundle and returns every verdict.", code: true },
  { key: "createRpcChainReader", value: "Reads mandates, anchors and transactions from an Arc RPC endpoint.", code: true },
  { key: "createMemoryChainReader", value: "The same interface over state you supply, for tests.", code: true },
  { key: "canonicalize · receiptBody · computeReceiptId", value: "The exact bytes a receipt hashes, and the hash itself.", code: true },
  { key: "createIssuer · nextCounter", value: "Issue receipts and advance the budget chain.", code: true },
  { key: "generateSigner · signBody · verifyBodySignature · issueReceipt", value: "ECDSA P-256 over the canonical body.", code: true },
  { key: "mandateCommitment · registerMandate · revokeMandate · anchorCounter", value: "Publish and retire mandates; anchor a budget commitment.", code: true },
  { key: "intentTypedData · signIntent · executeIntent · encodeExecute", value: "The 2-of-3 account: sign one intent, relay it with two signatures.", code: true },
  { key: "adoptTypedData · encodeAdopt", value: "Rotate the account onto a new mandate epoch, under the same quorum.", code: true },
  { key: "arc · arcTestnet · ARC_REGISTRIES · USDC_ERC20_ADDRESS", value: "viem chain definitions and the deployed addresses.", code: true },
  { key: "MANDATE_REGISTRY_ABI · ANCHOR_REGISTRY_ABI · ARCVEIL_ACCOUNT_ABI", value: "ABIs, for calls the SDK does not wrap.", code: true },
] as const;

export const IMMUTABILITY_NOTE =
  "issue returns the next issuer rather than mutating the one you called. Two receipts can never claim the same position in the budget chain, and a caller that drops the returned issuer notices at once instead of silently reusing a counter.";

export const KEY_NOTE =
  "generateSigner is a stand-in for the policy enclave, which is designed and not built. It creates a real P-256 key in whatever process calls it — fine for tests and samples, not a place to put an account that holds money.";
