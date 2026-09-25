import { getAddress } from "viem";

/**
 * The text a member signs to open an onramp into their account. It must match
 * packages/onramp/src/message.ts byte for byte — fundingMessage.test.ts holds
 * the two together, because a one-character drift is a signature the Worker
 * refuses with no hint why.
 */
export function fundingMessage({ account, chainId, issuedAt }: { account: string; chainId: number; issuedAt: string }): string {
  return ["Arcveil · fund this account", `account: ${getAddress(account)}`, `chain: ${chainId}`, `issued: ${issuedAt}`].join("\n");
}

/** A shell line that signs the message with Foundry, for keys that live in a keystore rather than a browser wallet. */
export function castSignCommand(message: string, keystore = "device"): string {
  const escaped = message.replace(/\\/g, "\\\\").replace(/'/g, "'\\''").replace(/\n/g, "\\n");
  return `cast wallet sign --account ${keystore} "$(printf '${escaped}')"`;
}
