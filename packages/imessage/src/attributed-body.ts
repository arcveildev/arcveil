const MARKER = Buffer.from("NSString", "latin1");

// NSString is followed by class bookkeeping, then '+' opens the string itself.
const STRING_START = 0x2b;
const SEARCH_WINDOW = 12;

// typedstream integers: a byte below 0x80 is the value, 0x81 prefixes an
// int16 and 0x82 an int32, both little-endian.
const INT16 = 0x81;
const INT32 = 0x82;

/**
 * Since Ventura, Messages often leaves `message.text` empty and keeps the text
 * only inside `attributedBody`, an NSAttributedString in Apple's typedstream
 * format. This reads the one string we need out of it and nothing else.
 *
 * Returns null for anything it cannot read with certainty: a command we
 * half-understood is worse than one we ignored.
 */
export function decodeAttributedBody(blob: Uint8Array): string | null {
  const buf = Buffer.from(blob.buffer, blob.byteOffset, blob.byteLength);
  const at = buf.indexOf(MARKER);
  if (at < 0) return null;

  const from = at + MARKER.length;
  const start = buf.subarray(from, from + SEARCH_WINDOW).indexOf(STRING_START);
  if (start < 0) return null;

  const read = readLength(buf, from + start + 1);
  if (read === null) return null;

  const end = read.offset + read.length;
  if (end > buf.length) return null;
  return buf.subarray(read.offset, end).toString("utf8");
}

function readLength(buf: Buffer, offset: number): { length: number; offset: number } | null {
  const lead = buf[offset];
  if (lead === undefined) return null;
  if (lead < 0x80) return { length: lead, offset: offset + 1 };
  if (lead === INT16 && offset + 3 <= buf.length) return { length: buf.readUInt16LE(offset + 1), offset: offset + 3 };
  if (lead === INT32 && offset + 5 <= buf.length) return { length: buf.readUInt32LE(offset + 1), offset: offset + 5 };
  return null;
}
