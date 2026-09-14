import { Hero } from "@/components/home/Hero";
import { Pillars } from "@/components/home/Pillars";
import { Ladder } from "@/components/home/Ladder";
import { Pipeline } from "@/components/home/Pipeline";
import { ThreatModel } from "@/components/home/ThreatModel";
import { Receipts } from "@/components/home/Receipts";
import { WorkedExample } from "@/components/home/WorkedExample";
import { EscapeHatch } from "@/components/home/EscapeHatch";
import { Roadmap } from "@/components/home/Roadmap";
import { Specs } from "@/components/home/Specs";
import { Faq } from "@/components/home/Faq";

export default function HomePage() {
  return (
    <div className="pb-20">
      {/* Claim, then the machine, then the proof, then the failure modes. */}
      <Hero />
      <Pillars />
      <Ladder />
      <Pipeline />
      <ThreatModel />
      <Receipts />
      <WorkedExample />
      <EscapeHatch />
      <Roadmap />
      <Specs />
      <Faq />
    </div>
  );
}
