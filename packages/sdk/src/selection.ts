import { buildEvaluation, type Clause, type Evaluation } from "./judge.js";
import { applyClauses, type Judgement } from "./judgement.js";

/**
 * Choosing a paid tool, under a mandate.
 *
 * An agent that discovers priced services has to answer two questions before it
 * spends: which one actually fits the task, and whether the price is worth
 * paying. Both are judgement calls; neither is the judge's to make binding.
 *
 * The cap is not among them. Candidates priced over the mandate's limit are
 * removed before the request is built, so the judge is never shown a tool it
 * could talk the agent into buying. Code owns the threshold, and the one
 * threshold that costs real money is enforced without asking a model at all.
 */

export type Candidate = { id: string; description: string; priceUsd: number };

export type SelectionPolicy = {
  /** The mandate's per-call cap. Enforced by arithmetic, before the judge is asked. */
  maxPriceUsd: number;
  fitConfidence: number;
  worthConfidence: number;
};

/** The checks a selection can name, in the order they are applied. */
export const SELECTION_CHECKS = ["price_cap", "tool_fit", "price_worth"] as const;

/** Removes what the mandate cannot afford. Returns a new list; the input is untouched. */
export const affordable = (candidates: readonly Candidate[], policy: SelectionPolicy): readonly Candidate[] =>
  candidates.filter((candidate) => candidate.priceUsd <= policy.maxPriceUsd);

/**
 * The two clauses a selection puts to the judge. Exported so a caller can
 * commit to them with `judgeCommitment` — a selection receipt then names the
 * field it chose from and the bar it had to clear, without publishing either.
 */
export const selectionClauses = (candidates: readonly Candidate[], policy: SelectionPolicy): readonly Clause[] => [
  {
    id: "tool_fit",
    type: "choice",
    instructions: "Which candidate is the right tool for `task`? Judge fit only, not price.",
    criteria: Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate.description])),
    allow: candidates.map((candidate) => candidate.id),
    confidence: policy.fitConfidence,
  },
  {
    id: "price_worth",
    type: "noul",
    instructions: "Is the best-fitting candidate's `priceUsd` justified by what `task` is worth?",
    criteria: {
      true: "The task needs what this tool provides, and the price is proportionate",
      false: "The price is out of proportion, or a cheaper candidate would do",
    },
    require: true,
    confidence: policy.worthConfidence,
  },
];

// Thresholds never leave the process — `buildEvaluation` strips them — so the
// numbers used to shape the questions cannot reach the judge, whatever they are.
const UNSET: SelectionPolicy = { maxPriceUsd: 0, fitConfidence: 0, worthConfidence: 0 };

/** Builds the request for one selection. Pass only candidates that already cleared the cap. */
export function buildSelection(task: string, candidates: readonly Candidate[]): Evaluation {
  if (candidates.length === 0) {
    throw new Error("Nothing to choose between: filter with `affordable` and handle an empty field before asking.");
  }
  return buildEvaluation(selectionClauses(candidates, UNSET), { task, candidates: [...candidates] });
}

export type Selection = {
  /** Null whenever any check did not hold — an undecided selection buys nothing. */
  chosen: Candidate | null;
  checks: readonly string[];
  failed: readonly string[];
};

/** Turns a judgement into a purchase, or into a refusal with the check that caused it. */
export function applySelection(
  candidates: readonly Candidate[],
  policy: SelectionPolicy,
  judgement: Judgement,
): Selection {
  if (candidates.length === 0) {
    return { chosen: null, checks: ["price_cap"], failed: ["price_cap"] };
  }
  const verdicts = applyClauses(selectionClauses(candidates, policy), judgement);
  const failed = verdicts.filter((verdict) => verdict.status !== "pass").map((verdict) => verdict.id);
  const checks = ["price_cap", ...verdicts.map((verdict) => verdict.id)];
  if (failed.length > 0) return { chosen: null, checks, failed };

  const answer = judgement.answers.tool_fit;
  const picked = answer?.type === "choice" ? candidates.find((candidate) => candidate.id === answer.choice) : undefined;
  // Unreachable while tool_fit passes, but a missing candidate must never read as a pass.
  return picked === undefined
    ? { chosen: null, checks, failed: ["tool_fit"] }
    : { chosen: picked, checks, failed: [] };
}
