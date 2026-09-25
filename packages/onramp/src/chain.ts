import { createPublicClient, http, type Address } from "viem";
import type { Membership } from "./authorize";

const IS_MEMBER_ABI = [
  {
    type: "function",
    name: "isMember",
    stateMutability: "view",
    inputs: [{ name: "who", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

/**
 * Asks the account itself. An address that is not an ArcveilAccount has no
 * isMember, so the call reverts, and the caller turns that into a refusal:
 * this service funds Arcveil accounts, not arbitrary wallets.
 */
export function createMembership(rpc: string): Membership {
  const client = createPublicClient({ transport: http(rpc, { timeout: 8_000 }) });
  return async (account, who) => {
    try {
      return await client.readContract({ address: account as Address, abi: IS_MEMBER_ABI, functionName: "isMember", args: [who as Address] });
    } catch (error) {
      // A revert means "not an Arcveil account"; anything else is the chain being unreachable.
      if (error instanceof Error && /revert|returned no data|execution/i.test(error.message)) return false;
      throw error;
    }
  };
}
