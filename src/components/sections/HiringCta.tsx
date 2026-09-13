import { Button } from "@/components/ui/Button";
import { SITE } from "@/data/site";

const COPY = {
  label: "We're Hiring",
  title: "Join Prime Intellect",
  body: "We are seeking the most ambitious developers to join our team — in San Francisco or remotely. Please send us examples of your exceptional work.",
  cta: "Join us",
} as const;

export function HiringCta() {
  return (
    <section
      aria-labelledby="hiring-title"
      className="mb-5 flex flex-col justify-between gap-8 border border-border p-5 md:mb-8 md:p-8 lg:mb-17.5 lg:flex-row lg:items-end"
    >
      <div className="flex flex-col items-start gap-3">
        <span className="label text-fg-muted">{COPY.label}</span>
        <h2 id="hiring-title" className="text-7 text-fg">
          {COPY.title}
        </h2>
        <p className="max-w-xl text-sm leading-140 text-fg-muted">{COPY.body}</p>
      </div>
      <Button href={SITE.careersUrl} aria-label={`${COPY.cta} — ${SITE.openRoles} open roles`}>
        {COPY.cta}
        <span className="flex items-center bg-on-primary/12 px-1 py-0.5 text-[0.68rem] leading-none text-on-primary/70">
          {SITE.openRoles}
        </span>
      </Button>
    </section>
  );
}
