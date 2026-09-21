import { ARC, CHAIN } from "@/data/site";

/**
 * Copy for /docs. The rule from docs/AGENT_BRIEF.md applies hardest here: a
 * developer who follows these pages must never find that something described
 * in the present tense does not exist yet.
 */
export const OVERVIEW = {
  label: "Documentation",
  title: "Docs.",
  tagline: "The format, the checks, and the code that produces both.",
  lede:
    "Arcveil gives an agent a mandate instead of keys. Every settled action leaves a receipt that proves the action stayed inside that mandate — without revealing the mandate, the balances, or the reasoning. These pages describe the receipt, the five checks that decide whether to believe it, and the TypeScript SDK that issues and verifies them.",
} as const;

export type StartCard = {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  readonly href: string;
  readonly cta: string;
};

export const START_CARDS: readonly StartCard[] = [
  {
    n: "01",
    title: "Check one by hand",
    body:
      "Paste a receipt into the verifier and watch five checks run in your tab. Three of them read Arc mainnet directly; no backend of ours is in the path.",
    href: "/verify",
    cta: "Open the verifier",
  },
  {
    n: "02",
    title: "Read the format",
    body:
      "Every field of v1, one hash, and a chain of budget commitments. Knowing what a receipt refuses to carry is most of understanding it.",
    href: "/docs/receipts",
    cta: "Receipt format v1",
  },
  {
    n: "03",
    title: "Verify in code",
    body:
      "The SDK runs the same five checks from Node or a browser, against the same registries the site reads.",
    href: "/docs/sdk",
    cta: "SDK reference",
  },
];

export const LIVE_ROWS = [
  { key: "Receipt format", value: "v1 — the schema on this site is the one the SDK parses" },
  { key: "Verifier", value: "Five checks, client-side, reading Arc mainnet over plain JSON-RPC" },
  { key: "Registries", value: `MandateRegistry and AnchorRegistry, deployed to ${CHAIN.name} mainnet (chain ${ARC.chainId})` },
  { key: "Account", value: "ERC-4337 account with 2-of-3 signing, executing only while its mandate is live" },
  { key: "SDK", value: "@arcveildev/sdk — issuing, verifying, mandates and account intents" },
] as const;

export const NOT_LIVE_ROWS = [
  { key: "Enclave", value: "Relative intents are resolved by hand today; the enclave that would do it is designed, not built" },
  { key: "Spend commitments", value: "The budget chain binds order and completeness. Binding spend needs numbers only the enclave would hold" },
  { key: "Zero-knowledge proofs", value: "Receipts carry an enclave attestation. The zk proof replaces it without changing the format" },
  { key: "Desktop app", value: "The 2-of-3 account is signed with cast and a keystore today. The app that would hold a shard is next" },
] as const;

export const VOCABULARY = [
  {
    key: "Mandate",
    value:
      "What an agent may touch, how much, which hours, when it expires. Written once and held by you; only its hash reaches the chain.",
  },
  {
    key: "Veil",
    value:
      "The agent works in relative terms — reduce exposure to A by 30% — and never receives an absolute balance.",
  },
  {
    key: "Receipt",
    value: "What one settled action leaves behind: proof the mandate was respected, carrying no amounts.",
  },
  {
    key: "Counter chain",
    value:
      "Commitments to cumulative budget use, each binding the last. A dropped receipt leaves a gap that verification catches.",
  },
  {
    key: "Escape hatch",
    value:
      "Your device shard and your passkey form a quorum without us. A mandate that expires stops the agent with nobody reachable.",
  },
] as const;

export const QUICKSTART = `
// Five checks against Arc mainnet, from Node or a browser.
import { arc, ARC_REGISTRIES, createRpcChainReader, parseReceiptInput, verifyReceipts } from "@arcveildev/sdk";

const chain = createRpcChainReader({
  endpoint: arc.rpcUrls.default.http[0],
  chainId: arc.id,
  ...ARC_REGISTRIES[arc.id],
});

const parsed = parseReceiptInput(json);
if (!parsed.ok) throw new Error(parsed.errors.join("\\n"));

const report = await verifyReceipts(parsed.receipts, { chain });
report.status; // "pass" | "fail" | "unknown"
`;
