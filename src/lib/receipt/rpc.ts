import type { ChainReader, MandateRecord, TxRecord } from "./chain";
import type { Hex } from "./types";

/**
 * Reads Arc over plain JSON-RPC, from the browser. Arc's endpoint allows
 * cross-origin requests, so the verifier keeps its promise: no backend of ours
 * sits in the path.
 *
 * Contracts we have not deployed yet are `null` here, and the reads for them
 * throw. The verifier turns a thrown check into `unknown` — which is the truth,
 * and better than a `fail` that would read as "this receipt is forged".
 */
export type RpcConfig = {
  endpoint: string;
  chainId: number;
  mandateRegistry: Hex | null;
  anchorRegistry: Hex | null;
};

type RpcResponse<T> = { result?: T; error?: { message: string } };

async function call<T>(endpoint: string, method: string, params: readonly unknown[]): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
  } catch (error) {
    throw new Error(`Arc is unreachable: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) throw new Error(`Arc RPC answered HTTP ${response.status}`);
  const body = (await response.json()) as RpcResponse<T>;
  if (body.error !== undefined) throw new Error(`Arc RPC error: ${body.error.message}`);
  if (body.result === undefined) throw new Error(`Arc RPC returned no result for ${method}`);
  return body.result;
}

const NOT_DEPLOYED = (what: string) =>
  new Error(`no ${what} is deployed on Arc yet, so this cannot be checked on chain`);

export function createRpcChainReader(config: RpcConfig): ChainReader {
  return {
    chainId: config.chainId,

    getMandate: async (): Promise<MandateRecord | null> => {
      throw NOT_DEPLOYED(config.mandateRegistry === null ? "mandate registry" : "mandate registry reader");
    },

    hasCounterAnchor: async (): Promise<boolean> => {
      throw NOT_DEPLOYED(config.anchorRegistry === null ? "anchor registry" : "anchor registry reader");
    },

    getTransaction: async (hash: Hex): Promise<TxRecord | null> => {
      const receipt = await call<{ status?: string } | null>(config.endpoint, "eth_getTransactionReceipt", [hash]);
      if (receipt === null) return null;
      return { status: receipt.status === "0x1" ? "success" : "failed" };
    },
  };
}
