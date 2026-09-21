import { describe, expect, it } from "vitest";

import { loadConfig, loadPostman, type Env } from "./env";

const complete: Env = {
  ARC_RPC: "https://rpc.mainnet.arc.io",
  ENTRYPOINT: "0x00000000000000000000000000000000000000c3",
  GATEWAY: "0x00000000000000000000000000000000000060A7",
  SCOPE: "777",
  RELAYER_KEY: `0x${"11".repeat(32)}`,
};

describe("configuration", () => {
  it("reads a complete configuration", () => {
    const loaded = loadConfig(complete);
    expect(loaded.ok && loaded.value.scope).toBe(777n);
    expect(loaded.ok && loaded.value.minFeeBps).toBe(25n);
  });

  it("serves nobody when a binding is missing, and says which", () => {
    const loaded = loadConfig({ ...complete, RELAYER_KEY: undefined });
    expect(loaded.ok).toBe(false);
    expect(!loaded.ok && loaded.error).toMatch(/key/);
  });

  it("refuses a key of the wrong length rather than deriving a wrong address", () => {
    expect(loadConfig({ ...complete, RELAYER_KEY: "0x1234" }).ok).toBe(false);
  });

  it("refuses a fee above the whole withdrawal", () => {
    expect(loadConfig({ ...complete, MIN_FEE_BPS: "10001" }).ok).toBe(false);
    expect(loadConfig({ ...complete, MIN_FEE_BPS: "10000" }).ok).toBe(true);
  });

  it("refuses an entrypoint that is not an address", () => {
    expect(loadConfig({ ...complete, ENTRYPOINT: "arcveil.dev" }).ok).toBe(false);
  });

  it("will not deliver deposits without a gateway to deliver them to", () => {
    expect(loadConfig({ ...complete, GATEWAY: undefined }).ok).toBe(false);
  });
});

describe("postman configuration", () => {
  it("is absent until both its key and its starting block are set", () => {
    expect(loadPostman({}).ok).toBe(false);
    expect(loadPostman({ POSTMAN_KEY: `0x${"22".repeat(32)}` }).ok).toBe(false);
    expect(loadPostman({ POSTMAN_KEY: `0x${"22".repeat(32)}`, FROM_BLOCK: "21800000" }).ok).toBe(true);
  });

  it("keeps the postman key separate from the relayer key", () => {
    // Nothing enforces this in code — they are different bindings — but the
    // test records the intent, and a deployment that reuses one key is a
    // deployment where losing it loses both roles at once.
    const relayer = loadConfig(complete);
    const postman = loadPostman({ POSTMAN_KEY: `0x${"22".repeat(32)}`, FROM_BLOCK: "1" });

    expect(relayer.ok && postman.ok && relayer.value.key).not.toBe(postman.ok && postman.value.key);
  });
});
