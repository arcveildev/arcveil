import { Button } from "@/components/ui/Button";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReceiptVerifier } from "@/components/verify/ReceiptVerifier";

const COPY = {
  label: "Proof, not adjectives",
  tagline: "Check one right now. Nothing leaves this tab.",
  body:
    "Everything above describes a machine that is still being built. This part is not a description: load a sample, edit a character of it, and watch the checks disagree with you. Three of the five are live reads of Arc mainnet — the mandate, the budget chain, and the transaction itself.",
} as const;

export function Receipts() {
  return (
    <section id="receipts" className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5">
      <div className="relative flex flex-col gap-4 overflow-hidden px-4 py-6 md:px-5 md:py-8">
        <SectionBackdrop src="/backgrounds/receipts-bg.webp" className="object-right" />
        <span className="relative z-10 label text-fg-muted">{COPY.label}</span>
        <SectionHeading className="relative z-10" title="Receipts." tagline={COPY.tagline} />
        <p className="relative z-10 max-w-2xl text-sm leading-140 text-fg-muted">{COPY.body}</p>
        <div className="relative z-10 flex items-center gap-1 pt-1">
          <Button href="/verify">Open the full verifier</Button>
        </div>
      </div>
      <ReceiptVerifier />
    </section>
  );
}
