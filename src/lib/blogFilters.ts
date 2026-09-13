import type { Post, PostCategory } from "@/data/posts";

export const BLOG_TABS = ["All", "Case Studies", "Announcements", "Partnerships", "Research"] as const;
export type BlogTab = (typeof BLOG_TABS)[number];

const TAB_TO_CATEGORY: Readonly<Record<Exclude<BlogTab, "All">, PostCategory>> = {
  "Case Studies": "Case Study",
  Announcements: "Announcements",
  Partnerships: "Partnerships",
  Research: "Research",
};

const isBlogTab = (value: string): value is BlogTab => (BLOG_TABS as readonly string[]).includes(value);

/** Normalise an arbitrary `?filter=` value (string, array or undefined) to a known tab. */
export const resolveTab = (raw: string | string[] | undefined): BlogTab => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && isBlogTab(value) ? value : "All";
};

export const tabHref = (tab: BlogTab): string => (tab === "All" ? "/blog" : `/blog?filter=${encodeURIComponent(tab)}`);

export const filterPosts = (posts: readonly Post[], tab: BlogTab): Post[] =>
  tab === "All" ? [...posts] : posts.filter((post) => post.category === TAB_TO_CATEGORY[tab]);
