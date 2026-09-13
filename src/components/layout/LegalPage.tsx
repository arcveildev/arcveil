export type LegalSection = { heading: string; body: string };

const PLACEHOLDER_BODY =
  "This section is a placeholder. The final text will describe the applicable terms, obligations and rights in plain language, and will be reviewed by counsel before publication.";

export const placeholderSections = (headings: readonly string[]): LegalSection[] =>
  headings.map((heading) => ({ heading, body: PLACEHOLDER_BODY }));

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: readonly LegalSection[];
}) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 pt-28 pb-20 xl:pt-36">
      <header className="flex flex-col gap-4">
        <span className="label text-fg-muted">Last updated {updated}</span>
        <h1 className="text-7 leading-120 text-fg md:text-[40px]">{title}</h1>
      </header>
      <div className="flex flex-col border border-border">
        {sections.map((section, i) => (
          <section key={section.heading} className={i > 0 ? "flex flex-col gap-3 border-t border-border p-5" : "flex flex-col gap-3 p-5"}>
            <h2 className="text-h3-title text-fg">
              <span className="mr-2 text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
              {section.heading}
            </h2>
            <p className="text-sm leading-140 text-fg-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
