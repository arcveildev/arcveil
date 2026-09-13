import { HOME_PILLARS } from "@/data/home";

export function Pillars() {
  return (
    <section className="mb-5 grid grid-cols-1 border-x border-b border-border md:mb-8 lg:mb-17.5 lg:grid-cols-3">
      {HOME_PILLARS.map((pillar) => (
        <article
          key={pillar.n}
          className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 md:p-5 lg:border-r lg:border-b-0 lg:last:border-r-0"
        >
          <p className="text-xl leading-122 text-fg lg:text-h3-title">
            <span className="opacity-50">{pillar.n}</span> {pillar.title}
          </p>
          <p className="text-sm leading-140 text-fg-muted">{pillar.body}</p>
        </article>
      ))}
    </section>
  );
}
