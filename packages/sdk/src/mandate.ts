import { keccak256, toHex, type Account, type Chain, type Hash, type Transport, type WalletClient } from "viem";
import { ANCHOR_REGISTRY_ABI, MANDATE_REGISTRY_ABI } from "./abi.js";
import type { Hex } from "./types.js";

/**
 * The commitment is all that ever reaches the chain. Terms stay with their
 * owner, so keep the text you hash: without it you can prove a mandate was
 * live, but never again show what it said.
 */
export const mandateCommitment = (terms: string): Hex => keccak256(toHex(terms));

/** A wallet client that already knows its chain and account — Arc, and the owner of the mandate. */
export type Writer = {
  client: WalletClient<Transport, Chain, Account>;
  registry: Hex;
};

/** Publishes the commitment for one epoch. An epoch can never be rewritten, only revoked. */
export const registerMandate = ({ client, registry }: Writer, epoch: number, commitment: Hex): Promise<Hash> =>
  client.writeContract({
    address: registry,
    abi: MANDATE_REGISTRY_ABI,
    functionName: "register",
    args: [BigInt(epoch), commitment],
    chain: client.chain,
    account: client.account,
  });

/** Ends an epoch. Receipts issued while it was live stay checkable and stay true. */
export const revokeMandate = ({ client, registry }: Writer, epoch: number): Promise<Hash> =>
  client.writeContract({
    address: registry,
    abi: MANDATE_REGISTRY_ABI,
    functionName: "revoke",
    args: [BigInt(epoch)],
    chain: client.chain,
    account: client.account,
  });

/** Anchors a budget commitment, which is what makes a dropped receipt visible. */
export const anchorCounter = ({ client, registry }: Writer, commitment: Hex): Promise<Hash> =>
  client.writeContract({
    address: registry,
    abi: ANCHOR_REGISTRY_ABI,
    functionName: "anchor",
    args: [commitment],
    chain: client.chain,
    account: client.account,
  });
