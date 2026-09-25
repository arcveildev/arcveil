# Arcveil — "In the chat" concept film (storyboard v1, 2026-09-24)

A tweet praised how smooth it feels to send money over @arc with iMessage.
This film shows what Arcveil adds to that picture: **the agent sits in the
chat, pays inside a mandate, hands back a receipt, and refuses when asked for
more — without saying what the limit is.**

It is a **concept film**. The iMessage relay (`packages/imessage`) is at
phase 0: it echoes and moves no money. So the film looks real, and says it
is a concept, in every frame and in the post. The `proof` film's rule —
every screen is real — does not apply here, which is exactly why the label
has to.

Length 25 s, 4:5 (1080×1350, 30 fps) — a phone film, watched on a phone.
Bright morning light, like the reference mood of the earlier films; no dusk.

## How "real" is built

AI video renders UI text as noise: "20 USDC", a link, `per_action_cap` would
come out garbled. So the work is split:

| Layer | Made with | Why |
|---|---|---|
| Live-action plates: hands, phone, café table, coffee, window light | **Higgsfield** — GPT Image 2.5 keyframes → Seedance 2.5 | What generative video is good at. Screens stay dark, angled away or green. |
| Phone screen: the chat, the refusal, the verifier | **Remotion** (`packages/film`) — an iMessage-style thread built in code | Every character exact and sharp. |
| `/verify` | Screen capture of the **real** page checking a real mainnet sample receipt | The one screen that already exists. |
| End card, CONCEPT tag | Remotion, Manrope + DM Mono | Same type as the other films. |

## Beats

| # | t | Picture | On screen |
|---|---|---|---|
| 1 | 0.0–2.5 | **P1** plate. Sunlit café window seat, wooden table, a flat white. A hand lifts an iPhone off the table; screen angled away. Slow push-in. | tag `CONCEPT` (top-left, all frames until the end card) |
| 2 | 2.5–8.0 | **UI** full frame: chat with contact **Arcveil** (Band-mark avatar). | You type *send 20 to sam for lunch* → send. Typing dots 0.8 s. Arcveil: *Sent 20 USDC to Sam. Inside your mandate.* + link card *Receipt · 5 checks · arcveil.dev/verify* |
| 3 | 8.0–10.0 | **P2** plate, top-down, locked off: phone flat on the table, thumb taps the link card. Screen is the UI composited in (corner-pin; see test below). | — |
| 4 | 10.0–14.5 | **UI**: `arcveil.dev/verify` in a mobile browser frame; five checks turn green one by one. | *Verified in your browser. Nothing sent to us.* |
| 5 | 14.5–19.5 | **UI**: back in the chat. | You: *send 500 to sam*. Arcveil: *Declined — this breaks per_action_cap.* then *The limit itself stays private.* |
| 6 | 19.5–22.0 | **P3** plate. Phone laid face down; the hand picks up the coffee. Window light, shallow focus, no face. | — |
| 7 | 22.0–25.0 | End card, white. | Band mark · *Agents that can spend, never see, never exceed.* · pill `CONCEPT · COMING TO iMESSAGE` · `arcveil.dev` |

Beat 5 is the film. Everyone can show a payment going through; the agent
saying no — and not leaking the number when it does — is the part only
Arcveil has.

## Plates (Higgsfield)

Common prompt spine: *photoreal, shot on a 35 mm lens, bright natural morning
window light, soft shadows, warm neutral café, shallow depth of field, cream
and light-wood palette with one mint accent object, iPhone with no visible
logo, hands only — no face, no text anywhere in frame.*

| Plate | Keyframe (GPT Image 2.5) | Motion (Seedance 2.5, 1080p, 5 s + handle) |
|---|---|---|
| P1 | Table by the window, flat white, iPhone face down, a hand entering frame | Hand lifts the phone toward camera-left, screen away; slow push-in |
| P2 | Top-down: iPhone flat on light wood, screen solid `#00FF00`, thumb hovering | Locked camera. Thumb taps the lower third of the screen once, withdraws |
| P3 | Phone face down beside the cup, hand around the cup | Hand lifts the cup out of frame; steam; light shifts slightly |

Cost at the launch-film rate (45 credits per 5 s, 1080p): three plates ≈ 135
credits, plus keyframe stills. Before spending on all three: **test P2 first**
— one keyframe and one 5 s plate — to see whether Seedance keeps the green
screen flat and the corners still enough to pin the UI onto. If it does not,
P2 becomes an over-the-shoulder shot with the screen out of focus, and the
tap is shown on the full-frame UI instead.

## What the film may not do

- Say *live*, *now*, or *available*. It says *concept* and *coming*.
- Drop the `CONCEPT` tag from any frame before the end card.
- Use Apple's logo, the iMessage icon, or Messages' own sounds. The thread is
  styled to read as a chat on an iPhone, nothing more.
- Show a transaction hash or an explorer page as if this flow produced it.
  The `/verify` capture checks a real sample receipt, and is fine only because
  the whole film is labelled a concept.

## Sound

No narration — the chat is the script. Room tone of a quiet café, one soft
tick per message (our own, not Apple's), a low pad under the end card.

## Post copy (X, draft)

> Concept: your agent, in iMessage.
>
> Text it like a friend. It pays inside your mandate, hands back a receipt anyone can verify, and when you ask for more than you allowed, it says no without telling anyone what the limit is.
>
> Building it now on @arc.
> arcveil.dev

## Open decisions

1. **Format** — 4:5 vertical (recommended, it is a phone film) or 16:9 like
   the earlier films.
2. ~~**Names**~~ — decided 2026-09-25: the friend is **Sam**, an international,
   gender-neutral name, not Budi.
3. **Sound** — room tone + ticks only (recommended), or a Grady VO line on
   the end card.
4. **P2 test** — approve spending one keyframe + one plate on the green-screen
   test before the other two.

## Stills (round 1, 2026-09-24)

GPT Image 2.5, high, 2k, 4:5, on Higgsfield; 2.75 credits each. Files in
`stills/`. The phone text is the image model's rendering and every line came
out exact, but it is for the storyboard only — the film rebuilds each screen
in code. Still 07's arch is the model's approximation, not the Band mark.

| Beat | File | Higgsfield job |
|---|---|---|
| 1 | `stills/01.jpg` | `34653948-b50e-4625-ae87-ccacc089c345` |
| 2 | `stills/02.jpg` | `637b9b77-00a2-4bd8-9209-f1762d6fc011` (Sam edit of `32147cdc…`) |
| 3 | `stills/03.jpg` | `fd45c051-4f97-45c5-9ed2-e24a2f7730b5` (Sam edit of `64981b0c…`) |
| 4 | `stills/04.jpg` | `13167110-ee8e-4834-95e8-c54280cc4ca4` |
| 5 | `stills/05.jpg` | `f5e05bec-1cf1-495f-ac21-d8d718d6ca38` (Sam edit of `698d036b…`) |
| 6 | `stills/06.jpg` | `fbd177c9-29e1-419f-8922-77290e64d67b` |
| 7 | `stills/07.jpg` | `9195b858-2f8a-4a83-ba8f-8bdf2abb36ee` |

Job ids 01, 03 and 06 can seed the Seedance plates P1, P2 and P3 as
references, so the café, the sweater cuff and the mint saucer stay the same
across shots.

## P2 test (2026-09-24) — passed

1. **Keyframe**: still 03 edited in GPT Image 2.5 to a flat chroma screen,
   hand removed (`plates/p2-keyframe.jpg`, job `77ae358e-3d6f-4f9a-9f09-11744f462a52`).
2. **Plate**: Seedance 2.5 omni-reference, keyframe as `start_image`, 3:4,
   1080p, 5 s, no audio — **60 credits**, not 45 (`plates/p2-plate.mp4`, job
   `79be842e-302e-40c3-852d-b73aef447266`). The first submit with
   `aspect_ratio: auto` failed without a reason and was not charged; an
   explicit ratio went through.
3. **Composite**: `p2/compose.py` → `plates/p2-test.mp4`, cropped to 4:5.

What the plate gave: the screen rectangle moves at most 2 px over 5 s, so a
fixed pin works with no tracking. The finger is down from 2.2 s to 3.55 s at
about 60 % across and 64 % down the screen, so the thread is anchored from
the bottom (as a real one is) with the receipt card centred there, and the
card shows its pressed state while the finger is down:

    python3 p2/compose.py plates/p2-plate.mp4 plates/p2-test.mp4 --tap 2.2 --tap-len 1.35 --card-y 0.645

Two traps found on the way: the key must be confined to the screen, or the
mint saucer is keyed grey with it; and the screen box must have even edges,
or 4:2:0 chroma leaves a one-pixel seam that runs across the finger.

The test's phone type is SF from macOS, because Manrope is not in the repo;
the film's screens move to Remotion as planned.
