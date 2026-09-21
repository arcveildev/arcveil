import { canonicalBytes, computeReceiptId } from "./canonical.js";
import { bytesToHex, hexToBytes } from "./hex.js";
import type { Hex, Receipt, ReceiptDraft } from "./types.js";

/**
 * Stand-in for the policy enclave's signing key. In production the private key
 * never leaves the enclave; only the public key and the signature travel.
 */
const KEY_ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;
const SIGN_ALGORITHM = { name: "ECDSA", hash: "SHA-256" } as const;

export type Signer = { privateKey: CryptoKey; publicKey: Hex };

export async function generateSigner(): Promise<Signer> {
  const pair = await crypto.subtle.generateKey(KEY_ALGORITHM, false, ["sign", "verify"]);
  const raw = await crypto.subtle.exportKey("raw", pair.publicKey);
  return { privateKey: pair.privateKey, publicKey: bytesToHex(new Uint8Array(raw)) };
}

export async function signBody(input: Receipt | ReceiptDraft, privateKey: CryptoKey): Promise<Hex> {
  const signature = await crypto.subtle.sign(SIGN_ALGORITHM, privateKey, canonicalBytes(input) as BufferSource);
  return bytesToHex(new Uint8Array(signature));
}

export async function verifyBodySignature(input: Receipt, signature: Hex, signer: Hex): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", hexToBytes(signer) as BufferSource, KEY_ALGORITHM, false, ["verify"]);
  return crypto.subtle.verify(SIGN_ALGORITHM, key, hexToBytes(signature) as BufferSource, canonicalBytes(input) as BufferSource);
}

/** Turns a draft into a receipt: hash the body, then sign the same bytes. */
export async function issueReceipt(draft: ReceiptDraft, privateKey: CryptoKey): Promise<Receipt> {
  if (draft.proof.type !== "attestation") throw new Error("Only attestation receipts can be signed in v0.5");
  const [id, signature] = await Promise.all([computeReceiptId(draft), signBody(draft, privateKey)]);
  return { ...draft, id, proof: { ...draft.proof, signature } };
}
