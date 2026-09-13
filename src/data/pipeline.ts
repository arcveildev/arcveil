/**
 * The six steps an agent action passes through, from proposal to receipt.
 * Copy rule: steps that are designed but not shipped are labelled as such in
 * PIPELINE_NOTE — never in the present tense on their own.
 */
export type PipelineStep = {
  /** Two-digit ordinal shown in the rail node. */
  readonly n: string;
  readonly title: string;
  /** Where the step runs — device, enclave, co-signer, chain. */
  readonly where: string;
  readonly body: string;
  /** What the step hands to the next one, rendered in mono. */
  readonly artifact: string;
};

export const PIPELINE_LABEL = "Architecture";

export const PIPELINE_TAGLINE = "Six steps, and the agent never sees a number.";

export const PIPELINE_NOTE =
  "Steps 1, 2 and 4 are designed, not shipped. Step 6 is — the format is documented and the verifier below runs on it.";

export const PIPELINE_STEPS: readonly PipelineStep[] = [
  {
    n: "01",
    title: "Intent",
    where: "Agent",
    body:
      "The agent proposes in relative terms: reduce exposure to A by 30%. It never states an amount, because it was never told one.",
    artifact: "intent{ asset, ratio }",
  },
  {
    n: "02",
    title: "Redact",
    where: "Enclave",
    body:
      "The enclave resolves the ratio against balances the agent cannot see and builds the unsigned operation.",
    artifact: "userOp (unsigned)",
  },
  {
    n: "03",
    title: "Client sign",
    where: "Your device (Shard A)",
    body:
      "Your device decrypts its shard from the OS keystore and signs the operation hash.",
    artifact: "sigA (65 bytes)",
  },
  {
    n: "04",
    title: "Mandate check",
    where: "Policy co-signer (Shard B)",
    body:
      "Every clause of the mandate is evaluated — allowlist, per-action cap, window spend, active hours, kill switch — and only then is the second signature produced.",
    artifact: "sigB (65 bytes)",
  },
  {
    n: "05",
    title: "Settle",
    where: "Robinhood Chain (4663)",
    body:
      "The two signatures combine into a 130-byte threshold payload; the account contract validates the quorum and executes.",
    artifact: "sigA ‖ sigB (130 B)",
  },
  {
    n: "06",
    title: "Receipt",
    where: "Issued to you",
    body:
      "The body is hashed, the policy signer attests it, and the budget commitment advances — so a dropped receipt later shows up as a gap.",
    artifact: "receipt v1 (~1 KB)",
  },
] as const;
