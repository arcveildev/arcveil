/** The only two contract calls the verifier makes. Kept beside the reader so
 *  the shapes are checkable against contracts/src/*.sol at a glance. */
export const MANDATE_REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [
      { name: "epoch", type: "uint64" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revoke",
    stateMutability: "nonpayable",
    inputs: [{ name: "epoch", type: "uint64" }],
    outputs: [],
  },
  {
    type: "function",
    name: "mandateOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "epoch", type: "uint64" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "commitment", type: "bytes32" },
          { name: "registeredAt", type: "uint64" },
          { name: "revokedAt", type: "uint64" },
        ],
      },
    ],
  },
] as const;

export const ANCHOR_REGISTRY_ABI = [
  {
    type: "function",
    name: "anchor",
    stateMutability: "nonpayable",
    inputs: [{ name: "commitment", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "isAnchored",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
