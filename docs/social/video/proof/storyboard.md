# Arcveil — "Proof" film (storyboard v1, 2026-09-17)

The launch film (`../launch/`) says what Arcveil is, in the Arcus grammar:
white studio, 3D glass, narration. This one does the opposite job and should
not look like it. **Every frame here is a screen, and every number on those
screens is real** — real contract addresses, real transaction hashes, a real
revert selector. Nothing is illustrated.

Why a second film: the launch film is a claim. Arc mainnet opened on
2026-09-16 and by the 17th Arcveil had contracts, an account, four
transactions and a site that reads the chain from the browser. That is the
rarest thing a launch can show, and it cannot be shown with 3D glass.

Length 40–45 s, 16:9. No narration — the screens carry it, cut to a single
pad. Type: DM Mono for everything on the overlay, navy `#1b3158` on white
title cards, mint `#85ed75` only where the chain says yes, `#fb7185` only
where it says no.

## The one thing this film is about

Everyone can show a transaction succeeding. Almost nobody shows their own
system **refusing**. Beat 6 is the film; beats 1–5 exist to make it land.

## Beats

| # | t | On screen | Real data shown |
|---|---|---|---|
| 1 | 0–4 | Title card: "Arc mainnet opened yesterday." → "This is Arcveil, running on it." | — |
| 2 | 4–10 | `explorer.arc.io` — the two registry contracts | `0xcd48ede3…31f5`, `0xb2af157f…8289`, chain 5042 |
| 3 | 10–16 | Terminal: `pnpm intent prepare anchor …` → digest line | `digest 0x84a2dfb8…2bba (confirmed against the account itself)` |
| 4 | 16–22 | Two `cast wallet sign` prompts, then `signed by 0xE3CcD5C4… and 0x71f1B18B… — both members, distinct` | the device and co-signer addresses |
| 5 | 22–28 | Explorer tx page, then arcveil.dev/verify: five checks turn green | tx `0xd110e725…7bb3`, block 21195992; "3 of these read Arc mainnet" |
| 6 | 28–38 | `prepare revoke 1` → sign → settle. Then the same action again, and the refusal: `MandateNotLive(1, 0xa69da9d9…977b)` on `0xb254c866` | revoke tx `0x78f19485…1372`, block 21197420 |
| 7 | 38–45 | Lockup, positioning line, URL, and the honest card | "unaudited · no enclave yet · nothing is at stake" |

## Beat 6, in full

The strongest ten seconds we have. Sequence:

1. `mandateOf(account, 1)` before: `revokedAt 0`, `isLive true` — mint.
2. The revoke transaction lands.
3. `mandateOf` after: `revokedAt 1789582067`, `isLive false` — the mint drains
   out of the row.
4. The identical anchor command runs again. The script refuses first:
   *"epoch 1 is revoked."*
5. Then the forced call, straight to the contract, and the raw revert data
   fills the frame: `0xb254c866…0001a69da9d9…977b`, decoded underneath as
   `MandateNotLive(epoch 1, 0xa69da9d9…977b)`.
6. One line of type: **"The contract refused. Not a policy engine. Not us."**

## What this film may not show

The launch film is allowed to describe the enclave, because it describes the
product. This one may not, because it shows the system. Absent, and therefore
off limits: an autonomous agent, gas abstraction, a paymaster, the enclave,
relative-only intents. The signatures in beat 4 are typed by a human at a
password prompt, and the film shows that rather than hiding it — a human
authorising a machine's bounded action is the honest picture today.

The closing card is not a disclaimer bolted on. A film that shows live
mainnet addresses invites people to use them; saying "unaudited, nothing is
at stake yet" in the same frame as the URL is the same discipline the site
already follows.

## Build plan

Different from the launch film, deliberately: **no Higgsfield plates for the
screens**. Screens are captured from the real thing at 2560×1440 and animated
programmatically, so a frame can never drift from what the chain says.

1. Capture: arcveil.dev/verify states, explorer pages, and terminal transcripts
   re-typed from the actual session output into an HTML terminal at brand type.
2. Animate: HTML/CSS keyframes rendered with headless Chrome to PNG sequences
   (same toolchain as the SDK banners), assembled with ffmpeg.
3. Higgsfield is used only for the 3-second opener and closer plates, in the
   established navy/mint horizon language, so it still sits in the family.
4. No captions, no VO, one pad. Master to `arcveil-proof.mp4`.

## Open decisions

1. **Screens vs 3D.** Recommendation: screens. A proof film rendered in 3D
   glass is a contradiction — the whole point is that it is not illustrated.
2. **Beat 7 extension.** Epoch 2 adoption is prepared but unsigned. With two
   signatures the film gains a closing beat — the account comes back under a
   *tighter* mandate — which turns the ending from "it stopped" into "you are
   in control". Recommended, and it costs two signatures.
3. **Where it posts.** As a reply under the launch film, or standalone quoting
   @arc's mainnet post.
