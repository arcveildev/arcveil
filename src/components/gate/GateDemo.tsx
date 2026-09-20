"use client";

import { useMemo, useState } from "react";
import {
  affordable,
  applySelection,
  buildEvaluation,
  buildSelection,
  decide,
  judgeCommitment,
  selectionClauses,
  type Candidate,
  type Evaluation,
} from "@arcveil/sdk";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { DEMO_CLAUSES, DEMO_SELECTION, SCENARIOS, type Scenario } from "@/data/gate";
import { stageJudgement, type DialValue, type Dials } from "@/lib/gate";
import { AnswerControls } from "./AnswerControls";
import { RequestView } from "./RequestView";
import { Verdict } from "./Verdict";

type Prepared = { evaluation: Evaluation | null; candidates: readonly Candidate[]; commitment: string | null };

/** Builds the request for a scenario. Price is settled here, before the judge exists. */
function prepare(scenario: Scenario): Prepared {
  if (scenario.kind === "evaluate") {
    return {
      evaluation: buildEvaluation(DEMO_CLAUSES, scenario.state),
      candidates: [],
      commitment: judgeCommitment(DEMO_CLAUSES),
    };
  }
  const candidates = affordable(scenario.candidates, DEMO_SELECTION);
  if (candidates.length === 0) return { evaluation: null, candidates, commitment: null };
  return {
    evaluation: buildSelection(scenario.task, candidates),
    candidates,
    commitment: judgeCommitment(selectionClauses(candidates, DEMO_SELECTION)),
  };
}

type Outcome = { allow: boolean; checks: readonly string[]; failed: readonly string[]; chosen?: string | null };

const PRICED_OUT: Outcome = { allow: false, checks: ["price_cap"], failed: ["price_cap"], chosen: null };

const short = (value: string) => `${value.slice(0, 10)}…${value.slice(-4)}`;

export function GateDemo() {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]!);
  const [dials, setDials] = useState<Dials>(SCENARIOS[0]!.dials);

  const prepared = useMemo(() => prepare(scenario), [scenario]);

  const result = useMemo<{ outcome: Outcome; errors: readonly string[] }>(() => {
    if (prepared.evaluation === null) return { outcome: PRICED_OUT, errors: [] };
    const staged = stageJudgement(prepared.evaluation.questions, dials);
    if (!staged.ok) return { outcome: PRICED_OUT, errors: staged.errors };
    if (scenario.kind === "evaluate") {
      const decision = decide(DEMO_CLAUSES, staged.judgement);
      return { outcome: { allow: decision.allow, checks: decision.checks, failed: decision.failed }, errors: [] };
    }
    const selection = applySelection(prepared.candidates, DEMO_SELECTION, staged.judgement);
    return {
      outcome: {
        allow: selection.chosen !== null,
        checks: selection.checks,
        failed: selection.failed,
        chosen: selection.chosen?.id ?? null,
      },
      errors: [],
    };
  }, [prepared, dials, scenario]);

  const pick = (next: Scenario) => {
    setScenario(next);
    setDials(next.dials);
  };

  const turn = (id: string, value: DialValue) => setDials((current) => ({ ...current, [id]: value }));

  return (
    <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
      <div className="flex flex-col border-b border-border lg:border-r lg:border-b-0">
        <FigureLabel n={1} />
        <div className="flex flex-col gap-3 px-4 pb-4 md:px-5 md:pb-5">
          <div className="flex flex-wrap gap-1">
            {SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.note}
                aria-pressed={item.id === scenario.id}
                onClick={() => pick(item)}
                className={
                  item.id === scenario.id
                    ? "hairline label-2xs border-fg/40 bg-fg/10 px-2 py-1.5 text-fg"
                    : "hairline label-2xs bg-surface-card px-2 py-1.5 text-fg-muted transition-colors hover:border-fg/28 hover:text-fg"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-sm leading-140 text-fg-muted">{scenario.note}</p>
          {prepared.evaluation === null ? (
            <p className="hairline bg-surface-card p-3 text-2xs leading-140 text-fg-muted">
              Every candidate is priced above the mandate&apos;s cap, so the field is empty and there is nothing to ask
              about. The refusal costs nothing: no request is built, and no inference is bought.
            </p>
          ) : (
            <RequestView evaluation={prepared.evaluation} />
          )}
          <p className="label-2xs text-fg-faint">
            {prepared.evaluation === null ? "No request built" : "Everything the judge is shown"}
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <FigureLabel n={2} />
        {prepared.evaluation === null ? (
          <p className="px-4 pb-4 text-sm leading-140 text-fg-muted md:px-5 md:pb-5">
            Nothing to answer. The cap is arithmetic, and arithmetic does not need a judge.
          </p>
        ) : (
          <AnswerControls questions={prepared.evaluation.questions} dials={dials} onChange={turn} />
        )}
        {result.errors.length > 0 && (
          <ul className="flex flex-col gap-1 border-t border-border p-4 md:p-5">
            {result.errors.map((error) => (
              <li key={error} className="font-mono text-2xs leading-140 text-chart-5">
                {error}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto border-t border-border">
          <Verdict outcome={result.outcome} chosen={result.outcome.chosen} />
          <p className="border-t border-border px-4 py-2.5 text-2xs leading-140 text-fg-faint">
            {prepared.commitment === null
              ? "No judge was asked, so a receipt for this would carry no judge at all."
              : `A receipt would carry these names, plus judge typesafe/jev at ${short(prepared.commitment)} — the clause set and its thresholds, committed to and still unreadable.`}
          </p>
        </div>
      </div>
    </div>
  );
}
