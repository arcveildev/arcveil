"use client";

import Link from "next/link";
import { BLOG_TABS, tabHref, type BlogTab } from "@/lib/blogFilters";
import { cn } from "@/lib/cn";

export function BlogFilters({ active }: { active: BlogTab }) {
  return (
    <nav aria-label="Blog categories" className="flex gap-6 overflow-x-auto scrollbar-none">
      {BLOG_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={tabHref(tab)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 border-b pb-2 label transition-colors",
              isActive ? "border-fg text-fg" : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {tab}
          </Link>
        );
      })}
    </nav>
  );
}
