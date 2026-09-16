import type { CheckId } from "@arcveil/sdk";

export const CHECK_TITLES: Record<CheckId, string> = {
  integrity: "Body integrity",
  signature: "Policy signature",
  mandate: "Mandate on chain",
  linkage: "Budget chain",
  settlement: "Settlement",
};

/** Said plainly, because a verifier that overstates its result is worth nothing. */
export const RECEIPT_PROVES: readonly string[] = [
  "The action came from an agent session the account holder authorised.",
  "It passed every clause of the mandate — without the mandate being revealed.",
  "It settled on chain, in a sequence with nothing quietly removed.",
];

export const RECEIPT_DOES_NOT_PROVE: readonly string[] = [
  "That the decision was a good one. A receipt bounds behaviour, not judgement.",
  "That the enclave itself is honest. v0.5 trusts its attestation; v1 replaces it with a zero-knowledge proof.",
  "That nothing is visible on chain. Observers still see that something happened — not what, not how much.",
];
