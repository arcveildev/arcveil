import { describe, expect, it } from "vitest";
import { decodeAttributedBody } from "./attributed-body";

const HEAD = Buffer.from([0x04, 0x0b, ...Buffer.from("streamtyped"), 0x81, 0xe8, 0x03, 0x84, 0x01, 0x40, 0x84, 0x84, 0x84]);
const TAIL = Buffer.from([0x86, 0x84, 0x02, 0x69, 0x49, 0x01, ...Buffer.from("__kIMMessagePartAttributeName")]);

/** A blob shaped like the ones Messages writes: NSString, a length, then UTF-8. */
function blob(text: string): Buffer {
  const bytes = Buffer.from(text, "utf8");
  const length =
    bytes.length < 0x80
      ? Buffer.from([bytes.length])
      : bytes.length <= 0xffff
        ? Buffer.from([0x81, bytes.length & 0xff, bytes.length >> 8])
        : Buffer.from([0x82, ...new Uint8Array(new Uint32Array([bytes.length]).buffer)]);
  return Buffer.concat([HEAD, Buffer.from("NSString"), Buffer.from([0x01, 0x94, 0x84, 0x01, 0x2b]), length, bytes, TAIL]);
}

describe("decodeAttributedBody", () => {
  it("reads a short message", () => {
    expect(decodeAttributedBody(blob("kirim 20 ke budi"))).toBe("kirim 20 ke budi");
  });

  it("reads a message whose length needs two bytes", () => {
    const long = "a".repeat(300);
    expect(decodeAttributedBody(blob(long))).toBe(long);
  });

  it("counts bytes, not characters, so emoji survive", () => {
    expect(decodeAttributedBody(blob("sent ✓ 🙌"))).toBe("sent ✓ 🙌");
  });

  it("returns null when there is no NSString in the blob", () => {
    expect(decodeAttributedBody(Buffer.concat([HEAD, TAIL]))).toBeNull();
  });

  it("returns null rather than reading past the end of a truncated blob", () => {
    const whole = blob("kirim 20 ke budi");
    expect(decodeAttributedBody(whole.subarray(0, HEAD.length + 16))).toBeNull();
  });
});
