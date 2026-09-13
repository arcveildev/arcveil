import Link from "next/link";
import { CASE_STUDIES } from "@/data/caseStudies";
import { cn } from "@/lib/cn";

/** Two customer quotes side by side, each linking to its case study. */
export function Testimonials() {
  return (
    <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
      {CASE_STUDIES.map((study, i) => (
        <Link
          key={study.slug}
          href={`/case-study/${study.slug}`}
          aria-label={`Read the ${study.company} case study`}
          className={cn(
            "group flex flex-col gap-8 p-5 transition-colors hover:bg-fg/2 lg:min-h-75 lg:justify-between border-border",
            i % 2 === 0 && "lg:border-r",
            i < CASE_STUDIES.length - 1 && "border-b lg:border-b-0",
          )}
        >
          <blockquote className="font-sans text-sm leading-normal text-fg/80 md:text-base">
            <p>&ldquo;{study.quote}&rdquo;</p>
          </blockquote>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col font-sans leading-normal">
              <p className="text-base text-fg">{study.author}</p>
              <p className="text-sm text-fg-muted">{study.role}</p>
            </div>
            <span className="font-sans text-lg font-semibold tracking-tight text-fg/70 transition-colors group-hover:text-fg">
              {study.company}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
