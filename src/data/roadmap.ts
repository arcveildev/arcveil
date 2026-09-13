/**
 * What is built, what is being built, and what is only designed.
 *
 * Copy rule for this file: the status chip is the only place tense is granted.
 * A phase that is not `shipped` must never be described in the present tense —
 * write "designed", "planned", or name the artefact, not the capability.
 * If a sentence and a chip ever disagree, fix the sentence.
 */
export type RoadmapStatus = "shipped" | "in progress" | "next" | "planned";

export type RoadmapPhase = {
  /** Two-digit ordinal rendered muted in front of the title. */
  readonly n: string;
  readonly status: RoadmapStatus;
  readonly title: string;
  /** One sentence. What the phase is, not what it will feel like. */
  readonly summary: string;
  /** Three or four short tags, rendered in the label font. */
  readonly tags: readonly string[];
};

export const ROADMAP_SECTION = {
  id: "roadmap",
  label: "Where this is",
  title: "Roadmap.",
  tagline: "With the labels the right way round.",
} as const;

export const ROADMAP_NOTE =
  "Nothing above is written in the present tense until it ships. If a claim and a status chip disagree, the chip is right.";

export const ROADMAP_PHASES: readonly RoadmapPhase[] = [
  {
    n: "01",
    status: "shipped",
    title: "Receipt format v1 and verifier",
    summary:
      "The artifact and the way to check it, before anything that produces it.",
    tags: ["canonical hashing", "attested proof", "in-browser checks", "budget chain"],
  },
  {
    n: "02",
    status: "in progress",
    title: "Mandate contracts and SDK",
    summary:
      "Registering a mandate, anchoring budget commitments, and a typed client for both.",
    tags: ["mandate registry", "anchors", "TypeScript SDK", "testnet"],
  },
  {
    n: "03",
    status: "next",
    title: "Desktop app",
    summary:
      "Threshold signing across device, co-signer and passkey, in an app you install.",
    tags: ["2-of-3 signing", "OS keystore", "passkey recovery", "escape hatch"],
  },
  {
    n: "04",
    status: "planned",
    title: "Blindfolded execution",
    summary:
      "Relative intents resolved inside the enclave, so the model never receives an absolute number.",
    tags: ["relative intents", "enclave resolve", "clearance levels"],
  },
  {
    n: "05",
    status: "planned",
    title: "Zero-knowledge policy proofs",
    summary:
      "The attestation is replaced by a proof; the receipt format does not change.",
    tags: ["policy circuit", "same format", "no trusted signer"],
  },
  {
    n: "06",
    status: "planned",
    title: "Receiver unlinkability",
    summary: "Stealth destinations so the chain observer loses the last thread it had.",
    tags: ["stealth addresses", "unlinkability"],
  },
];
