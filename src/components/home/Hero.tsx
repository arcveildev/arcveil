import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/data/site";
import { HOME_HERO } from "@/data/home";

const TITLE = HOME_HERO.title;

/**
 * Full-bleed hero: the loop runs edge to edge behind the header, content sits
 * on the dark left half. The still is painted under the video, so reduced
 * motion (or a video that never loads) still gets the frame.
 */
export function Hero() {
  return (
    <section className="relative -mx-4 mb-5 flex flex-col md:-mx-5 md:mb-8 lg:mb-20">
      <div
        aria-hidden="true"
        className="hero-video-edge-blend pointer-events-none absolute top-0 left-1/2 h-[528px] w-screen -translate-x-1/2 overflow-hidden bg-surface max-[560px]:h-[680px] md:h-[640px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative backdrop under the loop */}
        <img
          src="/backgrounds/hero-veil.webp"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[70%_48%] max-[560px]:object-[64%_44%]"
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[70%_48%] max-[560px]:object-[64%_44%] motion-reduce:hidden"
        >
          <source src="/backgrounds/hero-veil-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-black/88 via-black/50 to-transparent" />
        {/* The header floats over this, and the loop is brightest up top. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/75 to-transparent" />
      </div>

      <div className="relative flex h-[528px] flex-col items-start justify-end px-5 pt-16 pb-10 max-[560px]:h-[680px] md:h-[640px] lg:pt-20">
        <div className="relative z-10 flex w-full flex-col items-start font-sans xl:flex-row xl:items-end xl:justify-between xl:gap-10">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <h1 className="w-full font-sans leading-100 tracking-normal">
              <span className="block font-favorit text-xs leading-normal uppercase text-white/45 sm:text-sm sm:leading-none">
                {HOME_HERO.label}
              </span>
              <span className="text-glow relative mt-2 block w-full text-hero text-white/90 md:text-[40px] md:leading-[1.1]">
                <span className="relative z-0">{TITLE}</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 animate-hero-wash bg-[linear-gradient(105deg,rgba(255,255,255,0)_0%,rgba(219,255,212,0.34)_42%,rgba(255,255,255,0.68)_50%,rgba(120,231,114,0.28)_58%,rgba(255,255,255,0)_100%)] bg-[length:220%_100%] bg-clip-text text-transparent opacity-30 motion-reduce:animate-none"
                >
                  {TITLE}
                </span>
              </span>
            </h1>

            <p className="mt-3 w-full max-w-120 text-base leading-normal text-white/45 sm:text-lg">{HOME_HERO.body}</p>

            <div className="mt-6 flex items-center gap-1">
              <Button href={CTA.primary.href}>{CTA.primary.label}</Button>
              <Button
                href={CTA.secondary.href}
                variant="secondary"
                className="border-white/16 bg-white/10 text-white/85 hover:border-white/28 hover:bg-white/16 hover:text-white"
              >
                {CTA.secondary.label}
              </Button>
            </div>

            <Link
              href="/verify"
              className="mt-6 max-w-full font-mono text-xs leading-relaxed text-white/46 transition-colors hover:text-white/70 sm:text-sm sm:leading-none [text-shadow:0_0_24px_var(--accent-soft)]"
            >
              <span className="text-accent [text-shadow:0_0_18px_var(--accent-soft)]">✓</span>{" "}
              <span className="relative inline-block sm:whitespace-pre">
                {HOME_HERO.proofLine}
                <span className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-cursor-blink bg-white/60 motion-reduce:animate-none" />
              </span>
            </Link>
          </div>

          <div className="relative mt-12 min-w-0 py-3 pr-4 text-left font-sans text-sm leading-5 text-white/40 max-[560px]:mt-10 xl:mt-0 xl:shrink-0 xl:translate-y-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-y-5 -left-8 right-0 -z-10 bg-[radial-gradient(ellipse_at_82%_50%,rgba(120,231,114,0.12)_0%,rgba(120,231,114,0.055)_28%,rgba(255,255,255,0.035)_48%,rgba(255,255,255,0)_72%)] blur-xl"
            />
            <p className="relative mb-2 text-white/54">Built for</p>
            <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5 xl:flex-nowrap xl:whitespace-nowrap">
              {HOME_HERO.builtFor.map((item, i) => (
                <span key={item} className="flex items-center gap-x-3">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-white/30">
                      /
                    </span>
                  )}
                  <span className="text-white/62">{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
