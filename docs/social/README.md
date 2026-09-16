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
