import { cn } from "@/lib/cn";

type Row = { rank: number; model: string; score: number };

const ROWS: readonly Row[] = [
  { rank: 1, model: "Qwen3-235B-A22B", score: 0.84 },
  { rank: 2, model: "DeepSeek-V3.1", score: 0.79 },
  { rank: 3, model: "GLM-4.5", score: 0.74 },
  { rank: 4, model: "Kimi-K2-Instruct", score: 0.71 },
  { rank: 5, model: "gpt-oss-120b", score: 0.66 },
];

const ENV_NAME = "deepdive";

/** FIG.2 — a compact hosted-evaluation leaderboard (rank, model, score bar, score). */
export function LeaderboardFigure() {
  return (
    <div className="hairline w-full max-w-114 bg-surface font-sans text-xs" role="table" aria-label={`Leaderboard for ${ENV_NAME}`}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2" role="row">
        <span className="font-favorit text-2xs uppercase text-fg-faint" role="columnheader">
          Leaderboard · {ENV_NAME}
        </span>
        <span className="font-favorit text-2xs uppercase text-fg-faint" role="columnheader">
          avg reward
        </span>
      </div>
      {ROWS.map((row) => {
        const top = row.rank === 1;
        return (
          <div
            key={row.model}
            role="row"
            className={cn("flex items-center gap-3 px-3 py-2.5 border-border", row.rank < ROWS.length && "border-b")}
          >
            <span role="cell" className="w-4 shrink-0 font-favorit text-2xs text-fg-faint tabular-nums">
              {String(row.rank).padStart(2, "0")}
            </span>
            <span role="cell" className={cn("w-32 shrink-0 truncate font-mono", top ? "text-fg" : "text-fg-muted")}>
              {row.model}
            </span>
            <span role="cell" className="h-1 flex-1 bg-fg/6" aria-hidden="true">
              <span
                className={cn("block h-full", top ? "bg-accent" : "bg-fg/30")}
                style={{ width: `${Math.round(row.score * 100)}%` }}
              />
            </span>
            <span role="cell" className={cn("w-8 shrink-0 text-right font-mono tabular-nums", top ? "text-accent" : "text-fg-muted")}>
              {row.score.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
