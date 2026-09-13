import { SectionBackdrop } from "@/components/ui/SectionBackdrop";

/**
 * Hero loop over a still. The still is always painted, so a viewer who asked
 * for reduced motion — or whose browser never loads the video — still gets the
 * frame; the video sits on top, muted and inline so mobile plays it without a
 * gesture.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <SectionBackdrop src="/backgrounds/hero-blindfold.png" className="opacity-55 brightness-[1.1] contrast-[1.12]" />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen saturate-[1.58] brightness-[1.1] contrast-[1.12] motion-reduce:hidden"
      >
        <source src="/backgrounds/hero-blindfold-loop.mp4" type="video/mp4" />
      </video>
      {/* Two scrims: a flat one so body copy never sits on the bright band, and a
          horizontal one so the image keeps its depth on the right. */}
      <div className="absolute inset-0 bg-surface/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/75 to-transparent" />
    </div>
  );
}
