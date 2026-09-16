/**
 * Build status of each line in the spec table. Nothing may read as shipped
 * unless it actually is — see docs/AGENT_BRIEF.md copy rules.
 */
export type SpecStatus = "shipped" | "in progress" | "planned";

export type SpecRow = {
  readonly key: string;
  readonly value: string;
  readonly status: SpecStatus;
};

export const SPEC_ROWS: readonly SpecRow[] = [
  { key: "Execution network", value: "Arc mainnet, chain ID 5042", status: "planned" },
  { key: "Development network", value: "Arc testnet, chain ID 5042002", status: "in progress" },
  { key: "Native gas", value: "ETH", status: "planned" },
  { key: "Account", value: "ERC-4337 smart account", status: "planned" },
  {
    key: "Signing",
    value: "2-of-3 ECDSA: device shard, policy co-signer, passkey recovery",
    status: "planned",
  },
  { key: "Receipt format", value: "v1 — docs/RECEIPT.md", status: "shipped" },
  { key: "Proof today", value: "Enclave attestation, ECDSA P-256", status: "shipped" },
  {
    key: "Proof next",
    value: "Zero-knowledge policy proof, same receipt format",
    status: "planned",
  },
  {
    key: "Verifier",
    value: "Runs client-side, no backend, no request leaves the tab",
    status: "shipped",
  },
  { key: "SDK", value: "TypeScript, viem-based", status: "in progress" },
] as const;
