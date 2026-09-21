import { defineChain } from "viem";
import type { Hex } from "./types.js";

/**
 * Arc, Circle's EVM layer 1 for stablecoin finance. The native balance — gas,
 * msg.value, native sends — is USDC with 18 decimals; the ERC-20 interface at
 * 0x3600…0000 uses the familiar 6. Mixing them is a factor of a million, and it
 * fails silently, so the decimals here are deliberately explicit.
 */
export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.arc.io" } },
});

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  testnet: true,
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.testnet.arc.io" } },
});

/** USDC's ERC-20 face on Arc — 6 decimals, unlike the native balance. */
export const USDC_ERC20_ADDRESS: Hex = "0x3600000000000000000000000000000000000000";

export type Registries = { mandateRegistry: Hex; anchorRegistry: Hex };

/** Deployed 2026-09-16. Testnet is empty until the same script runs there. */
export const ARC_REGISTRIES: Record<number, Registries> = {
  [arc.id]: {
    mandateRegistry: "0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5",
    anchorRegistry: "0xb2af157f269b31e315099e9da693096833ab8289",
  },
};
