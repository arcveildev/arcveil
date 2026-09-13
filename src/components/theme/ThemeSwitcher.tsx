"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { FONT_PRESETS, THEME_PRESETS } from "@/theme/presets";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/cn";

/**
 * Floating dev widget to preview theme + font presets.
 * Remove from the layout (or gate behind an env flag) for production.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, font, setTheme, setFont } = useTheme();

  return (
    <div className="fixed right-4 bottom-4 z-[200] flex flex-col items-end gap-2">
      {open && (
        <div className="w-72 border border-border bg-surface-raised p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="label text-fg-muted">Design presets</span>
            <button
              type="button"
              aria-label="Close presets"
              onClick={() => setOpen(false)}
              className="text-fg-muted hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="label-2xs mb-1.5 text-fg-subtle">Theme</p>
          <div className="mb-3 flex flex-col gap-1">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(preset.id)}
                className={cn(
                  "flex items-center gap-2 border px-2 py-1.5 text-left text-xs transition-colors",
                  theme === preset.id
                    ? "border-fg bg-fg text-on-primary"
                    : "border-border text-fg-muted hover:text-fg",
                )}
              >
                <span className="flex gap-0.5">
                  {preset.swatch.map((color) => (
                    <span key={color} className="size-3 border border-black/20" style={{ background: color }} />
                  ))}
                </span>
                <span className="font-favorit uppercase">{preset.label}</span>
              </button>
            ))}
          </div>

          <p className="label-2xs mb-1.5 text-fg-subtle">Fonts</p>
          <div className="flex flex-col gap-1">
            {FONT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setFont(preset.id)}
                className={cn(
                  "border px-2 py-1.5 text-left text-xs transition-colors",
                  font === preset.id
                    ? "border-fg bg-fg text-on-primary"
                    : "border-border text-fg-muted hover:text-fg",
                )}
              >
                <span className="font-favorit uppercase">{preset.label}</span>
                <span className="mt-0.5 block text-2xs opacity-70">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="Toggle design presets"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 border border-border bg-surface-raised px-3 font-favorit text-xs uppercase text-fg-muted transition-colors hover:text-fg"
      >
        <Palette className="size-3.5" />
        Presets
      </button>
    </div>
  );
}
