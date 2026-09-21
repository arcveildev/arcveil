import { parseJudgement, type Judgement, type Question } from "@arcveildev/sdk";

/**
 * Turns the dials on the gate page into a judgement.
 *
 * The page has no judge in it: `typesafe/jev` runs behind a binding in the
 * enclave, not in a browser tab. So the visitor plays the judge — they set the
 * answers, and the mandate side runs for real. `buildEvaluation` builds the
 * questions, `decide` applies the thresholds, and the answer is put through
 * `parseJudgement` on the way in, the same boundary a real response crosses.
 */

export type DialValue =
  | { type: "noul"; noul: number }
  | { type: "choice"; choice: string; confidence: number }
  | { type: "score"; score: number; confidence: number };

export type Dials = Readonly<Record<string, DialValue>>;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Spreads what the judge did not commit to the chosen label across the rest. */
const spread = (labels: readonly string[], chosen: string, confidence: number): Record<string, number> => {
  const rest = labels.filter((label) => label !== chosen);
  const each = rest.length === 0 ? 0 : clamp(1 - confidence) / rest.length;
  return Object.fromEntries([[chosen, clamp(confidence)], ...rest.map((label) => [label, each] as const)]);
};

const nearest = (score: number, steps: number) => String(Math.min(steps - 1, Math.max(0, Math.round(score))));

const answerOf = (dial: DialValue, question: Question): unknown => {
  switch (dial.type) {
    case "noul":
      return { type: "noul", noul: clamp(dial.noul) };
    case "choice": {
      const labels = question.type === "choice" ? Object.keys(question.criteria) : [dial.choice];
      return {
        type: "choice",
        choice: dial.choice,
        confidence: clamp(dial.confidence),
        probabilities: spread(labels, dial.choice, dial.confidence),
      };
    }
    case "score": {
      const criteria = question.type === "score" ? question.criteria : [];
      const legend = Object.fromEntries(criteria.map((label, index) => [String(index), label]));
      const indices = criteria.map((_, index) => String(index));
      return {
        type: "score",
        score: dial.score,
        confidence: clamp(dial.confidence),
        legend,
        probabilities: spread(indices, nearest(dial.score, criteria.length), dial.confidence),
      };
    }
  }
};

export type Staged = { ok: true; judgement: Judgement } | { ok: false; errors: readonly string[] };

/** Builds the response a judge would have returned, and validates it like one. */
export function stageJudgement(
  questions: Readonly<Record<string, Question>>,
  dials: Dials,
  model = "jev-1.13.0",
): Staged {
  const answers = Object.entries(questions).reduce<Record<string, unknown>>((acc, [id, question]) => {
    const dial = dials[id];
    return dial === undefined ? acc : { ...acc, [id]: answerOf(dial, question) };
  }, {});
  const parsed = parseJudgement({ model, answers, usage: { input_tokens: 0, output_tokens: 0 } });
  return parsed.ok ? { ok: true, judgement: parsed.judgement } : { ok: false, errors: parsed.errors };
}
