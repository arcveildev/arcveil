import { afterEach, describe, expect, it, vi } from "vitest";
import { createRpcChainReader } from "./rpc";
import type { Hex } from "./types";

const CONFIG = { endpoint: "https://rpc.example", chainId: 5042, mandateRegistry: null, anchorRegistry: null };
const HASH = `0x${"be".repeat(32)}` as Hex;

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
});
