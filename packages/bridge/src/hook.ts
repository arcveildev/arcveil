import { decodeAbiParameters, encodeAbiParameters, isAddress, type Hex } from "viem";

/**
 * The 64 bytes a burn carries so that its USDC lands in the pool rather than in
 * a wallet: the deposit's precommitment, and where to send the money if the
 * deposit cannot be made after all.
 *
 * This travels inside the CCTP message and is public, like everything else
 * about a deposit. It has to be: the pool is a public ledger of commitments.
 * What stays private is which commitment a later withdrawal spends.
 */

/** The BN254 scalar field. A precommitment outside it is not a field element and the pool would reject it. */
export const SNARK_SCALAR_FIELD =
  21_888_242_871_839_275_222_246_405_745_257_275_088_548_364_400_416_034_343_698_204_186_575_808_495_617n;

export type VeilHook = {
  /** Poseidon(nullifier, secret), computed from the note before the burn is signed. */
  readonly precommitment: bigint;
  /**
   * Where the USDC goes if the deposit fails — a dead pool, a dust amount, a
   * duplicate commitment. An address *on Arc*: the source chain's sender is not
   * necessarily reachable there, which is why this is stated rather than assumed.
   */
  readonly refund: Hex;
};

const HOOK_ABI = [{ type: "uint256" }, { type: "address" }] as const;

export class InvalidHookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidHookError";
  }
}

export const encodeVeilHook = ({ precommitment, refund }: VeilHook): Hex => {
  if (precommitment <= 0n || precommitment >= SNARK_SCALAR_FIELD) {
    throw new InvalidHookError("precommitment must be a non-zero element of the BN254 scalar field");
  }
  if (!isAddress(refund)) throw new InvalidHookError(`refund is not an address: ${refund}`);

  return encodeAbiParameters(HOOK_ABI, [precommitment, refund]);
};

/**
 * Reads a hook back. Mirrors `VeilGateway._readHook`, including its strictness:
 * the gateway refunds anything it cannot read exactly, so anything this rejects
 * is something that would arrive as a plain transfer instead of a deposit.
 */
export const decodeVeilHook = (hookData: Hex): VeilHook => {
  // 64 bytes, hex-encoded, plus the 0x.
  if (hookData.length !== 130) {
    throw new InvalidHookError(`hook must be exactly 64 bytes, got ${(hookData.length - 2) / 2}`);
  }

  const [precommitment, refund] = decodeAbiParameters(HOOK_ABI, hookData);
  if (precommitment <= 0n || precommitment >= SNARK_SCALAR_FIELD) {
    throw new InvalidHookError("precommitment is not a field element");
  }

  return { precommitment, refund };
};
