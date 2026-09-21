import { ENTRYPOINT_ABI, readPoolState, rootOf } from "@arcveil/bridge";
import { keccak256, stringToHex, type Address, type PublicClient, type WalletClient } from "viem";

/**
 * The association-set postman.
 *
 * A withdrawal must prove its deposit's label is in the association set, and
 * the set's root has to be on chain for the pool to check against. This
 * publishes it.
 *
 * **The current policy admits every label, unfiltered.** Nothing is screened,
 * nothing is excluded, and that makes this pool a mixer in function. The
 * mechanism is the upstream one, so a stricter policy can be introduced later
 * without redeploying anything — but that is a future tense, and the
 * interface says so in the present.
 *
 * The postman has exactly one power: choosing which labels are spendable. It
 * cannot move funds, cannot upgrade anything, and cannot see who withdraws.
 * Its key is separate from the relayer's and from the 2-of-3 owner for that
 * reason — it is the key most exposed and the one worth the least.
 */

export type AspState = {
  readonly labels: readonly bigint[];
  readonly root: bigint;
  readonly published: bigint;
  readonly upToDate: boolean;
};

/**
 * The label list's digest, published in the `ipfsCID` field.
 *
 * It is not an IPFS CID. There is nothing to pin: the set is every `Deposited`
 * event the pool ever emitted, so anyone can rebuild it from the chain and
 * recompute this. Publishing the digest lets them check that the postman
 * published the set it claims, which a real CID would also do and an empty
 * string would not. The contract requires 32–64 characters; this is 64.
 */
export const digestOf = (labels: readonly bigint[]): string =>
  keccak256(stringToHex(labels.map((label) => label.toString()).join(","))).slice(2);

/**
 * Reads every label the pool has ever issued, in the only order that produces
 * the right root.
 *
 * The ordering lives in `@arcveil/bridge` and is shared with the browser. Two
 * implementations of it would eventually disagree, and the disagreement would
 * surface as a withdrawal proof nobody accepts — with no clue as to why.
 */
export const readLabels = async (
  publicClient: PublicClient,
  pool: Address,
  fromBlock: bigint,
): Promise<readonly bigint[]> => (await readPoolState(publicClient, pool, { fromBlock })).labels;

export const readState = async (
  publicClient: PublicClient,
  entrypoint: Address,
  pool: Address,
  fromBlock: bigint,
): Promise<AspState> => {
  const labels = await readLabels(publicClient, pool, fromBlock);
  const root = rootOf(labels);

  const published = await publicClient.readContract({
    address: entrypoint,
    abi: ENTRYPOINT_ABI,
    functionName: "latestRoot",
  });

  return { labels, root, published, upToDate: root === published };
};

export type PublishOutcome =
  | { readonly published: false; readonly reason: string }
  | { readonly published: true; readonly hash: `0x${string}`; readonly root: bigint; readonly labels: number };

/** Publishes the root, and only when it has actually moved. */
export const publishRoot = async (
  state: AspState,
  entrypoint: Address,
  clients: { readonly walletClient: WalletClient },
): Promise<PublishOutcome> => {
  if (state.labels.length === 0) return { published: false, reason: "no deposits yet" };
  if (state.upToDate) return { published: false, reason: "root already published" };

  const account = clients.walletClient.account;
  if (!account) return { published: false, reason: "no postman key configured" };

  const hash = await clients.walletClient.writeContract({
    account,
    chain: null,
    address: entrypoint,
    abi: ENTRYPOINT_ABI,
    functionName: "updateRoot",
    args: [state.root, digestOf(state.labels)],
  });

  return { published: true, hash, root: state.root, labels: state.labels.length };
};
