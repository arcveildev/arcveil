import Link from "next/link";
import { SITE } from "@/data/site";
import { cn } from "@/lib/cn";

/** Wordmark: a covered eye (square with a band across it) + the codename. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${SITE.name} home`} className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden="true" className="h-6 w-auto shrink-0">
        <rect x="5.5" y="4.5" width="17" height="15" stroke="currentColor" strokeOpacity="0.55" />
        <rect x="0" y="10" width="28" height="4" fill="currentColor" />
        <rect x="12.5" y="10" width="3" height="4" fill="currentColor" fillOpacity="0.25" />
      </svg>
      {!compact && (
        <span className="font-favorit text-[15px] font-medium uppercase tracking-[0.04em] leading-none">
          {SITE.name}
        </span>
      )}
    </Link>
  );
}
