import type { Metadata } from "next";
import { DocsNav } from "@/components/docs/DocsNav";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: { default: `Documentation | ${SITE.name}`, template: `%s | ${SITE.name} docs` },
  description:
    "Receipt format v1, the five checks, the TypeScript SDK, and the contracts Arcveil reads on Arc mainnet.",
};

/**
 * Sidebar on the left from lg up, a horizontal index above the content below
 * it. The bordered container lives here so every page is one stack of sections.
 */
export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="pt-28 pb-20 xl:pt-32">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-6 lg:items-start">
        <aside className="border border-border py-2 lg:py-3">
          <DocsNav />
        </aside>
        <article className="flex min-w-0 flex-col border border-border">{children}</article>
      </div>
    </div>
  );
}
