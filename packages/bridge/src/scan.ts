import { deriveNotes, type Note } from "./note";
import { witnessFor, type MerkleWitness } from "./tree";

/**
 * Reading the pool back off the chain.
 *
 * Nothing about a note is stored anywhere, so everything a withdrawal needs is
 * recovered here: which deposits are yours, where they sit in the state tree,
 * and where their labels sit in the association set.
 *
 * The two trees are built from different events, and getting that wrong is the
 * kind of mistake that only shows up as a proof nobody accepts:
 *
 * - The **state tree** contains every leaf the pool ever inserted, which is
 *   deposits *and* the change commitments withdrawals create. Building it from
 *   `Deposited` alone is correct exactly until the first withdrawal, and wrong
 *   forever after. `LeafInserted` is the only event that sees all of them.
 * - The **ASP tree** contains labels, which only deposits have.
 */

/** A `Deposited` event, reduced to what matters here. */
export type DepositLog = {
  readonly commitment: bigint;
  readonly label: bigint;
  readonly value: bigint;
  readonly precommitment: bigint;
  readonly blockNumber: bigint;
  readonly logIndex: number;
};

/** A `LeafInserted` event. `index` is the tree's size *after* the insertion, so it starts at one. */
export type LeafLog = {
  readonly index: bigint;
  readonly leaf: bigint;
};

export class TreeGapError extends Error {
  constructor(expected: bigint, got: bigint) {
    super(
      `the pool's leaves are not contiguous: expected index ${expected}, got ${got}. ` +
        `Some logs are missing — widen the block range or use an endpoint that does not truncate.`,
    );
    this.name = "TreeGapError";
  }
}

/** Chain order: block first, then position within the block. */
const inChainOrder = <T extends { blockNumber: bigint; logIndex: number }>(logs: readonly T[]): readonly T[] =>
  [...logs].sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1));

/**
 * Every label, in the order the postman inserts them.
 *
 * Shared with the relayer on purpose: two implementations of this ordering
 * would eventually disagree, and the disagreement would look like a bad proof.
 */
export const orderedLabels = (deposits: readonly DepositLog[]): readonly bigint[] =>
  inChainOrder(deposits).map((deposit) => deposit.label);

/**
 * Every state-tree leaf, in insertion order, refusing a set with a hole in it.
 *
 * A gap means logs were dropped — a range limit, a pruned endpoint — and the
 * tree built from them would have a root the pool has never held. Failing here
 * says so; carrying on would fail later as an unexplained invalid proof.
 */
export const orderedLeaves = (leaves: readonly LeafLog[]): readonly bigint[] => {
  const sorted = [...leaves].sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));

  return sorted.map((entry, position) => {
    const expected = BigInt(position + 1);
    if (entry.index !== expected) throw new TreeGapError(expected, entry.index);
    return entry.leaf;
  });
};

export type PoolState = {
  /** Deposits, in chain order. */
  readonly deposits: readonly DepositLog[];
  /** Every state-tree leaf, in insertion order. */
  readonly leaves: readonly bigint[];
  /** Every label, in insertion order. */
  readonly labels: readonly bigint[];
};

export const poolState = (deposits: readonly DepositLog[], leaves: readonly LeafLog[]): PoolState => ({
  deposits: inChainOrder(deposits),
  leaves: orderedLeaves(leaves),
  labels: orderedLabels(deposits),
});

export type OwnedDeposit = {
  readonly note: Note;
  readonly deposit: DepositLog;
};

/**
 * Which deposits in the pool belong to these notes.
 *
 * A deposit publishes its precommitment, and only the holder of the veil key
 * can derive the note behind it — so this is a local lookup against derived
 * values, not a query that tells anyone what is being looked for.
 *
 * @param count How many notes to derive and look for. Notes are used in order,
 *        so the first gap is usually the end; scanning a few past it is cheap.
 */
export const findOwned = (state: PoolState, signature: `0x${string}`, count = 32): readonly OwnedDeposit[] => {
  const notes = deriveNotes(signature, count);
  const byPrecommitment = new Map(notes.map((note) => [note.precommitment, note]));

  return state.deposits.flatMap((deposit) => {
    const note = byPrecommitment.get(deposit.precommitment);
    return note ? [{ note, deposit }] : [];
  });
};

/** The first note index this key has not used yet, so a new deposit never reuses one. */
export const nextNoteIndex = (owned: readonly OwnedDeposit[]): number =>
  owned.reduce((highest, entry) => Math.max(highest, entry.note.index + 1), 0);

export type Witnesses = {
  readonly stateWitness: MerkleWitness;
  readonly aspWitness: MerkleWitness;
};

/**
 * The two inclusion proofs a withdrawal needs.
 *
 * Throws rather than returning a witness for the wrong leaf: a commitment that
 * is not in the state tree, or a label the association set has not admitted,
 * are different problems with different answers, and the caller has to be able
 * to tell them apart.
 */
export const witnessesFor = (state: PoolState, deposit: DepositLog, commitment = deposit.commitment): Witnesses => ({
  stateWitness: witnessFor(state.leaves, commitment),
  aspWitness: witnessFor(state.labels, deposit.label),
});

/** Whether this deposit's label has been admitted, which is what makes it spendable privately. */
export const isSpendable = (state: PoolState, deposit: DepositLog): boolean => state.labels.includes(deposit.label);
