import { cn } from "@/lib/cn";

type Outcome = { allow: boolean; checks: readonly string[]; failed: readonly string[] };

const held = (id: string, failed: readonly string[]) => !failed.includes(id);

/** The whole answer a caller gets: which clauses were put, which held, and nothing numeric. */
export function Verdict({ outcome, chosen }: { outcome: Outcome; chosen?: string | null }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 bg-surface-raised px-4 py-2">
        <p className="label-2xs text-fg-muted">
          {chosen === undefined ? "Decision" : "Selection"}
          {chosen !== undefined && chosen !== null && (
            <> · <span className="font-mono normal-case text-fg">{chosen}</span></>
          )}
        </p>
        <span className={cn("label-2xs inline-flex items-center gap-1.5", outcome.allow ? "text-chart-1" : "text-chart-5")}>
          <span className={cn("size-1.5 shrink-0", outcome.allow ? "bg-chart-1" : "bg-chart-5")} aria-hidden="true" />
          {outcome.allow ? "Allow" : "Deny"}
        </span>
      </div>
      <ul>
        {outcome.checks.map((id) => (
          <li key={id} className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
            <span className="font-mono text-2xs text-fg">{id}</span>
            <span
              className={cn(
                "label-2xs inline-flex items-center gap-1.5",
                held(id, outcome.failed) ? "text-chart-1" : "text-chart-5",
              )}
            >
              <span
                className={cn("size-1.5 shrink-0", held(id, outcome.failed) ? "bg-chart-1" : "bg-chart-5")}
                aria-hidden="true"
              />
              {held(id, outcome.failed) ? "Held" : "Did not hold"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
