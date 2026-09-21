import {
  contextFor,
  deriveNote,
  withdrawalFor,
  witnessesFor,
  type OwnedDeposit,
  type PoolState,
} from "@arcveil/bridge";

/**
 * Assembling a withdrawal, up to but not including the proof.
 *
 * Everything here is pure and runs on the main thread, so the page can show
 * what it is about to prove — which leaf, out of how many — and so it can be
 * tested without a chain, a wallet or a 17 MB proving key. The worker is left
 * with one job it cannot get wrong.
 *
 * A `bigint` does not survive `postMessage` in every runtime, so the payload
 * crossing that boundary is strings. Converting at one named seam beats
 * discovering the loss inside a circuit.
 */

export type SpendPlan = {
  /** Which leaf of how many — the sentence the page shows before spending a couple of seconds. */
  readonly leafIndex: number;
  readonly leafCount: number;
  readonly anonymitySet: number;
  readonly context: bigint;
  readonly payload: SpendPayload;
};

/** The serialisable form the prover worker receives. */
export type SpendPayload = {
  readonly seed: `0x${string}`;
  readonly noteIndex: number;
  readonly changeIndex: number;
  readonly label: string;
  readonly existingValue: string;
  readonly withdrawnValue: string;
  readonly context: string;
  readonly stateRoot: string;
  /** The commitment being spent. Public — it is a leaf of a public tree. */
  readonly stateLeaf: string;
  readonly stateSiblings: readonly string[];
  readonly stateIndex: string;
  readonly stateDepth: string;
  readonly aspRoot: string;
  readonly aspLeaf: string;
  readonly aspSiblings: readonly string[];
  readonly aspIndex: string;
  readonly aspDepth: string;
};

export type SpendTerms = {
  readonly entrypoint: `0x${string}`;
  readonly recipient: `0x${string}`;
  readonly feeRecipient: `0x${string}`;
  readonly relayFeeBPS: bigint;
  readonly scope: bigint;
};

export class SpendPlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpendPlanError";
  }
}

/**
 * @param seed The veil-key signature. It reaches the worker and stops there.
 * @param changeIndex A note index this key has never used, for the remainder.
 */
export const planSpend = (
  state: PoolState,
  owned: OwnedDeposit,
  withdrawnValue: bigint,
  terms: SpendTerms,
  seed: `0x${string}`,
  changeIndex: number,
): SpendPlan => {
  if (withdrawnValue <= 0n) throw new SpendPlanError("A withdrawal has to move something.");
  if (withdrawnValue > owned.deposit.value) {
    throw new SpendPlanError("This deposit does not hold that much.");
  }
  if (changeIndex === owned.note.index) {
    throw new SpendPlanError("The change note must be a note this key has not used.");
  }

  // The proof is built for exactly one withdrawal; changing any of these
  // afterwards makes it invalid, which is what stops the relayer redirecting it.
  const context = contextFor(
    withdrawalFor(terms.entrypoint, {
      recipient: terms.recipient,
      feeRecipient: terms.feeRecipient,
      relayFeeBPS: terms.relayFeeBPS,
    }),
    terms.scope,
  );

  const { stateWitness, aspWitness } = witnessesFor(state, owned.deposit);

  return {
    leafIndex: stateWitness.index,
    leafCount: state.leaves.length,
    anonymitySet: state.deposits.length,
    context,
    payload: {
      seed,
      noteIndex: owned.note.index,
      changeIndex,
      label: owned.deposit.label.toString(),
      existingValue: owned.deposit.value.toString(),
      withdrawnValue: withdrawnValue.toString(),
      context: context.toString(),
      stateRoot: stateWitness.root.toString(),
      stateLeaf: stateWitness.leaf.toString(),
      stateSiblings: stateWitness.siblings.map(String),
      stateIndex: stateWitness.index.toString(),
      stateDepth: stateWitness.depth.toString(),
      aspRoot: aspWitness.root.toString(),
      aspLeaf: aspWitness.leaf.toString(),
      aspSiblings: aspWitness.siblings.map(String),
      aspIndex: aspWitness.index.toString(),
      aspDepth: aspWitness.depth.toString(),
    },
  };
};

/** Rebuilds what `proveWithdrawal` takes. Runs inside the worker. */
export const spendFromPayload = (payload: SpendPayload) => ({
  note: deriveNote(payload.seed, payload.noteIndex),
  change: deriveNote(payload.seed, payload.changeIndex),
  label: BigInt(payload.label),
  existingValue: BigInt(payload.existingValue),
  withdrawnValue: BigInt(payload.withdrawnValue),
  context: BigInt(payload.context),
  stateWitness: {
    root: BigInt(payload.stateRoot),
    leaf: BigInt(payload.stateLeaf),
    index: Number(payload.stateIndex),
    siblings: payload.stateSiblings.map(BigInt),
    depth: Number(payload.stateDepth),
  },
  aspWitness: {
    root: BigInt(payload.aspRoot),
    leaf: BigInt(payload.aspLeaf),
    index: Number(payload.aspIndex),
    siblings: payload.aspSiblings.map(BigInt),
    depth: Number(payload.aspDepth),
  },
});
