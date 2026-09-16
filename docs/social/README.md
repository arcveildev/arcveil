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
`banners/compose_burn.py`: real Band mark, DM Mono, ticker in the foreground
colour, headline in gold, mint rule, two sub lines, footer.

| File | World | Compose flags | Higgsfield job |
|---|---|---|---|
| `burn-a-meadow.png` | The Arch in the film's meadow, coins on its palm turning to sparks | `light top=0.13 scrim=150` | `e5e5d6ca-f7b3-46aa-8161-7c9cd971baea` |
| `burn-b-dusk.png` | X-header dusk plain, coin stack dissolving into an ember column under the glass arch | `dark top=0.11 sub_top=0.585` (type split around the horizon line) | `24188b6f-d375-4a9e-974f-b57ed216ee06` |
| `burn-c-receipt.png` | Receipt card burning into mint light on the dot-matrix black | `dark` | `6ac9457f-542f-4498-8dd9-19afd8e60a88` |

Sub lines are placeholders until the burn happens: swap `SUB`/`SUB2` in
`compose_burn.py` for the real amount and tx, then re-run. Plates are kept as
`plate-*.png` so the type can be redone without re-prompting.
