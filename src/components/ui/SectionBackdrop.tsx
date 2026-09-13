import { cn } from "@/lib/cn";

/**
 * Photographic backdrop behind a section header. The blend and filter are the
 * design language's (mix-blend-screen + saturate/brightness/contrast), kept in
 * one place so every backdrop reads as the same material.
 */
export function SectionBackdrop({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative, fixed aspect, no layout shift
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90",
        "mix-blend-screen saturate-[1.58] brightness-[1.28] contrast-[1.16]",
        className,
      )}
    />
  );
}
