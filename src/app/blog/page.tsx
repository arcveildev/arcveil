import type { Metadata } from "next";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogList } from "@/components/blog/BlogList";
import { sortedPosts } from "@/data/posts";
import { filterPosts, resolveTab } from "@/lib/blogFilters";

export const metadata: Metadata = {
  title: "Prime Intellect | Blog",
  description: "Latest updates, research and announcements from Prime Intellect.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const { filter } = await searchParams;
  const tab = resolveTab(filter);
  const posts = filterPosts(sortedPosts(), tab);

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-4 pt-28 pb-10 xl:pt-36">
        <span className="label text-fg-muted">Blog</span>
        <h1 className="text-7 leading-120 text-fg md:text-[40px]">
          Latest Updates from
          <br />
          Prime Intellect.
        </h1>
      </header>
      <BlogFilters active={tab} />
      <div className="mb-20">
        <BlogList posts={posts} />
      </div>
    </div>
  );
}
