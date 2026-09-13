# Prime clone — conventions for section authors

Stack: Next.js 16 (App Router, `src/app`), React 19, Tailwind v4, TypeScript, lucide-react.
Run `pnpm exec tsc --noEmit` and `pnpm lint` before finishing. Do NOT start the dev server.

## Design tokens (Tailwind v4, defined in src/app/globals.css + src/theme/presets.css)
Never hardcode hex colors. Use these utilities:
- Surfaces: `bg-surface` (#0e0e0e), `bg-surface-raised` (#191919), `bg-surface-card` (#161616), `bg-research-bg` (#071012)
- Borders: `border-border` (#202020 hairline). Radius is 0 everywhere (no rounded-*), except `rounded-md` on the secondary button.
- Text: `text-fg` (white), `text-fg-muted` (50%), `text-fg-subtle` (30%), `text-fg-faint` (20%). Opacity variants like `text-fg/45`, `bg-fg/10`, `border-fg/16` also work.
- Accent green: `text-accent` / `text-available` (#85ed75), `bg-accent`.
- Fonts: `font-sans` (Geist), `font-mono` (Geist Mono), `font-favorit` (label mono — used for ALL uppercase labels, nav, buttons, "FIG.1", tags), `font-ocr` (display).
- Sizes: `text-2xs` (10px), `text-xs`, `text-sm`, `text-h3-title` (20px), `text-7` (28px). Leading: `leading-120`, `leading-122`, `leading-130`, `leading-140`.
- Utilities: `label` (favorit 12px uppercase), `label-2xs`, `hairline`, `scrollbar-none`.
- Animations: `animate-value-flash`, `animate-row-in`, `animate-cursor-blink`.

## Shared components (src/components/ui)
- `<Button href variant="primary|secondary|ghost">` — primary = white bg/black text uppercase with sliding chevron; secondary = glass bordered pill.
- `<SectionHeading title="Lab." tagline="Post-train your own self improving agents" />` — 28px, title white + tagline 50%.
- `<FigureLabel n={1} />` — "FIG.1" caption row.
- `<NumberedList items={[{n:"1.1", text:"..."}]} />`.
- `cn()` from `@/lib/cn`.

## Section wrapper pattern (mirrors the original)
```tsx
<section id="lab" className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5 xl:scroll-mt-[104px]">
  <div className="relative flex h-80 flex-col gap-8 overflow-hidden border-b border-border px-5 py-5">
    {/* optional bg image: <img src="/backgrounds/lab.png" className="absolute inset-0 h-full w-full object-cover mix-blend-screen saturate-[1.58] brightness-[1.28] contrast-[1.16]" /> */}
    <SectionHeading title="Lab." tagline="..." />
    <div className="relative z-10 flex items-center gap-1"><Button .../><Button variant="secondary" .../></div>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2">{/* panels separated by border-b / lg:border-r border-border */}</div>
</section>
```
Panels: `<FigureLabel/>` on top, a diagram area (`h-62.5 md:h-75 lg:h-100.5 relative overflow-hidden`), then `p-4 md:p-5` body with title row (`<span class="opacity-50">01</span> RL Environments` at text-xl / lg:text-h3-title), description `text-fg-muted`, `<NumberedList/>`, and a `<Button>` CTA at bottom (`mt-1 lg:mt-auto`).

Available background assets in /public/backgrounds: lab.png, compute-bg.png, environment-hub-bg.png, fig-7-bg.png, inference-header.png, dedicated-inference.svg, inference-stack.svg, lora-hot-swapping.svg. Diagrams that are not available must be built as inline SVG / CSS (keep them simple, monochrome, hairline style, with the green accent). Use `next/image` only for raster with known sizes; plain `<img>` with eslint-disable comment is fine for decorative backgrounds.

Data lives in src/data (site.ts, gpus.ts, environments.ts, posts.ts, caseStudies.ts). Import from there, never inline copy.

Rules: many small files (<300 lines each), server components by default, `"use client"` only where state is needed, no mutation (spread/new arrays), no `any`. The reference HTML of the original page is at /private/tmp/claude-501/-Users-macbook64-Prime/d79f5670-255d-45e6-ad0b-ba837b2d5e23/scratchpad/home.html — grep it for the exact markup/classes of your section when in doubt.
