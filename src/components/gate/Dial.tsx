"use client";

import { cn } from "@/lib/cn";

/**
 * One answer, in the visitor's hands.
 *
 * A judge does not return a verdict, it returns a number. The dial is the
 * honest way to show that: the page cannot call Jev, so whoever is reading
 * gets to answer instead, and watches the mandate decide what the answer means.
 */
export function Dial({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 1,
  format,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  format?: (value: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3">
        <span className="label-2xs text-fg-muted">{label}</span>
        <span className="font-mono text-2xs text-fg">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          "h-1 w-full cursor-pointer appearance-none bg-fg/12 accent-accent",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg/60",
        )}
      />
      {hint !== undefined && <span className="text-2xs leading-140 text-fg-faint">{hint}</span>}
    </label>
  );
}
