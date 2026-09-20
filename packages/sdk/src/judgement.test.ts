import { describe, expect, it } from "vitest";
import type { Clause } from "./judge";
import { applyClauses, decide, parseJudgement } from "./judgement";

const raw = {
  model: "jev-1.13.0",
  answers: {
    is_urgent: { type: "noul", noul: 0.95 },
    department: {
      type: "choice",
      choice: "billing",
      confidence: 0.8,
      probabilities: { billing: 0.87, sales: 0, technical: 0.13 },
    },
    frustration: {
      type: "score",
      score: 1.04,
      confidence: 0.94,
      legend: { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
      probabilities: { "0": 0, "1": 0.96, "2": 0.04 },
    },
  },
  usage: { input_tokens: 426, output_tokens: 73 },
};

describe("parseJudgement", () => {
  it("accepts the documented response", () => {
    const result = parseJudgement(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.judgement.model).toBe("jev-1.13.0");
  });

  it("rejects a response whose probability is out of range", () => {
    const result = parseJudgement({ ...raw, answers: { is_urgent: { type: "noul", noul: 1.4 } } });
    expect(result.ok).toBe(false);
  });

  it("rejects an answer of an unknown type instead of passing it through", () => {
    const result = parseJudgement({ ...raw, answers: { mood: { type: "vibe", vibe: 0.5 } } });
    expect(result.ok).toBe(false);
  });

  it("reports the path of what was wrong", () => {
    const result = parseJudgement({ model: "", answers: {}, usage: { input_tokens: 1, output_tokens: 1 } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("model");
  });
});

const judgement = parseJudgement(raw);
if (!judgement.ok) throw new Error("fixture must parse");
const answers = judgement.judgement;

describe("applyClauses", () => {
  const noul = (require: boolean, confidence: number): Clause => ({
    id: "is_urgent",
    type: "noul",
    instructions: "Urgent?",
    require,
    confidence,
  });

  it("passes a noul clause when the required answer clears the threshold", () => {
    expect(applyClauses([noul(true, 0.9)], answers)).toEqual([{ id: "is_urgent", status: "pass" }]);
  });

  it("fails a noul clause when the judge is not sure enough", () => {
    expect(applyClauses([noul(true, 0.99)], answers)).toEqual([{ id: "is_urgent", status: "fail" }]);
  });

  it("reads the confidence of a required false as the complement", () => {
    expect(applyClauses([noul(false, 0.05)], answers)).toEqual([{ id: "is_urgent", status: "pass" }]);
    expect(applyClauses([noul(false, 0.06)], answers)).toEqual([{ id: "is_urgent", status: "fail" }]);
  });

  const choice = (allow: readonly string[], confidence: number): Clause => ({
    id: "department",
    type: "choice",
    instructions: "Which?",
    criteria: { billing: "b", sales: "s", technical: "t" },
    allow,
    confidence,
  });

  it("passes a choice inside the allowed set", () => {
    expect(applyClauses([choice(["billing", "sales"], 0.8)], answers)).toEqual([{ id: "department", status: "pass" }]);
  });

  it("fails a choice outside the allowed set however confident the judge is", () => {
    expect(applyClauses([choice(["sales"], 0)], answers)).toEqual([{ id: "department", status: "fail" }]);
  });

  it("fails an allowed choice the judge is not confident enough about", () => {
    expect(applyClauses([choice(["billing"], 0.81)], answers)).toEqual([{ id: "department", status: "fail" }]);
  });

  const score = (band: { min?: number; max?: number }, confidence: number): Clause => ({
    id: "frustration",
    type: "score",
    instructions: "How frustrated?",
    criteria: ["Calm", "Frustrated", "Very angry"],
    band,
    confidence,
  });

  it("passes a score inside its band", () => {
    expect(applyClauses([score({ max: 1.5 }, 0.9)], answers)).toEqual([{ id: "frustration", status: "pass" }]);
  });

  it("fails a score above its band", () => {
    expect(applyClauses([score({ max: 1 }, 0.9)], answers)).toEqual([{ id: "frustration", status: "fail" }]);
  });

  it("fails a score below its band", () => {
    expect(applyClauses([score({ min: 1.5 }, 0.9)], answers)).toEqual([{ id: "frustration", status: "fail" }]);
  });

  it("fails an in-band score the judge is not confident enough about", () => {
    expect(applyClauses([score({ max: 1.5 }, 0.95)], answers)).toEqual([{ id: "frustration", status: "fail" }]);
  });

  it("reports unknown — never pass — when the judge did not answer the clause", () => {
    const missing: Clause = { id: "absent", type: "noul", instructions: "?", require: true, confidence: 0.1 };
    expect(applyClauses([missing], answers)).toEqual([{ id: "absent", status: "unknown" }]);
  });

  it("reports unknown when the judge answered with a different type than the clause asked", () => {
    const mismatched: Clause = { id: "is_urgent", type: "score", instructions: "?", criteria: ["a"], band: {}, confidence: 0 };
    expect(applyClauses([mismatched], answers)).toEqual([{ id: "is_urgent", status: "unknown" }]);
  });

  it("keeps the clause order and never reports a number", () => {
    const verdicts = applyClauses([noul(true, 0.9), choice(["billing"], 0.5)], answers);
    expect(verdicts.map((v) => v.id)).toEqual(["is_urgent", "department"]);
    expect(JSON.stringify(verdicts)).not.toMatch(/0\.\d/);
  });
});

describe("decide", () => {
  const ok: Clause = { id: "is_urgent", type: "noul", instructions: "?", require: true, confidence: 0.9 };
  const strict: Clause = { id: "is_urgent", type: "noul", instructions: "?", require: true, confidence: 0.99 };

  it("allows only when every clause passes, and names the checks that ran", () => {
    expect(decide([ok], answers)).toEqual({
      allow: true,
      checks: ["is_urgent"],
      failed: [],
      model: "jev-1.13.0",
    });
  });

  it("denies on a single failure and names it", () => {
    expect(decide([ok, { ...strict, id: "other" }], answers)).toEqual({
      allow: false,
      checks: ["is_urgent", "other"],
      failed: ["other"],
      model: "jev-1.13.0",
    });
  });

  it("denies when a clause could not be decided", () => {
    const absent: Clause = { id: "absent", type: "noul", instructions: "?", require: true, confidence: 0 };
    expect(decide([absent], answers).allow).toBe(false);
  });
});
