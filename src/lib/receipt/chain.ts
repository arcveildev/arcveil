import type { Hex } from "./types";

/**
 * What the verifier needs from Arc. v0 ships the in-memory reader
 * below; the RPC reader replaces it once the mandate contracts are deployed.
 */
export type MandateRecord = { account: Hex; commitment: Hex; epoch: number; revoked: boolean };
export type TxRecord = { status: "success" | "failed" };

export type ChainReader = {
  /** The chain this reader is pointed at, so a receipt for another chain is caught. */
  chainId: number;
  getMandate: (account: Hex, epoch: number) => Promise<MandateRecord | null>;
  getTransaction: (hash: Hex) => Promise<TxRecord | null>;
  hasCounterAnchor: (account: Hex, commitment: Hex) => Promise<boolean>;
};

export type ChainState = {
  mandates: readonly MandateRecord[];
  transactions: Readonly<Record<string, TxRecord>>;
  anchors: readonly Hex[];
};

export const EMPTY_CHAIN_STATE: ChainState = { mandates: [], transactions: {}, anchors: [] };

export const createMemoryChainReader = (state: ChainState, chainId = 0): ChainReader => ({
  chainId,
  getMandate: async (account, epoch) =>
    state.mandates.find((m) => m.account.toLowerCase() === account.toLowerCase() && m.epoch === epoch) ?? null,
  getTransaction: async (hash) => state.transactions[hash.toLowerCase()] ?? null,
  hasCounterAnchor: async (_account, commitment) =>
    state.anchors.some((anchor) => anchor.toLowerCase() === commitment.toLowerCase()),
});
