/**
 * The questions a sceptic asks first, answered without widening any claim.
 *
 * Copy rule for this file: an answer may describe what the format proves and
 * what the design refuses to do, but anything unbuilt is named as planned and
 * pointed at the roadmap. No metrics, no customers, no dates.
 */
export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

export const FAQ_SECTION = {
  id: "faq",
  label: "FAQ",
  title: "Questions.",
  tagline: "The ones a sceptic asks first.",
} as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "What is a mandate?",
    answer:
      "An encrypted policy you write once: which assets an agent may touch, how much per action and per window, which hours, when it expires, and what stops it. It is enforced where the agent cannot reach, and nobody but you can read its terms.",
  },
  {
    question: "Can you read my mandate?",
    answer:
      "No. We check a commitment to it and evaluate clauses; the terms themselves stay sealed. What we can do is refuse to co-sign. What we cannot do is sign alone, move funds, or see what you hold.",
  },
  {
    question: "What happens if the agent is jailbroken?",
    answer:
      "It asks for something outside the mandate, and the second signature never appears. A jailbroken agent under a mandate can waste its own time; it cannot exceed a limit it was never able to see or reach.",
  },
  {
    question: "Is this custody?",
    answer:
      "No. Signing authority is split three ways and we hold one share — the account contract refuses any single signature, including ours. Your device and your passkey recovery form a quorum without us, and the contract\u2019s tests assert exactly that pair works. It also refuses to execute at all unless the mandate is live in the registry, so revoking one stops the agent on chain rather than in a policy engine we happen to run.",
  },
  {
    question: "Which network and assets?",
    answer:
      "Arc — Circle\u2019s EVM layer 1 for stablecoin finance, where USDC is the gas token. We are on mainnet, chain ID 5042: the two registries a receipt is checked against are deployed there, and the verifier reads them — plus the transaction itself — straight from your browser. What is not built yet is everything that would let an agent spend: the threshold account and the enclave. The specifications above say which is which.",
  },
  {
    question: "What does a receipt actually prove?",
    answer:
      "That an authorised agent session produced this action, that every mandate clause was checked and passed, and that it settled in a sequence with nothing removed. It does not prove the decision was a good one — a receipt bounds behaviour, not judgement.",
  },
  {
    question: "When do zero-knowledge proofs land?",
    answer:
      "After the mandate contracts and the desktop app. Receipts issued today stay valid when it happens: only the proof field changes.",
  },
];
