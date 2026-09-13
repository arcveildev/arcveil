# Conventions for section authors

Stack: Next.js 16 (App Router, `src/app`), React 19, Tailwind v4, TypeScript, lucide-react.
Run `pnpm test`, `pnpm exec tsc --noEmit` and `pnpm lint` before finishing.

## Design tokens (Tailwind v4, defined in src/app/globals.css + src/theme/presets.css)
Never hardcode hex colors. Use these utilities:
- Surfaces: `bg-surface` (#0e0e0e), `bg-surface-raised` (#191919), `bg-surface-card` (#161616)
- Borders: `border-border` (#202020 hairline). Radius is 0 everywhere, except `rounded-md` on the secondary button.
- Text: `text-fg` (white), `text-fg-muted` (50%), `text-fg-subtle` (30%), `text-fg-faint` (20%). Opacity variants like `text-fg/45`, `bg-fg/10`, `border-fg/16` also work.
- Accent green: `text-accent` / `text-available` (#85ed75), `bg-accent`.
- Status: `chart-1` pass, `chart-2` unknown, `chart-5` fail — the same three the verifier uses.
- Fonts: `font-sans` (Geist), `font-mono` (Geist Mono), `font-favorit` (label mono — ALL uppercase labels, nav, buttons, "FIG.1", tags), `font-ocr` (display).
- Sizes: `text-2xs` (10px), `text-xs`, `text-sm`, `text-h3-title` (20px), `text-7` (28px). Leading: `leading-120`, `leading-122`, `leading-130`, `leading-140`.
- Utilities: `label` (favorit 12px uppercase), `label-2xs`, `hairline`, `scrollbar-none`.

## Shared components (src/components/ui)
- `<Button href variant="primary|secondary|ghost">` — primary = white bg/black text uppercase with sliding chevron; secondary = glass bordered pill.
- `<SectionHeading title="Verify." tagline="Check what an agent did" />` — 28px, title white + tagline 50%.
- `<FigureLabel n={1} />` — "FIG.1" caption row.
- `<NumberedList items={[{n:"1.1", text:"..."}]} />`.
- `cn()` from `@/lib/cn`.

## Section wrapper pattern
```tsx
<section id="pipeline" className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5">
  <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
    <span className="label text-fg-muted">Architecture</span>
    <SectionHeading title="Pipeline." tagline="..." />
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2">{/* panels separated by border-b / lg:border-r border-border */}</div>
</section>
```
Panels: `<FigureLabel/>` on top, a diagram area (`h-62.5 md:h-75 lg:h-100.5 relative overflow-hidden`), then `p-4 md:p-5` body with a title row (`<span class="opacity-50">01</span> Mandate` at text-xl / lg:text-h3-title), description in `text-fg-muted`, and a `<Button>` CTA at the bottom (`mt-1 lg:mt-auto`).

Diagrams are inline SVG / CSS: monochrome, hairline, green accent only where it carries meaning. Raster backgrounds in `/public/backgrounds` are left over from the previous project — regenerate rather than reuse (see docs/ASSETS.md).

## Copy rules
This product sells verifiability, so the writing must not outrun what ships.
Name the adversary, state what is *not* proven, and label anything unbuilt as
what it is. See docs/RECEIPT.md for the vocabulary (mandate, blindfold, receipt,
counter chain, escape hatch).

## Code rules
Data lives in `src/data`, never inlined in a component. Many small files (<300 lines),
server components by default, `"use client"` only where state is needed, no mutation
(spread/new arrays), no `any`, validate untrusted input with zod at the boundary,
and unit-test anything in `src/lib` (vitest, `*.test.ts` next to the module).
