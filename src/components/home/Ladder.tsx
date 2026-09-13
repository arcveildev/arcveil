import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { LADDER_SECTION, LADDER_TIERS, type LadderTier } from "@/data/ladder";

/** Hairline dash standing in for a bullet — no icons, no emoji. */
function Marker({ advocated }: { advocated: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("mt-2.5 h-px w-2.5 shrink-0", advocated ? "bg-accent" : "bg-fg-subtle")}
    />
  );
}

function Tier({ tier }: { tier: LadderTier }) {
  const advocated = tier.advocated === true;

  return (
    <article
      className={cn(
        "relative flex flex-col border-b border-border last:border-b-0",
        "lg:border-r lg:border-b-0 lg:last:border-r-0",
      )}
    >
      {advocated ? (
        <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-px bg-accent/70" />
      ) : null}

      <div className="flex min-h-9 items-center border-b border-border px-4 md:px-5">
        {tier.eyebrow ? <span className="label-2xs text-accent">{tier.eyebrow}</span> : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <h3 className="text-xl leading-122 text-fg lg:text-h3-title">
          <span className="opacity-50">{tier.n}</span> {tier.title}
        </h3>

        <p className="text-sm leading-140 text-fg-muted">{tier.what}</p>

        <ul className="mt-1 flex flex-col gap-2">
          {tier.consequences.map((consequence) => (
            <li key={consequence} className="flex gap-2.5 text-sm leading-140 text-fg">
              <Marker advocated={advocated} />
              <span>{consequence}</span>
            </li>
          ))}
        </ul>

        {tier.caveat ? (
          <p className="mt-auto border-t border-border pt-3 text-xs leading-140 text-fg-subtle">
            {tier.caveat}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function Ladder() {
  return (
    <section
      id={LADDER_SECTION.id}
      className="mb-5 flex scroll-mt-17 flex-col border border-border md:mb-8 lg:mb-17.5"
    >
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">{LADDER_SECTION.label}</span>
        <SectionHeading title={LADDER_SECTION.title} tagline={LADDER_SECTION.tagline} />
      </div>

      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-3">
        {LADDER_TIERS.map((tier) => (
          <Tier key={tier.n} tier={tier} />
        ))}
      </div>
    </section>
  );
}
