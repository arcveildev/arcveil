"use client";

import type { PoolView } from "./usePool";

/**
 * How big the crowd is, read from the chain rather than typed into a file.
 *
 * This number *is* the privacy. A pool of one hides nobody, and a page that
 * lets someone deposit into one without saying so has mis-sold the product —
 * so when it is small, the strip says it plainly instead of showing a figure
 * and letting the reader assume it is enough.
 */
export function PoolStrip({ pool, ready }: { pool: PoolView; ready: boolean }) {
  if (!ready) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-border px-4 py-3 md:px-5">
        <span className="label-2xs text-fg-subtle">Anonymity set</span>
        <span className="text-sm text-chart-2">no pool yet</span>
      </div>
    );
  }

  const count = pool.state?.deposits.length ?? 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-border px-4 py-3 md:px-5">
      <span className="label-2xs text-fg-subtle">Anonymity set</span>

      {pool.loading ? (
        <span className="text-sm text-fg-muted">reading the chain…</span>
      ) : pool.error ? (
        <span className="text-sm text-chart-5">{pool.error}</span>
      ) : (
        <>
          <span className={`text-sm ${count < 10 ? "text-chart-2" : "text-accent"}`}>
            {count} {count === 1 ? "deposit" : "deposits"}
          </span>
          <span className="text-2xs leading-140 text-fg-faint">
            {count === 0
              ? "Nothing to hide among. The first deposit has no privacy at all."
              : count < 10
                ? "Small enough that timing and amounts will identify most withdrawals. Wait for it to grow."
                : "Every withdrawal could be any of these."}
          </span>
        </>
      )}
    </div>
  );
}
