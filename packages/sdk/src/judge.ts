import { keccak256, toHex } from "viem";
import { canonicalize } from "./canonical.js";
import type { Hex } from "./types.js";

/**
 * Semantic clauses — the part of a mandate no threshold can express.
 *
 * The five checks a receipt already names are arithmetic: a cap, a window, an
 * allowlist. They cannot answer "is this tool description trying to give the
 * agent new instructions?" or "is this still what the account holder asked
 * for?". A clause pairs that question with the threshold the answer must clear.
 *
 * The split is the whole point. `buildEvaluation` sends the judge the question
 * and withholds the threshold, so the model is never told what would make its
 * answer acceptable — it can only report what it saw. Code owns the threshold.
 */

type ClauseBase = {
  /** Also the check name that reaches the receipt. Public; the threshold is not. */
  id: string;
  instructions: string;
  /** Minimum confidence in the required answer, 0–1. */
  confidence: number;
};

/** A calibrated boolean: the mandate names the answer it requires. */
export type NoulClause = ClauseBase & {
  type: "noul";
  criteria?: { true: string; false: string };
  require: boolean;
};

/** A labelled pick: the mandate names the labels it will accept. */
export type ChoiceClause = ClauseBase & {
  type: "choice";
  criteria: Readonly<Record<string, string>>;
  allow: readonly string[];
};

/** A calibrated position on a scale: the mandate names the band it must land in. */
export type ScoreClause = ClauseBase & {
  type: "score";
  criteria: readonly string[];
  band: { min?: number; max?: number };
};

export type Clause = NoulClause | ChoiceClause | ScoreClause;

/** A clause with its threshold removed — what the judge is actually shown. */
export type Question =
  | { type: "noul"; instructions: string; criteria?: { true: string; false: string } }
  | { type: "choice"; instructions: string; criteria: Readonly<Record<string, string>> }
  | { type: "score"; instructions: string; criteria: readonly string[] };

export type Evaluation = {
  state: unknown;
  questions: Readonly<Record<string, Question>>;
};

const question = (clause: Clause): Question => {
  switch (clause.type) {
    case "noul":
      return clause.criteria === undefined
        ? { type: "noul", instructions: clause.instructions }
        : { type: "noul", instructions: clause.instructions, criteria: clause.criteria };
    case "choice":
      return { type: "choice", instructions: clause.instructions, criteria: clause.criteria };
    case "score":
      return { type: "score", instructions: clause.instructions, criteria: clause.criteria };
  }
};

const assertUsable = (clauses: readonly Clause[]): void => {
  if (clauses.length === 0) throw new Error("A gate needs at least one clause: nothing to ask is not a check.");
  const seen = new Set<string>();
  for (const clause of clauses) {
    if (seen.has(clause.id)) throw new Error(`Duplicate clause id "${clause.id}": ids name checks, so they must be unique.`);
    seen.add(clause.id);
    if (!(clause.confidence >= 0 && clause.confidence <= 1)) {
      throw new Error(`Clause "${clause.id}" has confidence ${clause.confidence}; it must be between 0 and 1.`);
    }
  }
};

/**
 * Builds the request for one evaluation. The thresholds stay behind: what
 * crosses to the model is the state, the questions and nothing else.
 */
export function buildEvaluation(clauses: readonly Clause[], state: unknown): Evaluation {
  assertUsable(clauses);
  return {
    state,
    questions: Object.fromEntries(clauses.map((clause) => [clause.id, question(clause)])),
  };
}

/** The clause as it is committed to — question *and* threshold, with no undefined holes. */
const terms = (clause: Clause): Record<string, unknown> => {
  const base = { id: clause.id, instructions: clause.instructions, confidence: clause.confidence };
  switch (clause.type) {
    case "noul":
      return {
        ...base,
        type: "noul",
        require: clause.require,
        ...(clause.criteria === undefined ? {} : { criteria: clause.criteria }),
      };
    case "choice":
      return { ...base, type: "choice", criteria: clause.criteria, allow: [...clause.allow].sort() };
    case "score":
      return {
        ...base,
        type: "score",
        criteria: clause.criteria,
        band: {
          ...(clause.band.min === undefined ? {} : { min: clause.band.min }),
          ...(clause.band.max === undefined ? {} : { max: clause.band.max }),
        },
      };
  }
};

/**
 * A commitment to the clause set, thresholds included.
 *
 * A receipt that says `intent_match` passed says nothing about how hard that
 * was to pass. Publishing this alongside the mandate lets the holder show, later
 * and at a time of their choosing, exactly which questions were asked and how
 * strictly — while a receipt on its own still reveals neither.
 */
export function judgeCommitment(clauses: readonly Clause[]): Hex {
  assertUsable(clauses);
  const sorted = [...clauses].sort((a, b) => (a.id < b.id ? -1 : 1));
  return keccak256(toHex(canonicalize(sorted.map(terms))));
}
