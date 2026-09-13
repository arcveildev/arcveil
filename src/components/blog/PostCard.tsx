import Link from "next/link";
import { formatPostDate, type Post } from "@/data/posts";
import { cn } from "@/lib/cn";

/** Placeholder cover: large faint mono glyph of the first letter plus a thin accent line. */
function CoverPlaceholder({ title }: { title: string }) {
  const glyph = title.trim().charAt(0).toUpperCase() || "P";
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-end bg-surface-card">
      <span className="absolute -top-4 right-3 select-none font-mono text-[10rem] leading-none text-fg/6">
        {glyph}
      </span>
      <span className="absolute inset-x-5 bottom-5 h-px bg-accent/50" />
      <span className="absolute bottom-5 left-5 size-1.5 -translate-y-px bg-accent" />
    </div>
  );
}

export function PostCard({ post, className }: { post: Post; className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn("block border-t border-border md:border-r md:last:border-r-0", className)}
    >
      <article className="flex h-[22rem] w-full cursor-pointer flex-col overflow-hidden transition-opacity hover:opacity-90 md:h-[23rem] lg:h-[24rem]">
        <div className="relative box-border h-45 shrink-0 overflow-hidden border-b border-border md:h-50 lg:h-54">
          {post.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <CoverPlaceholder title={post.title} />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex min-w-0 items-start justify-between gap-3 label text-fg-muted">
            <span className="shrink-0 bg-fg/10 px-1.5 py-1 text-fg/75">{post.category}</span>
            <time dateTime={post.date} className="shrink-0 pt-1 text-right tabular-nums">
              {formatPostDate(post.date)}
            </time>
          </div>
          <h3 className="line-clamp-3 text-base leading-130 text-fg lg:text-lg">{post.title}</h3>
        </div>
      </article>
    </Link>
  );
}
