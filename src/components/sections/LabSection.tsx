import { CliLoopFigure } from "@/components/figures/CliLoopFigure";
import { LeaderboardFigure } from "@/components/figures/LeaderboardFigure";
import { LoraFigure } from "@/components/figures/LoraFigure";
import { RewardChart } from "@/components/figures/RewardChart";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTA } from "@/data/site";
import { EnvironmentHub } from "./EnvironmentHub";
import { LabPanel, type LabPanelProps } from "./LabPanel";
import { Testimonials } from "./Testimonials";
import { Toolkit } from "./Toolkit";

const HEADING = { title: "Lab.", tagline: "Post-train your own self improving agents" } as const;

const PANELS: readonly LabPanelProps[] = [
  {
    index: "01",
    fig: 1,
    title: "RL Environments",
    description: "Turn any task into an RL environment. Init, develop, eval, and push with the Prime CLI.",
    items: [
      { n: "1.1", text: "Built on the open-source Verifiers library" },
      { n: "1.2", text: "One CLI loop: init, develop, eval, push" },
      { n: "1.3", text: "2,500+ community environments on the Hub" },
    ],
    cta: CTA.environments,
    figure: <CliLoopFigure />,
    className: "border-b lg:border-r",
  },
  {
    index: "02",
    fig: 2,
    title: "Evaluations",
    description: "Hosted evaluations for you to benchmark the performance of your models.",
    items: [
      { n: "2.1", text: "100+ open-source models" },
      { n: "2.2", text: "No infra, no setup." },
      { n: "2.3", text: "Public leaderboard" },
    ],
    cta: CTA.evaluations,
    figure: <LeaderboardFigure />,
    className: "border-b",
  },
  {
    index: "03",
    fig: 3,
    title: "Hosted Training",
    description: "Train large-scale models optimized for agentic workflows.",
    items: [
      { n: "3.1", text: "Train on 2,500+ RL environments" },
      { n: "3.2", text: "Managed training workflows with full visibility and control" },
      { n: "3.3", text: "Hands on support from our applied research team" },
    ],
    cta: CTA.startTraining,
    figure: <RewardChart />,
    className: "border-b lg:border-r lg:border-b-0",
  },
  {
    index: "04",
    fig: 4,
    title: "Inference",
    description: "Dedicated or serverless inference for your custom models, with native LoRA support.",
    items: [
      { n: "4.1", text: "1-click deployment for any fine-tuned model" },
      { n: "4.2", text: "LoRA adapters served alongside base models" },
      { n: "4.3", text: "Zero config. No setup." },
    ],
    cta: CTA.bookCall,
    figure: <LoraFigure />,
  },
];

function LabHeader() {
  return (
    <div className="relative flex h-80 flex-col gap-8 overflow-hidden border-b border-border px-5 py-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/backgrounds/lab.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover mix-blend-screen saturate-[1.58] brightness-[1.28] contrast-[1.16]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-surface/70 to-transparent" />
      <SectionHeading title={HEADING.title} tagline={HEADING.tagline} />
      <div className="relative z-10 flex items-center gap-1">
        <Button href={CTA.startTraining.href}>{CTA.startTraining.label}</Button>
        <Button href={CTA.bookDemo.href} variant="secondary">
          {CTA.bookDemo.label}
        </Button>
      </div>
    </div>
  );
}

/** Lab: header, the four product panels, customer quotes, the Environment Hub and the OSS toolkit. */
export function LabSection() {
  return (
    <section
      id="lab"
      aria-labelledby="lab-heading"
      className="mb-5 flex flex-col scroll-mt-17 md:mb-8 lg:mb-17.5 xl:scroll-mt-[104px]"
    >
      <h2 id="lab-heading" className="sr-only">
        {HEADING.title} {HEADING.tagline}
      </h2>
      <div className="flex flex-col border border-border">
        <LabHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {PANELS.map((panel) => (
            <LabPanel key={panel.index} {...panel} />
          ))}
        </div>
        <Testimonials />
      </div>
      <EnvironmentHub />
      <Toolkit />
    </section>
  );
}
