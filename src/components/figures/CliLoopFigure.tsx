const STEPS = [
  { label: "init", cmd: "prime env init" },
  { label: "develop", cmd: "prime env dev" },
  { label: "eval", cmd: "prime eval run" },
  { label: "push", cmd: "prime env push" },
] as const;

const W = 456;
const H = 313;
const BOX_W = 88;
const BOX_H = 40;
const GAP = (W - 24 - STEPS.length * BOX_W) / (STEPS.length - 1);
const BOX_Y = (H - BOX_H) / 2;
const LOOP_Y = BOX_Y + BOX_H + 56;

const boxX = (i: number): number => 12 + i * (BOX_W + GAP);

/** FIG.1 — the Prime CLI loop (init → develop → eval → push → back to init). */
export function CliLoopFigure() {
  const first = boxX(0) + BOX_W / 2;
  const last = boxX(STEPS.length - 1) + BOX_W / 2;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="h-auto w-full max-w-114 text-fg"
      role="img"
      aria-label="CLI loop: init, develop, eval, push"
    >
      <defs>
        <marker id="cli-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" strokeWidth="1" />
        </marker>
      </defs>

      {STEPS.map((step, i) => {
        const x = boxX(i);
        const hasNext = i < STEPS.length - 1;
        return (
          <g key={step.label}>
            <rect x={x + 0.5} y={BOX_Y + 0.5} width={BOX_W - 1} height={BOX_H - 1} fill="none" stroke="var(--line-strong)" />
            <text
              x={x + BOX_W / 2}
              y={BOX_Y + BOX_H / 2 + 4}
              textAnchor="middle"
              fill="currentColor"
              className="font-favorit text-xs uppercase"
            >
              {step.label}
            </text>
            <text
              x={x + BOX_W / 2}
              y={BOX_Y - 14}
              textAnchor="middle"
              className="fill-fg-faint font-mono text-2xs"
            >
              {step.cmd}
            </text>
            {hasNext && (
              <line
                x1={x + BOX_W}
                y1={BOX_Y + BOX_H / 2}
                x2={x + BOX_W + GAP - 2}
                y2={BOX_Y + BOX_H / 2}
                stroke="currentColor"
                strokeOpacity="0.4"
                markerEnd="url(#cli-arrow)"
              />
            )}
          </g>
        );
      })}

      {/* return path: push → init */}
      <path
        d={`M${last} ${BOX_Y + BOX_H} V${LOOP_Y} H${first} V${BOX_Y + BOX_H + 2}`}
        fill="none"
        stroke="var(--accent)"
        strokeDasharray="2 4"
        markerEnd="url(#cli-arrow)"
      />
      <text x={(first + last) / 2} y={LOOP_Y + 16} textAnchor="middle" className="fill-accent font-favorit text-2xs uppercase">
        iterate
      </text>
    </svg>
  );
}
