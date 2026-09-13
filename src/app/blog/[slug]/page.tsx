import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { findPost, formatPostDate, POSTS } from "@/data/posts";
import { SITE } from "@/data/site";

export const generateStaticParams = () => POSTS.map((post) => ({ slug: post.slug }));

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return { title: `${SITE.name} | Not found` };
  return {
    title: `${post.title} | ${SITE.name}`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 pt-28 pb-20 xl:pt-36">
      <div className="flex items-center gap-3 label text-fg-muted">
        <span className="bg-fg/10 px-1.5 py-1 text-fg/75">{post.category}</span>
        <time dateTime={post.date} className="tabular-nums">
          {formatPostDate(post.date)}
        </time>
      </div>
      <h1 className="text-7 leading-120 text-fg md:text-[40px]">{post.title}</h1>
      <p className="text-lg leading-140 text-fg-muted">{post.excerpt}</p>
      {post.cover && (
        <div className="overflow-hidden hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="aspect-video w-full object-cover" />
        </div>
      )}
      <ArticleBody post={post} />
    </article>
  );
}
