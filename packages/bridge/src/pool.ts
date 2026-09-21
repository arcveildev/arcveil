/**
 * The slice of the Privacy Pool protocol this bridge touches.
 *
 * Hand-written rather than generated, and checked against the compiled
 * artifacts in `pool.test.ts`. The vendored contracts are not ours to change,
 * so drift here means someone changed *this* file, and the test says so.
 */

export const ENTRYPOINT_ABI = [
  {
    type: "function",
    name: "relay",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "_withdrawal",
        type: "tuple",
        components: [
          { name: "processooor", type: "address" },
          { name: "data", type: "bytes" },
        ],
      },
      {
        name: "_proof",
        type: "tuple",
        components: [
          { name: "pA", type: "uint256[2]" },
          { name: "pB", type: "uint256[2][2]" },
          { name: "pC", type: "uint256[2]" },
          { name: "pubSignals", type: "uint256[8]" },
        ],
      },
      { name: "_scope", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_asset", type: "address" },
      { name: "_value", type: "uint256" },
      { name: "_precommitment", type: "uint256" },
    ],
    outputs: [{ name: "_commitment", type: "uint256" }],
  },
  {
    type: "function",
    name: "updateRoot",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_root", type: "uint256" },
      { name: "_ipfsCID", type: "string" },
    ],
    outputs: [{ name: "_index", type: "uint256" }],
  },
  {
    type: "function",
    name: "latestRoot",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "_root", type: "uint256" }],
  },
  {
    type: "function",
    name: "scopeToPool",
    stateMutability: "view",
    inputs: [{ name: "_scope", type: "uint256" }],
    outputs: [{ name: "_pool", type: "address" }],
  },
  {
    type: "function",
    name: "assetConfig",
    stateMutability: "view",
    inputs: [{ name: "_asset", type: "address" }],
    outputs: [
      { name: "_pool", type: "address" },
      { name: "_minimumDepositAmount", type: "uint256" },
      { name: "_vettingFeeBPS", type: "uint256" },
      { name: "_maxRelayFeeBPS", type: "uint256" },
    ],
  },
] as const;

export const POOL_ABI = [
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "_depositor", type: "address", indexed: true },
      { name: "_commitment", type: "uint256", indexed: false },
      { name: "_label", type: "uint256", indexed: false },
      { name: "_value", type: "uint256", indexed: false },
      { name: "_precommitmentHash", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "SCOPE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "_scope", type: "uint256" }],
  },
  {
    type: "function",
    name: "nullifierHashes",
    stateMutability: "view",
    inputs: [{ name: "_nullifierHash", type: "uint256" }],
    outputs: [{ name: "_spent", type: "bool" }],
  },
  {
    type: "function",
    name: "currentRoot",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "_root", type: "uint256" }],
  },
  {
    type: "function",
    name: "dead",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
] as const;
