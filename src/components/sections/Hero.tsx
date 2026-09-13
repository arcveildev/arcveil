import { BACKERS, CTA, SITE } from "@/data/site";
import { Button } from "@/components/ui/Button";

const TITLE = "Own Your Intelligence";

export function Hero() {
  return (
    <section className="relative -mx-4 mb-5 flex flex-col md:-mx-5 md:mb-8 lg:mb-20">
      {/* Full-bleed looping video background */}
      <div
        aria-hidden="true"
        className="hero-video-edge-blend pointer-events-none absolute top-0 left-1/2 h-[528px] w-screen -translate-x-1/2 overflow-hidden bg-surface max-[560px]:h-[680px] md:h-[640px]"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/backgrounds/pi-glass-loop-poster.webp"
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[60%_55%] max-[560px]:object-[62%_50%]"
        >
          <source src="/backgrounds/pi-glass-loop-prod.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="relative flex h-[528px] flex-col items-start justify-end px-5 pt-16 pb-10 max-[560px]:h-[680px] md:h-[640px] lg:pt-20">
        <div className="relative z-10 flex w-full flex-col items-start font-sans xl:flex-row xl:items-end xl:justify-between xl:gap-10">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <h1 className="font-sans leading-100 tracking-normal">
              <span className="block font-favorit text-sm leading-none uppercase text-white/30">
                The Open Superintelligence Stack
              </span>
              <span className="text-glow relative mt-2 block text-hero text-white/90 md:text-[40px] md:leading-[1.1] xl:whitespace-nowrap">
                <span className="relative z-0">{TITLE}</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 animate-hero-wash bg-[linear-gradient(105deg,rgba(255,255,255,0)_0%,rgba(219,255,212,0.34)_42%,rgba(255,255,255,0.68)_50%,rgba(120,231,114,0.28)_58%,rgba(255,255,255,0)_100%)] bg-[length:220%_100%] bg-clip-text text-transparent opacity-30 motion-reduce:animate-none"
                >
                  {TITLE}
                </span>
              </span>
            </h1>
            <p className="mt-3 max-w-120 text-lg leading-normal text-white/45">{SITE.description}</p>
            <div className="mt-6 flex items-center gap-1">
              <Button href={CTA.startTraining.href}>{CTA.startTraining.label}</Button>
              <Button href={CTA.bookCall.href} variant="secondary" className="border-white/16 bg-white/10 text-white/85 hover:border-white/28 hover:bg-white/16 hover:text-white">
                {CTA.bookCall.label}
              </Button>
            </div>
            <p className="mt-6 font-mono text-sm leading-none text-white/46 [text-shadow:0_0_24px_var(--accent-soft)]">
              <span className="text-accent [text-shadow:0_0_18px_var(--accent-soft)]">$</span>{" "}
              <span className="relative inline-block whitespace-pre">
                {SITE.pipCommand}
                <span className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-cursor-blink bg-white/60 motion-reduce:animate-none" />
              </span>
            </p>
          </div>

          <div className="relative mt-12 min-w-0 py-3 pr-4 text-left font-sans text-sm leading-5 text-white/40 max-[560px]:mt-10 xl:mt-0 xl:shrink-0 xl:translate-y-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-y-5 -left-8 right-0 -z-10 bg-[radial-gradient(ellipse_at_82%_50%,rgba(120,231,114,0.12)_0%,rgba(120,231,114,0.055)_28%,rgba(255,255,255,0.035)_48%,rgba(255,255,255,0)_72%)] blur-xl"
            />
            <p className="relative mb-2 text-white/54">Backed by</p>
            <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5 xl:flex-nowrap xl:whitespace-nowrap">
              {BACKERS.map((name, i) => (
                <span key={name} className="flex items-center gap-x-3">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-white/30">
                      /
                    </span>
                  )}
                  <span className="text-white/62">{name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
