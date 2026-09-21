# Social assets

- `x-header.png` — X/Twitter profile header, 1500×500. Chosen 2026-09-16 from six
  Higgsfield candidates: the dark-glass arch split by a dawn horizon, in the same
  navy-to-sand dusk tone as @arc's own header, so the profile reads as "built on Arc".
- `x-header@2x.png` — 3000×1000 master of the same file.
- `x-header-source.png` — the raw Higgsfield render (Nano Banana 2, 21:9, 2K) before
  crop and lockup. Regenerate the header from it by re-running the compose script
  (crop to 3:1 with the horizon at 50% height, lockup at 7.5% / 20%, DM Mono).
- `x-avatar.png` — 400×400 Band mark on the header's sky gradient, so avatar and header
  match on the profile page.

The lockup is the real `<LogoMark>` geometry from `src/components/ui/Logo.tsx`
and the wordmark in DM Mono Medium, not AI-rendered text. The tagline is
"Agents that can spend, never see, never exceed."

## Post banners (`banners/`)

`$ARCVEIL / DEV BURNT`, 1920×1080, 2026-09-17. Three Higgsfield plates
(GPT Image 2.5, high, 2k, no text in the prompt) with the type composited by
`banners/compose_burn.py`: real Band mark, DM Mono, brand colours only (navy,
mint, white; the first round's gold headline was dropped on 2026-09-17).

| File | World | Compose flags | Higgsfield job |
|---|---|---|---|
| `burn-a-meadow.png` | The Arch in the film's meadow, coins on its palm turning to sparks | `light top=0.13 scrim=150` | `e5e5d6ca-f7b3-46aa-8161-7c9cd971baea` |
| `burn-b-dusk.png` | X-header dusk plain, coin stack dissolving into an ember column under the glass arch | `dark top=0.11 sub_top=0.585` (type split around the horizon line) | `24188b6f-d375-4a9e-974f-b57ed216ee06` |
| `burn-c-receipt.png` | Receipt card burning into mint light on the dot-matrix black | `dark` | `6ac9457f-542f-4498-8dd9-19afd8e60a88` |

Round 2, developed from A (the user's pick), same compose script:

| File | Idea | Compose flags | Higgsfield job |
|---|---|---|---|
| `burn-a1-raised.png` | Coins held high with both hands, tall plume into the clouds | `light top=0.13 scrim=150` | `9ce44e97-fdff-4d8f-b1fd-e49bc0e76714` |
| `burn-a2-pile.png` | Coin pile burning on the path in the foreground, The Arch watching behind | `light top=0.13 scrim=150` | `35f2fc15-717d-4db6-8023-68d9a77a0ed8` |
| `burn-a3-dusk.png` | Same scene at golden hour, Band glowing; sub lines pushed below the horizon | `dark top=0.11 sub_top=0.665 scrim=120` | `64d2273e-8d78-4329-926d-38b393146b53` |

Round 3, type styles on plate A (the background the user kept), `style=`:

| File | Style | Compose flags |
|---|---|---|
| `burn-a-s1-stack.png` | `stack`: ticker and headline stacked, all navy, mint rule | `light style=stack top=0.13 scrim=150` |
| `burn-a-s2-outline.png` | `outline`: ticker solid, DEV BURNT as a hollow navy outline | `light style=outline top=0.13 scrim=150` |
| `burn-a-s3-receipt.png` | `receipt`: frosted card, mint DEV BURNT label, ticker, ledger rows (allocation / status / proof), lockup under the card | `light style=receipt top=0.12 scrim=60` |

**Chosen (2026-09-17): `burn-final-dusk-receipt.png`** — `receipt` style on the
A3 dusk plate, navy card with white type (`dark style=receipt top=0.12 scrim=60`).
`burn-final-dusk-receipt-lightcard.png` is the same with the frosted white card
(`light style=receipt top=0.12`). In the receipt style the lockup sits low-left
instead of under the card, so it clears the horizon glow.

DEX PAID (2026-09-17), same card, `preset=dex` (headline label, ledger rows
DEX Screener / Profile / Chain):

| File | Plate | Compose flags | Higgsfield job |
|---|---|---|---|
| `dex-final-dusk-receipt.png` (chosen series match) | The Arch at dusk holding up a glowing receipt card | `dark style=receipt preset=dex top=0.12 scrim=60` | `d11dedde-0951-4301-8121-cc3a8336986b` |
| `dex-day-receipt.png` | Same at morning | `light style=receipt preset=dex top=0.12 scrim=60` | `a9258325-e124-4871-9ee2-9666b5ff8093` |

Sub lines are placeholders until the burn happens: swap `SUB`/`SUB2` in
`compose_burn.py` for the real amount and tx, then re-run. Plates are kept as
`plate-*.png` so the type can be redone without re-prompting.

### Post copy for the banners (2026-09-17)

Same pattern as the launch QT: short declarative lines, no hashtags, no emoji.
Square brackets are placeholders to fill from the burn tx before posting.

Dev burnt, main:

> Dev allocation: burnt.
> [100%] of the team's $ARCVEIL, gone for good.
>
> No dev bags. No unlocks. Nothing to dump.
>
> Tx on Arc: [hash]
> The first privacy layer for agents, built on @arc.

Dev burnt, shorter:

> $ARCVEIL dev allocation is burnt. All of it.
>
> Proof is on Arc: [hash]
> Agents that can spend, never see, never exceed.

DEX paid:

> DEX paid. Profile live.
>
> $ARCVEIL on DEX Screener: [link]
> Built on @arc.

## Launch film (`video/launch/`)

"Arcveil, live on Arc": a 38 s product-launch explainer in the grammar of the
Arcus mainnet clip (white studio, soft glass objects, type that types in word
by word, a self-checking ledger, an end card), built entirely on Higgsfield.
Source of truth: `video/launch/storyboard.md`; style frames in
`video/launch/styles/` (job ids in the storyboard); review page
https://claude.ai/artifact/8P6EkYdkZWuy4U1x5Kefws. Plates are always
text-free; every word is set in Higgsedit (Manrope + DM Mono).

## SDK banner (`banners/sdk-banner.html` → `sdk-banner.png`)

Developer banner in the @arcusdotnet pattern (2026-09-17): eyebrow with the
mark, headline, three numbered steps, install pill on the left; a code window
on the right with real `@arcveildev/sdk` calls (publish a mandate, issue a
receipt, verify) and an "Arc Mainnet · 5042" badge. No Higgsfield: it is HTML,
Geist + DM Mono, rendered with headless Chrome at 2× (3000×1200 from a
1500×600 layout). Re-render after editing the HTML:

```bash
cd docs/social/banners && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --window-size=1500,600 \
  --force-device-scale-factor=2 --virtual-time-budget=6000 \
  --screenshot=sdk-banner.png "file://$PWD/sdk-banner.html"
```

Keep the code honest: every identifier in the window exists in
`packages/sdk/README.md`. Update the window when the API changes.

Post copy (Arcus pattern: what the primitive is, what we bring to Arc, what it
lets agents do, the call to action, the link):

> Agents on Arc can move money from day one. The question is what they can see.
>
> Arcveil brings mandates and receipts to @arc: an agent gets a spending
> mandate instead of your keys, and every action leaves a receipt that proves
> it stayed in bounds without revealing amounts or balances.
>
> Publish a mandate, issue receipts, verify against Arc mainnet. A few lines
> with @arcveildev/sdk.
>
> arcveil.dev

### SDK banner, three variants (2026-09-17)

Same topic as `sdk-banner.html` (the Arcus-pattern one, kept as reference) but
with our own forms: a Higgsfield plate in one of the three Arcveil worlds under
HTML type and a code surface. Same render command, swap the HTML file.

| File | World / plate | Form | Higgsfield job |
|---|---|---|---|
| `sdk-v1-meadow.html` → `.png` | Meadow, The Arch (eyes open) looking up at the sky, `plate-dev-meadow.png` | Frosted glass code card floating in the sky, tilted; steps as chips; navy install pill | `b2702cc4-04dc-4196-b6e0-064ff7c61dbd` |
| `sdk-v2-dusk.html` → `.png` | X-header dusk plain, `../x-header-source.png` | Dark glass code slab standing on the plain with a CSS reflection; step rail with mint nodes above the horizon; `$ pnpm add` line | none (reuses the header render) |
| `sdk-v3-black.html` → `.png` | Dot-matrix black with three receipt cards, `plate-dev-black.png` | No window at all: a CLI transcript (publish → issue → verify, `pass 5/5`); steps as a hairline-divided row | `3ca42f76-19b6-4bbb-80b6-6880567f9cba` |

The CLI in V3 is illustrative: `arcveil mandate publish` / `receipt issue` /
`verify` do not exist as commands yet. Ship V3 only once a CLI does, or swap
the transcript for the SDK calls.

**Chosen: V1 (`sdk-v1-meadow.png`).** Post copy, paired with its headline:

> Verify what an agent did on Arc. Never what it saw.
>
> @arcveildev/sdk gives an agent a spending mandate instead of your keys. Every
> action leaves a receipt that proves it stayed in bounds, with no amounts and
> no balances inside.
>
> Publish a mandate, issue receipts, verify against Arc mainnet. Five checks,
> a few lines, in Node or a browser.
>
> pnpm add @arcveildev/sdk
> arcveil.dev

Shorter alt:

> An agent that can spend is an agent that can see. Not on Arc.
>
> @arcveildev/sdk: a mandate instead of your keys, a receipt for every action,
> verified against Arc mainnet in a few lines.
>
> arcveil.dev

## Pipeline post (2026-09-17)

About the Architecture section on `/`: six steps, `PIPELINE_TAGLINE` as the
payoff line. Copy rule from `src/data/pipeline.ts` carried into the thread:
steps 1, 2 and 4 are designed, not shipped, and the closer says so.

Single post:

> The agent asks to reduce exposure to A by 30%. It never says how much, because
> it was never told.
>
> The enclave resolves that ratio against balances the agent cannot see. Two
> signatures settle it on Arc.
>
> Six steps, and the agent never sees a number.
> arcveil.dev

Thread, one step per post, artifact line in mono at the end of each:

1. An agent that can spend is an agent that can see: every balance, every
   position. / Unless the pipeline is built so it cannot. / Six steps, and the
   agent never sees a number.
2. 01 · Intent — The agent proposes in relative terms: reduce exposure to A by
   30%. / It never states an amount, because it was never told one. /
   `intent{ asset, ratio }`
3. 02 · Redact — The enclave resolves that ratio against balances the agent
   cannot see and builds the unsigned operation. / The numbers exist. They just
   never reach the agent. / `userOp (unsigned)`
4. 03 · Client sign — Your device decrypts its shard from the OS keystore and
   signs the operation hash. / Shard A stays on your device. / `sigA (65 bytes)`
5. 04 · Mandate check — The policy co-signer evaluates every clause: allowlist,
   per-action cap, window spend, active hours, kill switch. / Only then does the
   second signature exist. / `sigB (65 bytes)`
6. 05 · Settle — The two signatures combine into a 130-byte threshold payload.
   The account contract validates the quorum and executes. / Neither half moves
   anything alone. / `sigA ‖ sigB (130 B)`
7. 06 · Receipt — The body is hashed, the policy signer attests it, and the
   budget commitment advances. / A dropped receipt is not invisible. It shows up
   later as a gap. / `receipt v1 (~1 KB)`
8. Where this stands: the receipt format is shipped and the verifier reads Arc
   mainnet from your browser. Steps 1, 2 and 4 are designed, not deployed. / We
   would rather publish the architecture than imply it is finished. / arcveil.dev

Never post the thread without post 8, or the present-tense steps read as shipped.

### Pipeline banner (`banners/pipeline-banner.html` → `.png`)

V1 form reused for the Architecture section: the meadow plate
(`plate-dev-meadow.png`), the floating frosted card carrying the six pipeline
rows instead of code. Each row is ordinal, title, where it runs, artifact —
the same four fields as `PIPELINE_STEPS`. Row 06 is tinted mint with an accent
edge because it is the only shipped step, and the note at lower left states
that in words rather than leaving the card to imply everything runs. Same
render command as the SDK banners, 1500×600 layout at 2× → 3000×1200.

## Five tech posts and their banners (2026-09-17)

Copy: `posts-tech.md` — one post per piece of the system, in the same voice as
the launch and pipeline posts (short declarative lines, no hashtags, no emoji,
and a status line wherever a claim describes the design rather than the build).

Banners are the V1 form again — a text-free Higgsfield plate under HTML type
and a frosted card — but they share one stylesheet, `banners/tech-banner.css`,
so the five read as a series. Each HTML file sets only its own plate, framing,
headline, card grid and note. 1500×600 layout rendered at 2× → 3000×1200:

```bash
cd docs/social/banners && for f in tech-checks tech-counter tech-mandate tech-vision tech-escape; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --hide-scrollbars --window-size=1500,600 --force-device-scale-factor=2 \
    --virtual-time-budget=8000 --screenshot="$f.png" "file://$PWD/$f.html"
done
```

| File | Post | What the card carries | Plate | Higgsfield job |
|---|---|---|---|---|
| `tech-checks.png` | The five checks | Each check, where it reads from, and its verdicts — `unknown` in amber | The Arch holding five glass tiles, one amber and out of line | `383a28c6-ca71-4f12-93ef-89db1e3f496a` |
| `tech-counter.png` | The counter chain | Four actions, `counter.prev → counter.next`, row 03 withheld so row 04 no longer joins | A chain of blank cards into the sky with one link missing | `7b96991d-fd63-4b25-ab41-9ffeee36b211` |
| `tech-mandate.png` | The mandate registry | Split card: the terms that stay with you against the commitment, epoch and status that reach Arc | The Arch, blind, lowering a mint pebble into a pedestal beside a sealed envelope | `d0b5dfe9-e352-4a3b-ba79-943559b79789` |
| `tech-vision.png` | What each party sees | `THREAT_ROWS` verbatim, your row accented | The Arch, blind, a hand on a frosted pane with unreadable shapes behind it | `423d3bd8-06bf-44a4-bcfa-56aecef9b6e0` |
| `tech-escape.png` | If we disappear | The three `ESCAPE_HATCH` points and the caveat, the honest cost included | Three posts, two lit and bridged, the third dark | `ac5b1694-947c-4f27-9464-682e1c81af0c` |

All five: GPT Image 2.5, high, 2k, 16:9, character sheets passed as
`image_references`, and "no text anywhere" in every prompt — every word on the
banner is HTML. Plates are kept as `plate-tech-*.png` so the type can be redone
without re-prompting; `contact-sheet-tech.jpg` is the plates, and
`contact-sheet-tech-banners.jpg` the finished five.

Framing note: these plates put the character higher in the frame than the SDK
and pipeline plates did, so each file sets its own `background-position` to
drop the character below the card rather than behind it. Re-pan there, not in
the plate, if a card ever grows.

Card contents are quoted from `docs/RECEIPT.md`, `src/data/threatModel.ts` and
`src/data/escapeHatch.ts`. If those change, the banners are wrong — re-render
rather than leaving them.

## Dark banners (`dark-*.html`, 2026-09-21)

A second banner series, 1920×1080 at 2x, sharing `dark-banner.css`. It drops
the Higgsfield plates entirely and uses the product's own surface instead:
`#0e0e0e`, the one green `#85ed75`, hairline borders, and type doing the work.
Every mark is CSS or inline SVG, so a wrong number is a one-line fix rather
than a re-render — which matters for banners that carry addresses.

Rendered the same way as the `tech-*` series, at a different size:

```bash
cd docs/social/banners && for v in 1 2 3; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --hide-scrollbars --window-size=1920,1080 --force-device-scale-factor=2 \
    --virtual-time-budget=8000 --screenshot="dark-precompile-v$v.png" \
    "file://$PWD/dark-precompile-v$v.html"
done
```

Three versions of post 01 in `posts-bridge.md`, three different hooks on one
finding:

| File | Hook | Plate | Higgsfield job |
|---|---|---|---|
| `dark-precompile-v1.png` | Arc's USDC is a view, not a ledger | Three slabs in perspective; the near one glass, lit green from within, the two behind it matte and unlit | `611f3c3e-cc26-4b17-a793-08870c3dbb48` |
| `dark-precompile-v2.png` | Mix the decimals and you are out by a million | A watch-part disc in sharp focus dwarfed by an enormous unlit one | `5b77fc14-29b6-4e8b-94e0-674893cc5804` |
| `dark-precompile-v3.png` | Two precompiles. No bytecode. | A sealed matte cube, no seams, one amber corner | `57257830-fbfe-433c-9b89-f5a3412e271f` |

All three: `gpt_image_2_5`, 16:9, and every prompt ends "no text anywhere, no
letters, no numbers, no symbols, no logos" — every word on the banner is HTML,
as in the `tech-*` series. Plates are kept as `plate-dark-v*.png` so the type
can be redone without re-prompting.

**The composition is in the prompt, not the crop.** Each one asks for the
subject in the right third and "the left two thirds pure empty black negative
space", which is what the reference banner does and what leaves room for type
without a scrim doing the work.

Conventions this series keeps:

- **One lit thing.** The green is the only light in the frame, and in every
  version it marks what *can* be read. Amber is opacity, never failure.
- **The evidence line is the footer.** Bottom-right carries where and when the
  claim was traced, in place of a slogan.
- **The empty middle-left is deliberate**, and comes from the reference: the
  headline sits top-left, the lockup bottom-left, and nothing fills the space
  between them.
- **The canvas is `#000`, not the site's `#0e0e0e`.** The plates render on pure
  black, and any other value leaves a visible vertical seam where the scrim
  meets the image. Matching the render wins; this is the one place on the
  project where the surface token is not the site's.
- **Addresses live in the type column**, never over the render. The image
  carries the mood; a contract address has to be readable.

## The precompile banner (2026-09-21)

`banners/tech-precompile.png`, for post 01 in `posts-bridge.md`. Seventh file
in the `tech-*` series, same `tech-banner.css` and the same headless-Chrome
line with the name swapped.

| File | Post | What the card carries | Plate |
|---|---|---|---|
| `tech-precompile.png` | Arc's USDC is a view, not a ledger | The three addresses a USDC transfer on Arc touches, what each one is, and whether it can be read at all | **Reused** `plate-tech-vision.png` |

**The plate is reused, deliberately and with a cost.** It is the Arch with a
hand on a frosted pane and unreadable shapes behind it — which is the argument
of this post rather than decoration, since the finding is two precompiles
nobody outside Arc can read. The cost is that `tech-vision.png` uses the same
background, so the two should not go out near each other. Generate a bespoke
plate if they need to.

One departure from the series' meaning, not its look: amber rows here are
`.r.gap` for the colour but **not** the italic. In the first five, italic marked
a row that does not exist (`free text` on the injection banner). These two rows
exist; they are simply opaque, and italic would say the wrong thing.

Card contents are from the trace in `contracts/test/` and the correction in
`src/data/bridge.ts` — the `isBlocklisted` call was observed on the mint path
and *not* on a plain transfer. Do not broaden that line without re-tracing.

## The semantic gate banner (2026-09-20)

`banners/tech-injection.png`, for post 02 in `posts-gate.md` — the one that
leads on Jev's output channel. Sixth file in the `tech-*` series and rendered
the same way (same `tech-banner.css`, same headless-Chrome line, swap the name):

```bash
cd docs/social/banners && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --window-size=1500,600 \
  --force-device-scale-factor=2 --virtual-time-budget=8000 \
  --screenshot=tech-injection.png "file://$PWD/tech-injection.html"
```

| File | Post | What the card carries | Plate | Higgsfield job |
|---|---|---|---|---|
| `tech-injection.png` | A typed answer cannot carry an instruction | The three answer shapes Jev can return, what each one is, and the most an injection can do to it — with `free text` in amber as the row that does not exist | The Arch, blind, a long ruled scroll stopped flat against a slotted post while a single mint cube comes through to its palm | `747240be-b4df-4190-bfa1-bdcc1452618d` |

Two departures from the first five, both deliberate and both worth knowing
before the next one:

- **No character sheet.** The five were generated with the sheets passed as
  `image_references`; this one was not, so the character is the rounded "blind"
  variant from the mandate and vision plates rather than the arch silhouette.
  It sits in the series, but pass the sheet next time.
- **1k then upscaled.** The generation came back at 1344×752 rather than the
  series' 2k, so `plate-tech-injection.png` is that frame upscaled to 3856×2160
  (`bytedance`, 2k, job `d4f3b578-1cac-4cc2-8660-c5bdd2e97fed`) rather than
  re-rolled — the composition was the one worth keeping. Set the resolution
  explicitly on the next plate.

Card contents are quoted from `docs/JUDGE.md` and `packages/sdk/src/judge.ts`.
The note line says the gate is built and not deployed; **that line stops being
true the day it ships**, so re-render this banner with the deploy.

## The docs banner (2026-09-21)

Copy: `posts-docs.md`. Banner: `banners/docs-live.html` → `docs-live.png`, the
same `tech-banner.css` series as the five tech banners, so it needs only its own
plate, headline, rows and note.

Plate: `banners/plate-docs-live.png` — the Arch on the path beside five glass
markers, one per docs page. Generated with GPT Image 2.5 (high, 2k, 16:9) using
the **previous plate's job id as the image reference** rather than a character
sheet, which carries the meadow, the light and the character in one go:
`423d3bd8-06bf-44a4-bcfa-56aecef9b6e0`. Jobs
`12d48d30-aacb-47dd-b3ed-404b99afef26` (chosen) and
`516b02ee-6177-497e-a6d6-f8110a6699f9` (kept as `plate-docs-live-alt.png`, and
reused as the film's closing plate).

The numbers on the card are counted from `src/data/docs/*` — 17 receipt fields,
12 SDK exports, five pages. If those files change the banner is wrong, so
re-render rather than leaving it.

## The docs film (2026-09-21)

Storyboard, beats and build plan: `video/docs/storyboard.md`. Master:
`video/docs/arcveil-docs.mp4` — 38 s, 1920×1080, 30 fps, **silent**; the pad the
storyboard calls for is not cut yet.

First film built with **Remotion** rather than Higgsedit: the source is
`packages/film`, and the composition imports `src/data/docs/checks.ts`,
`receipts.ts` and `site.ts` directly, so the addresses and the five checks on
screen are the same objects the pages render. A doc change breaks the film's
typecheck instead of silently disagreeing with it.

Higgsfield renders exactly two frames of this film — the opening and closing
plates. Everything between them is React. That split is deliberate: the
reference film the user supplied is entirely typography and UI, and a generated
clip cannot be trusted to spell a contract address correctly.

```bash
cd packages/film
pnpm studio                 # scrub the beats
pnpm exec remotion still src/index.ts DocsFilm out.png --frame=540
pnpm exec remotion render src/index.ts DocsFilm ../../docs/social/video/docs/arcveil-docs.mp4
```

## Note on the SDK rename (2026-09-21)

The package was renamed `@arcveil/sdk` → `@arcveildev/sdk` before its first
publish: the `@arcveil` scope on npm needs an organisation of that name, and
the account is `arcveildev`. Everything in the repository uses the new name.

The four `sdk-*.html` banners are the exception and are left untouched, because
their PNGs were posted under the old name and those posts are a record of what
was true when they went out. Re-render them only if they are ever posted again.
