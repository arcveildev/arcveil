import Link from "next/link";
import { docsNeighbours } from "@/data/docs/nav";

/** Previous / next at the foot of every docs page. */
export function DocsPager({ href }: { href: string }) {
  const { prev, next } = docsNeighbours(href);
  if (prev === null && next === null) return null;

  return (
    <nav
      aria-label="Documentation pages"
      className="grid grid-cols-1 border-t border-border sm:grid-cols-2"
    >
      {prev !== null ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1.5 border-b border-border p-4 transition-colors hover:bg-fg/5 sm:border-b-0 sm:border-r md:p-5"
        >
          <span className="label-2xs text-fg-faint">Previous</span>
          <span className="text-sm text-fg-muted transition-colors group-hover:text-fg">
            {prev.label}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block sm:border-r sm:border-border" />
      )}

      {next !== null && (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1.5 p-4 text-right transition-colors hover:bg-fg/5 md:p-5"
        >
          <span className="label-2xs text-fg-faint">Next</span>
          <span className="text-sm text-fg-muted transition-colors group-hover:text-fg">
            {next.label}
          </span>
        </Link>
      )}
    </nav>
  );
}
