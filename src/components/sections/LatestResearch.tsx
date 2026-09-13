import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/Button";
import { sortedPosts } from "@/data/posts";

const LATEST_COUNT = 3;
const RESEARCH_HREF = "/blog?filter=Research";

/** "Latest Research." header + three most recent Research posts. */
export function LatestResearch() {
  const latest = sortedPosts()
    .filter((post) => post.category === "Research")
    .slice(0, LATEST_COUNT);

  return (
    <div className="mt-5 flex flex-col lg:mt-10">
      <div className="flex items-center justify-between px-5 py-5 lg:py-6">
        <h3 className="text-h3-title text-fg">Latest Research.</h3>
        <Button href={RESEARCH_HREF}>See all</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {latest.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
