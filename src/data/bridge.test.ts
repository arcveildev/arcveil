import { describe, expect, it } from "vitest";

import { BRIDGE_STEPS, bridgeSteps } from "./bridge";

describe("bridgeSteps", () => {
  it("names the chains a burn can actually start from", () => {
    const [burn] = bridgeSteps(["Ethereum Sepolia", "Base Sepolia", "Arbitrum Sepolia"]);

    expect(burn?.body).toContain("Ethereum Sepolia, Base Sepolia or Arbitrum Sepolia");
    expect(burn?.body).not.toContain("Polygon");
  });

  it("reads as a sentence whether there are three chains or one", () => {
    expect(bridgeSteps(["Base"])[0]?.body).toContain("One transaction on Base.");
    expect(bridgeSteps(["Base", "Polygon"])[0]?.body).toContain("One transaction on Base or Polygon.");
  });

  it("says nothing about where a burn starts when nothing can reach the pool", () => {
    expect(bridgeSteps([])[0]?.body).toContain("One transaction on the source chain.");
  });

  it("leaves the other three steps alone", () => {
    const steps = bridgeSteps(["Base"]);

    expect(steps.slice(1)).toEqual(BRIDGE_STEPS.slice(1));
    expect(steps).toHaveLength(BRIDGE_STEPS.length);
  });

  it("does not rewrite the constant it builds from", () => {
    const before = BRIDGE_STEPS[0]?.body;
    bridgeSteps(["Base"]);

    expect(BRIDGE_STEPS[0]?.body).toBe(before);
  });
});
