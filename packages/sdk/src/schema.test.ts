import { describe, expect, it } from "vitest";
import { parseReceiptInput } from "./schema";
import { receiptFixture } from "./testing";

describe("parseReceiptInput", () => {
  it("accepts a single receipt and returns it as a one-item bundle", async () => {
    const receipt = await receiptFixture();
    const result = parseReceiptInput(JSON.stringify(receipt));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.receipts).toHaveLength(1);
  });

  it("accepts an array of receipts", async () => {
    const receipt = await receiptFixture();
    const result = parseReceiptInput(JSON.stringify([receipt, receipt]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.receipts).toHaveLength(2);
  });

  it("reports malformed JSON instead of throwing", () => {
    const result = parseReceiptInput("{ nope");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toMatch(/json/i);
  });

  it("reports the path of a missing field", async () => {
    const receipt = await receiptFixture();
    const withoutCounter = Object.fromEntries(Object.entries(receipt).filter(([key]) => key !== "counter"));
    const result = parseReceiptInput(JSON.stringify(withoutCounter));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/counter/);
  });

  it("rejects an unsupported version", async () => {
    const receipt = await receiptFixture();
    const result = parseReceiptInput(JSON.stringify({ ...receipt, v: 2 }));
    expect(result.ok).toBe(false);
  });

  it("rejects a malformed hex field", async () => {
    const receipt = await receiptFixture();
    const result = parseReceiptInput(JSON.stringify({ ...receipt, id: "not-hex" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/id/);
  });

  it("rejects an empty bundle", () => {
    const result = parseReceiptInput("[]");
    expect(result.ok).toBe(false);
  });
});
