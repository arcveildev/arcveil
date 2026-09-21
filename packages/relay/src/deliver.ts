import { VEIL_GATEWAY_ABI } from "@arcveil/bridge";
import { BaseError, ContractFunctionRevertedError, type Address, type PublicClient, type WalletClient } from "viem";

/**
 * Delivering a deposit.
 *
 * A burn on the source chain is not a deposit until someone submits Circle's
 * attestation to the gateway on Arc — and the person who burnt the USDC has no
 * gas there, because gas on Arc is USDC and they have not received any yet.
 *
 * So this submits it for them, and is paid nothing for doing so. That is a
 * deliberate subsidy: an undelivered burn is USDC destroyed on one chain and
 * minted on neither, and no fee is worth that outcome.
 *
 * Nothing here is trusted. `gateway.relay` refuses any message that does not
 * name the gateway as both the payee and the only permitted caller, and the
 * attestation is Circle's. The worst a stranger can do is make this relayer
 * pay gas to deliver someone's deposit into the pool — which costs them a real
 * burn to arrange, and the money still lands where it was going.
 */

export type DeliverOutcome =
  | { readonly ok: true; readonly hash: `0x${string}` }
  | { readonly ok: false; readonly status: number; readonly error: string };

const revertReason = (error: unknown): string | undefined => {
  if (!(error instanceof BaseError)) return undefined;
  const reverted = error.walk((inner) => inner instanceof ContractFunctionRevertedError);
  if (!(reverted instanceof ContractFunctionRevertedError)) return undefined;
  return reverted.data?.errorName ?? reverted.reason ?? undefined;
};

/** What a revert means, in the words of someone who just lost sight of their money. */
const EXPLAIN: Readonly<Record<string, string>> = {
  NotForThisGateway:
    "This burn was not addressed to this gateway, or did not name it as the only address allowed to deliver it. Nothing was spent; the message is untouched.",
  UnsupportedVersion: "This message is not CCTP V2.",
  MalformedMessage: "This is not a CCTP burn message.",
  NothingMinted: "The transfer minted no USDC to the gateway.",
};

export const deliver = async (
  message: `0x${string}`,
  attestation: `0x${string}`,
  gateway: Address,
  clients: { readonly publicClient: PublicClient; readonly walletClient: WalletClient },
): Promise<DeliverOutcome> => {
  const account = clients.walletClient.account;
  if (!account) return { ok: false, status: 503, error: "This relayer has no key configured." };

  try {
    // Free, and it runs the real gateway: a message that would revert is
    // refused here rather than after gas has been spent on it.
    const { request } = await clients.publicClient.simulateContract({
      account,
      address: gateway,
      abi: VEIL_GATEWAY_ABI,
      functionName: "relay",
      args: [message, attestation],
    });

    return { ok: true, hash: await clients.walletClient.writeContract(request) };
  } catch (error) {
    const reason = revertReason(error);
    if (reason) {
      return { ok: false, status: 400, error: EXPLAIN[reason] ?? `The gateway refused this message: ${reason}.` };
    }
    // "Nonce already used" means someone else delivered it first, which is a
    // success from the depositor's point of view, not a failure.
    if (error instanceof BaseError && /nonce already used/i.test(error.message)) {
      return { ok: false, status: 409, error: "This message has already been delivered. The deposit is in the pool." };
    }
    return { ok: false, status: 502, error: "The message could not be delivered. Nothing was spent; try again." };
  }
};
