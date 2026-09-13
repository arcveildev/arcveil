import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import {
  ROADMAP_NOTE,
  ROADMAP_PHASES,
  ROADMAP_SECTION,
  type RoadmapPhase,
  type RoadmapStatus,
} from "@/data/roadmap";

/** Columns on lg — the grid hairlines are derived from this, not hardcoded. */
const COLUMNS = 3;

/** Shipped reads accent, in-flight reads chart-2, everything unbuilt reads muted. */
const STATUS_STYLES: Record<RoadmapStatus, { chip: string; dot: string }> = {
  shipped: { chip: "border-accent/40 text-accent", dot: "bg-accent" },
  "in progress": { chip: "border-chart-2/40 text-chart-2", dot: "bg-chart-2" },
  next: { chip: "border-border text-fg-subtle", dot: "bg-fg-subtle" },
  planned: { chip: "border-border text-fg-subtle", dot: "bg-fg-subtle" },
};

function StatusChip({ status }: { status: RoadmapStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "label-2xs inline-flex items-center gap-1.5 border px-1.5 py-1",
        style.chip,
      )}
    >
      <span aria-hidden className={cn("h-1 w-1 shrink-0", style.dot)} />
      {status}
    </span>
  );
}

function Phase({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const isLastColumn = (index + 1) % COLUMNS === 0;
  const isLastRow = index >= ROADMAP_PHASES.length - COLUMNS;

  return (
    <article
      className={cn(
        "flex flex-col border-b border-border last:border-b-0",
        isLastColumn ? "lg:border-r-0" : "lg:border-r",
        isLastRow && "lg:border-b-0",
      )}
    >
      <div className="flex min-h-9 items-center border-b border-border px-4 md:px-5">
        <StatusChip status={phase.status} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <h3 className="text-xl leading-122 text-fg lg:text-h3-title">
          <span className="opacity-50">{phase.n}</span> {phase.title}
        </h3>

        <p className="text-sm leading-140 text-fg-muted">{phase.summary}</p>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {phase.tags.map((tag) => (
            <li
              key={tag}
              className="label-2xs border border-border px-1.5 py-1 text-fg-subtle"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function Roadmap() {
  return (
    <section
      id={ROADMAP_SECTION.id}
      className="mb-5 flex scroll-mt-17 flex-col border border-border md:mb-8 lg:mb-17.5"
    >
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">{ROADMAP_SECTION.label}</span>
        <SectionHeading title={ROADMAP_SECTION.title} tagline={ROADMAP_SECTION.tagline} />
      </div>

      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-3">
        {ROADMAP_PHASES.map((phase, index) => (
          <Phase key={phase.n} phase={phase} index={index} />
        ))}
      </div>

      <p className="border-t border-border px-4 py-4 text-xs leading-140 text-fg-subtle md:px-5 md:py-5">
        {ROADMAP_NOTE}
      </p>
    </section>
  );
}
