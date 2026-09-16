import Link from "next/link";
import { SITE } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * Mark: a parabolic arch — the shape Arc uses, and one nobody owns — cut by a
 * band of light. Drawn as separate crown and legs rather than a masked shape,
 * so the gap is geometry: no mask ids to collide when the logo repeats on a
 * page, and it stays correct on any background.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3.1 10.5A11 11 0 0 1 24.9 10.5L18.77 10.5A5 5 0 0 0 9.23 10.5Z"
        fill="currentColor"
      />
      <rect x="3" y="14" width="6" height="9" fill="currentColor" />
      <rect x="19" y="14" width="6" height="9" fill="currentColor" />
      <rect y="11.25" width="28" height="2" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${SITE.name} home`} className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-6 w-auto shrink-0" />
      {!compact && (
        <span className="font-favorit text-[15px] leading-none font-medium tracking-[0.04em] uppercase">
          {SITE.name}
        </span>
      )}
    </Link>
  );
}
