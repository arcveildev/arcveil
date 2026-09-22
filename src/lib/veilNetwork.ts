import { routesInto, type CctpRoute } from "@arcveil/bridge";
import { arc, arcTestnet } from "@arcveildev/sdk";
import type { Chain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "viem/chains";

import { VEIL, type VeilNetwork } from "@/data/site";

/**
 * Which Arc the bridge is on, and which chains a deposit can arrive from.
 *
 * This is deliberately not `ARC` in `src/data/site.ts`. That one is where the
 * receipt verifier reads mandates and anchors, and those registries exist on
 * mainnet only. The bridge is a separate deployment with its own life: it
 * comes up on testnet first and has to be proven there with real money before
 * it points anywhere else. One field serving both would mean the verifier
 * breaking every time the bridge moves, which is how a page ends up lying
 * about one thing to stay honest about another.
 *
 * `pnpm veil:addresses` sets `VEIL.network` alongside the addresses, so the
 * network and the contracts deployed to it are written by the same command and
 * cannot drift apart.
 */

export type { VeilNetwork };

/** Thrown when a chain has no way into the pool. A programming error, not a user's. */
export class UnroutableNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnroutableNetworkError";
  }
}

export const arcChainFor = (network: VeilNetwork): Chain => (network === "testnet" ? arcTestnet : arc);

/**
 * A source chain, paired with the chain definition a wallet is asked to switch
 * to. They travel together so that the buttons on the deposit panel and the
 * chains wagmi is configured with cannot disagree — a button for a chain the
 * wallet was never told about looks alive and does nothing.
 */
export type Source = { readonly route: CctpRoute; readonly chain: Chain };

/** Every chain `@arcveil/bridge` has a route for. Adding a route means adding it here. */
const KNOWN: readonly Chain[] = [
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  sepolia,
  baseSepolia,
  arbitrumSepolia,
];

export const sourcesFor = (arcChainId: number): readonly Source[] => {
  const routes = routesInto(arcChainId);
  if (routes.length === 0) {
    throw new UnroutableNetworkError(`Chain ${arcChainId} is not an Arc network, so nothing bridges into it.`);
  }

  return routes.map((route) => {
    const chain = KNOWN.find((candidate) => candidate.id === route.chainId);
    if (!chain) {
      throw new UnroutableNetworkError(
        `${route.name} (${route.chainId}) has a CCTP route but no chain definition, so no wallet could be switched to it.`,
      );
    }
    return { route, chain };
  });
};

/** The same chains, in the same order, shaped as wagmi's non-empty list. */
export const walletChainsFor = (arcChainId: number): readonly [Chain, ...Chain[]] => {
  const [first, ...rest] = sourcesFor(arcChainId).map(({ chain }) => chain);
  if (!first) throw new UnroutableNetworkError(`No source chain can reach Arc ${arcChainId}.`);
  return [first, ...rest];
};

/** Arc as this deployment of the bridge sees it: id, RPC and explorer in one piece. */
export const veilArcChain = (): Chain => arcChainFor(VEIL.network);

export const veilSources = (): readonly Source[] => sourcesFor(veilArcChain().id);

export const veilWalletChains = (): readonly [Chain, ...Chain[]] => walletChainsFor(veilArcChain().id);
