import { LeanIMT } from "@zk-kit/lean-imt";
import { poseidon2 } from "poseidon-lite";

/**
 * The two trees a withdrawal proves membership in: the pool's state tree of
 * commitments, and the association set's tree of labels.
 *
 * Both are Lean Incremental Merkle Trees — a node with one child *is* that
 * child, so the tree has no fixed depth and no padding. That detail is not
 * cosmetic: a plain Merkle tree over the same leaves gives a different root,
 * and a different root makes every proof fail. `tree.test.ts` pins this
 * implementation against roots printed by the Solidity library the pool
 * actually inserts into.
 *
 * Insertion order is the whole contract between this file and the chain. Both
 * trees are rebuilt from events in chain order — block, then log index — and
 * there is no other ordering that produces the right root.
 */

/** The circuit is compiled for 32 levels. Siblings are padded to this, and a deeper tree cannot be proven. */
export const MAX_TREE_DEPTH = 32;

export type MerkleWitness = {
  readonly root: bigint;
  readonly leaf: bigint;
  readonly index: number;
  /** Always `MAX_TREE_DEPTH` long, zero-padded, because the circuit takes a fixed-size array. */
  readonly siblings: readonly bigint[];
  /** The tree's real depth, which the circuit checks against its maximum. */
  readonly depth: number;
};

export class LeafNotInTreeError extends Error {
  constructor(leaf: bigint) {
    super(`leaf ${leaf} is not in this tree`);
    this.name = "LeafNotInTreeError";
  }
}

export class TreeTooDeepError extends Error {
  constructor(depth: number) {
    super(`tree is ${depth} levels deep; the circuit is compiled for ${MAX_TREE_DEPTH}`);
    this.name = "TreeTooDeepError";
  }
}

const build = (leaves: readonly bigint[]): LeanIMT => {
  const tree = new LeanIMT((left, right) => poseidon2([left, right]));
  for (const leaf of leaves) tree.insert(leaf);
  return tree;
};

/** The root of a tree over these leaves, in this order. */
export const rootOf = (leaves: readonly bigint[]): bigint => (leaves.length === 0 ? 0n : build(leaves).root);

/**
 * The witness a proof needs for one leaf.
 * @param leaves Every leaf, in chain order.
 * @param leaf The one being proven.
 */
export const witnessFor = (leaves: readonly bigint[], leaf: bigint): MerkleWitness => {
  const index = leaves.indexOf(leaf);
  if (index === -1) throw new LeafNotInTreeError(leaf);

  const tree = build(leaves);
  if (tree.depth > MAX_TREE_DEPTH) throw new TreeTooDeepError(tree.depth);

  const proof = tree.generateProof(index);
  const siblings = [...proof.siblings];
  while (siblings.length < MAX_TREE_DEPTH) siblings.push(0n);

  return { root: tree.root, leaf, index, siblings, depth: tree.depth };
};

/**
 * How many deposits a withdrawal hides among — the number the interface has to
 * show, because privacy here is a crowd and a crowd of one is not one.
 */
export const anonymitySet = (leaves: readonly bigint[]): number => leaves.length;
