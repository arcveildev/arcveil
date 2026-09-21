import { SNARK_SCALAR_FIELD } from "@arcveil/bridge";

/** Formatting and parsing for /bridge. USDC is six decimals everywhere here. */

export const USDC_DECIMALS = 6;

/** Parses what a person typed. Returns null rather than a silent zero. */
export const parseUsdc = (input: string): bigint | null => {
  const trimmed = input.trim();
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") return null;

  const [whole = "0", fraction = ""] = trimmed.split(".");
  if (fraction.length > USDC_DECIMALS) return null;

  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(fraction.padEnd(USDC_DECIMALS, "0") || "0");
};

export const formatUsdc = (amount: bigint): string => {
  const whole = amount / 10n ** BigInt(USDC_DECIMALS);
  const fraction = (amount % 10n ** BigInt(USDC_DECIMALS)).toString().padStart(USDC_DECIMALS, "0");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed === "" ? whole.toString() : `${whole}.${trimmed}`;
};

/** Field elements are 77 digits. Nobody reads that; everybody wants to compare it. */
export const shortField = (value: bigint): string => {
  const hex = value.toString(16).padStart(64, "0");
  return `0x${hex.slice(0, 8)}…${hex.slice(-6)}`;
};

export const shortAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const isFieldElement = (value: bigint): boolean => value > 0n && value < SNARK_SCALAR_FIELD;
