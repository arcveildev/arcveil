import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ESCAPE_HATCH } from "@/data/escapeHatch";

/**
 * "If we disappear." — what still works when this company is unreachable, and
 * the one thing that does not. Plain-spoken on purpose: the caveat and the
 * not-shipped status line stay in the section.
 */
export function EscapeHatch() {
  return (
    <section
      id="escape"
      className="mb-5 flex flex-col scroll-mt-17 border border-border md:mb-8 lg:mb-17.5"
    >
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">{ESCAPE_HATCH.eyebrow}</span>
        <SectionHeading title={ESCAPE_HATCH.title} tagline={ESCAPE_HATCH.tagline} />
      </div>

      <ol className="grid grid-cols-1 border-t border-border lg:grid-cols-3">
        {ESCAPE_HATCH.points.map((point) => (
          <li
            key={point.n}
            className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 md:p-5 lg:border-r lg:border-b-0 lg:last:border-r-0"
          >
            <p className="text-xl leading-122 text-fg lg:text-h3-title">
              <span className="opacity-50">{point.n}</span> {point.title}
            </p>
            <p className="text-sm leading-140 text-fg-muted">{point.body}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-6 border-t border-border px-4 py-6 md:px-5 md:py-8">
        <p className="max-w-2xl text-sm leading-140 text-fg-muted">{ESCAPE_HATCH.caveat}</p>
        <Button href={ESCAPE_HATCH.cta.href}>{ESCAPE_HATCH.cta.label}</Button>
        <p className="label leading-140 text-fg-subtle">{ESCAPE_HATCH.status}</p>
      </div>
    </section>
  );
}
