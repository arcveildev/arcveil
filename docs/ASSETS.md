# Background assets

All media in `public/backgrounds/` is original to this repo.

## In use

| File | Used by | Source |
|---|---|---|
| `hero-veil.png` | Hero still, painted under the loop | Higgsfield · GPT Image 2.5, 16:9 (job 7833eb3f) |
| `hero-veil-loop.mp4` | Hero video loop, full-bleed | Higgsfield · Seedance 2.5 image-to-video from the still (job 2e594d39), then post-processed — see below |
| `pipeline-bg.png` | Pipeline section header | GPT Image 2.5, 21:9 (job 48a2e107) |
| `threat-bg.png` | Threat model section header | GPT Image 2.5, 21:9 (job d1c21655) |
| `receipts-bg.png` | Receipts section header | GPT Image 2.5, 21:9 (job 844b9265) |

Section backdrops render through `<SectionBackdrop>`, which owns the blend and
filter so they all read as the same material: `mix-blend-screen` +
`saturate(1.58) brightness(1.28) contrast(1.16)`. The hero is the exception —
it runs full-bleed and unfiltered so the loop keeps its brightness, and is made
readable by two scrims instead (left-to-right for the copy, top-down for the
floating header).

## Post-processing loops
Generated clips do not end where they began, so every wrap shows a hitch, and
24 fps reads as judder on slow hazy motion. Run each hero loop through:

```bash
ffmpeg -i in.mp4 -filter_complex \
  "[0:v]setpts=1.15*PTS,split[a][pre];[pre]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];\
   [a][r]concat=n=2:v=1,minterpolate=fps=30:mi_mode=blend[v]" \
  -map "[v]" -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 24 \
  -preset slow -movflags +faststart out.mp4
```

Forward plus reverse makes the loop seamless by construction, 1.15× slower
suits the material, blended interpolation to 30 fps smooths the judder, and the
result halves the bitrate (3.2 → 1.3 Mbps). Measured in the browser, dropped
frames went from ~6% to ~2%.

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
