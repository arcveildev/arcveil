import { getAddress } from "viem";
import { describe, expect, it } from "vitest";

import { ARC_CHAIN_ID, ARC_DOMAIN, ARC_TESTNET_CHAIN_ID, ROUTES, routeFor, routesInto } from "./routes";

describe("routes", () => {
  it("has no duplicate chain IDs", () => {
    const ids = ROUTES.map((route) => route.chainId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never claims Arc as a source, because a bridge from Arc to Arc is not a bridge", () => {
    expect(ROUTES.some((route) => route.domain === ARC_DOMAIN)).toBe(false);
    expect(routeFor(ARC_CHAIN_ID)).toBeUndefined();
  });

  it("stores every address checksummed, so a comparison never fails on case", () => {
    for (const route of ROUTES) {
      expect(getAddress(route.usdc)).toBe(route.usdc);
      expect(getAddress(route.tokenMessenger)).toBe(route.tokenMessenger);
      expect(getAddress(route.messageTransmitter)).toBe(route.messageTransmitter);
    }
  });

  it("uses one CCTP deployment per network class", () => {
    const messengers = new Set(ROUTES.filter((r) => !r.testnet).map((r) => r.tokenMessenger));
    expect(messengers.size).toBe(1);

    const testMessengers = new Set(ROUTES.filter((r) => r.testnet).map((r) => r.tokenMessenger));
    expect(testMessengers.size).toBe(1);
    expect([...messengers][0]).not.toBe([...testMessengers][0]);
  });

  it("keeps testnet money off mainnet and mainnet money off testnet", () => {
    expect(routesInto(ARC_CHAIN_ID).every((route) => !route.testnet)).toBe(true);
    expect(routesInto(ARC_TESTNET_CHAIN_ID).every((route) => route.testnet)).toBe(true);
  });

  it("offers nothing for a chain that is not Arc", () => {
    expect(routesInto(1)).toEqual([]);
  });
});
