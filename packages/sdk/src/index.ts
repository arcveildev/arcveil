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
} from "./types";
export { RECEIPT_VERSION } from "./types";

export { canonicalize, canonicalBytes, computeReceiptId, receiptBody } from "./canonical";
export { generateSigner, issueReceipt, signBody, verifyBodySignature, type Signer } from "./sign";
export { parseReceiptInput, type ParseResult } from "./schema";
export { CHECK_ORDER, verifyReceipts } from "./verify";

export {
  createMemoryChainReader,
  EMPTY_CHAIN_STATE,
  type ChainReader,
  type ChainState,
  type MandateRecord,
  type TxRecord,
} from "./chain";
export { createRpcChainReader, type RpcConfig } from "./rpc";

export { arc, arcTestnet, ARC_REGISTRIES, USDC_ERC20_ADDRESS, type Registries } from "./chains";
export { anchorCounter, mandateCommitment, registerMandate, revokeMandate } from "./mandate";
export { createIssuer, nextCounter, type ActionInput, type Issuance, type Issuer, type IssuerConfig } from "./issuer";
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
} from "./account";
export { ANCHOR_REGISTRY_ABI, MANDATE_REGISTRY_ABI } from "./abi";

export {
  buildEvaluation,
  judgeCommitment,
  type ChoiceClause,
  type Clause,
  type Evaluation,
  type NoulClause,
  type Question,
  type ScoreClause,
} from "./judge";
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
} from "./judgement";
export {
  affordable,
  applySelection,
  buildSelection,
  SELECTION_CHECKS,
  selectionClauses,
  type Candidate,
  type Selection,
  type SelectionPolicy,
} from "./selection";
