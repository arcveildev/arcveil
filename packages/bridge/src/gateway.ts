/**
 * `VeilGateway`'s surface, as the relayer and the interface use it.
 *
 * Hand-written rather than generated, and therefore checked against the
 * compiled artifact in `gateway.test.ts` — a signature that drifts here would
 * otherwise only show up as an unexplained revert on a funded transaction.
 */
export const VEIL_GATEWAY_ABI = [
  {
    type: "function",
    name: "relay",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [{ name: "commitment", type: "uint256" }],
  },
  {
    type: "function",
    name: "refundOf",
    stateMutability: "view",
    inputs: [{ name: "commitment", type: "uint256" }],
    outputs: [{ name: "refund", type: "address" }],
  },
  {
    type: "event",
    name: "Veiled",
    inputs: [
      { name: "commitment", type: "uint256", indexed: true },
      { name: "value", type: "uint256", indexed: false },
      { name: "refund", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "Refunded",
    inputs: [
      { name: "refund", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
      { name: "reason", type: "bytes", indexed: false },
    ],
  },
] as const;
