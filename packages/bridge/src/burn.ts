import { encodeFunctionData, pad, type Hex } from "viem";

import { encodeVeilHook, type VeilHook } from "./hook";
import { ARC_DOMAIN, FINALITY, type CctpRoute } from "./routes";

/**
 * Builds the two transactions that start a private bridge: approve USDC, then
 * burn it with a hook that names the gateway on Arc.
 *
 * Both are returned as plain call data rather than sent, because the signing
 * wallet is the caller's business and because a call you can inspect before
 * sending is one you can check against what the interface claimed.
 */

export const TOKEN_MESSENGER_V2_ABI = [
  {
    type: "function",
    name: "depositForBurnWithHook",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export type Call = { readonly to: Hex; readonly data: Hex };

export type BurnRequest = {
  readonly route: CctpRoute;
  /** In USDC's smallest unit — six decimals, so 25 USDC is 25_000_000n. */
  readonly amount: bigint;
  /** `VeilGateway` on Arc. It is both the payee and the only address allowed to deliver the message. */
  readonly gateway: Hex;
  readonly hook: VeilHook;
  /**
   * The most Circle may keep. Zero with standard finality, which is the
   * default; a fast transfer needs this above Circle's quoted minimum or the
   * burn is refused.
   */
  readonly maxFee?: bigint;
  readonly finality?: (typeof FINALITY)[keyof typeof FINALITY];
};

const toBytes32 = (address: Hex): Hex => pad(address, { size: 32 });

export const approveCall = ({ route, amount }: Pick<BurnRequest, "route" | "amount">): Call => ({
  to: route.usdc,
  data: encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: "approve",
    args: [route.tokenMessenger, amount],
  }),
});

/**
 * @dev `mintRecipient` and `destinationCaller` are both the gateway, and that
 *      is not redundant. The first decides where the USDC lands; the second
 *      makes the gateway the only address that may deliver the message, so
 *      nobody can mint into the gateway without the deposit that follows it.
 */
export const burnCall = ({ route, amount, gateway, hook, maxFee = 0n, finality = FINALITY.standard }: BurnRequest): Call => {
  const recipient = toBytes32(gateway);

  return {
    to: route.tokenMessenger,
    data: encodeFunctionData({
      abi: TOKEN_MESSENGER_V2_ABI,
      functionName: "depositForBurnWithHook",
      args: [amount, ARC_DOMAIN, recipient, route.usdc, recipient, maxFee, finality, encodeVeilHook(hook)],
    }),
  };
};
