"use client";

import type { Question } from "@arcveildev/sdk";
import type { DialValue, Dials } from "@/lib/gate";
import { Dial } from "./Dial";

const percent = (value: number) => `${Math.round(value * 100)}%`;

/** The judge's answers, one control per question, in the shape the model returns them. */
export function AnswerControls({
  questions,
  dials,
  onChange,
}: {
  questions: Readonly<Record<string, Question>>;
  dials: Dials;
  onChange: (id: string, value: DialValue) => void;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 py-4 md:px-5 md:py-5">
      {Object.entries(questions).map(([id, question]) => {
        const dial = dials[id];
        if (dial === undefined) return null;
        return (
          <fieldset key={id} className="flex flex-col gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
            <legend className="sr-only">{id}</legend>
            <p className="font-mono text-2xs text-fg">{id}</p>
            <p className="text-2xs leading-140 text-fg-faint">{question.instructions}</p>

            {dial.type === "noul" && (
              <Dial
                label="Probability of true"
                value={dial.noul}
                format={percent}
                onChange={(noul) => onChange(id, { type: "noul", noul })}
              />
            )}

            {dial.type === "choice" && question.type === "choice" && (
              <>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(question.criteria).map((label) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={dial.choice === label}
                      onClick={() => onChange(id, { ...dial, choice: label })}
                      className={
                        dial.choice === label
                          ? "hairline label-2xs border-fg/40 bg-fg/10 px-2 py-1.5 text-fg"
                          : "hairline label-2xs bg-surface-card px-2 py-1.5 text-fg-muted transition-colors hover:border-fg/28 hover:text-fg"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Dial
                  label="Confidence"
                  value={dial.confidence}
                  format={percent}
                  onChange={(confidence) => onChange(id, { ...dial, confidence })}
                />
              </>
            )}

            {dial.type === "score" && question.type === "score" && (
              <>
                <Dial
                  label={question.criteria[Math.min(question.criteria.length - 1, Math.round(dial.score))] ?? "Score"}
                  value={dial.score}
                  min={0}
                  max={question.criteria.length - 1}
                  onChange={(score) => onChange(id, { ...dial, score })}
                />
                <Dial
                  label="Confidence"
                  value={dial.confidence}
                  format={percent}
                  onChange={(confidence) => onChange(id, { ...dial, confidence })}
                />
              </>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
