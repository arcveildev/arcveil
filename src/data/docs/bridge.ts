/**
 * Copy for /docs/bridge.
 *
 * Every address and constant named here was read off the chain it belongs to,
 * and every claim about what is deployed is checked against `VEIL` in
 * src/data/site.ts. Nothing on this page is written in the present tense on
 * the strength of a plan.
 */
import { VEIL } from "@/data/site";

export const BRIDGE_DOC = {
  label: "Private bridge",
  title: "Bridge.",
  tagline: "One CCTP burn in, one unlinkable withdrawal out.",
  lede:
    "Circle's USDC Bridge publishes everything about a crossing: the sender, the amount and the destination. This bridges into a shielded pool on Arc instead. The deposit stays public and every withdrawal stays public; what is hidden is which deposit paid which withdrawal — and only as well as the pool is busy.",
} as const;

export const CCTP_ROWS = [
  { key: "Arc's CCTP domain", value: "26 — the same number on mainnet and testnet" },
  { key: "TokenMessengerV2", value: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d", mono: true },
  { key: "MessageTransmitterV2", value: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64", mono: true },
  { key: "TokenMinterV2", value: "0xfd78EE919681417d192449715b2594ab58f5D002", mono: true },
  { key: "Testnet set", value: "0x8FE6B999…2DAA / 0xE737e5cE…E275 / 0xb43db544…F192", mono: true },
  { key: "Attestation", value: "iris-api.circle.com, and iris-api-sandbox.circle.com for testnet" },
  { key: "Finality", value: "Standard (threshold 2000) is free; fast (1000) costs basis points" },
] as const;

export const VEIL_ROWS = [
  { key: "Entrypoint", value: VEIL.entrypoint ?? "not deployed", mono: true },
  { key: "PrivacyPool", value: VEIL.pool ?? "not deployed", mono: true },
  { key: "VeilGateway", value: VEIL.gateway ?? "not deployed", mono: true },
  { key: "Relayer", value: VEIL.relayer ?? "not deployed", mono: true },
  { key: "Scope", value: VEIL.scope ?? "not deployed", mono: true },
] as const;

export const HOOK_NOTE =
  "The burn names the gateway as `mintRecipient` *and* as `destinationCaller`. The first decides where the USDC lands; the second makes the gateway the only address that may deliver the message. Without it, anyone could call receiveMessage directly and mint into the gateway with no deposit behind it, stranding the funds.";

export const NEVER_REVERT_NOTE =
  "Once receiveMessage succeeds the CCTP message is consumed and cannot be replayed, so a revert after that point would burn USDC on the source chain and mint it nowhere. Every failure past the mint — malformed hook, dead pool, amount below the minimum, duplicate commitment — degrades to a plain transfer to the refund address the burn named.";

export const PRECOMPILE_NOTE =
  "Arc's USDC calls a compliance precompile at 0x1800…0001 with isBlocklisted on the mint path. A plain transfer does not make that call from the ERC-20 layer — but it does route through a second precompile at 0x1800…0000, whose code nobody outside Arc can read, so that says nothing about whether a blocklist applies inside it. Either way nothing here can override it, and no test covers it: a fork has no precompile to run.";

export const GATEWAY_FUNCTIONS = [
  {
    key: "relay(bytes message, bytes attestation)",
    value: "Mints an attested CCTP transfer and deposits it under the precommitment the hook carried. Permissionless.",
    code: true,
  },
  {
    key: "ragequit(RagequitProof proof)",
    value:
      "Pulls a bridged deposit back out publicly, to the refund address the burn named. The proof is the authorisation; nobody's permission is needed.",
    code: true,
  },
  { key: "refundOf(uint256 commitment) view", value: "Where that deposit's funds go if it is ever ragequit.", code: true },
] as const;

export const HOOK_SNIPPET = `
import { approveCall, burnCall, deriveNote, routeFor } from "@arcveil/bridge";

const route = routeFor(8453);            // Base
const note = deriveNote(signature, 0);   // one signature derives every note

// Two transactions from the source chain. Nothing is sent for you.
approveCall({ route, amount: 25_000_000n });
burnCall({
  route,
  amount: 25_000_000n,
  gateway: VEIL_GATEWAY,
  hook: { precommitment: note.precommitment, refund: yourArcAddress },
});
`;

export const WITHDRAW_SNIPPET = `
import { contextFor, proveWithdrawal, withdrawalFor, witnessFor } from "@arcveil/bridge";

// The recipient and the fee are hashed into the proof, so the relayer that
// submits it cannot redirect the money or pay itself more.
const withdrawal = withdrawalFor(ENTRYPOINT, { recipient, feeRecipient, relayFeeBPS: 25n });

const proof = await proveWithdrawal(
  {
    note, change, label, existingValue, withdrawnValue,
    stateWitness: witnessFor(commitments, myCommitment),
    aspWitness: witnessFor(labels, label),
    context: contextFor(withdrawal, SCOPE),
  },
  artifacts,   // withdraw.wasm and withdraw.zkey, fetched by \`pnpm veil:artifacts\`
  groth16,     // snarkjs, loaded only when someone actually withdraws
);
`;

export const RELAY_SNIPPET = `
# What the relayer needs before you build the proof.
curl https://arcveil-relay.workers.dev/quote

# The proof and eight public numbers. Nothing that names a deposit.
curl -X POST https://arcveil-relay.workers.dev/withdraw \\
  -H 'content-type: application/json' \\
  -d '{"recipient":"0x…","relayFeeBPS":"25","proof":{…}}'
`;

export const LEDGER_ROWS = [
  { key: "The burn", value: "Public on the source chain: your address, the amount, the time" },
  { key: "The deposit", value: "Public on Arc: a commitment joining the pool" },
  { key: "The pool balance", value: "Public on Arc" },
  { key: "Every withdrawal", value: "Public on Arc: recipient, amount, time" },
  { key: "Deposit → withdrawal", value: "Private. This is the only thing the pool hides." },
  { key: "Your note's secrets", value: "Private to your device, derived from one signature" },
  { key: "Recipient, amount and IP in flight", value: "Seen by the relayer you choose" },
] as const;

export const AUDIT_NOTE =
  "The pool contracts and the circuits are Privacy Pools by 0xbow, copied unmodified at commit c312dcd5 and audited by Oxorio and Auditware. VeilGateway, the relayer and the ASP postman are ours, and none of them has been audited by anyone. contracts/privacy/VERIFY.md is how to check the first claim without trusting us.";

export const ASP_NOTE =
  "The association set currently admits every label, unfiltered. That makes this pool a mixer in function. The mechanism is the upstream one, so the policy can be tightened later without redeploying — but that is a future tense, and today nothing is screened.";
