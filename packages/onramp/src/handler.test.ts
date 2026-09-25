import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { createHandler, type SessionMinter } from "./handler";
import { fundingMessage } from "./message";

const ACCOUNT = "0x96b698308B01473E3A0041634b01f652c4608C2A";
const ORIGIN = "http://localhost:3000";
const device = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
const NOW = Date.parse("2026-09-25T12:00:00.000Z");

function harness() {
  const minted: unknown[] = [];
  const mint: SessionMinter = async (request) => {
    minted.push(request);
    return { sessionId: "s1", sessionToken: "t1", expiresAt: "2026-09-25T12:30:00Z", widgetUrl: "https://onramp-sandbox.arc.io/?sessionToken=t1" };
  };
  const handle = createHandler({
    mint,
    isMember: async (account, who) => account.toLowerCase() === ACCOUNT.toLowerCase() && who === device.address,
    now: () => NOW,
    chainId: 5042,
    origin: ORIGIN,
  });
  return { handle, minted };
}

async function post(body: unknown, origin = ORIGIN) {
  return new Request("https://onramp.example/sessions", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}

async function signedBody(extra: Record<string, unknown> = {}) {
  const issuedAt = new Date(NOW).toISOString();
  const signature = await device.signMessage({ message: fundingMessage({ account: ACCOUNT, chainId: 5042, issuedAt }) });
  return { account: ACCOUNT, issuedAt, signature, ...extra };
}

describe("POST /sessions", () => {
  it("mints a session whose destination is the account itself", async () => {
    const { handle, minted } = harness();
    const response = await handle(await post(await signedBody()));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ sessionToken: "t1" });
    expect(minted).toEqual([
      { appUserId: ACCOUNT.toLowerCase(), destinationAddress: ACCOUNT, assets: { pairs: [{ token: "USDC", chain: "arc" }] } },
    ]);
  });

  it("ignores any destination the caller tries to supply", async () => {
    const { handle, minted } = harness();
    await handle(await post(await signedBody({ destinationAddress: "0x2222222222222222222222222222222222222222" })));
    expect(minted).toEqual([expect.objectContaining({ destinationAddress: ACCOUNT })]);
  });

  it("mints nothing for a refused signature", async () => {
    const { handle, minted } = harness();
    const stranger = privateKeyToAccount("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
    const issuedAt = new Date(NOW).toISOString();
    const signature = await stranger.signMessage({ message: fundingMessage({ account: ACCOUNT, chainId: 5042, issuedAt }) });
    const response = await handle(await post({ account: ACCOUNT, issuedAt, signature }));
    expect(response.status).toBe(403);
    expect(minted).toEqual([]);
  });

  it("answers CORS only for the one configured origin", async () => {
    const { handle } = harness();
    const ok = await handle(new Request("https://onramp.example/sessions", { method: "OPTIONS", headers: { origin: ORIGIN } }));
    expect(ok.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    const other = await handle(new Request("https://onramp.example/sessions", { method: "OPTIONS", headers: { origin: "https://evil.example" } }));
    expect(other.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("never caches a session", async () => {
    const { handle } = harness();
    const response = await handle(await post(await signedBody()));
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("turns a failed mint into a 502 without leaking the upstream message", async () => {
    const { handle } = harness();
    const failing = createHandler({
      mint: async () => {
        throw new Error("upstream said secret things");
      },
      isMember: async () => true,
      now: () => NOW,
      chainId: 5042,
      origin: ORIGIN,
    });
    void handle;
    const response = await failing(await post(await signedBody()));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });

  it("describes itself at the root", async () => {
    const { handle } = harness();
    const response = await handle(new Request("https://onramp.example/", { method: "GET" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ chainId: 5042 });
  });
});
