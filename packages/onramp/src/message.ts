import { getAddress } from "viem";

/** How far a signature's timestamp may sit from the Worker's clock, either way. */
export const FRESHNESS_MS = 5 * 60 * 1000;

export type FundingClaim = Readonly<{ account: string; chainId: number; issuedAt: string }>;

/**
 * The exact text a member signs to open an onramp into their account. It
 * names the account, so a signature for one account cannot fund another, and
 * a moment, so an old signature found in a log cannot be replayed for long.
 */
export function fundingMessage({ account, chainId, issuedAt }: FundingClaim): string {
  return ["Arcveil · fund this account", `account: ${getAddress(account)}`, `chain: ${chainId}`, `issued: ${issuedAt}`].join("\n");
}
