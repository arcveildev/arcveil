import { describe, expect, it } from "vitest";
import { loadConfig } from "./env";

const BASE = {
  ONRAMP_API_BASE_URL: "https://api-test.circle.com",
  ONRAMP_WIDGET_BASE_URL: "https://onramp-sandbox.arc.io",
  ARC_RPC: "https://rpc.mainnet.arc.io",
  ARC_CHAIN_ID: "5042",
};

describe("loadConfig", () => {
  it("accepts a full Circle key", () => {
    expect(loadConfig({ ...BASE, CIRCLE_API_KEY: "TEST_API_KEY:abc:def" }).ok).toBe(true);
  });

  it("refuses a key missing its environment prefix, and says so without echoing it", () => {
    const result = loadConfig({ ...BASE, CIRCLE_API_KEY: "abc123:def456" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/<ENV>_API_KEY/);
      expect(result.error).not.toContain("abc123");
    }
  });

  it("refuses a referrer given as a URL rather than a hostname", () => {
    expect(loadConfig({ ...BASE, CIRCLE_API_KEY: "TEST_API_KEY:a:b", ONRAMP_REFERRER_DOMAIN: "https://arcveil.dev" }).ok).toBe(false);
  });
});
