import { describe, expect, it } from "vitest";
import { fromAppleTime } from "./apple-time";

describe("fromAppleTime", () => {
  it("reads nanoseconds since 2001-01-01, which is what modern chat.db stores", () => {
    // 2026-09-24T00:00:00Z is 811_900_800 s after the Apple epoch.
    expect(fromAppleTime(811_900_800_000_000_000).toISOString()).toBe("2026-09-24T00:00:00.000Z");
  });

  it("takes a bigint, since nanosecond values are past 2^53", () => {
    expect(fromAppleTime(811_900_800_123_000_000n).toISOString()).toBe("2026-09-24T00:00:00.123Z");
  });

  it("reads seconds, which older databases stored", () => {
    expect(fromAppleTime(811_900_800).toISOString()).toBe("2026-09-24T00:00:00.000Z");
  });

  it("maps zero to the Apple epoch itself", () => {
    expect(fromAppleTime(0).toISOString()).toBe("2001-01-01T00:00:00.000Z");
  });
});
