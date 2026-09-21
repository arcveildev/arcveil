import { USDC_ERC20_ADDRESS } from "@arcveildev/sdk";
import { ARC, CHAIN } from "@/data/site";

/**
 * Copy for /docs/chain. Addresses come from src/data/site.ts and
 * packages/sdk/src/chains.ts — never typed in twice.
 */
export const CHAIN_PAGE = {
  label: "Network",
  title: "Arc.",
  tagline: "Where the receipts settle, and what answers when you read them.",
  lede:
    "Arc is Circle's EVM layer 1 for stablecoin finance, where USDC is the gas token. Arcveil's registries are deployed to mainnet, and the verifier reads them straight from the browser over plain JSON-RPC.",
} as const;

export const NETWORK_ROWS = [
  { key: "Mainnet", value: `${CHAIN.name}, chain ID ${CHAIN.id}`, },
  { key: "Testnet", value: `chain ID ${CHAIN.testnetId}`, },
  { key: "RPC", value: ARC.rpc, mono: true },
  { key: "Explorer", value: ARC.explorer, mono: true },
  { key: "Gas", value: "USDC — the native balance, at 18 decimals" },
  { key: "CORS", value: "The RPC endpoint allows cross-origin requests, which is why the verifier needs no backend" },
] as const;

export const CONTRACT_ROWS = [
  { key: "MandateRegistry", value: ARC.mandateRegistry ?? "not deployed", mono: true },
  { key: "AnchorRegistry", value: ARC.anchorRegistry ?? "not deployed", mono: true },
  { key: "ArcveilAccount", value: ARC.account ?? "not deployed", mono: true },
  { key: "USDC (ERC-20)", value: USDC_ERC20_ADDRESS, mono: true },
] as const;

export const MANDATE_FUNCTIONS = [
  { key: "register(uint64 epoch, bytes32 commitment)", value: "Publishes a commitment for an epoch. Reverts if that epoch already has one.", code: true },
  { key: "revoke(uint64 epoch)", value: "Retires it. The epoch stays registered and stays revoked — it can never be reused.", code: true },
  { key: "mandateOf(address, uint64) view", value: "The record: commitment, epoch, revoked flag.", code: true },
  { key: "isLive(address, uint64, bytes32) view", value: "One call for the question the verifier actually asks.", code: true },
] as const;

export const ANCHOR_FUNCTIONS = [
  { key: "anchor(bytes32 commitment)", value: "Anchors a budget commitment for the caller. Anchoring the same one twice reverts.", code: true },
  { key: "isAnchored(address, bytes32) view", value: "Whether a starting commitment is on chain — the linkage check for a receipt with no predecessor.", code: true },
  { key: "anchoredAt(address, bytes32) view", value: "When it was anchored.", code: true },
  { key: "head(address) view", value: "The latest commitment anchored by that account.", code: true },
] as const;

export const ACCOUNT_ROWS = [
  { key: "Standard", value: "ERC-4337, EntryPoint v0.7" },
  { key: "Quorum", value: "2 of 3 — device shard, policy co-signer, passkey recovery" },
  { key: "Gate", value: "execute reverts unless the mandate named in the intent is registered and live" },
  { key: "Binding", value: "The EIP-712 domain is this account on this chain, and the payload covers the epoch and commitment" },
  { key: "Relaying", value: "Permissionless — any funded wallet can submit an intent that already carries two signatures" },
] as const;

export const DECIMALS_NOTE =
  "USDC has two faces on Arc. The native balance — gas, msg.value, native sends — has 18 decimals; the ERC-20 interface has the familiar 6. Mixing them is a factor of a trillion — 10^12 — and it fails silently. The chain definitions in the SDK spell both out for that reason.";

export const READER_SNIPPET = `
import { createRpcChainReader, arc, arcTestnet, ARC_REGISTRIES } from "@arcveildev/sdk";

// Mainnet — the registries below are deployed and answering.
createRpcChainReader({
  endpoint: arc.rpcUrls.default.http[0],
  chainId: arc.id,
  ...ARC_REGISTRIES[arc.id],
});

// Testnet — nothing of ours is deployed there, so pass null and let those
// checks report unknown instead of pretending.
createRpcChainReader({
  endpoint: arcTestnet.rpcUrls.default.http[0],
  chainId: arcTestnet.id,
  mandateRegistry: null,
  anchorRegistry: null,
});
`;

export const CLI_SNIPPET = `
# Prepare an intent, sign it with a keystore, then relay it.
pnpm intent prepare transfer 0x<to> <usdc>
pnpm intent send 0x<sig1> 0x<sig2>
`;

export const CLI_NOTE =
  "scripts/intent.mts never touches a key. prepare writes the EIP-712 payload for cast wallet sign, which reads the encrypted keystore and prompts for the password; send checks the two signatures locally and prints the cast send that relays them.";
