import type { Metadata } from "next";
import { DefTable } from "@/components/docs/DefTable";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsProse, DocsSection } from "@/components/docs/DocsSection";
import { Note } from "@/components/docs/Note";
import { Snippet } from "@/components/docs/Snippet";
import { Button } from "@/components/ui/Button";
import {
  CHECKS_PAGE,
  CHECK_DOCS,
  EMPTY_STATE_NOTE,
  MEMORY_SNIPPET,
  REPORT_SNIPPET,
  UNKNOWN_NOTE,
  VERDICT_ROWS,
} from "@/data/docs/checks";

export const metadata: Metadata = {
  title: "The five checks",
  description: CHECKS_PAGE.lede,
  alternates: { canonical: "/docs/checks" },
};

export default function ChecksPage() {
  return (
    <>
      <DocsHeader
        label={CHECKS_PAGE.label}
        title={CHECKS_PAGE.title}
        tagline={CHECKS_PAGE.tagline}
        lede={CHECKS_PAGE.lede}
      />

      <DocsSection id="checks" title="What each one asks">
        <ul className="flex flex-col border border-border">
          {CHECK_DOCS.map((check) => (
            <li
              key={check.id}
              className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 md:p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="label-2xs text-fg-faint">{check.n}</span>
                <span className="font-mono text-sm text-fg">{check.id}</span>
                <span className="label-2xs border border-border px-1.5 py-1 text-fg-subtle">
                  {check.where}
                </span>
                <span className="label-2xs text-fg-subtle">{check.verdicts}</span>
              </div>
              <p className="max-w-2xl text-sm leading-140 text-fg">{check.question}</p>
              <p className="max-w-2xl text-sm leading-140 text-fg-muted">{check.detail}</p>
            </li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection id="verdicts" title="Three verdicts">
        <DefTable rows={VERDICT_ROWS} caption="The three verdicts a check can return." />
        <Note title="Nothing fails open" tone="warn">
          {UNKNOWN_NOTE}
        </Note>
      </DocsSection>

      <DocsSection id="report" title="The report">
        <DocsProse>
          Verification returns every verdict, not a boolean — the detail line on a failing check is
          usually the whole answer. Receipts are checked in the order given, so a bundle verifies
          its own linkage.
        </DocsProse>
        <Snippet caption="report shape" source={REPORT_SNIPPET} />
      </DocsSection>

      <DocsSection id="fixtures" title="Checking against fixed state">
        <DocsProse>
          The RPC reader is one implementation of a small interface. Tests use the in-memory one,
          which answers from a state you supply.
        </DocsProse>
        <Snippet caption="chain.test.ts" source={MEMORY_SNIPPET} />
        <Note title="Empty is an answer">{EMPTY_STATE_NOTE}</Note>
      </DocsSection>

      <DocsSection id="try" title="Or just try one">
        <DocsProse>
          The verifier on this site runs exactly these checks against Arc mainnet. Load a sample,
          change one character, and watch which check catches you.
        </DocsProse>
        <div className="flex items-center gap-1 pt-1">
          <Button href="/verify">Open the verifier</Button>
        </div>
      </DocsSection>

      <DocsPager href="/docs/checks" />
    </>
  );
}
