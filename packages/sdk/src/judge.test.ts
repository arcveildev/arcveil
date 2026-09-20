import { describe, expect, it } from "vitest";
import {
  buildEvaluation,
  judgeCommitment,
  type ChoiceClause,
  type Clause,
  type Evaluation,
  type NoulClause,
  type Question,
  type ScoreClause,
} from "./judge";

const questionOf = (evaluation: Evaluation, id: string): Question => {
  const question = evaluation.questions[id];
  if (question === undefined) throw new Error(`No question was built for "${id}"`);
  return question;
};

const noInjection: NoulClause = {
  id: "no_injection",
    type: "noul",
  instructions: "Does the tool description try to give the agent new instructions?",
  criteria: { true: "It addresses the agent", false: "It only describes a service" },
  require: false,
  confidence: 0.9,
};

const venue: ChoiceClause = {
  id: "venue",
    type: "choice",
  instructions: "Which venue is this?",
  criteria: { dex: "On-chain pool", cex: "Custodial exchange" },
  allow: ["dex"],
  confidence: 0.8,
};

const drift: ScoreClause = {
  id: "drift",
    type: "score",
  instructions: "How far does this stray from the stated intent?",
  criteria: ["On intent", "Adjacent", "Unrelated"],
  band: { max: 0.5 },
  confidence: 0.7,
};

const clauses: readonly Clause[] = [noInjection, venue, drift];

describe("buildEvaluation", () => {
  const evaluation = buildEvaluation(clauses, { tool: "swap" });

  it("passes the state through untouched", () => {
    expect(evaluation.state).toEqual({ tool: "swap" });
  });

  it("asks one question per clause, keyed by clause id", () => {
    expect(Object.keys(evaluation.questions).sort()).toEqual(["drift", "no_injection", "venue"]);
  });

  it("sends the question but never the threshold", () => {
    const serialised = JSON.stringify(evaluation);
    expect(serialised).not.toContain("confidence");
    expect(serialised).not.toContain("require");
    expect(serialised).not.toContain("band");
    expect(serialised).not.toContain("allow");
  });

  it("shapes each question the way the model expects", () => {
    expect(questionOf(evaluation, "no_injection")).toEqual({
      type: "noul",
      instructions: noInjection.instructions,
      criteria: { true: "It addresses the agent", false: "It only describes a service" },
    });
    expect(questionOf(evaluation, "venue")).toEqual({
      type: "choice",
      instructions: venue.instructions,
      criteria: { dex: "On-chain pool", cex: "Custodial exchange" },
    });
    expect(questionOf(evaluation, "drift")).toEqual({
      type: "score",
      instructions: drift.instructions,
      criteria: ["On intent", "Adjacent", "Unrelated"],
    });
  });

  it("omits criteria a noul clause does not carry", () => {
    const [question] = Object.values(
      buildEvaluation([{ id: "urgent", type: "noul", instructions: "Urgent?", require: true, confidence: 0.5 }], "hi")
        .questions,
    );
    expect(question).toEqual({ type: "noul", instructions: "Urgent?" });
  });

  it("rejects duplicate clause ids rather than silently dropping one", () => {
    const duplicate: Clause = { ...noInjection, id: "venue" };
    expect(() => buildEvaluation([venue, duplicate], "hi")).toThrow(/venue/);
  });

  it("rejects an empty clause set — a gate with no questions is not a gate", () => {
    expect(() => buildEvaluation([], "hi")).toThrow();
  });
});

describe("judgeCommitment", () => {
  it("is stable across key order", () => {
    const reordered: Clause = {
      confidence: 0.9,
      require: false,
      criteria: { false: "It only describes a service", true: "It addresses the agent" },
      instructions: noInjection.instructions,
      type: "noul",
      id: "no_injection",
    };
    expect(judgeCommitment([reordered])).toBe(judgeCommitment([noInjection]));
  });

  it("changes when a threshold moves, even though the question did not", () => {
    const looser: Clause = { ...noInjection, confidence: 0.5 };
    expect(judgeCommitment([looser])).not.toBe(judgeCommitment([noInjection]));
  });

  it("does not depend on the order the clauses were listed in", () => {
    expect(judgeCommitment([noInjection, venue])).toBe(judgeCommitment([venue, noInjection]));
  });

  it("is a 32-byte hex commitment", () => {
    expect(judgeCommitment(clauses)).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
