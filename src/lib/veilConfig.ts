import { createPublicClient, http, type PublicClient } from "viem";

import { VEIL } from "@/data/site";
import { veilArcChain } from "./veilNetwork";

/**
 * What the bridge needs before it can do anything, and a plain answer when it
 * is not there.
 *
 * `VEIL` is null until the contracts are deployed. Rather than letting that
 * surface as a crash or, worse, a form that looks alive and silently does
 * nothing, the page asks this first and says which piece is missing.
 */

export type VeilConfig = {
  readonly entrypoint: `0x${string}`;
  readonly pool: `0x${string}`;
  readonly gateway: `0x${string}`;
  readonly scope: bigint;
  readonly relayer: string;
  /** The block the pool was deployed in; scanning from genesis would work and be slow. */
  readonly fromBlock: bigint;
};

export type ConfigState =
  | { readonly ready: true; readonly config: VeilConfig }
  | { readonly ready: false; readonly missing: readonly string[] };

/**
 * Set once the deploy script has run. It is a constant rather than an env var
 * because every other address on this site is: a deployment is a fact about
 * the world, and the repository should record which one it is pointing at.
 */
const FROM_BLOCK = 0n;

export const veilConfig = (): ConfigState => {
  const missing = [
    VEIL.entrypoint === null && "Entrypoint",
    VEIL.pool === null && "PrivacyPool",
    VEIL.gateway === null && "VeilGateway",
    VEIL.scope === null && "the pool's scope",
    VEIL.relayer === null && "a relayer",
  ].filter((entry): entry is string => typeof entry === "string");

  if (missing.length > 0) return { ready: false, missing };

  return {
    ready: true,
    config: {
      entrypoint: VEIL.entrypoint as `0x${string}`,
      pool: VEIL.pool as `0x${string}`,
      gateway: VEIL.gateway as `0x${string}`,
      scope: BigInt(VEIL.scope as string),
      relayer: VEIL.relayer as string,
      fromBlock: FROM_BLOCK,
    },
  };
};

/**
 * A read-only client for Arc.
 *
 * Deliberately not a wagmi chain: the browser never signs anything on Arc.
 * Deposits are signed on the source chain and withdrawals are submitted by the
 * relayer, because a wallet paying its own gas here would rebuild the link the
 * pool exists to break.
 *
 * The chain comes from `VEIL.network`, not from `ARC`: the verifier reads
 * mainnet registries and the bridge may be on testnet, and reading one with
 * the other's RPC finds nothing and says nothing about why.
 */
export const arcClient = (): PublicClient => {
  const chain = veilArcChain();
  return createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });
};
