import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PARTNERS } from "@/data/site";
import { cn } from "@/lib/cn";

/** Five-column logo strip under the hero (text wordmarks stand in for SVG logos). */
export function PartnersStrip() {
  return (
    <div className="relative z-10 -mx-4 bg-surface px-4 md:-mx-5 md:px-5 mb-5 md:mb-8 lg:mb-17.5">
      <div className="grid grid-cols-2 border border-border sm:grid-cols-3 lg:grid-cols-5">
        {PARTNERS.map((partner, i) => {
          const cell = cn(
            "group relative flex h-25 min-w-0 items-center justify-center p-2.5 border-border",
            i > 0 && "border-l max-lg:[&:nth-child(3n+1)]:border-l-0 max-sm:[&:nth-child(2n+1)]:border-l-0",
            i >= 2 && "max-sm:border-t",
            i >= 3 && "max-lg:border-t",
          );
          const mark = (
            <span className="font-sans text-lg font-semibold tracking-tight text-fg/70 transition-colors group-hover:text-fg">
              {partner.name}
            </span>
          );
          if (!partner.href) {
            return (
              <div key={partner.name} className={cell}>
                {mark}
              </div>
            );
          }
          return (
            <Link key={partner.name} href={partner.href} aria-label={`${partner.tag}: ${partner.name}`} className={cell}>
              {mark}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 z-10 flex items-center gap-1.5 bg-fg/4 p-1.5 font-favorit text-xs leading-none uppercase text-fg/50 transition-colors group-hover:bg-fg/8 group-hover:text-fg"
              >
                <span className="hidden md:inline">{partner.tag}</span>
                <ArrowUpRight className="size-3 opacity-50" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
