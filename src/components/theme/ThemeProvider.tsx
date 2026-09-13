"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_FONT,
  DEFAULT_THEME,
  FONT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isFontId,
  isThemeId,
  type FontId,
  type ThemeId,
} from "@/theme/presets";

type ThemeContextValue = {
  theme: ThemeId;
  font: FontId;
  setTheme: (theme: ThemeId) => void;
  setFont: (font: FontId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStored = <T,>(key: string, guard: (v: unknown) => v is T, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return guard(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [font, setFontState] = useState<FontId>(DEFAULT_FONT);

  // Sync React state with the value the pre-hydration script (layout.tsx)
  // already applied from localStorage. Server renders the defaults, so this
  // must run after mount; the setState here is intentional.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(readStored(THEME_STORAGE_KEY, isThemeId, DEFAULT_THEME));
    setFontState(readStored(FONT_STORAGE_KEY, isFontId, DEFAULT_FONT));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.font = font;
  }, [font]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    writeStored(THEME_STORAGE_KEY, next);
  }, []);

  const setFont = useCallback((next: FontId) => {
    setFontState(next);
    writeStored(FONT_STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, font, setTheme, setFont }), [theme, font, setTheme, setFont]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};
