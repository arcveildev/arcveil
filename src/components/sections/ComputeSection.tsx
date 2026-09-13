import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComputeFeatureList, type ComputeFeature } from "@/components/figures/ComputeFeatureList";
import { GpuListFigure } from "@/components/figures/GpuListFigure";
import { IdleCalculator } from "@/components/figures/IdleCalculator";
import { CTA } from "@/data/site";

const ON_DEMAND_FEATURES: readonly ComputeFeature[] = [
  {
    n: "1.1",
    title: "SLURM, K8s Orchestration",
    description: "Orchestrate dynamic workloads with enterprise-grade scheduling and container automation.",
  },
  {
    n: "1.2",
    title: "Infiniband Networking",
    description: "Scale distributed training with high-bandwidth interconnects across nodes.",
  },
  {
    n: "1.3",
    title: "Grafana Monitoring Dashboards",
    description: "Visualize metrics in real time with customizable dashboards for full system observability.",
  },
];

const RESERVED_FEATURES: readonly ComputeFeature[] = [
  {
    n: "1.1",
    title: "Get quotes from 50+ datacenters within 24 hours",
    description: "One request, parallel bids for options, from H100, H200, to B200, B300, GB300 NVL72",
  },
  {
    n: "1.2",
    title: "Re-sell idle GPUs back to our spot market",
    description:
      "Resell idle node on our spot market or put on our spot market with no manual ops. Reclaim capacity instantly when you need it",
  },
  {
    n: "1.3",
    title: "Direct assistance from our research and infra engineering team",
    description: "Dedicated solutions engineer from cluster bring-up through steady-state",
  },
];

export function ComputeSection() {
  return (
    <section
      id="compute"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5 xl:scroll-mt-[104px]"
    >
      <div className="relative flex h-90 flex-col items-start gap-8 overflow-hidden border-b border-border p-5">
        <div className="pointer-events-none absolute inset-0 mix-blend-lighten" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/backgrounds/compute-bg.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center saturate-[1.58] brightness-[1.28] contrast-[1.16]"
          />
        </div>
        <SectionHeading
          title="Compute."
          tagline="Find reliable compute operated globally from a single GPU to largest clusters."
          className="max-w-170"
        />
        <div className="relative z-10 flex items-center gap-1">
          <Button href={CTA.findCompute.href}>FIND COMPUTE</Button>
          <Button href={CTA.bookDemo.href} variant="secondary">
            BOOK A DEMO
          </Button>
        </div>
      </div>

      {/* Row A: On demand + GPU list */}
      <div className="flex flex-col border-b border-border lg:grid lg:min-h-151.5 lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 border-b border-border p-5 font-sans lg:border-r lg:border-b-0">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-h3-title leading-122 text-fg">On demand</p>
              <p className="max-w-115 text-h3-title leading-122 text-fg-muted">
                Instant access to 1-256 GPUs.
                <br />
                Use your GPUs across clouds in a single platform.
              </p>
            </div>
            <ComputeFeatureList items={ON_DEMAND_FEATURES} />
          </div>
          <Button href={CTA.findCompute.href}>GET COMPUTE</Button>
        </div>
        <GpuListFigure />
      </div>

      {/* Row B: Liquid Reserved Clusters + idle calculator */}
      <div className="flex flex-col lg:grid lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 border-b border-border p-5 font-sans lg:border-r lg:border-b-0">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-h3-title leading-122 text-fg">Liquid Reserved Clusters</p>
              <p className="max-w-115 leading-122 text-fg-muted">
                Request large-scale clusters from 50+ providers.
                <br />
                Sell-back idle GPUs to our spot market.
              </p>
            </div>
            <ComputeFeatureList items={RESERVED_FEATURES} />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button href={CTA.getQuote.href}>GET A QUOTE</Button>
            <Button href={CTA.bookCall.href} variant="secondary">
              BOOK A CALL
            </Button>
          </div>
        </div>
        <IdleCalculator />
      </div>
    </section>
  );
}
