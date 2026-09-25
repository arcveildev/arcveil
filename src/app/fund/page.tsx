import type { Metadata } from "next";
import { FundAccount } from "@/components/fund/FundAccount";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Fund an account",
  description: "Top up an Arcveil account with a card or Apple Pay through Circle's Onramp. Sandbox demo.",
  // A sandbox demo, not a product page: keep it out of search until it is real.
  robots: { index: false, follow: false },
};

const COPY = {
  label: "Onramp · Circle sandbox",
  tagline: "Fiat in. The mandate still holds.",
  body:
    "Circle's Onramp turns a card, Apple Pay or a bank transfer into USDC on Arc. Here it can only pay into an Arcveil account, and only for someone who signs with one of that account's three keys — the account itself is asked, on Arc mainnet. Whatever arrives is still spent under the mandate, never past it.",
  boundary:
    "This is Circle's sandbox: no real money moves and nothing is delivered on mainnet. Circle runs identity checks inside the widget, so money that comes in this way is tied to a person on Circle's side, even though the chain does not show it.",
} as const;

export default function FundPage() {
  return (
    <div className="pt-28 pb-20 xl:pt-36">
      <section className="flex flex-col border border-border">
        <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
          <span className="label text-fg-muted">{COPY.label}</span>
          <SectionHeading title="Fund." tagline={COPY.tagline} />
          <p className="max-w-2xl text-sm leading-140 text-fg-muted">{COPY.body}</p>
          <p className="max-w-2xl border-l-2 border-primary pl-3 text-sm leading-140 text-fg">{COPY.boundary}</p>
        </div>
        <FundAccount />
      </section>
    </div>
  );
}
