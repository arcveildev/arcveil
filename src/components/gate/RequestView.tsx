import type { Evaluation } from "@arcveil/sdk";

/**
 * Everything the judge is shown, and nothing else.
 *
 * Worth reading twice: there is no threshold anywhere in this object. The model
 * is asked the question and never told what would make its answer acceptable,
 * which is what stops a talkative state from arguing its way past a clause.
 */
export function RequestView({ evaluation }: { evaluation: Evaluation }) {
  return (
    <pre className="hairline scrollbar-none max-h-96 overflow-auto bg-surface-card p-3 font-mono text-2xs leading-140 text-fg-muted">
      {JSON.stringify(evaluation, null, 2)}
    </pre>
  );
}
