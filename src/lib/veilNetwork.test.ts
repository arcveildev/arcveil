import { ARC_CHAIN_ID, ARC_TESTNET_CHAIN_ID, ROUTES } from "@arcveil/bridge";
import { describe, expect, it } from "vitest";

import {
  arcChainFor,
  sourcesFor,
  UnroutableNetworkError,
  veilArcChain,
  walletChainsFor,
} from "./veilNetwork";

describe("arcChainFor", () => {
  it("resolves each network to the chain that answers for it", () => {
    expect(arcChainFor("mainnet").id).toBe(ARC_CHAIN_ID);
    expect(arcChainFor("testnet").id).toBe(ARC_TESTNET_CHAIN_ID);
  });

  it("carries the RPC and explorer with it, so neither can be paired with the wrong chain", () => {
    expect(arcChainFor("testnet").rpcUrls.default.http[0]).toContain("testnet");
    expect(arcChainFor("mainnet").rpcUrls.default.http[0]).not.toContain("testnet");
  });
});

describe("sourcesFor", () => {
  it("feeds testnet from testnets only", () => {
    const sources = sourcesFor(ARC_TESTNET_CHAIN_ID);

    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every(({ route }) => route.testnet)).toBe(true);
    expect(sources.map(({ route }) => route.chainId)).toContain(84_532);
    expect(sources.map(({ route }) => route.chainId)).not.toContain(8453);
  });

  it("feeds mainnet from mainnets only", () => {
    const sources = sourcesFor(ARC_CHAIN_ID);

    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every(({ route }) => !route.testnet)).toBe(true);
  });

  it("pairs every route with the chain a wallet would be asked to switch to", () => {
    for (const { route, chain } of [...sourcesFor(ARC_CHAIN_ID), ...sourcesFor(ARC_TESTNET_CHAIN_ID)]) {
      expect(chain.id).toBe(route.chainId);
    }
  });

  // A route the wallet cannot be switched to would render as a button that
  // does nothing. Adding one to @arcveil/bridge has to fail here, not there.
  it("leaves no route in the package unreachable", () => {
    const reached = [...sourcesFor(ARC_CHAIN_ID), ...sourcesFor(ARC_TESTNET_CHAIN_ID)];

    expect(reached).toHaveLength(ROUTES.length);
  });

  it("refuses a chain that is not Arc rather than offering an empty list", () => {
    expect(() => sourcesFor(1)).toThrow(UnroutableNetworkError);
  });
});

describe("walletChainsFor", () => {
  it("returns the same chains the panel offers, in the same order", () => {
    const sources = sourcesFor(ARC_TESTNET_CHAIN_ID);

    expect(walletChainsFor(ARC_TESTNET_CHAIN_ID).map((chain) => chain.id)).toEqual(
      sources.map(({ chain }) => chain.id),
    );
  });

  it("refuses a chain that is not Arc", () => {
    expect(() => walletChainsFor(1)).toThrow(UnroutableNetworkError);
  });
});

describe("what the site is configured for", () => {
  it("is one of the two Arc networks, so the bridge always has somewhere to read", () => {
    expect([ARC_CHAIN_ID, ARC_TESTNET_CHAIN_ID]).toContain(veilArcChain().id);
  });

  it("has source chains for whichever one it is", () => {
    expect(walletChainsFor(veilArcChain().id).length).toBeGreaterThan(0);
  });
});
