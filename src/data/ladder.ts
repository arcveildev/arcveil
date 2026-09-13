/**
 * The three ways an agent can be given spending power, worst to best.
 * Tier 03 describes the design this product is built around; the enclave
 * execution path is not shipped, so its copy stays definitional and carries
 * an explicit caveat. Never restate it as a present-tense capability.
 */
export type LadderTier = {
  /** Two-digit ordinal rendered muted in front of the title. */
  readonly n: string;
  readonly title: string;
  /** What this arrangement actually is, in plain terms. */
  readonly what: string;
  /** What follows from it, one short clause each. */
  readonly consequences: readonly string[];
  /** Set on the tier this product advocates — drives the accent treatment. */
  readonly advocated?: true;
  /** Accent eyebrow, only on the advocated tier. */
  readonly eyebrow?: string;
  /** Honest cost of the advocated tier, rendered smaller and muted. */
  readonly caveat?: string;
};

export const LADDER_SECTION = {
  id: "ladder",
  label: "The choice",
  title: "Ladder.",
  tagline: "Three ways to let a machine spend your money.",
} as const;

export const LADDER_TIERS: readonly LadderTier[] = [
  {
    n: "01",
    title: "Give it your key",
    what:
      "The agent holds the private key. This is what most agent stacks do today, because it is the only thing that works out of the box.",
    consequences: [
      "One jailbreak is total loss",
      "The key is copied wherever the agent runs",
      "No limit exists that the agent cannot lift",
    ],
  },
  {
    n: "02",
    title: "Give it an allowance",
    what:
      "A session key or spending cap on a smart account. A real improvement: the loss is bounded by the cap.",
    consequences: [
      "The permission is a blob — it cannot say when, or why, or how much of your book",
      "Every amount is public on chain",
      "The agent still sees your entire balance",
    ],
  },
  {
    n: "03",
    title: "Give it a mandate",
    what:
      "An encrypted policy the agent cannot read and cannot reach around. Limits are enforced where the agent has no access, the agent works in relative terms, and every settled action emits a receipt.",
    consequences: [
      "The agent never receives an absolute number",
      "Limits are enforced outside the agent's reach",
      "Each action leaves a receipt anyone can verify and nobody can read",
    ],
    advocated: true,
    eyebrow: "This product",
    caveat: "Costs you: a co-signer in the path today. See “If we disappear” below.",
  },
];
