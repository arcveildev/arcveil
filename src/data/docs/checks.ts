/**
 * Copy for /docs/checks. The verdicts here must match packages/sdk/src/verify.ts
 * exactly — a doc that promises a `fail` where the code returns `unknown` is
 * worse than no doc.
 */
export const CHECKS_PAGE = {
  label: "Verification",
  title: "Five checks.",
  tagline: "Two local, three against Arc, and a third verdict that matters.",
  lede:
    "Verification answers one question in five parts: is this receipt the one that was issued, was it issued by the policy signer, was the mandate it names live, does it join the receipt before it, and did the action really settle. The overall verdict is the worst of the five.",
} as const;

export type CheckDoc = {
  readonly n: string;
  readonly id: string;
  readonly question: string;
  readonly where: string;
  readonly verdicts: string;
  readonly detail: string;
};

export const CHECK_DOCS: readonly CheckDoc[] = [
  {
    n: "01",
    id: "integrity",
    question: "Does the body still hash to the id it claims?",
    where: "Local",
    verdicts: "pass · fail",
    detail:
      "Recomputes sha256 over the canonical body. Editing one character of a receipt fails here, which is why this check has no unknown: the answer never depends on anything outside the file.",
  },
  {
    n: "02",
    id: "signature",
    question: "Did the policy signer sign these exact bytes?",
    where: "Local",
    verdicts: "pass · fail · unknown",
    detail:
      "ECDSA P-256 over the same canonical bytes the id covers. A receipt carrying a zk proof returns unknown: the in-browser verifier for those ships with v1.",
  },
  {
    n: "03",
    id: "mandate",
    question: "Was that mandate commitment live at that epoch?",
    where: "Arc mainnet",
    verdicts: "pass · fail",
    detail:
      "Reads MandateRegistry.mandateOf(account, epoch). Fails if nothing is registered, if the epoch was revoked, or if the commitment on chain differs from the one the receipt was checked against. The terms behind the commitment stay sealed either way.",
  },
  {
    n: "04",
    id: "linkage",
    question: "Does the budget chain join to its predecessor?",
    where: "Arc mainnet",
    verdicts: "pass · fail · unknown",
    detail:
      "With a predecessor in the bundle, the previous receipt's counter.next must equal this one's counter.prev — a gap means a receipt was dropped or reordered. With no predecessor, the starting commitment has to be anchored in AnchorRegistry; if it is not, the answer is unknown, not fail.",
  },
  {
    n: "05",
    id: "settlement",
    question: "Did the transaction it points at succeed?",
    where: "Arc mainnet",
    verdicts: "pass · fail · unknown",
    detail:
      "An eth_getTransactionReceipt for action.settledTx. A reverted transaction fails. A transaction that is not visible yet, or a receipt for a different chain than the verifier is pointed at, returns unknown.",
  },
];

export const VERDICT_ROWS = [
  { key: "pass", value: "The check ran and the answer was yes." },
  { key: "fail", value: "The check ran and the answer was no. This receipt is not what it claims." },
  {
    key: "unknown",
    value: "The check could not decide. Never reported as a pass, and never as a fail — which would read as an accusation the evidence does not support.",
  },
] as const;

export const REPORT_SNIPPET = `
const report = await verifyReceipts(parsed.receipts, { chain });

report.status; // worst verdict across every receipt
report.receipts[0].status; // worst across this receipt's five checks
report.receipts[0].checks; // [{ id, status, detail }, ...] in CHECK_ORDER
`;

export const MEMORY_SNIPPET = `
// In tests, hand the verifier the chain state you want to check against.
import { createMemoryChainReader } from "@arcveil/sdk";

const chain = createMemoryChainReader({
  mandates: [{ account, commitment, epoch: 1, revoked: false }],
  transactions: { [settledTx.toLowerCase()]: { status: "success" } },
  anchors: [head],
});
`;

export const UNKNOWN_NOTE =
  "A check that throws — Arc unreachable, a registry address left null, an RPC error — is caught and reported as unknown with the reason attached. Nothing in verification is allowed to fail open.";

export const EMPTY_STATE_NOTE =
  "An empty state is not the same as being offline. A registry that answers \"nothing registered here\" has answered, and the mandate check fails on it. unknown is reserved for a question that could not be asked at all — Arc unreachable, a registry address left null, an RPC error.";
