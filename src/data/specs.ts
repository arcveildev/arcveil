/**
 * Build status of each line in the spec table. Nothing may read as shipped
 * unless it actually is — see docs/AGENT_BRIEF.md copy rules.
 */
import { ARC } from "./site";

export type SpecStatus = "shipped" | "in progress" | "planned";

export type SpecRow = {
  readonly key: string;
  readonly value: string;
  readonly status: SpecStatus;
};

export const SPEC_ROWS: readonly SpecRow[] = [
  { key: "Execution network", value: "Arc mainnet, chain ID 5042", status: "shipped" },
  { key: "Native gas", value: "USDC — 18 decimals native, 6 on the ERC-20 interface", status: "shipped" },
  {
    key: "MandateRegistry",
    value: ARC.mandateRegistry ?? "not deployed",
    status: "shipped",
  },
  {
    key: "AnchorRegistry",
    value: ARC.anchorRegistry ?? "not deployed",
    status: "shipped",
  },
  {
    key: "Verifier",
    value: "Runs client-side; the only request it makes is a read of Arc itself",
    status: "shipped",
  },
  { key: "Receipt format", value: "v1 — docs/RECEIPT.md", status: "shipped" },
  { key: "Proof today", value: "Enclave attestation, ECDSA P-256", status: "shipped" },
  {
    key: "Proof next",
    value: "Zero-knowledge policy proof, same receipt format",
    status: "planned",
  },
  { key: "SDK", value: "@arcveildev/sdk on npm — TypeScript, viem-based, published with provenance", status: "shipped" },
  {
    key: "Account",
    value: `${ARC.account} — ERC-4337, EntryPoint v0.7`,
    status: "shipped",
  },
  {
    key: "Threshold signing",
    value: "2-of-3 across device, policy co-signer and passkey recovery; execution gated on the mandate being live",
    status: "shipped",
  },
  { key: "Enclave execution", value: "Relative intents resolved away from the model", status: "planned" },
] as const;
