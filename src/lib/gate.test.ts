import { describe, expect, it } from "vitest";
import { buildEvaluation, decide, type Clause } from "@arcveildev/sdk";
import { stageJudgement, type Dials } from "./gate";

const clauses: readonly Clause[] = [
  { id: "no_injection", type: "noul", instructions: "Injected?", require: false, confidence: 0.9 },
  {
    id: "venue",
    type: "choice",
    instructions: "Which venue?",
    criteria: { dex: "On-chain pool", cex: "Custodial exchange" },
    allow: ["dex"],
    confidence: 0.7,
  },
  {
    id: "drift",
    type: "score",
    instructions: "How far from intent?",
    criteria: ["On intent", "Adjacent", "Unrelated"],
    band: { max: 0.6 },
    confidence: 0.6,
  },
];

const questions = buildEvaluation(clauses, "a proposed swap").questions;

const dials: Dials = {
  no_injection: { type: "noul", noul: 0.04 },
  venue: { type: "choice", choice: "dex", confidence: 0.92 },
  drift: { type: "score", score: 0.2, confidence: 0.81 },
};

describe("stageJudgement", () => {
  it("produces a judgement the SDK's own parser accepts", () => {
    expect(stageJudgement(questions, dials).ok).toBe(true);
  });

  it("feeds a decision the real thresholds can act on", () => {
    const staged = stageJudgement(questions, dials);
    if (!staged.ok) throw new Error(staged.errors.join("; "));
    expect(decide(clauses, staged.judgement)).toMatchObject({ allow: true, failed: [] });
  });

  it("turns a dial past the threshold into a deny", () => {
    const staged = stageJudgement(questions, { ...dials, no_injection: { type: "noul", noul: 0.4 } });
    if (!staged.ok) throw new Error(staged.errors.join("; "));
    expect(decide(clauses, staged.judgement).failed).toEqual(["no_injection"]);
  });

  it("keeps every probability set inside the range the model promises", () => {
    const staged = stageJudgement(questions, { ...dials, venue: { type: "choice", choice: "dex", confidence: 1 } });
    expect(staged.ok).toBe(true);
  });

  it("carries a legend for a score, so the page can label the scale", () => {
    const staged = stageJudgement(questions, dials);
    if (!staged.ok) throw new Error("expected a judgement");
    const answer = staged.judgement.answers.drift;
    expect(answer?.type === "score" && answer.legend["0"]).toBe("On intent");
  });

  it("leaves out a question nobody set a dial for, so the clause reads unknown", () => {
    const staged = stageJudgement(questions, { no_injection: dials.no_injection! });
    if (!staged.ok) throw new Error("expected a judgement");
    expect(decide(clauses, staged.judgement).failed).toEqual(["venue", "drift"]);
  });

  it("clamps a dial that was dragged out of range rather than emitting an invalid answer", () => {
    const staged = stageJudgement(questions, { ...dials, no_injection: { type: "noul", noul: 1.8 } });
    expect(staged.ok).toBe(true);
  });
});
