import { describe, expect, it } from "vitest";
import { createAllowlist, normalizeHandle } from "./handle";

describe("normalizeHandle", () => {
  it("keeps + and digits of a phone number, dropping formatting", () => {
    expect(normalizeHandle(" +62 812-3456-7890 ")).toBe("+6281234567890");
  });

  it("lowercases an email handle", () => {
    expect(normalizeHandle("Me@iCloud.com")).toBe("me@icloud.com");
  });
});

describe("createAllowlist", () => {
  const allowed = createAllowlist(["+62 812 3456 7890", "me@icloud.com"]);

  it("accepts a listed sender however it is formatted", () => {
    expect(allowed("+6281234567890")).toBe(true);
    expect(allowed("ME@icloud.com")).toBe(true);
  });

  it("refuses anyone else, and a missing sender", () => {
    expect(allowed("+6281200000000")).toBe(false);
    expect(allowed(null)).toBe(false);
  });

  it("does not treat a local number as the same person as the E.164 one", () => {
    // Guessing a country code is how the wrong person gets to spend.
    expect(allowed("081234567890")).toBe(false);
  });
});
