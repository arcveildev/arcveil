# Background assets

All media in `public/backgrounds/` is original to this repo.

## In use

| File | Used by | Source |
|---|---|---|
| `hero-veil.png` | Hero still, painted under the loop | Higgsfield · GPT Image 2.5, 16:9 (job 7833eb3f) |
| `hero-veil-loop.mp4` | Hero video loop, full-bleed | Higgsfield · Seedance 2.5 image-to-video from the still, 720p, 6s, no audio (job 2e594d39) |
| `pipeline-bg.png` | Pipeline section header | GPT Image 2.5, 21:9 (job 48a2e107) |
| `threat-bg.png` | Threat model section header | GPT Image 2.5, 21:9 (job d1c21655) |
| `receipts-bg.png` | Receipts section header | GPT Image 2.5, 21:9 (job 844b9265) |

Section backdrops render through `<SectionBackdrop>`, which owns the blend and
filter so they all read as the same material: `mix-blend-screen` +
`saturate(1.58) brightness(1.28) contrast(1.16)`. The hero is the exception —
it runs full-bleed and unfiltered so the loop keeps its brightness, and is made
readable by two scrims instead (left-to-right for the copy, top-down for the
floating header).

## Style rules for new backgrounds
Pure black canvas, dot-matrix / LED sub-pixel texture, one accent hue (mint
green `#85ed75`), no text, no logos, no faces, no UI. Ultra-wide 21:9 for
section headers, 16:9 for the hero. Subject vocabulary for this product: a band
of light across an unseen form (blindfold), a hairline rail of nodes
(pipeline), apertures in the dark with one lit (threat model), sealed
translucent sheets (receipts). Video: near-still, the loop should end where it
began — no cuts, no camera moves, no new objects entering.

## Left over from the previous project
`lab.png`, `compute-bg.png`, `inference-header.png`, `fig-7-bg.png`,
`environment-hub-bg.png`, `dedicated-inference.svg`, `inference-stack.svg`,
`lora-hot-swapping.svg`, `pi-glass-loop-*` — generated for the Prime Intellect
clone and unused since the pivot. Delete them once no new section wants them.
