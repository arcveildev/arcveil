import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import {
  PIPELINE_LABEL,
  PIPELINE_NOTE,
  PIPELINE_STEPS,
  PIPELINE_TAGLINE,
  type PipelineStep,
} from "@/data/pipeline";

/**
 * The connective hairline running through the rail column. It stops at the
 * first node and starts again at the last one, so the flow reads as a single
 * line with six taps on it rather than six detached rows.
 * Offsets match the row padding (py-5 / md:py-6) plus half the node (12px).
 */
function RailLine({ position }: { position: "first" | "middle" | "last" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-7 w-px bg-border md:left-8",
        position === "first" && "top-8 bottom-0 md:top-9",
        position === "middle" && "inset-y-0",
        position === "last" && "top-0 h-8 md:h-9",
      )}
    />
  );
}

function StepRow({ step, position }: { step: PipelineStep; position: "first" | "middle" | "last" }) {
  const isLast = position === "last";

  return (
    <li className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 border-b border-border px-4 py-5 last:border-b-0 md:grid-cols-[1.5rem_minmax(0,1fr)_auto] md:gap-x-5 md:px-5 md:py-6">
      <RailLine position={position} />

      <span
        className={cn(
          "relative z-10 flex size-6 items-center justify-center border bg-surface font-favorit text-2xs",
          isLast ? "border-accent text-accent" : "border-border text-fg-muted",
        )}
      >
        {step.n}
      </span>

      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-xl leading-122 text-fg lg:text-h3-title">{step.title}</p>
        <p className="font-mono text-2xs leading-130 text-fg-subtle">{step.where}</p>
        <p className="max-w-2xl text-sm leading-140 text-fg-muted">{step.body}</p>
      </div>

      <div className="col-start-2 mt-3 flex md:col-start-3 md:row-start-1 md:mt-0 md:justify-end">
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-2 border px-2 py-1.5",
            isLast ? "border-accent/40 bg-accent/5" : "border-border bg-surface-raised",
          )}
        >
          <span className="label-2xs text-fg-faint">Artifact</span>
          <span
            className={cn(
              "truncate font-mono text-2xs leading-none",
              isLast ? "text-accent" : "text-fg",
            )}
          >
            {step.artifact}
          </span>
        </span>
      </div>
    </li>
  );
}

export function Pipeline() {
  const last = PIPELINE_STEPS.length - 1;

  return (
    <section
      id="pipeline"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5"
    >
      <div className="relative overflow-hidden flex flex-col gap-4 border-b border-border px-4 py-6 md:px-5 md:py-8">
        <SectionBackdrop src="/backgrounds/pipeline-bg.webp" />
        <span className="relative z-10 label text-fg-muted">{PIPELINE_LABEL}</span>
        <SectionHeading className="relative z-10" title="Pipeline." tagline={PIPELINE_TAGLINE} />
      </div>

      <ol className="flex flex-col">
        {PIPELINE_STEPS.map((step, i) => (
          <StepRow
            key={step.n}
            step={step}
            position={i === 0 ? "first" : i === last ? "last" : "middle"}
          />
        ))}
      </ol>

      <p className="border-t border-border px-4 py-4 text-xs leading-140 text-fg-subtle md:px-5 md:py-5">
        {PIPELINE_NOTE}
      </p>
    </section>
  );
}
