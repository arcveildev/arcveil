import type { Metadata } from "next";
import { GateDemo } from "@/components/gate/GateDemo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GATE_COPY } from "@/data/gate";

export const metadata: Metadata = {
  title: "The semantic gate",
  description:
    "Some mandate clauses are judgement calls, not arithmetic. Arcveil puts them to typesafe/jev and keeps the threshold: the judge answers, the mandate decides.",
};

export default function GatePage() {
  return (
    <div className="pt-28 pb-20 xl:pt-36">
      <section className="flex flex-col border border-border">
        <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
          <span className="label text-fg-muted">{GATE_COPY.label}</span>
          <SectionHeading title="Gate." tagline={GATE_COPY.tagline} />
          <p className="max-w-2xl text-sm leading-140 text-fg-muted">{GATE_COPY.body}</p>
          <p className="max-w-2xl text-2xs leading-140 text-fg-faint">{GATE_COPY.caveat}</p>
        </div>
        <GateDemo />
      </section>
    </div>
  );
}
