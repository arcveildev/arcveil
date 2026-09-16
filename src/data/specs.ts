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
  { key: "Execution network", value: "Arc mainnet, chain ID 5042", status: "shipped" },
  { key: "Native gas", value: "USDC — 18 decimals native, 6 on the ERC-20 interface", status: "shipped" },
  {
    key: "MandateRegistry",
    value: "0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5",
    status: "shipped",
  },
  {
    key: "AnchorRegistry",
    value: "0xb2af157f269b31e315099e9da693096833ab8289",
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
  { key: "SDK", value: "TypeScript, viem-based", status: "in progress" },
  {
    key: "Account",
    value: "0xb1c0983a7b84f38fbaf5f3af92f0fecaa62ce25d — ERC-4337, EntryPoint v0.7",
    status: "shipped",
  },
  {
    key: "Threshold signing",
    value: "2-of-3 across device, policy co-signer and passkey recovery; execution gated on the mandate being live",
    status: "shipped",
  },
  { key: "Enclave execution", value: "Relative intents resolved away from the model", status: "planned" },
] as const;
