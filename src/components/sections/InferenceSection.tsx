import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTA } from "@/data/site";

const DOCS_INFERENCE_URL = "https://docs.primeintellect.ai/inference/overview";

const INTRO =
  "Dedicated inference, pay-per-token LoRA serving, and serverless APIs-all in one loop that turns traces into better models and cheaper intelligence your business owns.";

const OFFERINGS = [
  {
    index: "01",
    title: "Dedicated deploys",
    body: "Production serving capacity optimized around customer use cases, private routing, latency, reliability, and custom model requirements.",
    diagram: "/backgrounds/dedicated-inference.svg",
    diagramClass: "max-h-full w-auto max-w-[210px]",
  },
  {
    index: "02",
    title: "LoRA inference",
    body: "Pay-per-token serving for adapters trained with Lab, so teams can deploy customized behavior without copying the base model.",
    diagram: "/backgrounds/lora-hot-swapping.svg",
    diagramClass: "max-h-full w-auto max-w-full",
  },
  {
    index: "03",
    title: "Serverless APIs",
    body: "OpenAI-compatible access to base models with efficient routing, selected first-party hosting, and a path into dedicated capacity.",
    diagram: "/backgrounds/inference-stack.svg",
    diagramClass: "max-h-full w-auto max-w-[240px]",
  },
] as const;

const CLOSING = {
  title: "Turn production traces into the next training run.",
  body: "Capture traces, cluster failures, convert high-value misses into environments and evals, then train adapters that make the production model cheaper, more reliable, and more specific to your business.",
} as const;

export function InferenceSection() {
  return (
    <section
      id="inference"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5 xl:scroll-mt-[104px]"
    >
      <div className="relative flex h-80 flex-col gap-8 overflow-hidden border-b border-border p-5 lg:h-90">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/backgrounds/inference-header.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center saturate-[1.58] brightness-[1.28] contrast-[1.16]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent"
        />
        <SectionHeading
          title="Inference."
          tagline="Serve open-source and custom models through the same stack that trains them."
          className="max-w-[64rem]"
        />
        <div className="relative z-10 flex flex-wrap items-center gap-1">
          <Button href={CTA.bookCall.href}>Book A Call</Button>
          <Button href={DOCS_INFERENCE_URL} variant="secondary">
            Learn More
          </Button>
        </div>
      </div>

      <div className="border-b border-border p-5">
        <p className="max-w-3xl font-sans text-h3-title text-fg-muted">{INTRO}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {OFFERINGS.map((offer, i) => (
          <article
            key={offer.index}
            className={
              i < OFFERINGS.length - 1
                ? "flex flex-col gap-4 border-b border-border p-5 md:border-b-0 md:border-r"
                : "flex flex-col gap-4 p-5"
            }
          >
            <span className="label-2xs text-fg-faint">{offer.index}</span>
            <div className="flex h-50 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={offer.diagram} alt="" aria-hidden="true" className={`object-contain opacity-90 ${offer.diagramClass}`} />
            </div>
            <h3 className="font-sans text-h3-title text-fg">{offer.title}</h3>
            <p className="font-sans text-sm leading-normal text-fg-muted">{offer.body}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-6 border-t border-border p-5 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-2 font-sans">
          <p className="text-h3-title text-fg">{CLOSING.title}</p>
          <p className="max-w-2xl text-sm leading-normal text-fg-muted">{CLOSING.body}</p>
        </div>
        <Button href={CTA.bookCall.href} className="shrink-0">
          Book a Call
        </Button>
      </div>
    </section>
  );
}
