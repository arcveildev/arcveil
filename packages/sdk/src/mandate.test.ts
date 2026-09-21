import { describe, expect, it, vi } from "vitest";
import { anchorCounter, mandateCommitment, registerMandate, revokeMandate } from "./mandate.js";
import type { Hex } from "./types.js";

const REGISTRY = `0x${"11".repeat(20)}` as Hex;
const COMMITMENT = `0x${"4d".repeat(32)}` as Hex;

const writer = () => {
  const writeContract = vi.fn(async () => `0x${"ab".repeat(32)}` as Hex);
  const client = { writeContract, chain: { id: 5042 }, account: { address: REGISTRY } };
  return { writer: { client, registry: REGISTRY } as never, writeContract };
};

describe("mandateCommitment", () => {
  it("is stable for the same terms and different for any change", () => {
    const terms = "assets: USDC only\nper action: 250 USDC";
    expect(mandateCommitment(terms)).toBe(mandateCommitment(terms));
    expect(mandateCommitment(terms)).not.toBe(mandateCommitment(`${terms} `));
    expect(mandateCommitment(terms)).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("writes", () => {
  it("registers an epoch against the mandate registry", async () => {
    const { writer: w, writeContract } = writer();
    await registerMandate(w, 7, COMMITMENT);
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: REGISTRY, functionName: "register", args: [BigInt(7), COMMITMENT] }),
    );
  });

  it("revokes an epoch", async () => {
    const { writer: w, writeContract } = writer();
    await revokeMandate(w, 7);
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "revoke", args: [BigInt(7)] }),
    );
  });

  it("anchors a budget commitment", async () => {
    const { writer: w, writeContract } = writer();
    await anchorCounter(w, COMMITMENT);
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "anchor", args: [COMMITMENT] }),
    );
  });
});
