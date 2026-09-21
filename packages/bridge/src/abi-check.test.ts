import type { Abi } from "viem";
import { describe, expect, it } from "vitest";

import { mismatches } from "./abi-check";

/**
 * A drift check that cannot fail is worse than no drift check, so this proves
 * it catches the three ways an ABI actually goes wrong.
 */
const artifact = [
  {
    type: "function",
    name: "relay",
    stateMutability: "nonpayable",
    inputs: [{ name: "_message", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "_commitment", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "event",
    name: "Veiled",
    inputs: [{ name: "_commitment", type: "uint256", indexed: true, internalType: "uint256" }],
  },
] as const;

describe("abi drift", () => {
  it("passes when only the names differ", () => {
    const ours = [
      {
        type: "function",
        name: "relay",
        stateMutability: "nonpayable",
        inputs: [{ name: "somethingElse", type: "bytes" }],
        outputs: [{ name: "alsoRenamed", type: "uint256" }],
      },
    ] as const;

    expect(mismatches(ours as unknown as Abi, artifact)).toEqual([]);
  });

  it("catches a changed argument type", () => {
    const ours = [
      {
        type: "function",
        name: "relay",
        stateMutability: "nonpayable",
        inputs: [{ name: "message", type: "string" }],
        outputs: [{ name: "commitment", type: "uint256" }],
      },
    ] as const;

    expect(mismatches(ours as unknown as Abi, artifact)).toEqual([
      { name: "relay(string)", reason: "no function with this signature in the compiled contract" },
    ]);
  });

  it("catches a changed return type", () => {
    const ours = [
      {
        type: "function",
        name: "relay",
        stateMutability: "nonpayable",
        inputs: [{ name: "message", type: "bytes" }],
        outputs: [{ name: "commitment", type: "address" }],
      },
    ] as const;

    expect(mismatches(ours as unknown as Abi, artifact)).toEqual([
      { name: "relay(bytes)", reason: "returns uint256, not address" },
    ]);
  });

  it("catches an event that no longer exists", () => {
    const ours = [
      { type: "event", name: "Veiled", inputs: [{ name: "commitment", type: "address", indexed: true }] },
    ] as const;

    expect(mismatches(ours as unknown as Abi, artifact)).toEqual([
      { name: "Veiled(address)", reason: "no event with this signature in the compiled contract" },
    ]);
  });
});
