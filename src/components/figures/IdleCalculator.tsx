"use client";

import { useId, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { cn } from "@/lib/cn";
import { RESERVED_SKUS } from "@/data/gpus";
import {
  clampGpuCount,
  computeIdleEconomics,
  formatInteger,
  formatSignedUsd,
  formatUsd,
  formatUsdCents,
  MAX_GPU_COUNT,
  MIN_GPU_COUNT,
  RESALE_RATE_PER_HOUR,
} from "@/lib/idleCalculator";

type Sku = (typeof RESERVED_SKUS)[number];

const DEFAULT_SKU: Sku = RESERVED_SKUS[0];
const DEFAULT_GPU_COUNT = 512;

const matchesQuery = (sku: Sku, query: string): boolean =>
  sku.label.toLowerCase().includes(query.trim().toLowerCase());

export function IdleCalculator() {
  const listId = useId();
  const countId = useId();
  const [sku, setSku] = useState<Sku>(DEFAULT_SKU);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [gpuCount, setGpuCount] = useState(DEFAULT_GPU_COUNT);

  const options = RESERVED_SKUS.filter((s) => matchesQuery(s, query));
  const economics = computeIdleEconomics({ pricePerHour: sku.pricePerHour, gpuCount });

  const pickSku = (next: Sku) => {
    setSku(next);
    setQuery("");
    setOpen(false);
  };

  const rows = [
    { label: "Reserved cost (3yrs)", value: formatUsd(economics.reservedCost) },
    { label: "Idle hrs resold", value: `${formatInteger(economics.idleHours)} hrs` },
    { label: "Cost of idle capacity", value: formatUsd(economics.idleCost) },
    { label: `Revenue at ${formatUsdCents(RESALE_RATE_PER_HOUR)}/hr/gpu`, value: formatUsd(economics.revenue) },
  ] as const;

  return (
    <div className="relative flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-surface" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/backgrounds/fig-7-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-lighten"
        />
      </div>
      <div className="relative">
        <FigureLabel n={7} />
      </div>

      <div className="relative flex min-h-90 flex-1 items-center justify-center overflow-hidden p-5 lg:min-h-0">
        <div className="relative flex w-full max-w-124.5 flex-col overflow-visible border border-border bg-surface/90 font-sans shadow-2xl backdrop-blur-sm">
          <div className="relative border-b border-border">
            <div className="flex items-center gap-3 px-3 py-3">
              <Search className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
              <input
                type="text"
                role="combobox"
                aria-label="Search GPU SKU"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                placeholder="Enter GPU name.."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                className="hairline flex-1 bg-surface-card px-2 py-1 font-sans text-sm text-fg placeholder:text-fg-muted focus:outline-none focus-visible:border-fg/40"
              />
              <button
                type="button"
                aria-label={open ? "Close SKU list" : "Open SKU list"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen((o) => !o)}
                className="cursor-pointer text-fg-muted transition-colors hover:text-fg"
              >
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
              </button>
            </div>
            <ul
              id={listId}
              role="listbox"
              aria-label="Reserved GPU SKUs"
              hidden={!open}
              className="absolute inset-x-0 top-full z-20 border border-border bg-surface-raised"
            >
              {options.length === 0 && <li className="px-3 py-2 text-sm text-fg-muted">No matching SKU</li>}
              {options.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={option.id === sku.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSku(option)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-fg/8",
                    option.id === sku.id ? "text-fg" : "text-fg-muted",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="text-2xs text-fg-muted">{formatUsdCents(option.pricePerHour)}/HR/GPU</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-b border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-4">
                <span className="label-2xs text-fg/50">NVIDIA</span>
                <div className="flex flex-col gap-4">
                  <label htmlFor={countId} className="flex items-center gap-2 text-xl leading-none text-fg">
                    <span>{sku.label} x</span>
                    <input
                      id={countId}
                      type="number"
                      inputMode="numeric"
                      min={MIN_GPU_COUNT}
                      max={MAX_GPU_COUNT}
                      step={1}
                      value={gpuCount}
                      onChange={(e) => setGpuCount(clampGpuCount(e.target.valueAsNumber))}
                      aria-label="GPU count"
                      className="hairline w-24 bg-surface-card px-2 py-1 font-sans text-sm text-fg focus:outline-none focus-visible:border-fg/40"
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-fg">{sku.label.split(" ").at(-1)}</span>
                    <span className="label-2xs border border-border px-1.5 py-1 text-fg">3-YEAR RESERVED</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="whitespace-nowrap leading-none">
                  <span className="text-7 text-fg">{formatUsdCents(sku.pricePerHour)}</span>{" "}
                  <span className="text-2xs text-fg-muted">/HR/GPU</span>
                </p>
                <p className="label-2xs whitespace-nowrap">
                  <span className="text-fg">TOTAL</span> <span className="text-fg-muted">{formatUsd(economics.hourlyTotal)}/hr</span>
                </p>
              </div>
            </div>
          </div>

          <dl className="flex flex-col gap-4 border-b border-border p-4">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <dt className="whitespace-nowrap text-sm text-fg-muted">{row.label}</dt>
                <div className="flex-1 border-t border-border" aria-hidden="true" />
                <dd className="whitespace-nowrap text-sm text-fg">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center justify-between p-4" aria-live="polite">
            <p className="text-lg text-fg">Profit on idle capacity</p>
            <p className={cn("text-xl", economics.profit >= 0 ? "text-available" : "text-fg")}>
              {formatSignedUsd(economics.profit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
