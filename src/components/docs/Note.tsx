import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type NoteTone = "plain" | "warn";

/**
 * A line the reader must not skim past: what is not built, or what fails
 * silently. `warn` is for the second kind — the accent is reserved for
 * something that actually costs money when ignored.
 */
export function Note({
  title,
  tone = "plain",
  children,
}: {
  title: string;
  tone?: NoteTone;
  children: ReactNode;
}) {
  return (
    <aside
      className={cn(
        "flex max-w-2xl flex-col gap-2 border-l-2 bg-surface-card px-4 py-3.5",
        tone === "warn" ? "border-l-chart-2" : "border-l-fg/20",
      )}
    >
      <p className={cn("label-2xs", tone === "warn" ? "text-chart-2" : "text-fg-subtle")}>{title}</p>
      <p className="text-sm leading-140 text-fg-muted">{children}</p>
    </aside>
  );
}
