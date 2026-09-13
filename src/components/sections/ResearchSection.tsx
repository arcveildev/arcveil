import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LatestResearch } from "./LatestResearch";
import { ResearchFeatured } from "./ResearchFeatured";
import { ResearchSideList } from "./ResearchSideList";

const RESEARCH_HREF = "/blog?filter=Research";

export function ResearchSection() {
  return (
    <section
      id="research"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5 xl:scroll-mt-[104px]"
    >
      <div className="flex flex-col gap-6 border-b border-border p-5 lg:min-h-[136px]">
        <SectionHeading title="Research." tagline="Our Contributions to the Frontier of Open-Source AI" />
        <div className="relative z-10 flex items-center gap-1">
          <Button href={RESEARCH_HREF}>Discover</Button>
        </div>
      </div>

      <div className="flex flex-col border-b border-border lg:flex-row">
        <ResearchFeatured />
        <ResearchSideList />
      </div>

      <LatestResearch />
    </section>
  );
}
