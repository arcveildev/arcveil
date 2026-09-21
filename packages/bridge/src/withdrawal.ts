import { encodeAbiParameters, keccak256, type Hex } from "viem";

import { SNARK_SCALAR_FIELD } from "./hook";

/**
 * A withdrawal: who gets the money, who relays it, and what the relayer is
 * paid. All three are bound into the proof through `context`, so a relayer
 * that changes any of them produces a proof the pool refuses. That is what
 * makes it safe to hand a proof to a stranger and ask them to submit it.
 */

export type RelayData = {
  /** Where the USDC lands. A fresh address, or the whole exercise was pointless. */
  readonly recipient: Hex;
  /** The relayer, paid out of the withdrawal rather than by the recipient. */
  readonly feeRecipient: Hex;
  /** Basis points of the withdrawn amount. The pool caps this at the pool's `maxRelayFeeBPS`. */
  readonly relayFeeBPS: bigint;
};

export type Withdrawal = {
  /** The only address allowed to process this withdrawal — the Entrypoint, when a relayer submits it. */
  readonly processooor: Hex;
  readonly data: Hex;
};

export const RELAY_DATA_ABI = [
  {
    type: "tuple",
    components: [
      { name: "recipient", type: "address" },
      { name: "feeRecipient", type: "address" },
      { name: "relayFeeBPS", type: "uint256" },
    ],
  },
] as const;

const WITHDRAWAL_ABI = [
  {
    type: "tuple",
    components: [
      { name: "processooor", type: "address" },
      { name: "data", type: "bytes" },
    ],
  },
  { type: "uint256" },
] as const;

export const encodeRelayData = (data: RelayData): Hex =>
  encodeAbiParameters(RELAY_DATA_ABI, [
    { recipient: data.recipient, feeRecipient: data.feeRecipient, relayFeeBPS: data.relayFeeBPS },
  ]);

export const withdrawalFor = (entrypoint: Hex, relay: RelayData): Withdrawal => ({
  processooor: entrypoint,
  data: encodeRelayData(relay),
});

/**
 * The `context` public signal, exactly as `PrivacyPool.validWithdrawal`
 * recomputes it: `keccak256(abi.encode(withdrawal, scope)) % field`.
 *
 * @dev This is the hinge of the whole relayer story. The recipient and the fee
 *      live inside the hash, so the proof only verifies for the withdrawal it
 *      was made for. A relayer can refuse to submit, and can see what it is
 *      submitting — it cannot redirect it or pay itself more.
 */
export const contextFor = (withdrawal: Withdrawal, scope: bigint): bigint =>
  BigInt(
    keccak256(
      encodeAbiParameters(WITHDRAWAL_ABI, [
        { processooor: withdrawal.processooor, data: withdrawal.data },
        scope,
      ]),
    ),
  ) % SNARK_SCALAR_FIELD;

/** A Groth16 proof in the shape `ProofLib.WithdrawProof` expects. */
export type WithdrawProof = {
  readonly pA: readonly [bigint, bigint];
  readonly pB: readonly [readonly [bigint, bigint], readonly [bigint, bigint]];
  readonly pC: readonly [bigint, bigint];
  /**
   * `[newCommitmentHash, existingNullifierHash, withdrawnValue, stateRoot,
   *   stateTreeDepth, ASPRoot, ASPTreeDepth, context]` — the order the
   * contract reads them in, which is not the order the circuit declares them.
   */
  readonly pubSignals: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
};

export const PUBLIC_SIGNALS = [
  "newCommitmentHash",
  "existingNullifierHash",
  "withdrawnValue",
  "stateRoot",
  "stateTreeDepth",
  "ASPRoot",
  "ASPTreeDepth",
  "context",
] as const;

export const signal = (proof: WithdrawProof, name: (typeof PUBLIC_SIGNALS)[number]): bigint =>
  proof.pubSignals[PUBLIC_SIGNALS.indexOf(name)] as bigint;

/** What the recipient actually receives once the relayer has taken its cut. */
export const amountAfterFee = (withdrawnValue: bigint, relayFeeBPS: bigint): bigint =>
  withdrawnValue - (withdrawnValue * relayFeeBPS) / 10_000n;
