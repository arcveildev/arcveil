import type { Hex } from "./types.js";

export const isHex = (value: string, bytes?: number): value is Hex =>
  new RegExp(`^0x[0-9a-fA-F]${bytes === undefined ? "*" : `{${bytes * 2}}`}$`).test(value) &&
  (bytes !== undefined || value.length % 2 === 0);

export function hexToBytes(value: Hex): Uint8Array {
  const body = value.slice(2);
  if (body.length % 2 !== 0) throw new Error(`Hex string has an odd length: ${value}`);
  const bytes = new Uint8Array(body.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = Number.parseInt(body.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) throw new Error(`Hex string contains a non-hex character: ${value}`);
    bytes[i] = byte;
  }
  return bytes;
}

export const bytesToHex = (bytes: Uint8Array): Hex =>
  `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
