const GLYPHS = "01$>_#*+-=/\\|:.;{}[]<>~^%&@ ";
const ROWS = 14;
const COLS = 64;

/** Deterministic pseudo-random so server and client render the same grid. */
const seeded = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const buildRows = (): readonly string[] =>
  Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const v = seeded(r * COLS + c);
      return v < 0.55 ? " " : GLYPHS[Math.floor(seeded(v * 1000 + r) * GLYPHS.length)];
    }).join(""),
  );

const SPLASH_ROWS = buildRows();

/** CSS-only "terminal splash" background: faint mono glyph grid + radial green glow. */
export function ResearchSplash() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,var(--accent-soft)_0%,transparent_55%)] opacity-60" />
      <pre className="absolute -top-2 left-3 select-none font-mono text-[11px] leading-[1.35] text-accent/14 md:text-xs">
        {SPLASH_ROWS.map((row, i) => (
          <span key={i} className="block whitespace-pre">
            {row}
          </span>
        ))}
      </pre>
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-research-bg via-research-bg/85 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-research-bg/70 to-transparent" />
    </div>
  );
}
