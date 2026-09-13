import type { Post } from "@/data/posts";
import { PostCard } from "./PostCard";

export function BlogList({ posts }: { posts: readonly Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="border border-border p-10 text-center text-sm text-fg-muted">No posts in this category yet.</div>
    );
  }
  return (
    <div className="grid grid-cols-1 border border-border border-t-0 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          className="md:last:border-r md:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0"
        />
      ))}
    </div>
  );
}
