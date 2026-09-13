"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type ComputeFeature = {
  readonly n: string;
  readonly title: string;
  readonly description: string;
};

type Props = {
  items: readonly ComputeFeature[];
  /** `n` of the row open on first render. Defaults to the first item. */
  defaultOpen?: string;
  className?: string;
};

/**
 * Accordion-style numbered list ("1.1 SLURM, K8s Orchestration").
 * One row is expanded at a time; clicking the open row keeps it open so
 * there is always a visible description.
 */
export function ComputeFeatureList({ items, defaultOpen, className }: Props) {
  const baseId = useId();
  const [activeN, setActiveN] = useState<string>(defaultOpen ?? items[0]?.n ?? "");

  return (
    <div className={cn("flex flex-col font-sans", className)}>
      {items.map((item, i) => {
        const open = item.n === activeN;
        const panelId = `${baseId}-${i}`;
        return (
          <div key={item.n} className={i === 0 ? "" : "border-t border-border"}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setActiveN(item.n)}
              className="flex w-full cursor-pointer items-start gap-2.5 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg/60"
            >
              <span className="w-5 shrink-0 whitespace-nowrap text-fg-faint">{item.n}</span>
              <span className="flex flex-1 flex-col">
                <span className={cn("transition-colors", open ? "text-fg" : "text-fg-muted hover:text-fg")}>
                  {item.title}
                </span>
                <span
                  id={panelId}
                  hidden={!open}
                  className="block max-w-80 pt-3 leading-122 text-fg-muted"
                >
                  {item.description}
                </span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
