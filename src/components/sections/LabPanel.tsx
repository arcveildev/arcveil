import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { NumberedList, type NumberedItem } from "@/components/ui/NumberedList";
import { cn } from "@/lib/cn";

export type LabPanelProps = {
  index: string;
  fig: number;
  title: string;
  description: string;
  items: readonly NumberedItem[];
  cta: { label: string; href: string };
  figure: ReactNode;
  className?: string;
};

/** One quadrant of the Lab 2x2 grid: FIG label, diagram area, then the copy + CTA body. */
export function LabPanel({ index, fig, title, description, items, cta, figure, className }: LabPanelProps) {
  return (
    <article className={cn("flex flex-1 flex-col border-border", className)}>
      <FigureLabel n={fig} />
      <div className="relative h-62.5 overflow-hidden md:h-75 lg:h-100.5">
        <div className="flex h-full items-center justify-center px-3 md:px-0">{figure}</div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-4 md:p-5 lg:gap-8">
        <div className="flex flex-col gap-5 font-sans leading-normal lg:flex-row lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-col gap-1 text-xl leading-normal lg:flex-1 lg:text-h3-title">
            <h3 className="flex items-start gap-2 font-normal text-fg">
              <span className="whitespace-nowrap opacity-50">{index}</span>
              <span>{title}</span>
            </h3>
            <p className="text-fg-muted">{description}</p>
          </div>
          <div className="min-w-0 lg:flex-1">
            <NumberedList items={items} />
          </div>
        </div>
        <Button href={cta.href} className="mt-1 lg:mt-auto">
          {cta.label}
        </Button>
      </div>
    </article>
  );
}
