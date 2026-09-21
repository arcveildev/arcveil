# Arcveil — "Read it first" (docs film, storyboard v1, 2026-09-21)

Third film. The launch film (`../launch/`) is a claim in 3D glass; the proof
film (`../proof/`) is live mainnet on real screens. This one is for developers,
and its job is narrower: **the docs are live, and here is what is in them.**

Reference: the Apollo × Orthogonal product film supplied by the user
(`ElEMsENvWOutmPP2.mp4`, 38.4 s, 1920×1080, 30 fps). What is worth copying from
it, and what is not:

- **Copy** the grammar: cream ground, one bold centred headline per beat, an
  accent underline on the single word that carries the beat, product UI drawn
  as floating cards with soft shadows, monospace for anything an API would
  print, logo lockup + URL to close.
- **Copy** the pace: a beat every 3–4 s, no beat that says two things.
- **Do not copy** the palette. Their accent is yellow; ours is mint `#85ed75`
  on navy `#1b3158`, the same pairing the banners and both earlier films use.
- **Do not copy** the claim density. Theirs sells a price per lead. Ours has
  nothing to sell, so beat 8 spends four seconds saying what is *not* built —
  the same discipline as beat 6 of the proof film.

Length 36–40 s, 16:9, 30 fps. No narration: type and cards carry it, over one
pad. Type: Manrope 700 headlines, DM Mono for code, receipt fields and the URL.

## Why this film can be built almost entirely in Remotion

Every frame of the reference is typography and UI. There is no photographed or
generated footage in it at all — which is why it reads as a product film rather
than an advert. Ours should be the same, so **Higgsfield renders two plates and
nothing else**: a three-second opener and a three-second closer in the
established meadow language, so the film still sits in the family. Everything
between them is React, rendered by Remotion at 1920×1080.

That split is deliberate. A generated clip cannot be trusted to show a receipt
field correctly, and every number in this film has to be the real one.

## Beats

| # | t | On screen | Accent word |
|---|---|---|---|
| 1 | 0–3 | Higgsfield plate: the Arch on the path beside five glass markers. Lockup fades up. | — |
| 2 | 3–7 | "Every action leaves a **receipt**." Receipt card assembles field by field. | receipt |
| 3 | 7–11 | "It proves the mandate held — **without revealing it**." Amount, asset and balance rows strike through and vanish; what is left is the real receipt. | without revealing it |
| 4 | 11–16 | "**Five checks**." The five rows land in order, each tagged `local` or `Arc`. | Five checks |
| 5 | 16–20 | "A check that cannot decide returns **unknown**." The amber row holds alone on the frame. | unknown |
| 6 | 20–25 | "Three of them read **Arc mainnet**." Both registry addresses, chain 5042, from `src/data/site.ts`. | Arc mainnet |
| 7 | 25–30 | Terminal types `verifyReceipts(...)` and prints `report.status`. | — |
| 8 | 30–34 | "**No enclave yet.**" The honest card: no enclave, no spend binding, no zk proof, nothing audited. | No enclave yet |
| 9 | 34–38 | Higgsfield closer plate, lockup, `arcveil.dev/docs`. | — |

## Beat 3, in full

The one that earns the film. The receipt card from beat 2 is on screen with
nine rows. Four rows that a reader *expects* — `amount`, `asset`, `balance`,
`threshold` — are drawn in the same style as the rest, then struck through and
lifted out one by one, and the card closes the gap. The remaining rows are the
actual v1 fields. One line under it: **"None of these were ever in it."**

It is the same move as the banners: show the absence, do not describe it.

## Data this film may show

Only what is already public on the site, quoted from source so it cannot drift:

- `MandateRegistry 0xcd48ede3…31f5`, `AnchorRegistry 0xb2af157f…8289`, chain 5042
- The five check ids and their verdicts, from `src/data/docs/checks.ts`
- The receipt fields, from `src/data/docs/receipts.ts`
- `arcveil.dev/docs`

## What this film may not show

No agent acting on its own, no enclave, no zk proof, no npm install that works.
Beat 8 exists so that none of those can be inferred from the other eight.

## Build plan

1. Higgsfield: two plates, 16:9, established meadow language, no text (the type
   is always HTML/React so it can be corrected without a re-prompt).
2. Remotion project in `packages/film`, composition `DocsFilm`, 1920×1080 @ 30.
3. Beat content imported from `src/data/docs/*` where it exists, so a doc change
   shows up in the film instead of silently disagreeing with it.
4. `pnpm film:still` for a frame check at each beat before any full render;
   `pnpm film:render` for the master to `docs/social/video/docs/arcveil-docs.mp4`.

## Cut v1 (2026-09-21)

`arcveil-docs.mp4`: 1920×1080, 30 fps, H.264, 38.00 s, 1140 frames, silent.
Rendered by Remotion from `packages/film`, composition `DocsFilm`.

Built as planned, with three things learned in the doing:

- Remotion compiles `remotion.config.ts` to CJS, so `import.meta.url` is empty
  there. The alias onto the site's `src` resolves from the working directory
  instead, and throws if it misses — an unresolved alias would otherwise show up
  much later as a blank frame.
- A row whose text sits in a fixed right-hand column wraps as soon as the copy
  grows. Descriptions belong in the flexible middle column; the right column is
  for tags short enough that they cannot wrap.
- The two plates are the ones generated for the docs banner the same day, not
  new renders. The alternate take became the closer, which is why the film opens
  and closes on the same meadow from two angles.

Not done: the pad. The film is silent until one is cut.

## Recut (2026-09-21, after the SDK was published)

Beat 8 said "Not on npm yet." The package is on npm now, so the beat was
recut rather than left to age: the honest list drops the npm row, gains the
spend commitment the budget chain still does not bind, and the headline moves
to the largest thing that is genuinely missing — the enclave.

The beat itself was never about npm. It is four seconds spent on what is not
built, so the other eight cannot be over-read, and that job did not change.
