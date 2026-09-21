import { poseidon2 } from "poseidon-lite";
import { describe, expect, it } from "vitest";

import { anonymitySet, LeafNotInTreeError, MAX_TREE_DEPTH, rootOf, witnessFor } from "./tree";

/**
 * Printed by `contracts/test/LeanImt.t.sol` from `InternalLeanIMT`, the library
 * the pool inserts into. A root computed differently here than there makes
 * every withdrawal proof fail.
 */
const SOLIDITY_ROOTS = [
  1n,
  7853200120776062878684798364095072458815029376092732009249414926327459813530n,
  13816780880028945690020260331303642730075999758909899334839547418969502592169n,
  3330844108758711782672220159612173083623710937399719017074673646455206473965n,
  11512324111804726054755717642058292259866309947044530224809882918003853859592n,
];

describe("lean IMT agrees with the contracts", () => {
  it.each(SOLIDITY_ROOTS.map((root, index) => [index + 1, root] as const))(
    "matches the Solidity root after %i leaves",
    (count, expected) => {
      const leaves = Array.from({ length: count }, (_, i) => BigInt(i + 1));
      expect(rootOf(leaves)).toBe(expected);
    },
  );

  it("propagates a lone child instead of padding it, which is what makes it lean", () => {
    // A plain Merkle tree would hash leaf 3 against a zero here; a LeanIMT
    // carries it up untouched, and the two give different roots.
    expect(rootOf([1n, 2n, 3n])).not.toBe(poseidon2([poseidon2([1n, 2n]), poseidon2([3n, 0n])]));
    expect(rootOf([1n, 2n, 3n])).toBe(poseidon2([poseidon2([1n, 2n]), 3n]));
  });
});

describe("witnesses", () => {
  const leaves = [11n, 22n, 33n, 44n, 55n, 66n, 77n];

  it("gives the circuit a fixed-length sibling array", () => {
    expect(witnessFor(leaves, 33n).siblings).toHaveLength(MAX_TREE_DEPTH);
  });

  it("reports the tree's real depth, not the padded one", () => {
    expect(witnessFor(leaves, 33n).depth).toBe(3);
  });

  it("finds the leaf where the chain put it", () => {
    expect(witnessFor(leaves, 11n).index).toBe(0);
    expect(witnessFor(leaves, 77n).index).toBe(6);
  });

  it("agrees with the root of the whole tree", () => {
    expect(witnessFor(leaves, 44n).root).toBe(rootOf(leaves));
  });

  it("refuses a leaf that is not there rather than proving nonsense", () => {
    expect(() => witnessFor(leaves, 99n)).toThrow(LeafNotInTreeError);
  });

  it("changes the root when the order changes, because order is the contract", () => {
    expect(rootOf([1n, 2n])).not.toBe(rootOf([2n, 1n]));
  });
});

describe("anonymity set", () => {
  it("is the number of deposits, and an empty pool hides nobody", () => {
    expect(anonymitySet([])).toBe(0);
    expect(anonymitySet([1n, 2n, 3n])).toBe(3);
    expect(rootOf([])).toBe(0n);
  });
});
