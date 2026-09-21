/**
 * @arcveil/bridge — bridge USDC into Arc's shielded pool.
 *
 * One CCTP burn on any supported chain becomes one deposit in the pool on Arc,
 * and a later withdrawal spends it to an address with no link to the depositor.
 *
 * What this hides: which deposit funds which withdrawal.
 * What it does not: the burn, the amount, the sender, the deposit, and every
 * withdrawal — all public, on two chains. The privacy is a crowd, so it is only
 * as strong as the pool is busy.
 */

export {
  ARC_CHAIN_ID,
  ARC_DOMAIN,
  ARC_TESTNET_CHAIN_ID,
  FINALITY,
  ROUTES,
  routeFor,
  routesInto,
  type CctpRoute,
} from "./routes";

export {
  decodeVeilHook,
  encodeVeilHook,
  InvalidHookError,
  SNARK_SCALAR_FIELD,
  type VeilHook,
} from "./hook";

export {
  approveCall,
  burnCall,
  ERC20_APPROVE_ABI,
  TOKEN_MESSENGER_V2_ABI,
  type BurnRequest,
  type Call,
} from "./burn";

export {
  attestationUrl,
  fetchAttestations,
  irisBase,
  IrisError,
  isSigned,
  parseIrisBody,
  type Attestation,
  type FetchLike,
  type SignedAttestation,
} from "./iris";

export {
  commitmentOf,
  deriveNote,
  deriveNotes,
  nullifierHashOf,
  veilKeyTypedData,
  type Note,
} from "./note";

export {
  anonymitySet,
  LeafNotInTreeError,
  MAX_TREE_DEPTH,
  rootOf,
  TreeTooDeepError,
  witnessFor,
  type MerkleWitness,
} from "./tree";

export {
  amountAfterFee,
  contextFor,
  encodeRelayData,
  PUBLIC_SIGNALS,
  RELAY_DATA_ABI,
  signal,
  withdrawalFor,
  type RelayData,
  type Withdrawal,
  type WithdrawProof,
} from "./withdrawal";

export {
  buildWithdrawInputs,
  proveWithdrawal,
  SpendError,
  toSolidityProof,
  type Artifacts,
  type Groth16,
  type SnarkjsProof,
  type SpendRequest,
  type WithdrawInputs,
} from "./prove";

export {
  findOwned,
  isSpendable,
  nextNoteIndex,
  orderedLabels,
  orderedLeaves,
  poolState,
  TreeGapError,
  witnessesFor,
  type DepositLog,
  type LeafLog,
  type OwnedDeposit,
  type PoolState,
  type Witnesses,
} from "./scan";

export { readPoolState, type ReadOptions } from "./reader";

export { ENTRYPOINT_ABI, POOL_ABI } from "./pool";

export { VEIL_GATEWAY_ABI } from "./gateway";
