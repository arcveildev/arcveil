import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { findPost } from "@/data/posts";

const HUGGING_FACE_URL = "https://huggingface.co/PrimeIntellect";

const SIDE_POSTS = [
  { slug: "rlm", title: "Recursive Language Models: the paradigm of 2026", excerpt: "How we plan to manage extremely long contexts." },
  { slug: "intellect-3", title: "INTELLECT-3: A 100B+ MoE trained with large-scale RL", excerpt: "A 100B+ parameter Mixture-of-Experts model trained on our RL stack." },
  { slug: "synthetic-2-release", title: "SYNTHETIC-2 Release", excerpt: "Four million collaboratively generated reasoning traces." },
] as const;

function HuggingFaceMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center bg-fg/8 text-lg leading-none transition-colors group-hover:bg-fg/14"
    >
      🤗
    </span>
  );
}

/** Right column of the Research section: three post rows + Hugging Face link. */
export function ResearchSideList() {
  return (
    <div className="flex flex-col lg:w-[38%]">
      {SIDE_POSTS.map((item) => {
        const post = findPost(item.slug);
        return (
          <Link
            key={item.slug}
            href={`/blog/${item.slug}`}
            className="group flex items-start justify-between gap-4 border-b border-border p-5 transition-colors hover:bg-fg/3"
          >
            <span className="flex flex-col gap-2">
              <span className="text-base leading-130 text-fg">{post?.title ?? item.title}</span>
              <span className="text-sm leading-140 text-fg-muted">{post?.excerpt ?? item.excerpt}</span>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-fg opacity-0 transition-opacity group-hover:opacity-70"
            />
          </Link>
        );
      })}
      <a
        href={HUGGING_FACE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between p-5 transition-colors hover:bg-fg/3"
      >
        <span className="flex flex-col gap-1.5 label text-fg-muted">
          <span>View on</span>
          <span className="text-fg decoration-fg/60 underline-offset-4 group-hover:underline">Hugging Face</span>
        </span>
        <HuggingFaceMark />
      </a>
    </div>
  );
}
