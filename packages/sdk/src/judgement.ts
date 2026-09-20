import { z } from "zod";
import type { Clause } from "./judge";

/**
 * What comes back from the judge, and what the mandate makes of it.
 *
 * A judgement is untrusted: it arrives from a third-party model over the
 * network, so it is parsed before it is read. Anything that does not fit the
 * documented shape cannot decide a clause, and a clause that cannot be decided
 * is never a pass — the same rule the receipt verifier already follows.
 */

const probability = z.number().min(0).max(1);

const answerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("noul"), noul: probability }),
  z.object({
    type: z.literal("choice"),
    choice: z.string().min(1),
    confidence: probability,
    probabilities: z.record(z.string(), probability),
  }),
  z.object({
    type: z.literal("score"),
    score: z.number(),
    confidence: probability,
    legend: z.record(z.string(), z.string()),
    probabilities: z.record(z.string(), probability),
  }),
]);

// Unknown keys are stripped rather than rejected: the gateway may add fields,
// and a new field in a response is not a reason to stop honouring a mandate.
const judgementSchema = z.object({
  model: z.string().min(1),
  answers: z.record(z.string(), answerSchema),
  usage: z.object({ input_tokens: z.number().int().nonnegative(), output_tokens: z.number().int().nonnegative() }),
});

export type Answer = z.infer<typeof answerSchema>;
export type Judgement = z.infer<typeof judgementSchema>;

export type JudgementResult = { ok: true; judgement: Judgement } | { ok: false; errors: readonly string[] };

const formatIssues = (error: z.ZodError): string[] =>
  error.issues.map((issue) => `${issue.path.join(".") || "judgement"}: ${issue.message}`);

/** Everything crossing the boundary from the model is untrusted until this says otherwise. */
export function parseJudgement(input: unknown): JudgementResult {
  const parsed = judgementSchema.safeParse(input);
  return parsed.success ? { ok: true, judgement: parsed.data } : { ok: false, errors: formatIssues(parsed.error) };
}

export type ClauseStatus = "pass" | "fail" | "unknown";

/**
 * A decided clause. It carries no probability on purpose: the numbers are the
 * judge's reasoning, and the reasoning is exactly what the veil covers.
 */
export type ClauseVerdict = { id: string; status: ClauseStatus };

const met = (clause: Clause, answer: Answer): boolean | null => {
  if (clause.type !== answer.type) return null;
  switch (answer.type) {
    case "noul": {
      const held = clause.type === "noul" && clause.require ? answer.noul : 1 - answer.noul;
      return held >= clause.confidence;
    }
    case "choice":
      if (clause.type !== "choice") return null;
      return clause.allow.includes(answer.choice) && answer.confidence >= clause.confidence;
    case "score": {
      if (clause.type !== "score") return null;
      const { min, max } = clause.band;
      const inBand = (min === undefined || answer.score >= min) && (max === undefined || answer.score <= max);
      return inBand && answer.confidence >= clause.confidence;
    }
  }
};

const verdict = (clause: Clause, judgement: Judgement): ClauseVerdict => {
  const answer = judgement.answers[clause.id];
  if (answer === undefined) return { id: clause.id, status: "unknown" };
  const held = met(clause, answer);
  if (held === null) return { id: clause.id, status: "unknown" };
  return { id: clause.id, status: held ? "pass" : "fail" };
};

/** Decides every clause against the judgement, in the order the mandate lists them. */
export const applyClauses = (clauses: readonly Clause[], judgement: Judgement): readonly ClauseVerdict[] =>
  clauses.map((clause) => verdict(clause, judgement));

export type Decision = {
  allow: boolean;
  /** Every clause that was put to the judge — these are the names a receipt carries. */
  checks: readonly string[];
  /** The ones that did not hold, whether they failed or could not be decided. */
  failed: readonly string[];
  model: string;
};

/** One clause short of unanimous is a deny. There is no partial mandate. */
export function decide(clauses: readonly Clause[], judgement: Judgement): Decision {
  const verdicts = applyClauses(clauses, judgement);
  const failed = verdicts.filter((item) => item.status !== "pass").map((item) => item.id);
  return {
    allow: failed.length === 0,
    checks: verdicts.map((item) => item.id),
    failed,
    model: judgement.model,
  };
}
