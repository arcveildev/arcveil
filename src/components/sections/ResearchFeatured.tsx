import Link from "next/link";
import { ArrowSlide } from "@/components/ui/Button";
import { findPost } from "@/data/posts";
import { SITE } from "@/data/site";
import { ResearchSplash } from "./ResearchSplash";

const FEATURED_SLUG = "prime-agent";
const FALLBACK = {
  title: "Prime Agent: A self-improving RLM agent",
  excerpt: "A self-improving agent harness built around RLMs and the Continual Harness.",
};

/** Big left card of the Research section: full-card link with a terminal-style splash. */
export function ResearchFeatured() {
  const post = findPost(FEATURED_SLUG);
  const title = post?.title ?? FALLBACK.title;
  const excerpt = post?.excerpt ?? FALLBACK.excerpt;

  return (
    <Link
      href={`/blog/${FEATURED_SLUG}`}
      className="group relative flex min-h-95 flex-1 flex-col justify-end overflow-hidden border-b border-border bg-research-bg md:min-h-120 lg:border-r lg:border-b-0"
    >
      <ResearchSplash />
      <div className="relative z-10 flex flex-col items-start gap-3 p-5">
        <span className="label text-fg-muted">Research</span>
        <h3 className="max-w-lg text-h3-title text-fg">{title}</h3>
        <p className="max-w-md text-sm leading-140 text-fg-muted">{excerpt}</p>
        <code className="mt-1 block max-w-full overflow-x-auto whitespace-nowrap bg-surface/60 px-2.5 py-2 font-mono text-xs text-fg/80 hairline scrollbar-none">
          <span className="text-accent">$</span> {SITE.installCommand}
        </code>
        <span className="mt-2 inline-flex items-center gap-1 font-favorit text-xs leading-none uppercase text-fg">
          Read more
          <ArrowSlide />
        </span>
      </div>
    </Link>
  );
}
