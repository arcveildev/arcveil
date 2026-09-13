import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReceiptVerifier } from "@/components/verify/ReceiptVerifier";

const COPY = {
  label: "Proof, not adjectives",
  tagline: "Check one right now. Nothing leaves this tab.",
  body:
    "Everything above describes a machine that is still being built. This part is not a description: load a sample, edit a character of it, and watch the checks disagree with you.",
} as const;

export function Receipts() {
  return (
    <section id="receipts" className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5">
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">{COPY.label}</span>
        <SectionHeading title="Receipts." tagline={COPY.tagline} />
        <p className="max-w-2xl text-sm leading-140 text-fg-muted">{COPY.body}</p>
        <div className="flex items-center gap-1 pt-1">
          <Button href="/verify">Open the full verifier</Button>
        </div>
      </div>
      <ReceiptVerifier />
    </section>
  );
}
