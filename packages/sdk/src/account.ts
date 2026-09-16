import { encodeFunctionData, type Account, type Chain, type Hash, type Hex as ViemHex, type Transport, type WalletClient } from "viem";
import type { Hex } from "./types";

/** The 2-of-3 account: a device key, a refusable policy co-signer, and recovery. */
export const ARCVEIL_ACCOUNT_ABI = [
  {
    type: "function",
    name: "execute",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "call",
        type: "tuple",
        components: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
      },
      { name: "deadline", type: "uint64" },
      { name: "epoch", type: "uint64" },
      { name: "mandate", type: "bytes32" },
      { name: "first", type: "bytes" },
      { name: "second", type: "bytes" },
    ],
    outputs: [{ type: "bytes" }],
  },
  {
    type: "function",
    name: "intentDigest",
    stateMutability: "view",
    inputs: [
      {
        name: "call",
        type: "tuple",
        components: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
      },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint64" },
      { name: "epoch", type: "uint64" },
      { name: "mandate", type: "bytes32" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "nonce",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export type AccountCall = { to: Hex; value: bigint; data: Hex };

export type Adoption = { epoch: number; commitment: Hex; nonce: bigint; deadline: bigint };

/**
 * EIP-712 payload for adopting the next mandate epoch. Rotation is governance,
 * not spending, so it is signed as its own thing rather than as a call.
 */
export const adoptTypedData = (account: Hex, chainId: number, adoption: Adoption) =>
  ({
    domain: { name: "Arcveil", version: "1", chainId, verifyingContract: account },
    types: {
      Adopt: [
        { name: "epoch", type: "uint64" },
        { name: "commitment", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint64" },
      ],
    },
    primaryType: "Adopt",
    message: {
      epoch: BigInt(adoption.epoch),
      commitment: adoption.commitment,
      nonce: adoption.nonce,
      deadline: adoption.deadline,
    },
  }) as const;

export type Intent = {
  call: AccountCall;
  nonce: bigint;
  deadline: bigint;
  epoch: number;
  mandate: Hex;
};

/**
 * EIP-712 payload for one intent. It covers the mandate it is claimed under, so
 * a signature gathered for one mandate can never be replayed against another —
 * and it is bound to this account on this chain.
 */
export const intentTypedData = (account: Hex, chainId: number, intent: Intent) =>
  ({
    domain: { name: "Arcveil", version: "1", chainId, verifyingContract: account },
    types: {
      Intent: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint64" },
        { name: "epoch", type: "uint64" },
        { name: "mandate", type: "bytes32" },
      ],
    },
    primaryType: "Intent",
    message: {
      to: intent.call.to,
      value: intent.call.value,
      data: intent.call.data,
      nonce: intent.nonce,
      deadline: intent.deadline,
      epoch: BigInt(intent.epoch),
      mandate: intent.mandate,
    },
  }) as const;

/** One shard signing an intent. Two of these, from different keys, authorise it. */
export const signIntent = (
  client: WalletClient<Transport, Chain, Account>,
  account: Hex,
  intent: Intent,
): Promise<ViemHex> =>
  client.signTypedData({
    account: client.account,
    ...intentTypedData(account, client.chain.id, intent),
  });

/** Submits an intent that already carries two signatures. Anyone may relay it. */
export const executeIntent = (
  client: WalletClient<Transport, Chain, Account>,
  account: Hex,
  intent: Intent,
  signatures: readonly [ViemHex, ViemHex],
): Promise<Hash> =>
  client.writeContract({
    address: account,
    abi: ARCVEIL_ACCOUNT_ABI,
    functionName: "execute",
    args: [
      intent.call,
      intent.deadline,
      BigInt(intent.epoch),
      intent.mandate,
      signatures[0],
      signatures[1],
    ],
    chain: client.chain,
    account: client.account,
  });

/** Calldata for the same intent, for a relayer that builds its own transaction. */
export const encodeExecute = (intent: Intent, signatures: readonly [ViemHex, ViemHex]): ViemHex =>
  encodeFunctionData({
    abi: ARCVEIL_ACCOUNT_ABI,
    functionName: "execute",
    args: [
      intent.call,
      intent.deadline,
      BigInt(intent.epoch),
      intent.mandate,
      signatures[0],
      signatures[1],
    ],
  });
