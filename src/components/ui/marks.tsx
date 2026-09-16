/**
 * Logo mark candidates. All share one geometry — a parabolic arch, the form Arc
 * itself uses and a shape nobody owns — and differ in how the veil is drawn.
 * 28x24 viewBox so they drop into the existing wordmark without relayout.
 */
import type { CSSProperties } from "react";

type MarkProps = { className?: string; style?: CSSProperties };

const ARCH = "M3 23V12a11 11 0 0 1 22 0v11h-6V12a5 5 0 0 0-10 0v11Z";

/** 01 — Band: the arch, cut by a horizontal veil of light. */
export function MarkBand({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" className={className} style={style}>
      <mask id="band-mask">
        <rect width="28" height="24" fill="white" />
        <rect y="10.5" width="28" height="3.5" fill="black" />
      </mask>
      <path d={ARCH} fill="currentColor" mask="url(#band-mask)" />
      <rect y="11.25" width="28" height="2" fill="var(--accent)" />
    </svg>
  );
}

/** 02 — Dissolve: solid at the crown, unravelling into hairlines at the base. */
export function MarkDissolve({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" className={className} style={style}>
      <mask id="dissolve-mask">
        <rect width="28" height="11" fill="white" />
        <rect y="12" width="28" height="1.5" fill="white" fillOpacity="0.8" />
        <rect y="15" width="28" height="1.5" fill="white" fillOpacity="0.6" />
        <rect y="18" width="28" height="1.5" fill="white" fillOpacity="0.4" />
        <rect y="21" width="28" height="1.5" fill="white" fillOpacity="0.2" />
      </mask>
      <path d={ARCH} fill="currentColor" mask="url(#dissolve-mask)" />
      <rect y="10.5" width="28" height="1.5" fill="var(--accent)" />
    </svg>
  );
}

/** 03 — Parting: the arch split down the middle, a seam of light between. */
export function MarkParting({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" className={className} style={style}>
      <mask id="parting-mask">
        <rect width="28" height="24" fill="white" />
        <rect x="13.25" width="1.5" height="24" fill="black" />
      </mask>
      <path d={ARCH} fill="currentColor" mask="url(#parting-mask)" />
      <rect x="13.75" y="2" width="0.75" height="21" fill="var(--accent)" />
    </svg>
  );
}

/** 04 — Aperture: an eye under the arch, closed. */
export function MarkAperture({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" className={className} style={style}>
      <path d={ARCH} fill="currentColor" fillOpacity="0.55" />
      <path
        d="M6 14c2.6-3.2 5.3-4.8 8-4.8s5.4 1.6 8 4.8"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <path d="M14 16.5v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export const MARKS = [
  { id: "band", label: "01 Band", note: "The arch, cut by a veil of light.", Mark: MarkBand },
  { id: "dissolve", label: "02 Dissolve", note: "Solid at the crown, unravelling at the base.", Mark: MarkDissolve },
  { id: "parting", label: "03 Parting", note: "Split down the middle, a seam of light between.", Mark: MarkParting },
  { id: "aperture", label: "04 Aperture", note: "An eye under the arch, closed.", Mark: MarkAperture },
] as const;
