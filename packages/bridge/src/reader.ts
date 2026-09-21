import type { Address, PublicClient } from "viem";

import { POOL_ABI } from "./pool";
import { poolState, type DepositLog, type LeafLog, type PoolState } from "./scan";

/**
 * Fetching the pool's state from a node.
 *
 * Split from `scan.ts` on purpose: the ordering and the tree building are pure
 * and tested without a chain, and this is the thin part that talks to one. It
 * is used by the browser and by the relayer's postman, so both see the same
 * pool in the same order.
 *
 * Every read here is a public log query. It reveals which pool is being read
 * and nothing about who is reading or what they are looking for — the note
 * matching happens locally, against values only the veil key can derive.
 */

const DEPOSITED = POOL_ABI[0];
const LEAF_INSERTED = POOL_ABI[1];

export type ReadOptions = {
  /** The block the pool was deployed in. Scanning from genesis works and is slow. */
  readonly fromBlock: bigint;
  readonly toBlock?: bigint | "latest";
};

const asDeposit = (log: {
  blockNumber: bigint | null;
  logIndex: number | null;
  args: Record<string, unknown>;
}): DepositLog => ({
  commitment: log.args._commitment as bigint,
  label: log.args._label as bigint,
  value: log.args._value as bigint,
  precommitment: log.args._precommitmentHash as bigint,
  blockNumber: log.blockNumber ?? 0n,
  logIndex: log.logIndex ?? 0,
});

const asLeaf = (log: { args: Record<string, unknown> }): LeafLog => ({
  index: log.args._index as bigint,
  leaf: log.args._leaf as bigint,
});

/**
 * Reads both event streams and assembles the state.
 *
 * They are fetched together because they have to describe the same moment: a
 * deposit landing between the two queries would give a label with no leaf, and
 * the resulting tree would have a root the pool has never held. `toBlock` is
 * pinned for that reason.
 */
export const readPoolState = async (
  client: PublicClient,
  pool: Address,
  options: ReadOptions,
): Promise<PoolState> => {
  const toBlock = options.toBlock ?? (await client.getBlockNumber());

  const [deposits, leaves] = await Promise.all([
    client.getLogs({ address: pool, event: DEPOSITED, fromBlock: options.fromBlock, toBlock }),
    client.getLogs({ address: pool, event: LEAF_INSERTED, fromBlock: options.fromBlock, toBlock }),
  ]);

  return poolState(
    deposits.map((log) => asDeposit(log as never)),
    leaves.map((log) => asLeaf(log as never)),
  );
};
