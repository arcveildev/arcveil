import type { Metadata } from "next";
import { DefTable } from "@/components/docs/DefTable";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsProse, DocsSection } from "@/components/docs/DocsSection";
import { Note } from "@/components/docs/Note";
import { Snippet } from "@/components/docs/Snippet";
import { NumberedList } from "@/components/ui/NumberedList";
import {
  CANONICAL_RULES,
  CANONICAL_SNIPPET,
  COUNTER_SNIPPET,
  FIELD_ROWS,
  PROOF_ROWS,
  RECEIPTS_PAGE,
  SAMPLE,
} from "@/data/docs/receipts";

export const metadata: Metadata = {
  title: "Receipt format v1",
  description: RECEIPTS_PAGE.lede,
  alternates: { canonical: "/docs/receipts" },
};

export default function ReceiptFormatPage() {
  return (
    <>
      <DocsHeader
        label={RECEIPTS_PAGE.label}
        title={RECEIPTS_PAGE.title}
        tagline={RECEIPTS_PAGE.tagline}
        lede={RECEIPTS_PAGE.lede}
      />

      <DocsSection id="shape" title="One receipt">
        <DocsProse>
          A real one, from the samples the verifier loads. Every hash in it resolves on Arc mainnet.
        </DocsProse>
        <Snippet caption="receipt.json" source={SAMPLE} />
      </DocsSection>

      <DocsSection id="fields" title="Fields">
        <DefTable
          rows={FIELD_ROWS}
          head={["Field", "Meaning"]}
          caption="Every field of receipt format v1, with the type the schema enforces."
        />
        <Note title="What is missing is the point">
          There is no amount, no asset, no balance and no threshold anywhere above. A receipt names
          the clauses that ran; what they were set to stays inside the mandate, which exists on
          chain only as a hash. That holds for semantic clauses too: <code className="font-mono text-xs text-fg">judge</code>{" "}
          records who answered and a commitment to what they were asked, never the question or the
          bar it had to clear.
        </Note>
      </DocsSection>

      <DocsSection id="id" title="The id">
        <DocsProse>
          The id is a sha256 over a canonical serialisation of the body. Two parties must produce
          identical bytes or no hash ever agrees, so the rules are fixed:
        </DocsProse>
        <div className="max-w-2xl">
          <NumberedList items={CANONICAL_RULES.map((text, i) => ({ n: `${i + 1}.`, text }))} />
        </div>
        <Snippet caption="checking it yourself" source={CANONICAL_SNIPPET} />
      </DocsSection>

      <DocsSection id="counter" title="The counter chain">
        <DocsProse>
          Each receipt carries the budget commitment it started from and the one it left behind.
          The next is derived from the previous, the action, and — when an enclave supplies it — a
          commitment to cumulative spend. Consecutive receipts must join, which is what makes a
          dropped receipt visible rather than silent.
        </DocsProse>
        <Snippet caption="@arcveil/sdk" source={COUNTER_SNIPPET} />
        <Note title="Spend is not bound yet">
          The SDK cannot compute a spend commitment: receipts carry no amounts, and the numbers
          would live inside an enclave that is designed, not built. Omit it and the chain still
          binds order and completeness — just not how much was spent.
        </Note>
      </DocsSection>

      <DocsSection id="proof" title="The proof">
        <DocsProse>
          Today a receipt carries an enclave attestation. Version 1 replaces it with a
          zero-knowledge proof and changes nothing else in the format — which is the reason the
          proof is a discriminated union rather than two signature fields.
        </DocsProse>
        <DefTable
          rows={PROOF_ROWS}
          head={["Member", "Meaning"]}
          caption="Fields of the proof union, for attestations and zk proofs."
        />
      </DocsSection>

      <DocsPager href="/docs/receipts" />
    </>
  );
}
