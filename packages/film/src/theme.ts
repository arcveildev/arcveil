import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDmMono } from "@remotion/google-fonts/DMMono";

const manrope = loadManrope();
const dmMono = loadDmMono();

/**
 * The film's palette is the banners' palette, not the reference film's. Theirs
 * accents in yellow on cream; ours is navy on warm white with the brand mint,
 * and mint only ever marks something the chain or the code actually says.
 */
export const COLOR = {
  ground: "#f6f4f0",
  ink: "#1b3158",
  ink2: "#46587c",
  mute: "#8492ab",
  /** Mint is unreadable as type on white; this is its legible sibling. */
  accent: "#1f9d4c",
  mint: "#85ed75",
  amber: "#b6761f",
  hair: "rgba(27,49,88,.10)",
  card: "#ffffff",
} as const;

export const FONT = {
  sans: manrope.fontFamily,
  mono: dmMono.fontFamily,
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const seconds = (s: number) => Math.round(s * FPS);

/** Every beat's start and length, in seconds. The storyboard's table, as code. */
export const BEATS = [
  { id: "opener", at: 0, for: 3 },
  { id: "receipt", at: 3, for: 4 },
  { id: "redact", at: 7, for: 4 },
  { id: "checks", at: 11, for: 5 },
  { id: "unknown", at: 16, for: 4 },
  { id: "chain", at: 20, for: 5 },
  { id: "terminal", at: 25, for: 5 },
  { id: "honest", at: 30, for: 4 },
  { id: "closer", at: 34, for: 4 },
] as const;

export const TOTAL_FRAMES = seconds(
  BEATS.reduce((end, beat) => Math.max(end, beat.at + beat.for), 0),
);
