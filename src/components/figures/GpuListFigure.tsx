"use client";

import { useState, type CSSProperties } from "react";
import { Network, Server } from "lucide-react";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { cn } from "@/lib/cn";
import { MULTI_NODE_GPUS, SINGLE_NODE_GPUS, type GpuOffer } from "@/data/gpus";
import { formatUsdCents } from "@/lib/idleCalculator";

type Mode = "single" | "multi";

const MODES: readonly { id: Mode; label: string; Icon: typeof Server }[] = [
  { id: "single", label: "Single-Node", Icon: Server },
  { id: "multi", label: "Multi-Node", Icon: Network },
];

const OFFERS: Record<Mode, readonly GpuOffer[]> = {
  single: SINGLE_NODE_GPUS,
  multi: MULTI_NODE_GPUS,
};

/** Cards needed in one half of the loop so the strip never shows a gap. */
const MIN_CARDS_PER_HALF = 6;
const SECONDS_PER_CARD = 3.5;

type MarqueeStyle = CSSProperties & { "--gpu-marquee-duration": string };

/**
 * Repeat the offer list so the animated strip consists of two identical
 * halves (translateY(-50%) then loops seamlessly).
 */
function buildLoop(offers: readonly GpuOffer[]): readonly GpuOffer[] {
  if (offers.length === 0) return [];
  const half = Math.max(1, Math.ceil(MIN_CARDS_PER_HALF / offers.length));
  const copies = half * 2;
  return Array.from({ length: copies }, () => offers).flat();
}

export function GpuListFigure() {
  const [mode, setMode] = useState<Mode>("single");
  const loop = buildLoop(OFFERS[mode]);
  const style: MarqueeStyle = { "--gpu-marquee-duration": `${(loop.length / 2) * SECONDS_PER_CARD}s` };

  return (
    <div className="flex flex-col overflow-hidden">
      <FigureLabel n={5} />
      <div className="flex flex-1 flex-col overflow-hidden py-4">
        <div
          role="group"
          aria-label="GPU deployment type"
          className="flex w-81.75 max-w-full items-center gap-3.5 self-center border border-border p-0.5"
        >
          {MODES.map(({ id, label, Icon }) => {
            const active = id === mode;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(id)}
                className={cn(
                  "flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 px-1.5 py-1 font-sans text-sm leading-140 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg/60",
                  active ? "bg-fg/8 text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                <Icon className="size-3 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-2.5 flex h-130 justify-center overflow-hidden" aria-hidden="true">
          <div
            key={mode}
            style={style}
            className="pointer-events-none flex w-81.75 max-w-full shrink-0 animate-gpu-marquee flex-col opacity-60 motion-reduce:animate-none"
          >
            {loop.map((offer, i) => (
              <GpuCard key={`${offer.id}-${i}`} offer={offer} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
        </div>
      </div>

      {/* Screen-reader friendly, non-animated summary of the visible list */}
      <ul className="sr-only">
        {OFFERS[mode].map((offer) => (
          <li key={offer.id}>
            {offer.vendor} {offer.name}, {offer.status}, {formatUsdCents(offer.pricePerHour)} per hour
          </li>
        ))}
      </ul>
    </div>
  );
}

function GpuCard({ offer }: { offer: GpuOffer }) {
  return (
    <div className="-mt-px flex flex-col gap-5 border border-border p-5 font-sans first:mt-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="label-2xs mt-0.5 shrink-0 text-fg/50">{offer.vendor}</span>
          <div className="flex flex-col gap-2.5">
            <p className="whitespace-nowrap text-sm leading-none text-fg">{offer.name}</p>
            <div className="flex items-center gap-1 text-2xs leading-none text-fg-muted">
              <span className={offer.status === "Available" ? "text-available" : undefined}>{offer.status}</span>
              <span>{offer.config}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <p className="whitespace-nowrap text-xs leading-none text-fg">{formatUsdCents(offer.pricePerHour)}/HR</p>
          {offer.spotPerHour !== undefined && (
            <p className="whitespace-nowrap text-2xs leading-none text-accent">
              Spot {formatUsdCents(offer.spotPerHour)}/HR
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-2xs leading-none">
        <span className="whitespace-nowrap text-fg">{offer.vram}</span>
        <span className="text-fg/25">·</span>
        <span className="whitespace-nowrap text-fg-muted">{offer.ram}</span>
        <span className="text-fg/25">·</span>
        <span className="whitespace-nowrap text-fg-muted">{offer.vcpu}</span>
      </div>
    </div>
  );
}
