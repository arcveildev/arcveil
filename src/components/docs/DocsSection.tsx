import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * One section of a docs page: an anchored heading and its body. The id is what
 * the in-page links and any deep link from a post point at.
 */
export function DocsSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "flex flex-col gap-4 border-b border-border px-4 py-6 scroll-mt-21 last:border-b-0 md:px-5 md:py-8",
        className,
      )}
    >
      <h2 className="text-h3-title leading-122 text-fg">
        <a href={`#${id}`} className="transition-colors hover:text-accent">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

/** Body copy inside a section — one measure, muted, never full width. */
export function DocsProse({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-sm leading-140 text-fg-muted">{children}</p>;
}
