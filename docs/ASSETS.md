# Background assets

> Currently unused: the sections these belonged to were removed when the project
> pivoted. Kept as raw material for the new home page — regenerate or drop them
> as that page takes shape.

All media in `public/backgrounds/` is original to this repo (no Prime Intellect files remain).

| File | Used by | Source |
|---|---|---|
| `pi-glass-loop-poster.webp` | Hero poster | Higgsfield · GPT Image 2.5, 16:9, 2k (job e2c956c5) |
| `pi-glass-loop-prod.mp4` | Hero video loop | Higgsfield · Seedance 2.5 image-to-video from the poster, 720p, 6s, no audio |
| `lab.png` | Lab section header | GPT Image 2.5, 21:9 (job 63153b06) |
| `compute-bg.png` | Compute section header | GPT Image 2.5, 21:9 (job e8cb97a9) |
| `inference-header.png` | Inference section header | GPT Image 2.5, 21:9 (job f79ee5a4) |
| `fig-7-bg.png`, `environment-hub-bg.png` | Dot-grid textures | Generated with Python/PIL (`scripts/gen-dot-grids.py`) |
| `dedicated-inference.svg`, `lora-hot-swapping.svg`, `inference-stack.svg` | Inference diagrams | Hand-written SVG |

## Regenerating
Prompts used are recorded in the Higgsfield generation history (job ids above).
Style rules for new backgrounds: pure black canvas, dot-matrix / LED sub-pixel texture,
one accent hue (mint green `#85ed75` or blue), no text, ultra-wide (21:9) for section headers.
