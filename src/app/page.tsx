import { Thesis } from "@/components/home/Thesis";
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
    <div className="pt-28 pb-20 xl:pt-36">
      {/* Claim, then the machine, then the proof, then the failure modes. */}
      <Thesis />
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
