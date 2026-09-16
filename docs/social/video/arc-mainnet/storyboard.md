# Arcveil × Arc Mainnet — "The Courier" (storyboard v1)

Reply video for Arc's mainnet-launch post (x.com/arc/status/2100170550857404852,
2026-09-16). 16:9, ~23 s, one continuous push-in, one character, one prop, one
location — the same grammar as the reference clip (many-eyed sphere in a tulip
field that goes blind when it takes the brand mark), rebuilt in Arcveil's world.

## Reference, decoded

| t | Beat in the reference | What it does |
|---|---|---|
| 0–4 s | Wide: character stands still in a bright field, slow push-in | Establish "a thing that sees everything" |
| 4–8 s | The brand mark drifts in from frame-right; the big eye swivels to it | Curiosity |
| 8–12 s | Character holds and inspects the mark | Contact |
| 12–16 s | Mark flies off, loops around the character trailing light | The mark acts on the character |
| 16–18 s | Mark lands on the central eye | Adoption |
| 18–20 s | Every eye closes; plain sphere with the mark. Cut. | Payoff: it no longer sees |

Rules the reference obeys, and we keep: no cuts, no camera moves other than a
slow push, nothing enters except the prop, no text until the end.

## Our translation

| Reference | Arcveil |
|---|---|
| Many-eyed sphere | **The Courier**: an agent. Matte near-black sphere, stubby legs and arms, studded with **camera irises** (mechanical apertures, mint glow) — lenses, not eyeballs |
| Tulip field, rainbow, windmill | The X-header world: dark glass plain under the navy→sand dusk; rows of tiny lit apertures either side of a path, one line of light at the horizon |
| Pinwheel (their mark) | **The Band**: a short bar of horizon light (the accent stroke in our mark) |
| Eyes close | Irises **shutter closed** under the Band — a blindfold, not a wink |
| Ends with mark on the sphere | Ends with the Courier still working blind: it pays out a disc of light and a **sealed receipt card** rises, then it steps under the Arch (our mark) |

## Narration (English, ~58 words, 22 s)

Pulled from Arc's own launch wording so the reply reads as continuation, then
turns on "agentic".

> Arc mainnet is live. USDC as gas, sub-second finality, and agents moving money
> from day one.
> But an agent that can spend is an agent that can see: every balance, every key.
> Arcveil hands it a mandate instead of your keys.
> It spends. It never sees. It never exceeds.
> And every action leaves a receipt.
> Arcveil. Built on Arc.

Short alt (14 s): *Arc mainnet is live, agents included. An agent that can
spend can see. Arcveil: a mandate, not your keys. Spend, never see, never
exceed. Built on Arc.*

## Shots

| # | t | Picture | Camera | VO | Sound |
|---|---|---|---|---|---|
| 1 | 0–4 | Wide. The Courier stands on the glass path, irises blinking and scanning in all directions, each lens catching the horizon. Aperture rows glow faintly like tulip rows. | Slow push-in, eye level | "Arc mainnet is live. USDC as gas, sub-second finality, and agents moving money from day one." | Low pad, tiny shutter clicks |
| 2 | 4–8 | A bar of light peels off the horizon at frame-right and drifts in, level with the largest iris. That iris swivels and dilates toward it. | Push continues | "But an agent that can spend is an agent that can see—" | Single rising tone |
| 3 | 8–12 | The Courier catches the Band in its hand, turns it; every iris rotates to it, mint reflections across the body. | Push to medium | "—every balance, every key." | Reflections tick |
| 4 | 12–16 | The Band lifts out of its hand, arcs once around the sphere leaving a light trail, and settles around it at iris height. | Medium, hold | "Arcveil hands it a mandate instead of your keys." | Whoosh, then a soft lock |
| 5 | 16–20 | Under the Band the irises shutter closed one by one, outer to inner. Plain matte sphere, one horizontal line of light. Calm. It extends its hand: a small disc of light leaves it, and a translucent sealed card rises and hangs. | Medium close, hold | "It spends. It never sees. It never exceeds. And every action leaves a receipt." | Shutter clicks descending, a clean chime on the card |
| 6 | 20–23 | Pull back: the horizon line and the two lit pillars beside the path resolve into the Arch. The Courier stands under it. Lockup composited: mark + ARCVEIL, tagline, "BUILT ON ARC". | Slow pull-out | "Arcveil. Built on Arc." | Pad resolves, hold, cut |

## Character: The Courier (locked before any shot renders)

- Body: matte near-black sphere, soft clay-render finish, faint dot-matrix
  texture, no seams. Diameter ≈ 1.5× the path width.
- Lenses: 9 mechanical irises of three sizes, largest front-centre, mint glow
  (`#85ed75`) inside dark chrome rings. They dilate, swivel and **shutter**; they
  never blink like eyes.
- Limbs: stubby black legs and short arms with mitt hands, same finish.
- No hat, no face, no mouth. Personality comes from the lenses and posture.
- Blindfolded state: all irises closed flush to the sphere; the Band is a
  2-px-thin horizontal light line around the equator.

## Generation plan (Higgsfield)

1. **Character sheet** — via the `character-sheet` workflow, 3D-stylized preset:
   front / three-quarter / back, open and shuttered states. One approved sheet
   is the identity reference for everything after.
2. **World plate** — `nano_banana_2`, 16:9, 2K, no text: the dark glass plain
   from `docs/social/x-header-source.png` with aperture rows and a path. Same
   prompt family as the X header so the film and the profile match.
3. **Keyframes** (`gpt_image_2_5`, character sheet + plate as references):
   K0 shot 1 start, K1 shot 2 Band at hand, K2 shot 4 Band wrapped, K3 shot 5
   shuttered with card, K4 shot 6 under the Arch.
4. **Clips** — `seedance_2_5`, `omni_reference`, 1080p, `generate_audio` off:
   - Clip A 0–12 s: start K0 → end K1 (shots 1–3)
   - Clip B 12–20 s: start K2 → end K3 (shots 4–5)
   - Clip C 20–23 s: start K3 → end K4 (shot 6)
   Fallback per clip: `kling3_0` pro with start/end frames if Seedance drifts
   the character.
5. **Voice** — one narrator via `generate_audio`, pick from `list_voices`, low,
   unhurried; fit to 22 s without time-stretch.
6. **Post** — ffmpeg: concat, 30 fps blend, VO + pad mix, then the lockup on
   shot 6 through `docs/social/compose.py` (real LogoMark + DM Mono, never
   AI-rendered text). Export 1920×1080 H.264 for X.

## Reply copy

> Arc mainnet is live, with agentic economic workflows from day one.
>
> An agent that can spend is an agent that can see.
>
> Arcveil: a mandate instead of your keys, a receipt for every action.
> Agents that can spend, never see, never exceed.
>
> Built on Arc.

## Open before rendering

- Length: 23 s (full VO) or 14 s (alt). X autoplay favours short.
- Shot 5 second beat (disc + card) is the one addition to the reference's
  grammar. Keep it, or end on the shutter like the reference does.
- Voice: male / female / neutral; accent.
