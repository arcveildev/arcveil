"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const PARAMS = [
  { key: "max_steps", value: "10,000" },
  { key: "rollouts_per_example", value: "19" },
  { key: "seq_len", value: "4" },
  { key: "batch_size", value: "65536" },
  { key: "max_tokens", value: "256" },
  { key: "learning_rate", value: "0.00005", flash: true },
] as const;

const AXIS = ["1", "0.8", "0.6", "0.4", "0.2", "0"] as const;
const SAMPLES = 64;
const START = 0.01;
const END = 0.8;
const DURATION_MS = 4200;
const HOLD_MS = 2400;
const ROW_STAGGER_MS = 80;

type Point = { x: number; y: number };

/** Deterministic noisy saturation curve so SSR and client render the same shape. */
const rewardAt = (x: number): number => {
  const base = START + (END - START) * ((1 - Math.exp(-3.4 * x)) / (1 - Math.exp(-3.4)));
  const noise = 0.03 * Math.sin(x * 34) * Math.sin(x * 9.7 + 0.6) * (0.25 + x);
  return Math.min(1, Math.max(0, base + noise));
};

const CURVE: readonly Point[] = Array.from({ length: SAMPLES }, (_, i) => {
  const x = i / (SAMPLES - 1);
  return { x, y: rewardAt(x) };
});

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);

const visiblePoints = (progress: number): readonly Point[] => {
  const idx = progress * (SAMPLES - 1);
  const whole = Math.floor(idx);
  const frac = idx - whole;
  const head = CURVE.slice(0, whole + 1);
  if (whole >= SAMPLES - 1) return head;
  const a = CURVE[whole];
  const b = CURVE[whole + 1];
  return [...head, { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac }];
};

const toSvg = (points: readonly Point[]): string =>
  points.map((p) => `${(p.x * 200).toFixed(2)},${((1 - p.y) * 100).toFixed(2)}`).join(" ");

function useRewardProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (reduced) {
        setProgress(1);
        return;
      }
      const t = (now - started) % (DURATION_MS + HOLD_MS);
      setProgress(easeOut(Math.min(1, t / DURATION_MS)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return progress;
}

/** FIG.3 — animated reward curve beside the run's hyper-parameters. */
export function RewardChart() {
  const progress = useRewardProgress();
  const points = useMemo(() => visiblePoints(progress), [progress]);
  const current = points[points.length - 1]?.y ?? START;
  const high = current > 0.5;

  return (
    <div className="flex w-full max-w-114 select-none items-stretch gap-4 bg-surface font-sans text-fg/90">
      <div className="relative flex min-w-0 flex-1 flex-col gap-3 border-r border-dashed border-fg/16 py-2 pr-4">
        <div className="flex items-start justify-between whitespace-nowrap text-xs">
          <span className="text-fg">Reward</span>
          <span className={cn("font-mono tabular-nums transition-colors", high ? "text-accent" : "text-fg-muted")}>
            {current.toFixed(2)}
          </span>
        </div>
        <div className="relative h-32 pl-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between">
            {AXIS.map((tick) => (
              <span key={tick} className="font-favorit text-2xs leading-none text-fg/40 tabular-nums">
                {tick}
              </span>
            ))}
          </div>
          <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label={`Reward ${current.toFixed(2)}`}>
            {AXIS.map((tick, i) => {
              const y = (i / (AXIS.length - 1)) * 100;
              return <line key={tick} x1="0" y1={y} x2="200" y2={y} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />;
            })}
            <polyline points={toSvg(points)} fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      <dl className="flex w-44 shrink-0 flex-col justify-center text-xs leading-normal whitespace-nowrap">
        {PARAMS.map((param, i) => (
          <div
            key={param.key}
            className="flex h-7 items-center gap-2 border-b border-border animate-row-in last:border-b-0 motion-reduce:animate-none"
            style={{ animationDelay: `${i * ROW_STAGGER_MS}ms` }}
          >
            <dt className="shrink-0 text-fg-muted">{param.key}</dt>
            <span aria-hidden="true" className="min-w-px flex-1 border-t border-dotted border-fg/20" />
            <dd className={cn("shrink-0 font-mono tabular-nums text-fg", "flash" in param && param.flash && "animate-value-flash motion-reduce:animate-none")}>
              {param.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
