import { describe, expect, it } from "vitest";
import { isHexAddress, shortenAddress } from "./tokenAddress";

describe("isHexAddress", () => {
  it("accepts a 20-byte hex address", () => {
    expect(isHexAddress("0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5")).toBe(true);
  });
  it("rejects wrong length, missing prefix and non-hex characters", () => {
    expect(isHexAddress("0xcd48")).toBe(false);
    expect(isHexAddress("cd48ede31bd45d8fda65d5d24f8a6a317fd131f5")).toBe(false);
    expect(isHexAddress("0xzz48ede31bd45d8fda65d5d24f8a6a317fd131f5")).toBe(false);
    expect(isHexAddress("")).toBe(false);
  });
});

describe("shortenAddress", () => {
  it("keeps the prefix and the last four characters", () => {
    expect(shortenAddress("0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5")).toBe("0xcd48…31f5");
  });
  it("returns the input untouched when it is not an address", () => {
    expect(shortenAddress("soon")).toBe("soon");
  });
});
