const APPLE_EPOCH_MS = Date.UTC(2001, 0, 1);

// Past this, a timestamp cannot be seconds: it would be thousands of years out.
const NANOSECOND_FLOOR = 1_000_000_000_000n;

/**
 * Messages stores time since 2001-01-01 UTC: nanoseconds today, seconds in
 * databases from before High Sierra. Both still turn up.
 */
export function fromAppleTime(value: number | bigint): Date {
  const raw = BigInt(value);
  const ms = raw >= NANOSECOND_FLOOR ? raw / 1_000_000n : raw * 1_000n;
  return new Date(APPLE_EPOCH_MS + Number(ms));
}
