import { describe, expect, it } from "vitest";
import { hashTypedData } from "viem";
import { encodeExecute, intentTypedData, type Intent } from "./account";
import type { Hex } from "./types";

/**
 * The fixture below is also asserted in contracts/test/ArcveilAccount.t.sol.
 * Both sides must agree on this exact digest: if the Solidity typehash, the
 * domain, or the field order changes on either side, one of the two suites
 * fails loudly — which is the only way this seam ever announces itself.
 */
const ACCOUNT = `0x${"ac".repeat(20)}` as Hex;
const CHAIN_ID = 5042;
const INTENT: Intent = {
  call: { to: `0x${"7a".repeat(20)}`, value: 1000000000000000000n, data: "0xdeadbeef" },
  nonce: 3n,
  deadline: 1789600000n,
  epoch: 1,
  mandate: `0x${"4d".repeat(32)}`,
};
const EXPECTED_DIGEST = "0x883a1593ae07a432f4b909e2ed822cba681df6b2cb71d946344d762fb4b55255";

describe("intentTypedData", () => {
  it("hashes to the digest the account computes on chain", () => {
    expect(hashTypedData(intentTypedData(ACCOUNT, CHAIN_ID, INTENT))).toBe(EXPECTED_DIGEST);
  });

  it("is bound to the account, so a signature cannot be moved to another one", () => {
    const elsewhere = hashTypedData(intentTypedData(`0x${"bb".repeat(20)}`, CHAIN_ID, INTENT));
    expect(elsewhere).not.toBe(EXPECTED_DIGEST);
  });

  it("is bound to the chain", () => {
    expect(hashTypedData(intentTypedData(ACCOUNT, 1, INTENT))).not.toBe(EXPECTED_DIGEST);
  });

  it("covers the mandate, so it cannot be replayed under a different one", () => {
    const other = hashTypedData(
      intentTypedData(ACCOUNT, CHAIN_ID, { ...INTENT, mandate: `0x${"99".repeat(32)}` }),
    );
    expect(other).not.toBe(EXPECTED_DIGEST);
  });

  it("covers the nonce, the deadline and every part of the call", () => {
    const variants: Intent[] = [
      { ...INTENT, nonce: 4n },
      { ...INTENT, deadline: 1789600001n },
      { ...INTENT, epoch: 2 },
      { ...INTENT, call: { ...INTENT.call, to: `0x${"11".repeat(20)}` } },
      { ...INTENT, call: { ...INTENT.call, value: 2n } },
      { ...INTENT, call: { ...INTENT.call, data: "0xdeadbeff" } },
    ];
    for (const variant of variants) {
      expect(hashTypedData(intentTypedData(ACCOUNT, CHAIN_ID, variant))).not.toBe(EXPECTED_DIGEST);
    }
  });
});

describe("encodeExecute", () => {
  it("produces calldata a relayer can send as-is", () => {
    const data = encodeExecute(INTENT, [`0x${"11".repeat(65)}`, `0x${"22".repeat(65)}`]);
    expect(data).toMatch(/^0x[0-9a-f]+$/);
    expect(data.length).toBeGreaterThan(200);
  });
});
