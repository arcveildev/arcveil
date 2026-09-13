# prime-web

Local clone of [primeintellect.ai](https://www.primeintellect.ai) built as a
design/engineering reference. Frontend first; backend comes later.

## Stack
- Next.js 16 (App Router, `src/app`) · React 19 · TypeScript
- Tailwind v4 with design tokens in `src/app/globals.css`
- Theme + font **presets** in `src/theme/` (switch live with the "Presets" widget)
- Mock data in `src/data/` — swap for API calls when the backend lands

## Run
```bash
pnpm install
pnpm dev
```

## Structure
```
src/
  app/                 routes (/, /blog, /blog/[slug], /contact, /case-study/[slug], legal pages)
  components/
    layout/            Header, AnnouncementBar, MobileMenu, Footer, FooterCanvas
    sections/          Hero, PartnersStrip, Lab, EnvironmentHub, Toolkit, Inference, Compute, Research, ...
    figures/           diagrams / interactive widgets (reward chart, GPU list, idle calculator)
    ui/                Button, SectionHeading, FigureLabel, NumberedList, Logo, CodeBlock
    theme/             ThemeProvider (data-theme / data-font), ThemeSwitcher
  data/                site nav, gpus, environments, posts, case studies
  theme/               presets.css (tokens per preset), presets.ts (registry), fonts.ts (next/font)
docs/DESIGN_SYSTEM.md  the reverse-engineered design language + token map
public/backgrounds/    background media generated with Higgsfield (GPT Image 2.5 + Seedance 2.5) and hand-drawn SVGs — see docs/ASSETS.md
public/fonts/          drop licensed fonts here (see README inside)
```

## Presets
- Themes: `prime-dark` (default), `prime-light`, `prime-forest`
- Fonts: `geist` (default), `plex`, `jetbrains`, `custom` (licensed ABC Favorit Mono / OCR X)

See `docs/DESIGN_SYSTEM.md` for the full token map and how to add presets.

## Roadmap
- [x] Frontend: home, blog, contact, case studies, legal pages
- [ ] Backend: `/api/contact`, posts + environments + GPU offers endpoints, auth stub
