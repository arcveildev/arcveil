/**
 * Pure math + formatting for the "Liquid Reserved Clusters" idle-capacity
 * calculator (FIG.7). No mutation: every function returns a fresh value.
 */

export const RESERVATION_YEARS = 3;
export const HOURS_PER_YEAR = 365 * 24;
export const RESERVATION_HOURS = RESERVATION_YEARS * HOURS_PER_YEAR;
/** Share of reserved hours assumed to sit idle and be resold. */
export const IDLE_SHARE = 0.5;
/** Spot-market resale rate used for the revenue line. */
export const RESALE_RATE_PER_HOUR = 8;

export const MIN_GPU_COUNT = 1;
export const MAX_GPU_COUNT = 100_000;

export type IdleInputs = {
  readonly pricePerHour: number;
  readonly gpuCount: number;
};

export type IdleEconomics = {
  readonly hours: number;
  readonly hourlyTotal: number;
  readonly reservedCost: number;
  readonly idleHours: number;
  readonly idleCost: number;
  readonly revenue: number;
  readonly profit: number;
};

const isFiniteNonNegative = (n: number): boolean => Number.isFinite(n) && n >= 0;

/** Clamp a raw GPU count into the supported range; NaN falls back to the minimum. */
export function clampGpuCount(raw: number): number {
  if (!Number.isFinite(raw)) return MIN_GPU_COUNT;
  return Math.min(MAX_GPU_COUNT, Math.max(MIN_GPU_COUNT, Math.floor(raw)));
}

/**
 * Compute the 3-year reserved economics for a cluster.
 * Throws on invalid input so callers fail fast at the boundary.
 */
export function computeIdleEconomics({ pricePerHour, gpuCount }: IdleInputs): IdleEconomics {
  if (!isFiniteNonNegative(pricePerHour)) {
    throw new RangeError(`pricePerHour must be a finite non-negative number, got ${pricePerHour}`);
  }
  if (!Number.isInteger(gpuCount) || gpuCount < MIN_GPU_COUNT || gpuCount > MAX_GPU_COUNT) {
    throw new RangeError(`gpuCount must be an integer in [${MIN_GPU_COUNT}, ${MAX_GPU_COUNT}], got ${gpuCount}`);
  }

  const hours = RESERVATION_HOURS;
  const hourlyTotal = pricePerHour * gpuCount;
  const reservedCost = hourlyTotal * hours;
  const idleHours = hours * gpuCount * IDLE_SHARE;
  const idleCost = idleHours * pricePerHour;
  const revenue = idleHours * RESALE_RATE_PER_HOUR;
  const profit = revenue - idleCost;

  return { hours, hourlyTotal, reservedCost, idleHours, idleCost, revenue, profit };
}

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** "$67,276,800" */
export const formatUsd = (n: number): string => usdWhole.format(n);
/** "$5.00" */
export const formatUsdCents = (n: number): string => usdCents.format(n);
/** "6,727,680" */
export const formatInteger = (n: number): string => integer.format(n);
/** "+$20,183,040" / "-$1,000" */
export const formatSignedUsd = (n: number): string => (n >= 0 ? `+${usdWhole.format(n)}` : usdWhole.format(n));
