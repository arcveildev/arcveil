import { describe, expect, it } from "vitest";

import { deriveNote } from "./note";
import {
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
} from "./scan";
import { rootOf } from "./tree";

const SIGNATURE = `0x${"ab".repeat(65)}` as const;

const deposit = (overrides: Partial<DepositLog> & Pick<DepositLog, "commitment" | "blockNumber">): DepositLog => ({
  label: 1n,
  value: 25_000_000n,
  precommitment: 1n,
  logIndex: 0,
  ...overrides,
});

const leaf = (index: number, value: bigint): LeafLog => ({ index: BigInt(index), leaf: value });

describe("ordering leaves", () => {
  it("uses the pool's own index, not the order the RPC happened to return them", () => {
    expect(orderedLeaves([leaf(3, 30n), leaf(1, 10n), leaf(2, 20n)])).toEqual([10n, 20n, 30n]);
  });

  it("refuses a set with a hole rather than building a root the pool never held", () => {
    expect(() => orderedLeaves([leaf(1, 10n), leaf(3, 30n)])).toThrow(TreeGapError);
    expect(() => orderedLeaves([leaf(1, 10n), leaf(3, 30n)])).toThrow(/expected index 2/);
  });

  it("refuses a set that does not start at one", () => {
    // The pool emits the size *after* insertion, so the first leaf is index 1.
    expect(() => orderedLeaves([leaf(2, 20n), leaf(3, 30n)])).toThrow(TreeGapError);
  });

  it("accepts an empty pool", () => {
    expect(orderedLeaves([])).toEqual([]);
  });
});

describe("ordering labels", () => {
  it("sorts by block, then by position within the block", () => {
    const deposits = [
      deposit({ commitment: 3n, label: 30n, blockNumber: 11n, logIndex: 0 }),
      deposit({ commitment: 2n, label: 20n, blockNumber: 10n, logIndex: 5 }),
      deposit({ commitment: 1n, label: 10n, blockNumber: 10n, logIndex: 1 }),
    ];

    expect(orderedLabels(deposits)).toEqual([10n, 20n, 30n]);
  });
});

describe("the state tree is not the deposit tree", () => {
  it("includes the change commitments withdrawals create", () => {
    // Two deposits, then a withdrawal inserting its change commitment third.
    const deposits = [
      deposit({ commitment: 111n, label: 10n, blockNumber: 1n }),
      deposit({ commitment: 222n, label: 20n, blockNumber: 2n }),
    ];
    const leaves = [leaf(1, 111n), leaf(2, 222n), leaf(3, 999n)];

    const state = poolState(deposits, leaves);

    expect(state.leaves).toEqual([111n, 222n, 999n]);
    expect(state.labels).toEqual([10n, 20n]);
    // Building the state tree from deposits alone would give a different root,
    // and every proof against it would be refused.
    expect(rootOf(state.leaves)).not.toBe(rootOf([111n, 222n]));
  });
});

describe("finding what is yours", () => {
  const mine = deriveNote(SIGNATURE, 0);
  const alsoMine = deriveNote(SIGNATURE, 1);

  const state = poolState(
    [
      deposit({ commitment: 111n, label: 10n, precommitment: 42n, blockNumber: 1n }),
      deposit({ commitment: 222n, label: 20n, precommitment: mine.precommitment, blockNumber: 2n }),
      deposit({ commitment: 333n, label: 30n, precommitment: alsoMine.precommitment, blockNumber: 3n }),
    ],
    [leaf(1, 111n), leaf(2, 222n), leaf(3, 333n)],
  );

  it("matches deposits by the precommitment they published", () => {
    const owned = findOwned(state, SIGNATURE);

    expect(owned.map((entry) => entry.deposit.commitment)).toEqual([222n, 333n]);
    expect(owned[0]?.note.index).toBe(0);
    expect(owned[1]?.note.index).toBe(1);
  });

  it("claims nothing that is not derived from this key", () => {
    const stranger = `0x${"cd".repeat(65)}` as const;
    expect(findOwned(state, stranger)).toEqual([]);
  });

  it("knows which note index to use next, so a deposit never reuses one", () => {
    expect(nextNoteIndex(findOwned(state, SIGNATURE))).toBe(2);
    expect(nextNoteIndex([])).toBe(0);
  });
});

describe("witnesses", () => {
  const state = poolState(
    [
      deposit({ commitment: 111n, label: 10n, blockNumber: 1n }),
      deposit({ commitment: 222n, label: 20n, blockNumber: 2n }),
      deposit({ commitment: 333n, label: 30n, blockNumber: 3n }),
    ],
    [leaf(1, 111n), leaf(2, 222n), leaf(3, 333n)],
  );

  it("proves the commitment against the state tree and the label against the ASP tree", () => {
    const { stateWitness, aspWitness } = witnessesFor(state, state.deposits[1]!);

    expect(stateWitness.root).toBe(rootOf(state.leaves));
    expect(stateWitness.leaf).toBe(222n);
    expect(aspWitness.root).toBe(rootOf(state.labels));
    expect(aspWitness.leaf).toBe(20n);
  });

  it("follows a change commitment rather than the original, once one has been spent", () => {
    const withChange = poolState(state.deposits, [leaf(1, 111n), leaf(2, 222n), leaf(3, 333n), leaf(4, 444n)]);
    const { stateWitness } = witnessesFor(withChange, withChange.deposits[1]!, 444n);

    expect(stateWitness.leaf).toBe(444n);
  });

  it("says which of the two trees is missing it, because the answers differ", () => {
    const unadmitted = poolState([deposit({ commitment: 111n, label: 99n, blockNumber: 1n })], [leaf(1, 111n)]);
    const other = poolState([deposit({ commitment: 111n, label: 10n, blockNumber: 1n })], [leaf(1, 111n)]);

    expect(isSpendable(unadmitted, unadmitted.deposits[0]!)).toBe(true);
    expect(isSpendable(other, unadmitted.deposits[0]!)).toBe(false);
    expect(() => witnessesFor(other, unadmitted.deposits[0]!)).toThrow(/not in this tree/);
  });
});
