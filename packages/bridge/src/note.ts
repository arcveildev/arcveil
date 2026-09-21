import { keccak256, encodePacked, type Hex } from "viem";
import { poseidon1, poseidon2, poseidon3 } from "poseidon-lite";

import { SNARK_SCALAR_FIELD } from "./hook";

/**
 * A note is the only thing that can spend a deposit. Lose it and the money is
 * still in the pool, still yours in every moral sense, and gone.
 *
 * So notes here are **derived, not drawn**. One signature over a fixed message
 * reconstructs every note the wallet ever made, on any device, forever. That is
 * the failure Tornado never fixed: a browser that cleared its storage took the
 * funds with it.
 *
 * The cost is stated plainly: that one signature *is* the money. Anyone who
 * gets it can spend every deposit derived from it, past and future. It is
 * never sent anywhere, never stored by us, and the interface asks the wallet
 * for it again rather than keeping it.
 *
 * The hashing matches the circuit in `contracts/privacy/circuits/commitment.circom`
 * exactly — Poseidon(1) for the nullifier hash, Poseidon(2) for the
 * precommitment, Poseidon(3) for the commitment — and `note.test.ts` pins that
 * against vectors printed by the Solidity library the pool actually runs.
 */

export type Note = {
  /** Revealed when the note is spent; the pool refuses a second spend of the same one. */
  readonly nullifier: bigint;
  /** Never revealed. */
  readonly secret: bigint;
  /** Poseidon(nullifier, secret) — what the burn publishes, and all it publishes. */
  readonly precommitment: bigint;
  /** Which note this is in the sequence derived from one key. */
  readonly index: number;
};

/**
 * What the wallet signs, once. Domain-separated so a signature obtained for
 * something else can never be replayed into a veil key, and chain-bound so a
 * testnet signature cannot spend mainnet funds.
 */
export const veilKeyTypedData = (chainId: number, gateway: Hex) =>
  ({
    domain: { name: "Arcveil Veil", version: "1", chainId, verifyingContract: gateway },
    types: {
      VeilKey: [
        { name: "purpose", type: "string" },
        { name: "warning", type: "string" },
      ],
    },
    primaryType: "VeilKey",
    message: {
      purpose: "Derive the keys that spend this wallet's shielded deposits on Arc.",
      warning: "Anyone who obtains this signature can spend every one of them. Sign only on arcveil.dev.",
    },
  }) as const;

/** Rejection sampling is unnecessary here: keccak is 256 bits and the field is ~254, so the bias is negligible, but the reduction must still be explicit. */
const fieldElement = (seed: Hex, kind: string, index: number): bigint => {
  const digest = keccak256(encodePacked(["bytes32", "string", "uint32"], [seed, kind, index]));
  const reduced = BigInt(digest) % SNARK_SCALAR_FIELD;
  // Zero is not a usable nullifier or secret; the next index is.
  return reduced === 0n ? fieldElement(seed, `${kind}:retry`, index) : reduced;
};

/**
 * Derives note number `index` from the veil-key signature.
 * @param signature The signature over `veilKeyTypedData`. Treated as a secret.
 */
export const deriveNote = (signature: Hex, index: number): Note => {
  if (!Number.isInteger(index) || index < 0) throw new RangeError(`note index must be a non-negative integer: ${index}`);

  const seed = keccak256(signature);
  const nullifier = fieldElement(seed, "arcveil/nullifier", index);
  const secret = fieldElement(seed, "arcveil/secret", index);

  return { nullifier, secret, precommitment: poseidon2([nullifier, secret]), index };
};

/** Every note up to `count`, in order. Scanning the chain for which ones exist is the caller's job. */
export const deriveNotes = (signature: Hex, count: number): readonly Note[] =>
  Array.from({ length: count }, (_, index) => deriveNote(signature, index));

/**
 * The leaf the pool inserts. `label` is assigned by the pool at deposit time —
 * `keccak256(scope, nonce) % field` — so a note alone cannot predict its own
 * commitment; it has to be read back from the `Deposited` event.
 */
export const commitmentOf = (value: bigint, label: bigint, precommitment: bigint): bigint =>
  poseidon3([value, label, precommitment]);

/** What a withdrawal publishes to prove this note has not been spent before. */
export const nullifierHashOf = (nullifier: bigint): bigint => poseidon1([nullifier]);
