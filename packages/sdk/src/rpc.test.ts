import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeAbiParameters } from "viem";
import { createRpcChainReader } from "./rpc.js";
import type { Hex } from "./types.js";

const CONFIG = { endpoint: "https://rpc.example", chainId: 5042, mandateRegistry: null, anchorRegistry: null };
const DEPLOYED = {
  ...CONFIG,
  mandateRegistry: `0x${"11".repeat(20)}` as Hex,
  anchorRegistry: `0x${"22".repeat(20)}` as Hex,
};
const HASH = `0x${"be".repeat(32)}` as Hex;
const ACCOUNT = `0x${"8f".repeat(20)}` as Hex;
const COMMITMENT = `0x${"4d".repeat(32)}` as Hex;

const encodedMandate = (commitment: Hex, revokedAt: bigint) =>
  encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "commitment", type: "bytes32" },
          { name: "registeredAt", type: "uint64" },
          { name: "revokedAt", type: "uint64" },
        ],
      },
    ],
    [{ commitment, registeredAt: BigInt(1789573201), revokedAt }],
  );

const encodedBool = (value: boolean) => encodeAbiParameters([{ type: "bool" }], [value]);

const mockFetch = (body: unknown, ok = true, status = 200) =>
  vi.fn(async () => ({ ok, status, json: async () => body }) as unknown as Response);

afterEach(() => vi.unstubAllGlobals());

describe("createRpcChainReader", () => {
  it("reads a successful transaction", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: { status: "0x1" } }));
    expect(await createRpcChainReader(CONFIG).getTransaction(HASH)).toEqual({ status: "success" });
  });

  it("reads a reverted transaction", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: { status: "0x0" } }));
    expect(await createRpcChainReader(CONFIG).getTransaction(HASH)).toEqual({ status: "failed" });
  });

  it("returns null when the transaction is not on chain", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: null }));
    expect(await createRpcChainReader(CONFIG).getTransaction(HASH)).toBeNull();
  });

  it("surfaces an RPC error rather than guessing", async () => {
    vi.stubGlobal("fetch", mockFetch({ error: { message: "limit exceeded" } }));
    await expect(createRpcChainReader(CONFIG).getTransaction(HASH)).rejects.toThrow(/limit exceeded/);
  });

  it("surfaces an HTTP failure", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false, 502));
    await expect(createRpcChainReader(CONFIG).getTransaction(HASH)).rejects.toThrow(/HTTP 502/);
  });

  it("surfaces an unreachable endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));
    await expect(createRpcChainReader(CONFIG).getTransaction(HASH)).rejects.toThrow(/unreachable/);
  });

  it("refuses to judge the mandate while no registry is deployed", async () => {
    await expect(createRpcChainReader(CONFIG).getMandate(HASH, 7)).rejects.toThrow(/mandate registry/);
  });

  it("refuses to judge the anchor while no registry is deployed", async () => {
    await expect(createRpcChainReader(CONFIG).hasCounterAnchor(HASH, HASH)).rejects.toThrow(/anchor registry/);
  });

  it("reads a live mandate once the registry is deployed", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: encodedMandate(COMMITMENT, BigInt(0)) }));
    expect(await createRpcChainReader(DEPLOYED).getMandate(ACCOUNT, 7)).toEqual({
      account: ACCOUNT,
      commitment: COMMITMENT,
      epoch: 7,
      revoked: false,
    });
  });

  it("reports a revoked mandate as revoked", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: encodedMandate(COMMITMENT, BigInt(1789573999)) }));
    const mandate = await createRpcChainReader(DEPLOYED).getMandate(ACCOUNT, 7);
    expect(mandate?.revoked).toBe(true);
  });

  it("returns null for an epoch that was never registered", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: encodedMandate(`0x${"00".repeat(32)}`, BigInt(0)) }));
    expect(await createRpcChainReader(DEPLOYED).getMandate(ACCOUNT, 7)).toBeNull();
  });

  it("reads an anchor once the registry is deployed", async () => {
    vi.stubGlobal("fetch", mockFetch({ result: encodedBool(true) }));
    expect(await createRpcChainReader(DEPLOYED).hasCounterAnchor(ACCOUNT, COMMITMENT)).toBe(true);

    vi.stubGlobal("fetch", mockFetch({ result: encodedBool(false) }));
    expect(await createRpcChainReader(DEPLOYED).hasCounterAnchor(ACCOUNT, COMMITMENT)).toBe(false);
  });
});
