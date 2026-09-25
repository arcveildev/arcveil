import { describe, expect, it } from "vitest";
import { fundingMessage, FRESHNESS_MS } from "./message";

describe("fundingMessage", () => {
  it("names the account, the chain and the moment, one per line", () => {
    expect(
      fundingMessage({ account: "0x96b698308B01473E3A0041634b01f652c4608C2A", chainId: 5042, issuedAt: "2026-09-25T12:00:00.000Z" }),
    ).toBe(
      "Arcveil · fund this account\naccount: 0x96b698308B01473E3A0041634b01f652c4608C2A\nchain: 5042\nissued: 2026-09-25T12:00:00.000Z",
    );
  });

  it("checksums the account, so two spellings of one address sign the same bytes", () => {
    const a = fundingMessage({ account: "0x96b698308b01473e3a0041634b01f652c4608c2a", chainId: 5042, issuedAt: "2026-09-25T12:00:00.000Z" });
    const b = fundingMessage({ account: "0x96B698308B01473E3A0041634B01F652C4608C2A", chainId: 5042, issuedAt: "2026-09-25T12:00:00.000Z" });
    expect(a).toBe(b);
  });

  it("allows five minutes of clock drift and no more", () => {
    expect(FRESHNESS_MS).toBe(5 * 60 * 1000);
  });
});
