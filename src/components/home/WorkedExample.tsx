import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WORKED_EXAMPLE } from "@/data/workedExample";

/**
 * "One action." — a single agent action at 02:14 told three ways, plus the
 * measurable cost of the receipt it left behind. The disclaimer at the top is
 * part of the product: these are testnet-shaped figures, not telemetry.
 */
export function WorkedExample() {
  return (
    <section
      id="example"
      className="mb-5 flex flex-col scroll-mt-17 border border-border md:mb-8 lg:mb-17.5"
    >
      <p className="label border-b border-border px-4 py-3 leading-140 text-fg-muted md:px-5">
        {WORKED_EXAMPLE.disclaimer}
      </p>

      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">{WORKED_EXAMPLE.eyebrow}</span>
        <SectionHeading title={WORKED_EXAMPLE.title} tagline={WORKED_EXAMPLE.tagline} />
      </div>

      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-3">
        {WORKED_EXAMPLE.views.map((view) => (
          <article
            key={view.n}
            className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 md:p-5 lg:border-r lg:border-b-0 lg:last:border-r-0"
          >
            <p className="text-xl leading-122 text-fg lg:text-h3-title">
              <span className="opacity-50">{view.n}</span> {view.title}
            </p>
            <p className="text-sm leading-140 text-fg-muted">{view.body}</p>
          </article>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border md:grid-cols-3 lg:grid-cols-5">
        {WORKED_EXAMPLE.figures.map((figure, index) => (
          <div
            key={figure.label}
            className={cn(
              "flex flex-col gap-2 bg-surface px-4 py-4 md:px-5",
              // the strip has five cells, so the last one fills the short row
              index === WORKED_EXAMPLE.figures.length - 1 && "col-span-2 lg:col-span-1",
            )}
          >
            <dt className="label-2xs leading-140 text-fg-subtle">{figure.label}</dt>
            <dd className="font-mono text-sm leading-130 break-words text-fg">{figure.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
