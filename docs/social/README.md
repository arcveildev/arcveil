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
on the right with real `@arcveil/sdk` calls (publish a mandate, issue a
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
> with @arcveil/sdk.
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
> @arcveil/sdk gives an agent a spending mandate instead of your keys. Every
> action leaves a receipt that proves it stayed in bounds, with no amounts and
> no balances inside.
>
> Publish a mandate, issue receipts, verify against Arc mainnet. Five checks,
> a few lines, in Node or a browser.
>
> pnpm add @arcveil/sdk
> arcveil.dev

Shorter alt:

> An agent that can spend is an agent that can see. Not on Arc.
>
> @arcveil/sdk: a mandate instead of your keys, a receipt for every action,
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
