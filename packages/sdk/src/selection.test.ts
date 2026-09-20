import { describe, expect, it } from "vitest";
import { parseJudgement } from "./judgement";
import {
  affordable,
  applySelection,
  buildSelection,
  selectionClauses,
  type Candidate,
  type SelectionPolicy,
} from "./selection";
import { judgeCommitment } from "./judge";

const candidates: readonly Candidate[] = [
  { id: "quotes_pro", description: "Streaming quotes for 40 venues", priceUsd: 0.02 },
  { id: "quotes_lite", description: "Delayed quotes, one venue", priceUsd: 0.001 },
  { id: "whale_alerts", description: "Large-transfer notifications", priceUsd: 0.4 },
];

const policy: SelectionPolicy = { maxPriceUsd: 0.05, fitConfidence: 0.7, worthConfidence: 0.6 };

const judgementOf = (input: unknown) => {
  const parsed = parseJudgement(input);
  if (!parsed.ok) throw new Error(parsed.errors.join("; "));
  return parsed.judgement;
};

const answered = (fit: string, fitConfidence: number, worth: number) =>
  judgementOf({
    model: "jev-1.13.0",
    answers: {
      tool_fit: {
        type: "choice",
        choice: fit,
        confidence: fitConfidence,
        probabilities: { quotes_pro: 0.9, quotes_lite: 0.1 },
      },
      price_worth: { type: "noul", noul: worth },
    },
    usage: { input_tokens: 1, output_tokens: 1 },
  });

describe("affordable", () => {
  it("drops candidates over the mandate's cap before the judge is ever asked", () => {
    expect(affordable(candidates, policy).map((c) => c.id)).toEqual(["quotes_pro", "quotes_lite"]);
  });

  it("keeps a candidate priced exactly at the cap", () => {
    expect(affordable(candidates, { ...policy, maxPriceUsd: 0.4 })).toHaveLength(3);
  });

  it("does not mutate the list it was given", () => {
    const input = [...candidates];
    affordable(input, policy);
    expect(input).toEqual(candidates);
  });
});

describe("buildSelection", () => {
  const evaluation = buildSelection("Price a USDC/EURC swap", affordable(candidates, policy));

  it("shows the judge the task and the surviving candidates", () => {
    expect(evaluation.state).toEqual({
      task: "Price a USDC/EURC swap",
      candidates: [
        { id: "quotes_pro", description: "Streaming quotes for 40 venues", priceUsd: 0.02 },
        { id: "quotes_lite", description: "Delayed quotes, one venue", priceUsd: 0.001 },
      ],
    });
  });

  it("asks which one fits, over exactly the affordable ids", () => {
    const fit = evaluation.questions.tool_fit;
    expect(fit?.type).toBe("choice");
    if (fit?.type === "choice") expect(Object.keys(fit.criteria).sort()).toEqual(["quotes_lite", "quotes_pro"]);
  });

  it("asks whether the price is worth it, as a separate question", () => {
    expect(evaluation.questions.price_worth?.type).toBe("noul");
  });

  it("refuses to ask about an empty field", () => {
    expect(() => buildSelection("anything", [])).toThrow();
  });
});

describe("applySelection", () => {
  const surviving = affordable(candidates, policy);

  it("picks the tool when fit and worth both clear their thresholds", () => {
    const result = applySelection(surviving, policy, answered("quotes_pro", 0.8, 0.7));
    expect(result.chosen?.id).toBe("quotes_pro");
    expect(result.checks).toEqual(["price_cap", "tool_fit", "price_worth"]);
    expect(result.failed).toEqual([]);
  });

  it("buys nothing when the judge is not confident about the fit", () => {
    const result = applySelection(surviving, policy, answered("quotes_pro", 0.6, 0.9));
    expect(result.chosen).toBeNull();
    expect(result.failed).toEqual(["tool_fit"]);
  });

  it("buys nothing when the price is not judged worth it", () => {
    const result = applySelection(surviving, policy, answered("quotes_pro", 0.9, 0.5));
    expect(result.chosen).toBeNull();
    expect(result.failed).toEqual(["price_worth"]);
  });

  it("refuses a pick that is not one of the candidates it offered", () => {
    const result = applySelection(surviving, policy, answered("whale_alerts", 1, 1));
    expect(result.chosen).toBeNull();
    expect(result.failed).toEqual(["tool_fit"]);
  });

  it("fails the price cap, and asks nothing else, when nothing was affordable", () => {
    const result = applySelection([], policy, answered("quotes_pro", 1, 1));
    expect(result.chosen).toBeNull();
    expect(result.checks).toEqual(["price_cap"]);
    expect(result.failed).toEqual(["price_cap"]);
  });

  it("never reports what the judge scored", () => {
    const result = applySelection(surviving, policy, answered("quotes_pro", 0.8, 0.7));
    expect(JSON.stringify(result)).not.toContain("0.8");
  });
});

describe("selectionClauses", () => {
  const surviving = affordable(candidates, policy);

  it("can be committed to, and the commitment moves when the bar does", () => {
    const strict = { ...policy, fitConfidence: 0.95 };
    expect(judgeCommitment(selectionClauses(surviving, policy))).not.toBe(
      judgeCommitment(selectionClauses(surviving, strict)),
    );
  });

  it("commits to the field it chose from, not just the bar", () => {
    const narrower = surviving.slice(0, 1);
    expect(judgeCommitment(selectionClauses(surviving, policy))).not.toBe(
      judgeCommitment(selectionClauses(narrower, policy)),
    );
  });
});
