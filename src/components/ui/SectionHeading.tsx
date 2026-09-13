import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** "Lab. Post-train your own..." style heading: bold title + muted tagline in one line. */
export function SectionHeading({
  title,
  tagline,
  className,
}: {
  title: string;
  tagline: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("relative z-10 font-sans text-7 leading-120", className)}>
      <span className="text-fg">{title} </span>
      <span className="text-fg-muted">{tagline}</span>
    </p>
  );
}
