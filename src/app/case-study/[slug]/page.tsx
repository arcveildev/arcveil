import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CASE_STUDIES, findCaseStudy } from "@/data/caseStudies";
import { CTA, SITE } from "@/data/site";

export const generateStaticParams = () => CASE_STUDIES.map((study) => ({ slug: study.slug }));

export async function generateMetadata({ params }: PageProps<"/case-study/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) return { title: `${SITE.name} | Not found` };
  return { title: `${study.title} | ${SITE.name}`, description: study.summary };
}

export default async function CaseStudyPage({ params }: PageProps<"/case-study/[slug]">) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 pt-28 pb-20 xl:pt-36">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 label text-fg-muted">
          <span className="border border-fg/22 p-1">{study.category}</span>
          <span className="text-fg">{study.company}</span>
        </div>
        <h1 className="text-7 leading-120 text-fg md:text-[40px]">{study.title}</h1>
      </header>

      <blockquote className="flex flex-col gap-4 border-l border-accent pl-5">
        <p className="text-lg leading-140 text-fg/80">&ldquo;{study.quote}&rdquo;</p>
        <footer className="flex flex-col gap-1 label text-fg-muted">
          <span className="text-fg">{study.author}</span>
          <span>{study.role}</span>
        </footer>
      </blockquote>

      <dl className="grid grid-cols-3 border border-border">
        {study.results.map((result, i) => (
          <div key={result.label} className={i > 0 ? "flex flex-col gap-2 border-l border-border p-5" : "flex flex-col gap-2 p-5"}>
            <dd className="text-7 text-fg">{result.value}</dd>
            <dt className="label-2xs text-fg-muted">{result.label}</dt>
          </div>
        ))}
      </dl>

      <p className="text-base leading-140 text-fg/80">{study.summary}</p>

      <div className="flex items-center gap-1 border-t border-border pt-8">
        <Button href={CTA.startTraining.href}>{CTA.startTraining.label}</Button>
        <Button href={CTA.bookCall.href} variant="secondary">
          {CTA.bookCall.label}
        </Button>
      </div>
    </article>
  );
}
