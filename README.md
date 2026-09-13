# Blindfold *(codename)*

Agents that can spend, and never see.

Give an agent a **mandate** instead of your keys: it works in relative terms
("reduce exposure to A by 30%"), the enclave holds the real numbers, and every
settled action leaves a **receipt** that proves the mandate was respected —
verifiable by anyone, readable by no one.

Built for Robinhood Chain (Arbitrum L2, chain ID 4663).
The product name is a placeholder; only the codename is fixed.

## Stack
- Next.js 16 (App Router, `src/app`) · React 19 · TypeScript
- Tailwind v4 with design tokens in `src/app/globals.css`
- Theme + font **presets** in `src/theme/` (switch live with the "Presets" widget)
- vitest for unit tests · zod for input validation at the boundaries

## Run
```bash
pnpm install
pnpm dev
```
```bash
pnpm test && pnpm lint && pnpm exec tsc --noEmit
```

## What exists today
| | |
|---|---|
| `/` | Thesis + the three primitives (mandate, blindfold, receipt) |
| `/verify` | **Receipt verifier** — paste a receipt, five checks run in your browser |
| `/contact` | Enquiry form (posts to `/api/contact`, falls back to local) |
| `/privacy-policy` `/terms-of-service` `/security` | Placeholder legal copy |

`pnpm gen:receipts` regenerates the sample receipts served by `/verify`
(a throwaway signing key per run — no private material is committed).

## Structure
```
src/
  app/                 routes
  components/
    layout/            Header, AnnouncementBar, MobileMenu, Footer, FooterCanvas
    home/              Thesis, Pillars
    verify/            ReceiptVerifier, CheckList, StatusPill, ClaimPanels
    ui/                Button, SectionHeading, FigureLabel, NumberedList, Logo, CodeBlock
    theme/             ThemeProvider (data-theme / data-font), ThemeSwitcher
  lib/receipt/         receipt format: canonical hashing, signing, schema, chain reader, verifier
  data/                site identity, home copy, receipt samples + claims
  theme/               presets.css (tokens per preset), presets.ts, fonts.ts
docs/RECEIPT.md        receipt format v1 and the five checks
docs/DESIGN_SYSTEM.md  design language + token map
docs/AGENT_BRIEF.md    conventions for anyone adding a section
```

## Roadmap
- [x] Receipt format v1 + in-browser verifier
- [ ] Home page: ladder, signing pipeline, threat model, worked example, escape hatch, roadmap
- [ ] `/docs` + TypeScript SDK
- [ ] Desktop app (Tauri, sharing these components)
- [ ] Contracts + co-signer/enclave service, RPC chain reader

## History
The repository started as a frontend clone of primeintellect.ai, used as
design raw material. That code is gone from `main` but remains in the history
up to `59e7357`.
