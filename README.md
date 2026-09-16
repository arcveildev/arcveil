# Arcveil

Agents that can spend, and never see. → **live at [arcveil.dev](https://arcveil.dev)**

Give an agent a **mandate** instead of your keys: it works in relative terms
("reduce exposure to A by 30%"), the enclave holds the real numbers, and every
settled action leaves a **receipt** that proves the mandate was respected —
verifiable by anyone, readable by no one.

Built for [Arc](https://docs.arc.io) — Circle's EVM layer 1 for stablecoin
finance, where USDC is the gas token. Mainnet is chain ID 5042 (public since
16 September 2026), testnet 5042002. Nothing of ours is deployed to either yet:
the receipt format and its verifier are what exist today, and they run entirely
in the browser.

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

## Deploy
The site is a static export served by Cloudflare Workers (no Worker script —
every route is prerendered and the verifier talks to Arc from the browser).

```bash
pnpm deploy       # next build && wrangler deploy
pnpm deploy:dry   # package without publishing
```

`arcveil.dev` and `www.arcveil.dev` are declared as custom domains in
`wrangler.jsonc`; the canonical tag points at the apex.
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
  data/                site identity, home copy, receipt samples + claims
  theme/               presets.css (tokens per preset), presets.ts, fonts.ts
docs/RECEIPT.md        receipt format v1 and the five checks
docs/DESIGN_SYSTEM.md  design language + token map
docs/AGENT_BRIEF.md    conventions for anyone adding a section
packages/sdk/          @arcveil/sdk — the receipt format, issuer and verifier
contracts/             Foundry project: MandateRegistry, AnchorRegistry
```

## Roadmap
- [x] Receipt format v1 + in-browser verifier
- [x] Live reads of Arc mainnet from the browser
- [ ] Home page: ladder, signing pipeline, threat model, worked example, escape hatch, roadmap
- [x] TypeScript SDK (`packages/sdk`) — the site is its first consumer
- [ ] `/docs`
- [ ] Desktop app (Tauri, sharing these components)
- [x] Registries deployed to Arc mainnet, and the verifier reads them live
- [ ] Co-signer / enclave service

## History
The repository started as a frontend clone of primeintellect.ai, used as design
raw material (gone from `main`, still in the history up to `59e7357`), then ran
under the codename BLINDFOLD while the product was shaped. It became Arcveil,
aimed at Arc, on 16 September 2026.
