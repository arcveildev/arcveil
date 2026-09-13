import { Hero } from "@/components/sections/Hero";
import { PartnersStrip } from "@/components/sections/PartnersStrip";
import { LabSection } from "@/components/sections/LabSection";
import { InferenceSection } from "@/components/sections/InferenceSection";
import { ComputeSection } from "@/components/sections/ComputeSection";
import { ResearchSection } from "@/components/sections/ResearchSection";
import { CustomerStories } from "@/components/sections/CustomerStories";
import { HiringCta } from "@/components/sections/HiringCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PartnersStrip />
      <LabSection />
      <InferenceSection />
      <ComputeSection />
      <ResearchSection />
      <CustomerStories />
      <HiringCta />
    </>
  );
}
