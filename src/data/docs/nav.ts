/**
 * The order of the docs, and the only place it is written down: the sidebar,
 * the prev/next footer and the sitemap all read this list.
 */
export type DocsPage = {
  readonly index: string;
  readonly href: string;
  readonly label: string;
  /** One line, shown under the title on the overview page. */
  readonly blurb: string;
};

export const DOCS_PAGES: readonly DocsPage[] = [
  {
    index: "00",
    href: "/docs",
    label: "Overview",
    blurb: "What a receipt is, what is live today, and where to start.",
  },
  {
    index: "01",
    href: "/docs/receipts",
    label: "Receipt format",
    blurb: "Every field of v1, how the id is computed, and what a receipt refuses to carry.",
  },
  {
    index: "02",
    href: "/docs/checks",
    label: "The five checks",
    blurb: "What each check asks, which ones read the chain, and why unknown is a verdict.",
  },
  {
    index: "03",
    href: "/docs/sdk",
    label: "SDK",
    blurb: "Verify receipts, publish a mandate, issue receipts — from Node or the browser.",
  },
  {
    index: "04",
    href: "/docs/chain",
    label: "Arc and contracts",
    blurb: "Chain ids, the deployed registries, the account, and the decimals that bite.",
  },
];

/** Previous and next page for the footer pager. */
export function docsNeighbours(href: string): {
  prev: DocsPage | null;
  next: DocsPage | null;
} {
  const at = DOCS_PAGES.findIndex((page) => page.href === href);
  if (at === -1) return { prev: null, next: null };
  return {
    prev: at > 0 ? DOCS_PAGES[at - 1] : null,
    next: at < DOCS_PAGES.length - 1 ? DOCS_PAGES[at + 1] : null,
  };
}
