/** Arcveil SDK — issue receipts, publish the mandates they are checked against, and verify both. */
export type {
  ActionKind,
  AttestationProof,
  CheckId,
  CheckResult,
  CheckStatus,
  Hex,
  Proof,
  Receipt,
  ReceiptDraft,
  ReceiptReport,
  UnsignedProof,
  VerificationReport,
  ZkProof,
} from "./types.js";
export { RECEIPT_VERSION } from "./types.js";

export { canonicalize, canonicalBytes, computeReceiptId, receiptBody } from "./canonical.js";
export { generateSigner, issueReceipt, signBody, verifyBodySignature, type Signer } from "./sign.js";
export { parseReceiptInput, type ParseResult } from "./schema.js";
export { CHECK_ORDER, verifyReceipts } from "./verify.js";

export {
  createMemoryChainReader,
  EMPTY_CHAIN_STATE,
  type ChainReader,
  type ChainState,
  type MandateRecord,
  type TxRecord,
} from "./chain.js";
export { createRpcChainReader, type RpcConfig } from "./rpc.js";

export { arc, arcTestnet, ARC_REGISTRIES, USDC_ERC20_ADDRESS, type Registries } from "./chains.js";
export { anchorCounter, mandateCommitment, registerMandate, revokeMandate } from "./mandate.js";
export { createIssuer, nextCounter, type ActionInput, type Issuance, type Issuer, type IssuerConfig } from "./issuer.js";
export {
  adoptTypedData,
  ARCVEIL_ACCOUNT_ABI,
  encodeAdopt,
  encodeExecute,
  executeIntent,
  intentTypedData,
  signIntent,
  type AccountCall,
  type Adoption,
  type Intent,
} from "./account.js";
export { ANCHOR_REGISTRY_ABI, MANDATE_REGISTRY_ABI } from "./abi.js";

export {
  buildEvaluation,
  judgeCommitment,
  type ChoiceClause,
  type Clause,
  type Evaluation,
  type NoulClause,
  type Question,
  type ScoreClause,
} from "./judge.js";
export {
  applyClauses,
  decide,
  parseJudgement,
  type Answer,
  type ClauseStatus,
  type ClauseVerdict,
  type Decision,
  type Judgement,
  type JudgementResult,
} from "./judgement.js";
export {
  affordable,
  applySelection,
  buildSelection,
  SELECTION_CHECKS,
  selectionClauses,
  type Candidate,
  type Selection,
  type SelectionPolicy,
} from "./selection.js";
