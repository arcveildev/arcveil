/**
 * Registry of theme + font presets. The CSS lives in presets.css;
 * this file is the single source of truth for ids, labels and
 * defaults used by the ThemeProvider / ThemeSwitcher.
 */
export const THEME_PRESETS = [
  {
    id: "prime-dark",
    label: "Prime Dark",
    description: "Default. Near-black surface, hairline borders, green accent.",
    swatch: ["#0e0e0e", "#202020", "#85ed75"],
  },
  {
    id: "prime-light",
    label: "Prime Light",
    description: "Warm off-white canvas with the same structure.",
    swatch: ["#f6f6f4", "#d9d9d4", "#1f9d4c"],
  },
  {
    id: "prime-forest",
    label: "Prime Forest",
    description: "Dark, green-tinted surfaces and a brighter accent.",
    swatch: ["#070c0a", "#16241d", "#9dff8c"],
  },
] as const;

export const FONT_PRESETS = [
  {
    id: "geist",
    label: "Geist + DM Mono",
    description: "Closest open stack to the original (Geist / Geist Mono / DM Mono).",
  },
  {
    id: "plex",
    label: "IBM Plex",
    description: "IBM Plex Sans + Plex Mono for labels.",
  },
  {
    id: "jetbrains",
    label: "Geist + JetBrains Mono",
    description: "Geist body with JetBrains Mono labels.",
  },
  {
    id: "custom",
    label: "Licensed (Favorit / OCR X)",
    description: "Uses ABC Favorit Mono + OCR X if the files are in /public/fonts.",
  },
] as const;

export type ThemeId = (typeof THEME_PRESETS)[number]["id"];
export type FontId = (typeof FONT_PRESETS)[number]["id"];

export const DEFAULT_THEME: ThemeId = "prime-dark";
export const DEFAULT_FONT: FontId = "geist";

export const THEME_STORAGE_KEY = "prime.theme";
export const FONT_STORAGE_KEY = "prime.font";

export const isThemeId = (value: unknown): value is ThemeId =>
  THEME_PRESETS.some((preset) => preset.id === value);

export const isFontId = (value: unknown): value is FontId =>
  FONT_PRESETS.some((preset) => preset.id === value);
