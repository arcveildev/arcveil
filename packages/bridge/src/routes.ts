import type { Hex } from "viem";

/**
 * Where a bridge can start, and what it talks to when it does.
 *
 * Every address here was read off the chain it belongs to — `symbol()` and
 * `decimals()` for each USDC, `eth_getCode` for each CCTP contract — rather
 * than copied from a document. A wrong address in this file sends real money
 * to the wrong place, so the rule is: verify, then paste.
 */

/** Arc's CCTP domain. The same number on mainnet and testnet. */
export const ARC_DOMAIN = 26;

/** Arc's chain IDs. Gas is USDC on both. */
export const ARC_CHAIN_ID = 5042;
export const ARC_TESTNET_CHAIN_ID = 5_042_002;

/**
 * How final a burn must be before Circle attests it.
 * `standard` waits for hard finality and costs nothing; `fast` is quicker and
 * charges basis points. The bridge defaults to standard: a private deposit
 * that arrives a few minutes later is still private.
 */
export const FINALITY = { fast: 1000, standard: 2000 } as const;

export type CctpRoute = {
  /** EVM chain ID of the source chain. */
  readonly chainId: number;
  readonly name: string;
  /** CCTP domain, which is not the chain ID and never coincides with it by accident. */
  readonly domain: number;
  /** USDC's ERC-20 on that chain. Six decimals everywhere in this table. */
  readonly usdc: Hex;
  readonly tokenMessenger: Hex;
  readonly messageTransmitter: Hex;
  readonly testnet: boolean;
};

/** CCTP V2 uses one address across mainnets, and a different one across testnets. */
const MAINNET_TOKEN_MESSENGER: Hex = "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d";
const MAINNET_TRANSMITTER: Hex = "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64";
const TESTNET_TOKEN_MESSENGER: Hex = "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA";
const TESTNET_TRANSMITTER: Hex = "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275";

const mainnet = (chainId: number, name: string, domain: number, usdc: Hex): CctpRoute => ({
  chainId,
  name,
  domain,
  usdc,
  tokenMessenger: MAINNET_TOKEN_MESSENGER,
  messageTransmitter: MAINNET_TRANSMITTER,
  testnet: false,
});

const testnet = (chainId: number, name: string, domain: number, usdc: Hex): CctpRoute => ({
  chainId,
  name,
  domain,
  usdc,
  tokenMessenger: TESTNET_TOKEN_MESSENGER,
  messageTransmitter: TESTNET_TRANSMITTER,
  testnet: true,
});

/**
 * The chains a deposit can come from. Circle supports many more; these are the
 * ones this bridge has verified addresses for. Adding a route is cheap, but it
 * is not free — every extra source chain is another set of addresses that has
 * to stay right.
 */
export const ROUTES: readonly CctpRoute[] = [
  mainnet(1, "Ethereum", 0, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
  mainnet(8453, "Base", 6, "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
  mainnet(42_161, "Arbitrum", 3, "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"),
  mainnet(10, "OP Mainnet", 2, "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"),
  mainnet(137, "Polygon", 7, "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"),
  testnet(11_155_111, "Ethereum Sepolia", 0, "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"),
  testnet(84_532, "Base Sepolia", 6, "0x036CbD53842c5426634e7929541eC2318f3dCF7e"),
  testnet(421_614, "Arbitrum Sepolia", 3, "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"),
] as const;

export const routeFor = (chainId: number): CctpRoute | undefined =>
  ROUTES.find((route) => route.chainId === chainId);

/** The routes that can reach a given Arc network. Testnet feeds testnet, and only testnet. */
export const routesInto = (arcChainId: number): readonly CctpRoute[] => {
  if (arcChainId !== ARC_CHAIN_ID && arcChainId !== ARC_TESTNET_CHAIN_ID) return [];
  return ROUTES.filter((route) => route.testnet === (arcChainId === ARC_TESTNET_CHAIN_ID));
};
