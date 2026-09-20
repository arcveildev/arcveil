/** Receipt format v1 — the artifact an agent run produces. See docs/RECEIPT.md. */
export const RECEIPT_VERSION = 1;

export type Hex = `0x${string}`;

export type ActionKind = "transfer" | "swap" | "approve";

/** v0.5: a signature from the policy enclave. v1 swaps this for a zero-knowledge proof. */
export type AttestationProof = { type: "attestation"; signer: Hex; signature: Hex };
export type ZkProof = { type: "zk"; system: string; data: Hex };
export type Proof = AttestationProof | ZkProof;

/** The proof without its evidence — the part that is covered by the receipt hash. */
export type UnsignedProof = Omit<AttestationProof, "signature"> | Omit<ZkProof, "data">;

export type Receipt = {
  v: typeof RECEIPT_VERSION;
  /** sha256 of the canonical body (everything except `id` and the proof evidence). */
  id: Hex;
  chain: number;
  account: Hex;
  mandate: { commitment: Hex; epoch: number };
  agent: { id: Hex; session: Hex; vision: "relative-only" | "absolute" };
  action: { kind: ActionKind; userOpHash: Hex; settledTx: Hex; at: string };
  /** Names of the policy checks that ran. Thresholds stay inside the mandate. */
  checks: readonly string[];
  /**
   * Present when some of those checks were semantic — answered by a model
   * rather than by arithmetic. `model` names who answered; `commitment` binds
   * the exact clauses and thresholds it was held to, without revealing either.
   * Absent on receipts whose checks were all arithmetic, which hash unchanged.
   */
  judge?: { model: string; commitment: Hex };
  /** Commitments to cumulative budget use, before and after this action. */
  counter: { prev: Hex; next: Hex };
  proof: Proof;
};

export type ReceiptDraft = Omit<Receipt, "id" | "proof"> & { proof: UnsignedProof };

export type CheckId = "integrity" | "signature" | "mandate" | "linkage" | "settlement";
export type CheckStatus = "pass" | "fail" | "unknown";

export type CheckResult = { id: CheckId; status: CheckStatus; detail: string };
export type ReceiptReport = { id: Hex; status: CheckStatus; checks: readonly CheckResult[] };
export type VerificationReport = { status: CheckStatus; receipts: readonly ReceiptReport[] };
