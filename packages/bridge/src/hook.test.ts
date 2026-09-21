import { describe, expect, it } from "vitest";

import { decodeVeilHook, encodeVeilHook, InvalidHookError, SNARK_SCALAR_FIELD } from "./hook";

const REFUND = "0x000000000000000000000000000000000000FEeD" as const;

describe("veil hook", () => {
  it("round-trips a precommitment and a refund address", () => {
    const hook = { precommitment: 123_456_789n, refund: REFUND };
    expect(decodeVeilHook(encodeVeilHook(hook))).toEqual(hook);
  });

  it("is exactly the 64 bytes the gateway reads", () => {
    const encoded = encodeVeilHook({ precommitment: 1n, refund: REFUND });
    expect((encoded.length - 2) / 2).toBe(64);
  });

  it("refuses a precommitment outside the scalar field", () => {
    expect(() => encodeVeilHook({ precommitment: SNARK_SCALAR_FIELD, refund: REFUND })).toThrow(InvalidHookError);
    expect(() => encodeVeilHook({ precommitment: 0n, refund: REFUND })).toThrow(InvalidHookError);
  });

  it("accepts the largest legal field element", () => {
    const precommitment = SNARK_SCALAR_FIELD - 1n;
    expect(decodeVeilHook(encodeVeilHook({ precommitment, refund: REFUND })).precommitment).toBe(precommitment);
  });

  it("refuses something that is not an address", () => {
    expect(() => encodeVeilHook({ precommitment: 1n, refund: "0xnope" as `0x${string}` })).toThrow(InvalidHookError);
  });

  it("refuses a hook of the wrong length, because the gateway would refund it", () => {
    expect(() => decodeVeilHook("0x1234")).toThrow(/exactly 64 bytes/);
  });
});
