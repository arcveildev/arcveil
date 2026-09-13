import type { Metadata } from "next";
import { ClaimPanels } from "@/components/verify/ClaimPanels";
import { ReceiptVerifier } from "@/components/verify/ReceiptVerifier";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Verify a receipt",
  description:
    "Paste a receipt from an agent run and check it here: body integrity, policy signature, mandate on chain, budget chain and settlement.",
};

const COPY = {
  label: "Receipt format v1",
  tagline: "Check what an agent did — without seeing what it saw.",
  body:
    "Every action an agent takes under a mandate produces a receipt. It proves the action stayed inside the mandate without revealing the mandate, the balances, or the reasoning. Five checks, all of them run in your browser.",
} as const;

export default function VerifyPage() {
  return (
    <div className="pt-28 pb-20 xl:pt-36">
      <section className="flex flex-col border border-border">
        <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
          <span className="label text-fg-muted">{COPY.label}</span>
          <SectionHeading title="Verify." tagline={COPY.tagline} />
          <p className="max-w-2xl text-sm leading-140 text-fg-muted">{COPY.body}</p>
        </div>
        <ReceiptVerifier />
        <ClaimPanels />
      </section>
    </div>
  );
}
