import {
  contextFor,
  ENTRYPOINT_ABI,
  signal,
  withdrawalFor,
  type RelayData,
  type WithdrawProof,
} from "@arcveil/bridge";
import { BaseError, ContractFunctionRevertedError, type Address, type PublicClient, type WalletClient } from "viem";

import type { Config } from "./env";
import type { WithdrawRequest } from "./schema";

/**
 * Submitting a withdrawal.
 *
 * The relayer exists for one reason: on Arc, gas is USDC, so a freshly created
 * recipient address has nothing to pay with. If the user paid their own gas
 * from a funded wallet, that wallet would be the link the pool just spent a
 * proof to break.
 *
 * It is not trusted with anything. The recipient, the fee and the pool are all
 * hashed into the proof's `context` signal, so a relayer can refuse to submit
 * a withdrawal but cannot redirect it, cannot raise its own fee, and cannot
 * learn the note behind it. The worst it can do is nothing.
 */

export type RelayOutcome =
  | { readonly ok: true; readonly hash: `0x${string}` }
  | { readonly ok: false; readonly status: number; readonly error: string };

const refuse = (status: number, error: string): RelayOutcome => ({ ok: false, status, error });

/**
 * Everything checkable before a transaction is signed. Each of these would
 * otherwise be a revert the relayer had already paid for.
 */
export const check = (
  request: WithdrawRequest,
  config: Config,
  feeRecipient: Address,
): { readonly ok: true; readonly relay: RelayData } | { readonly ok: false; readonly status: number; readonly error: string } => {
  if (request.relayFeeBPS < config.minFeeBps) {
    return { ok: false, status: 402, error: `This relayer works for ${config.minFeeBps} basis points or more.` };
  }

  const proof = request.proof as WithdrawProof;
  if (signal(proof, "withdrawnValue") === 0n) {
    return { ok: false, status: 400, error: "A withdrawal of nothing is not a withdrawal." };
  }

  const relay: RelayData = {
    recipient: request.recipient,
    feeRecipient,
    relayFeeBPS: request.relayFeeBPS,
  };

  // The proof commits to exactly one withdrawal. If the request describes a
  // different one, the pool would reject it — say so now, and say which part.
  const expected = contextFor(withdrawalFor(config.entrypoint, relay), config.scope);
  if (signal(proof, "context") !== expected) {
    return {
      ok: false,
      status: 400,
      error:
        "This proof was not made for this withdrawal. The recipient, the fee, the entrypoint and the scope are all bound into it — rebuild the proof against this relayer's quote.",
    };
  }

  return { ok: true, relay };
};

const revertReason = (error: unknown): string | undefined => {
  if (!(error instanceof BaseError)) return undefined;
  const reverted = error.walk((inner) => inner instanceof ContractFunctionRevertedError);
  if (!(reverted instanceof ContractFunctionRevertedError)) return undefined;
  return reverted.data?.errorName ?? reverted.reason ?? undefined;
};

/**
 * Asks the chain whether the withdrawal would succeed, then sends it.
 *
 * The simulation is the proof check. Verifying the Groth16 proof here would
 * mean shipping a proving library and a verification key and keeping both in
 * step with the deployed verifier; `eth_call` runs the deployed verifier
 * itself, costs nothing, and cannot drift.
 */
export const submit = async (
  request: WithdrawRequest,
  config: Config,
  clients: { readonly publicClient: PublicClient; readonly walletClient: WalletClient },
): Promise<RelayOutcome> => {
  const account = clients.walletClient.account;
  if (!account) return refuse(503, "This relayer has no key configured.");

  const checked = check(request, config, account.address);
  if (!checked.ok) return refuse(checked.status, checked.error);

  const args = [
    withdrawalFor(config.entrypoint, checked.relay),
    request.proof,
    config.scope,
  ] as const;

  try {
    const { request: simulated } = await clients.publicClient.simulateContract({
      account,
      address: config.entrypoint,
      abi: ENTRYPOINT_ABI,
      functionName: "relay",
      args: args as never,
    });

    return { ok: true, hash: await clients.walletClient.writeContract(simulated) };
  } catch (error) {
    const reason = revertReason(error);
    if (reason) {
      // A named revert is the pool's own answer, and the caller can act on it.
      return refuse(400, `The pool refused this withdrawal: ${reason}.`);
    }
    return refuse(502, "The withdrawal could not be submitted. Nothing was spent; try again.");
  }
};
