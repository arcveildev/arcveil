import { computeReceiptId } from "./canonical";
import { verifyBodySignature } from "./sign";
import type { ChainReader } from "./chain";
import type { CheckId, CheckResult, CheckStatus, Receipt, ReceiptReport, VerificationReport } from "./types";

type CheckContext = { receipt: Receipt; predecessor: Receipt | null; chain: ChainReader };
type CheckOutcome = Omit<CheckResult, "id">;
type Check = { id: CheckId; run: (ctx: CheckContext) => Promise<CheckOutcome> };

const pass = (detail: string): CheckOutcome => ({ status: "pass", detail });
const fail = (detail: string): CheckOutcome => ({ status: "fail", detail });
const unknown = (detail: string): CheckOutcome => ({ status: "unknown", detail });

const short = (value: string) => `${value.slice(0, 10)}…${value.slice(-4)}`;

const integrity: Check = {
  id: "integrity",
  run: async ({ receipt }) => {
    const recomputed = await computeReceiptId(receipt);
    return recomputed === receipt.id
      ? pass("Body hashes to the id it claims — nothing was edited after issuing.")
      : fail(`Body hashes to ${short(recomputed)}, but the receipt claims ${short(receipt.id)}.`);
  },
};

const signature: Check = {
  id: "signature",
  run: async ({ receipt }) => {
    if (receipt.proof.type === "zk") {
      return unknown(`Carries a ${receipt.proof.system} proof; the in-browser zk verifier ships in v1.`);
    }
    const valid = await verifyBodySignature(receipt, receipt.proof.signature, receipt.proof.signer);
    return valid
      ? pass(`Signed by policy signer ${short(receipt.proof.signer)} over these exact bytes.`)
      : fail("The signature does not match this body and this signer.");
  },
};

const mandate: Check = {
  id: "mandate",
  run: async ({ receipt, chain }) => {
    const record = await chain.getMandate(receipt.account, receipt.mandate.epoch);
    if (record === null) return fail(`No mandate registered for epoch ${receipt.mandate.epoch} on this account.`);
    if (record.revoked) return fail("The mandate for this epoch was revoked.");
    if (record.commitment.toLowerCase() !== receipt.mandate.commitment.toLowerCase()) {
      return fail("The mandate commitment on chain differs from the one the receipt was checked against.");
    }
    return pass(`Mandate ${short(record.commitment)} was live at epoch ${record.epoch}. Its terms stay sealed.`);
  },
};

const linkage: Check = {
  id: "linkage",
  run: async ({ receipt, predecessor, chain }) => {
    if (predecessor !== null) {
      return predecessor.counter.next.toLowerCase() === receipt.counter.prev.toLowerCase()
        ? pass("Continues the previous receipt's budget commitment — no receipt was dropped between them.")
        : fail("Budget commitment does not continue the previous receipt: a receipt is missing or reordered.");
    }
    const anchored = await chain.hasCounterAnchor(receipt.account, receipt.counter.prev);
    return anchored
      ? pass("Starts from a budget commitment anchored on chain.")
      : unknown("No predecessor supplied and this starting commitment is not anchored yet.");
  },
};

const settlement: Check = {
  id: "settlement",
  run: async ({ receipt, chain }) => {
    if (chain.chainId !== 0 && receipt.chain !== chain.chainId) {
      return unknown(
        `This receipt is for chain ${receipt.chain}; the verifier is pointed at chain ${chain.chainId}.`,
      );
    }
    const tx = await chain.getTransaction(receipt.action.settledTx);
    if (tx === null) return unknown(`Transaction ${short(receipt.action.settledTx)} is not visible on chain yet.`);
    return tx.status === "success"
      ? pass(`Settled on chain ${receipt.chain} as ${short(receipt.action.settledTx)}.`)
      : fail("The transaction this receipt points at reverted.");
  },
};

export const CHECK_ORDER: readonly CheckId[] = ["integrity", "signature", "mandate", "linkage", "settlement"];

const CHECKS: readonly Check[] = [integrity, signature, mandate, linkage, settlement];

/** A check that throws is a check that could not decide — never a pass, never a silent failure. */
const runCheck = async (check: Check, ctx: CheckContext): Promise<CheckResult> => {
  try {
    return { id: check.id, ...(await check.run(ctx)) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { id: check.id, status: "unknown", detail: `Could not be checked: ${reason}` };
  }
};

const RANK: Record<CheckStatus, number> = { pass: 0, unknown: 1, fail: 2 };

const worst = (statuses: readonly CheckStatus[]): CheckStatus =>
  statuses.reduce<CheckStatus>((acc, status) => (RANK[status] > RANK[acc] ? status : acc), "pass");

export async function verifyReceipts(
  receipts: readonly Receipt[],
  { chain }: { chain: ChainReader },
): Promise<VerificationReport> {
  const reports: ReceiptReport[] = [];
  for (const [index, receipt] of receipts.entries()) {
    const ctx: CheckContext = { receipt, predecessor: receipts[index - 1] ?? null, chain };
    const checks = await Promise.all(CHECKS.map((check) => runCheck(check, ctx)));
    reports.push({ id: receipt.id, status: worst(checks.map((c) => c.status)), checks });
  }
  return { status: worst(reports.map((r) => r.status)), receipts: reports };
}
