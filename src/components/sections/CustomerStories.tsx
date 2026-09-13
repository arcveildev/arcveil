import Link from "next/link";
import { ArrowSlide } from "@/components/ui/Button";
import { CASE_STUDIES, type CaseStudy } from "@/data/caseStudies";
import { cn } from "@/lib/cn";

function StoryCard({ study, className }: { study: CaseStudy; className?: string }) {
  return (
    <Link
      href={`/case-study/${study.slug}`}
      className={cn(
        "group relative flex min-h-60 flex-col justify-between gap-6 overflow-hidden p-5 transition-colors hover:bg-fg/3",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,var(--accent-soft),transparent_40%)] opacity-40 transition-opacity group-hover:opacity-70"
      />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <span className="inline-flex items-center justify-center border border-fg/22 p-1 label text-fg-muted">
          {study.category}
        </span>
        <span className="font-sans text-lg font-semibold tracking-tight text-fg">{study.company}</span>
      </div>
      <div className="relative z-10 flex flex-col items-start gap-4">
        <h3 className="max-w-lg text-h3-title leading-122 text-fg">{study.title}</h3>
        <span className="inline-flex items-center gap-1 font-favorit text-xs leading-none uppercase text-fg">
          Read case study
          <ArrowSlide />
        </span>
      </div>
    </Link>
  );
}

export function CustomerStories() {
  return (
    <section
      id="customer-stories"
      aria-labelledby="customer-stories-title"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5 xl:scroll-mt-[104px]"
    >
      <div className="border-b border-border p-5">
        <h2 id="customer-stories-title" className="text-h3-title text-fg">
          Customer Stories
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {CASE_STUDIES.map((study, i) => (
          <StoryCard
            key={study.slug}
            study={study}
            className={cn(i > 0 && "border-t border-border md:border-t-0 md:border-l")}
          />
        ))}
      </div>
    </section>
  );
}
