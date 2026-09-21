import { rootOf } from "@arcveil/bridge";
import type { Address, PublicClient, WalletClient } from "viem";
import { describe, expect, it } from "vitest";

import { digestOf, publishRoot, readLabels, type AspState } from "./asp";

const ENTRYPOINT = "0x00000000000000000000000000000000000000c3" as Address;
const POOL = "0x00000000000000000000000000000000000000d4" as Address;

/**
 * A node that answers the two log queries `readPoolState` makes. Deposits
 * carry labels; LeafInserted carries the tree's own index, and the reader
 * refuses a set with a hole in it.
 */
const poolClient = (deposits: readonly unknown[], leaves: readonly unknown[]): PublicClient =>
  ({
    getBlockNumber: async () => 100n,
    getLogs: async ({ event }: { event: { name: string } }) =>
      event.name === "Deposited" ? deposits : leaves,
  }) as unknown as PublicClient;

const log = (blockNumber: bigint, logIndex: number, label: bigint) => ({
  blockNumber,
  logIndex,
  args: { _commitment: label * 10n, _label: label, _value: 1n, _precommitmentHash: label },
});

const leafLog = (index: number, leaf: bigint) => ({ args: { _index: BigInt(index), _leaf: leaf } });

describe("the association set's digest", () => {
  it("fits the contract's 32-to-64 character window", () => {
    const digest = digestOf([1n, 2n, 3n]);
    expect(digest).toHaveLength(64);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is reproducible by anyone reading the same chain", () => {
    expect(digestOf([1n, 2n, 3n])).toBe(digestOf([1n, 2n, 3n]));
  });

  it("changes when the set does, including when only the order does", () => {
    expect(digestOf([1n, 2n])).not.toBe(digestOf([2n, 1n]));
    expect(digestOf([1n, 2n])).not.toBe(digestOf([1n, 2n, 3n]));
  });

  it("does not collide on the separator", () => {
    // "1,23" and "12,3" must not hash the same.
    expect(digestOf([1n, 23n])).not.toBe(digestOf([12n, 3n]));
  });
});

describe("reading labels", () => {
  it("puts them in chain order, which is the only order that gives the right root", async () => {
    const shuffled = [log(11n, 0, 300n), log(10n, 2, 200n), log(10n, 1, 100n)];
    const leaves = [leafLog(1, 1000n), leafLog(2, 2000n), leafLog(3, 3000n)];

    expect(await readLabels(poolClient(shuffled, leaves), POOL, 0n)).toEqual([100n, 200n, 300n]);
  });

  it("gives an empty set for a pool with no deposits", async () => {
    expect(await readLabels(poolClient([], []), POOL, 0n)).toEqual([]);
  });

  it("agrees with the tree the circuit proves against", async () => {
    const labels = await readLabels(poolClient([log(1n, 0, 5n), log(2n, 0, 6n)], [leafLog(1, 50n), leafLog(2, 60n)]), POOL, 0n);
    expect(rootOf(labels)).toBe(rootOf([5n, 6n]));
  });

  it("refuses a pool whose leaves arrived with a gap, rather than publishing a root nobody holds", async () => {
    const client = poolClient([log(1n, 0, 5n)], [leafLog(1, 50n), leafLog(3, 70n)]);
    await expect(readLabels(client, POOL, 0n)).rejects.toThrow(/not contiguous/);
  });
});

describe("publishing", () => {
  const wallet = (onWrite: () => void): WalletClient =>
    ({
      account: { address: ENTRYPOINT },
      writeContract: async () => {
        onWrite();
        return `0x${"ab".repeat(32)}`;
      },
    }) as unknown as WalletClient;

  const state = (labels: readonly bigint[], published: bigint): AspState => ({
    labels,
    root: rootOf(labels),
    published,
    upToDate: rootOf(labels) === published,
  });

  it("publishes when the root has moved", async () => {
    let wrote = false;
    const outcome = await publishRoot(state([1n, 2n], 0n), ENTRYPOINT, { walletClient: wallet(() => (wrote = true)) });

    expect(wrote).toBe(true);
    expect(outcome).toMatchObject({ published: true, labels: 2 });
  });

  it("spends nothing when the root has not moved", async () => {
    let wrote = false;
    const current = state([1n, 2n], rootOf([1n, 2n]));
    const outcome = await publishRoot(current, ENTRYPOINT, { walletClient: wallet(() => (wrote = true)) });

    expect(wrote).toBe(false);
    expect(outcome).toEqual({ published: false, reason: "root already published" });
  });

  it("publishes nothing for an empty pool, because the contract refuses a zero root", async () => {
    let wrote = false;
    const outcome = await publishRoot(state([], 0n), ENTRYPOINT, { walletClient: wallet(() => (wrote = true)) });

    expect(wrote).toBe(false);
    expect(outcome).toEqual({ published: false, reason: "no deposits yet" });
  });
});
