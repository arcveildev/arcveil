import type { Metadata } from "next";

import { BridgeApp } from "@/components/bridge/BridgeApp";
import { Ledger } from "@/components/bridge/Ledger";
import { BridgeProviders } from "@/components/bridge/Providers";
import { Steps } from "@/components/bridge/Steps";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BRIDGE_COPY } from "@/data/bridge";

export const metadata: Metadata = {
  title: "The private bridge",
  description:
    "Bridge USDC into Arc through a shielded pool. The deposit is public, the withdrawal is public, and which deposit paid which withdrawal is not.",
};

export default function BridgePage() {
  return (
    <div className="pt-28 pb-20 xl:pt-36">
      <section className="flex flex-col border border-border">
        <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
          <span className="label text-fg-muted">{BRIDGE_COPY.label}</span>
          <SectionHeading title={BRIDGE_COPY.title} tagline={BRIDGE_COPY.tagline} />
          <p className="max-w-2xl text-sm leading-140 text-fg-muted">{BRIDGE_COPY.body}</p>
          <p className="max-w-2xl text-2xs leading-140 text-fg-faint">{BRIDGE_COPY.caveat}</p>
        </div>

        <Steps />

        <BridgeProviders>
          <BridgeApp />
        </BridgeProviders>

        <Ledger />
      </section>
    </div>
  );
}
