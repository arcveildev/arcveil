import Link from "next/link";
import { cn } from "@/lib/cn";

/** Wordmark: geometric mark + "PRIME" (label font) + "Intellect" (italic sans). */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label="Prime Intellect home" className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden="true" className="h-6 w-auto shrink-0">
        <path d="M2 22 L11 2 L14 9 L9 22 Z" fill="currentColor" />
        <path d="M12 22 L20 4 L26 22 L21 22 L19.5 17 L15.5 17 L14 22 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M0 8 L7 8 L5.5 11 L0 11 Z" fill="currentColor" fillOpacity="0.6" />
      </svg>
      {!compact && (
        <span className="flex items-baseline gap-1 leading-none">
          <span className="font-favorit text-[15px] font-medium uppercase tracking-[0.04em]">Prime</span>
          <span className="font-sans text-[17px] italic tracking-tight">Intellect</span>
        </span>
      )}
    </Link>
  );
}
