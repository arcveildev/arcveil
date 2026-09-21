import { arc, arcTestnet } from "@arcveildev/sdk";
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * viem clients, built per request.
 *
 * A Worker is not a long-lived process and there is nothing here worth
 * keeping between invocations: no nonce cache, no connection pool, no state.
 * The only thing that persists is the key, and that lives in a secret binding
 * rather than in memory this code controls.
 */

export type Clients = { readonly publicClient: PublicClient; readonly walletClient: WalletClient };

const chainFor = (chainId: number) => (chainId === arcTestnet.id ? arcTestnet : arc);

export const clientsFor = async (rpc: string, key: `0x${string}`): Promise<Clients> => {
  const transport = http(rpc);
  const probe = createPublicClient({ transport });
  const chain = chainFor(await probe.getChainId());

  return {
    publicClient: createPublicClient({ chain, transport }),
    walletClient: createWalletClient({ account: privateKeyToAccount(key), chain, transport }),
  };
};
