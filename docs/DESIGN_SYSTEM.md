# Design system — Prime clone

Reverse-engineered from primeintellect.ai (Sept 2026). Everything is a preset:
switch theme with `data-theme` and fonts with `data-font` on `<html>`
(the floating **Presets** widget bottom-right does this and persists to localStorage;
`?theme=prime-light&font=plex` in the URL also selects a preset; the pre-paint logic lives in `public/preset-boot.js`).

## Visual language
- **Near-black canvas** `#0e0e0e`, raised surfaces `#191919`, cards `#161616`.
- **Hairline grid**: every section is a `1px #202020` bordered box; panels inside are separated by `border-b` / `lg:border-r`, never by gaps. Zero border radius.
- **Type**: Geist for body/headings (28px section titles, 20px sub-titles), a monospace *label* face for anything uppercase (nav, buttons, "FIG.1", tags, footer links) — the original uses the commercial **ABC Favorit Mono**; the default preset substitutes **DM Mono**. Decorative display face "OCR X" → **Share Tech Mono**.
- **Text hierarchy by opacity**, not color: white, 50%, 30%, 25%, 20%.
- **Accent**: one green `#85ed75` (chart-1 / "available"), used for status, glows and text-shadows only.
- **Buttons**: primary = white block, black uppercase 12px label, sliding double chevron on hover. Secondary = glass pill (`bg-white/10`, `border-white/16`, backdrop blur, `rounded-md` — the only rounded element).
- **Imagery**: photographic backgrounds pushed through `mix-blend-screen` + `saturate(1.58) brightness(1.28) contrast(1.16)` so they read as monochrome-ish film.

## Token map (globals.css → presets.css)
| Tailwind utility | CSS var | prime-dark |
|---|---|---|
| `bg-surface` | `--surface` | #0e0e0e |
| `bg-surface-raised` | `--surface-raised` | #191919 |
| `bg-surface-card` | `--surface-card` | #161616 |
| `bg-research-bg` | `--research-bg` | #071012 |
| `border-border` | `--line` | #202020 |
| `text-fg` / `-muted` / `-subtle` / `-faint` | `--fg*` | #fff / 50% / 30% / 20% |
| `bg-primary` + `text-on-primary` | `--primary` / `--on-primary` | #fff / #000 |
| `text-accent`, `text-available` | `--accent` | #85ed75 |
| `font-sans` / `font-mono` / `font-favorit` / `font-ocr` | `--font-preset-*` | Geist / Geist Mono / DM Mono / Share Tech Mono |

Type scale extras: `text-2xs` 10px · `text-h3-title` 20px · `text-7` 28px · `text-hero` 36px · `text-hero-lg` 44px.
Leading helpers: `leading-120/122/130/140`.

## Presets
Themes: `prime-dark` (default), `prime-light`, `prime-forest`.
Fonts: `geist` (default), `plex`, `jetbrains`, `custom`.

Add a preset: append a `[data-theme="..."]` block in `src/theme/presets.css` and register it in `src/theme/presets.ts`. Components never reference raw colors, so a new preset restyles the whole site.

## Licensed fonts
Drop `ABCFavoritMono-{Regular,Medium,Bold}.woff2` and `OCRX.woff2` into `public/fonts/`, uncomment the `@font-face` block at the bottom of `src/theme/presets.css`, and choose the **Licensed** font preset.

## Logo
The mark is a parabolic arch cut by a band of light: the arch is the geometry
Arc itself uses — a shape nobody owns — and the band is what makes it Arcveil.
It lives in `src/components/ui/Logo.tsx` as `<LogoMark>`, drawn as a separate
crown and legs rather than a masked shape, so the gap is geometry: no mask ids
to collide when the logo appears more than once on a page, and it renders
correctly on any background. The band uses `var(--accent)`, so it follows the
theme preset; everything else is `currentColor`.

`src/app/icon.svg` is the same mark on a `#0e0e0e` plate (a transparent white
mark disappears on a light browser tab).

Chosen 2026-09-16 from four candidates. The rejected three — a base unravelling
into hairlines, a seam parting the arch, a closed eye beneath it — were all
legible at display size and illegible at 24px, which is where a logo actually
lives. They are in the history at commit 471b93f if one is ever worth revisiting.

