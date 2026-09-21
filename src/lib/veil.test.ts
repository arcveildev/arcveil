import { describe, expect, it } from "vitest";

import { formatUsdc, isFieldElement, parseUsdc, shortAddress, shortField } from "./veil";

describe("parsing an amount", () => {
  it("reads whole and fractional USDC", () => {
    expect(parseUsdc("25")).toBe(25_000_000n);
    expect(parseUsdc("0.5")).toBe(500_000n);
    expect(parseUsdc("1234.567891")).toBe(1_234_567_891n);
  });

  it("refuses more precision than USDC has, instead of rounding someone's money", () => {
    expect(parseUsdc("1.1234567")).toBeNull();
  });

  it("refuses anything that is not a number", () => {
    expect(parseUsdc("")).toBeNull();
    expect(parseUsdc(".")).toBeNull();
    expect(parseUsdc("1e6")).toBeNull();
    expect(parseUsdc("-5")).toBeNull();
    expect(parseUsdc("25 USDC")).toBeNull();
  });

  it("accepts the shapes people actually type", () => {
    expect(parseUsdc(" 10 ")).toBe(10_000_000n);
    expect(parseUsdc("10.")).toBe(10_000_000n);
    expect(parseUsdc(".5")).toBe(500_000n);
  });
});

describe("formatting an amount", () => {
  it("round-trips", () => {
    for (const input of ["25", "0.5", "1234.567891", "0.000001"]) {
      expect(formatUsdc(parseUsdc(input)!)).toBe(input.replace(/^\./, "0."));
    }
  });

  it("drops trailing zeros rather than showing 25.000000", () => {
    expect(formatUsdc(25_000_000n)).toBe("25");
    expect(formatUsdc(25_500_000n)).toBe("25.5");
    expect(formatUsdc(0n)).toBe("0");
  });
});

describe("shortening", () => {
  it("keeps both ends of a field element, which is what people compare", () => {
    const short = shortField(123_456_789n);
    expect(short).toMatch(/^0x[0-9a-f]{8}…[0-9a-f]{6}$/);
  });

  it("shortens an address without losing its ends", () => {
    expect(shortAddress("0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d")).toBe("0x28b5…cf5d");
  });
});

describe("field elements", () => {
  it("rejects zero and anything at or above the modulus", () => {
    expect(isFieldElement(0n)).toBe(false);
    expect(isFieldElement(1n)).toBe(true);
    expect(
      isFieldElement(
        21_888_242_871_839_275_222_246_405_745_257_275_088_548_364_400_416_034_343_698_204_186_575_808_495_617n,
      ),
    ).toBe(false);
  });
});
