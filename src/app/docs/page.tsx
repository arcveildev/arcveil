import type { Metadata } from "next";
import Link from "next/link";
import { DefTable } from "@/components/docs/DefTable";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsProse, DocsSection } from "@/components/docs/DocsSection";
import { Note } from "@/components/docs/Note";
import { Snippet } from "@/components/docs/Snippet";
import {
  LIVE_ROWS,
  NOT_LIVE_ROWS,
  OVERVIEW,
  QUICKSTART,
  START_CARDS,
  VOCABULARY,
} from "@/data/docs/overview";

export const metadata: Metadata = {
  title: "Documentation",
  description: OVERVIEW.lede,
  alternates: { canonical: "/docs" },
};

export default function DocsOverviewPage() {
  return (
    <>
      <DocsHeader
        label={OVERVIEW.label}
        title={OVERVIEW.title}
        tagline={OVERVIEW.tagline}
        lede={OVERVIEW.lede}
      />

      <DocsSection id="start" title="Start here">
        <div className="grid grid-cols-1 border border-border md:grid-cols-3">
          {START_CARDS.map((card) => (
            <Link
              key={card.n}
              href={card.href}
              className="group flex flex-col gap-3 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-fg/5 md:border-b-0 md:border-r md:p-5 md:last:border-r-0"
            >
              <span className="label-2xs text-fg-faint">{card.n}</span>
              <span className="text-h3-title leading-122 text-fg">{card.title}</span>
              <span className="text-sm leading-140 text-fg-muted">{card.body}</span>
              <span className="label-2xs mt-auto pt-2 text-accent">{card.cta} →</span>
            </Link>
          ))}
        </div>
      </DocsSection>

      <DocsSection id="verify-in-code" title="Verify a receipt in code">
        <DocsProse>
          The same five checks the site runs, in about ten lines. Two are local crypto; three read
          Arc mainnet over plain JSON-RPC, which allows cross-origin requests — so this works
          unchanged in a browser.
        </DocsProse>
        <Snippet caption="verify.ts" source={QUICKSTART} />
        <Note title="Not on npm yet">
          <code className="font-mono text-xs text-fg">@arcveildev/sdk</code> is not published. Until it
          is, it is a workspace package in this repository — build it with{" "}
          <code className="font-mono text-xs text-fg">pnpm sdk:build</code> and depend on it with{" "}
          <code className="font-mono text-xs text-fg">workspace:*</code>, the way this site does.
        </Note>
      </DocsSection>

      <DocsSection id="live" title="What is live">
        <DocsProse>
          Everything in this table exists and can be pointed at. Anything not in it is either in the
          table below or not built.
        </DocsProse>
        <DefTable rows={LIVE_ROWS} caption="Parts of Arcveil that are deployed and usable today." />
      </DocsSection>

      <DocsSection id="not-live" title="What is not">
        <DocsProse>
          Named here rather than left out, because a developer who finds this list late has been
          misled by everything before it.
        </DocsProse>
        <DefTable rows={NOT_LIVE_ROWS} caption="Parts of Arcveil that are designed but not built." />
      </DocsSection>

      <DocsSection id="vocabulary" title="Vocabulary">
        <DefTable rows={VOCABULARY} caption="The five terms the rest of the docs assume." />
      </DocsSection>

      <DocsPager href="/docs" />
    </>
  );
}
