import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { authorizeFunding, type Membership } from "./authorize";
import { fundingMessage } from "./message";

const ACCOUNT = "0x96b698308B01473E3A0041634b01f652c4608C2A";
const OTHER = "0x1111111111111111111111111111111111111111";
const device = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
const stranger = privateKeyToAccount("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");

const NOW = Date.parse("2026-09-25T12:00:00.000Z");
const CHAIN = 5042;

/** The account's members, as the contract would answer isMember. */
const members: Membership = async (account, who) =>
  account.toLowerCase() === ACCOUNT.toLowerCase() && who.toLowerCase() === device.address.toLowerCase();

async function signed(signer = device, account = ACCOUNT, issuedAt = new Date(NOW).toISOString()) {
  const signature = await signer.signMessage({ message: fundingMessage({ account, chainId: CHAIN, issuedAt }) });
  return { account, issuedAt, signature };
}

const deps = { isMember: members, now: () => NOW, chainId: CHAIN };

describe("authorizeFunding", () => {
  it("lets a member of the account fund it", async () => {
    const result = await authorizeFunding(await signed(), deps);
    expect(result).toEqual({ ok: true, account: ACCOUNT, signer: device.address });
  });

  it("refuses someone who is not a member", async () => {
    const result = await authorizeFunding(await signed(stranger), deps);
    expect(result).toMatchObject({ ok: false, status: 403 });
  });

  it("refuses a member's signature replayed against a different account", async () => {
    const body = { ...(await signed()), account: OTHER };
    const result = await authorizeFunding(body, deps);
    expect(result).toMatchObject({ ok: false, status: 403 });
  });

  it("refuses a stale signature", async () => {
    const result = await authorizeFunding(await signed(device, ACCOUNT, new Date(NOW - 6 * 60_000).toISOString()), deps);
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("refuses one dated in the future", async () => {
    const result = await authorizeFunding(await signed(device, ACCOUNT, new Date(NOW + 6 * 60_000).toISOString()), deps);
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("rejects a malformed body before touching the chain", async () => {
    let asked = false;
    const result = await authorizeFunding(
      { account: "not-an-address", issuedAt: "yesterday", signature: "0x00" },
      { ...deps, isMember: async () => ((asked = true), true) },
    );
    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(asked).toBe(false);
  });

  it("treats a chain that cannot answer as a refusal, not a pass", async () => {
    const result = await authorizeFunding(await signed(), {
      ...deps,
      isMember: async () => {
        throw new Error("rpc down");
      },
    });
    expect(result).toMatchObject({ ok: false, status: 503 });
  });
});
