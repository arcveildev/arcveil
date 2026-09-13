import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_ITEMS, FAQ_SECTION, type FaqItem } from "@/data/faq";

/**
 * Open/closed marker drawn from two hairlines: a plus that turns into a cross.
 * Driven entirely by the parent <details open> state, so the section needs no
 * client JavaScript.
 */
function DisclosureMarker() {
  return (
    <span
      aria-hidden
      className="relative mt-1 block h-2.5 w-2.5 shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
    >
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-fg-subtle" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-fg-subtle transition-opacity duration-200 group-open:opacity-0 motion-reduce:transition-none" />
    </span>
  );
}

function Question({ item }: { item: FaqItem }) {
  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-4 py-4 md:px-5 md:py-5 [&::-webkit-details-marker]:hidden">
        <span className="font-favorit text-sm leading-130 text-fg uppercase">
          {item.question}
        </span>
        <DisclosureMarker />
      </summary>

      <p className="max-w-3xl px-4 pb-5 text-sm leading-140 text-fg-muted md:px-5 md:pb-6">
        {item.answer}
      </p>
    </details>
  );
}

export function Faq() {
  return (
    <section
      id={FAQ_SECTION.id}
      className="mb-5 flex scroll-mt-17 flex-col border border-border md:mb-8 lg:mb-17.5"
    >
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">{FAQ_SECTION.label}</span>
        <SectionHeading title={FAQ_SECTION.title} tagline={FAQ_SECTION.tagline} />
      </div>

      <div className="border-t border-border">
        {FAQ_ITEMS.map((item) => (
          <Question key={item.question} item={item} />
        ))}
      </div>
    </section>
  );
}
