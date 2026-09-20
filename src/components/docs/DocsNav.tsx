"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_PAGES } from "@/data/docs/nav";
import { cn } from "@/lib/cn";

/**
 * The docs index. Sticky on desktop, a horizontal scroller above the content on
 * small screens — client-only because the active page is read from the path.
 */
export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="lg:sticky lg:top-21">
      <p className="label hidden px-3 pb-3 text-fg-faint lg:block">Contents</p>
      <ul className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col lg:gap-0 lg:overflow-visible">
        {DOCS_PAGES.map((page) => {
          const active = pathname === page.href;
          return (
            <li key={page.href} className="shrink-0 lg:shrink">
              <Link
                href={page.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-9 items-center gap-2.5 whitespace-nowrap px-3 font-favorit text-xs uppercase transition-colors duration-150",
                  active ? "bg-fg/10 text-fg" : "text-fg-subtle hover:bg-fg/5 hover:text-fg-muted",
                )}
              >
                <span className={cn(active ? "text-accent" : "opacity-45")}>{page.index}</span>
                <span>{page.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
