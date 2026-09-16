import { describe, expect, it } from "vitest";
import { canonicalize, computeReceiptId, receiptBody } from "./canonical";
import { draftFixture, receiptFixture } from "./testing";

describe("canonicalize", () => {
  it("is independent of key order", () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe(canonicalize({ a: 2, b: 1 }));
  });

  it("keeps array order and sorts nested objects", () => {
    expect(canonicalize({ z: [3, { y: 1, x: 2 }] })).toBe('{"z":[3,{"x":2,"y":1}]}');
  });

  it("rejects values JSON cannot represent deterministically", () => {
    expect(() => canonicalize({ a: undefined })).toThrow();
    expect(() => canonicalize({ a: Number.NaN })).toThrow();
  });
});

describe("receiptBody", () => {
  it("drops the id and the proof evidence", async () => {
    const receipt = await receiptFixture();
    const body = receiptBody(receipt) as Record<string, unknown>;
    expect(body).not.toHaveProperty("id");
    expect(body.proof).toEqual({
      type: "attestation",
      signer: receipt.proof.type === "attestation" ? receipt.proof.signer : null,
    });
  });

  it("produces the same body for a draft and the receipt issued from it", async () => {
    const draft = await draftFixture();
    const receipt = await receiptFixture();
    expect(canonicalize(receiptBody(draft))).toBe(canonicalize(receiptBody(receipt)));
  });
});

describe("computeReceiptId", () => {
  it("returns a 0x-prefixed sha256 digest", async () => {
    expect(await computeReceiptId(await draftFixture())).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("changes when any body field changes", async () => {
    const draft = await draftFixture();
    const other = { ...draft, action: { ...draft.action, kind: "transfer" as const } };
    expect(await computeReceiptId(draft)).not.toBe(await computeReceiptId(other));
  });

  it("ignores the signature", async () => {
    const receipt = await receiptFixture();
    if (receipt.proof.type !== "attestation") throw new Error("fixture must be an attestation receipt");
    const forged = { ...receipt, proof: { ...receipt.proof, signature: `0x${"11".repeat(64)}` as const } };
    expect(await computeReceiptId(forged)).toBe(await computeReceiptId(receipt));
  });
});
