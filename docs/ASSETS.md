# Background assets

All media in `public/backgrounds/` is original to this repo.

## In use

| File | Used by | Source |
|---|---|---|
| `hero-blindfold.png` | Hero poster (`HeroBackdrop`) | Higgsfield · GPT Image 2.5, 16:9 (job bbfed435) |
| `hero-blindfold-loop.mp4` | Hero video loop | Higgsfield · Seedance 2.5 image-to-video from the poster, 720p, 6s, no audio (job 2909bf1c) |
| `pipeline-bg.png` | Pipeline section header | GPT Image 2.5, 21:9 (job 48a2e107) |
| `threat-bg.png` | Threat model section header | GPT Image 2.5, 21:9 (job d1c21655) |
| `receipts-bg.png` | Receipts section header | GPT Image 2.5, 21:9 (job 844b9265) |

Every backdrop renders through `<SectionBackdrop>` (or `HeroBackdrop` for the
loop), which owns the blend and filter so all of them read as the same
material: `mix-blend-screen` + `saturate(1.58) brightness(1.28) contrast(1.16)`.

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
