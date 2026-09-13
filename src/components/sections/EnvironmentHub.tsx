import { Compass, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ENVIRONMENT_GROUPS } from "@/data/environments";
import { CTA } from "@/data/site";
import { cn } from "@/lib/cn";
import { EnvironmentCard } from "./EnvironmentCard";

const TABS = [
  { label: "Explore", icon: Compass, active: true },
  { label: "My Stars", icon: Star, active: false },
  { label: "My Environments", icon: Lock, active: false },
] as const;

const HUB_COPY = {
  title: "Environment Hub",
  description:
    "Access and contribute to 2,500+ open-source RL environments and a community of researchers and developers.",
  cta: "Explore Environments",
} as const;

/** Environment Hub promo: copy on the left, a cropped mock of the hub app on the right. */
export function EnvironmentHub() {
  return (
    <div className="relative mt-6 flex flex-col overflow-hidden border border-border md:mt-8 lg:mt-10 lg:h-110.75 lg:flex-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/backgrounds/environment-hub-bg.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full -translate-x-5 select-none object-contain object-left"
      />

      <div className="relative z-10 flex shrink-0 flex-col justify-center gap-8 p-5 lg:w-131">
        <div className="flex flex-col gap-1 font-sans text-xl">
          <h3 className="font-normal leading-122 text-fg">{HUB_COPY.title}</h3>
          <p className="max-w-115 leading-normal text-fg-muted">{HUB_COPY.description}</p>
        </div>
        <Button href={CTA.environments.href} className="self-start">
          {HUB_COPY.cta}
        </Button>
      </div>

      <div
        aria-hidden="true"
        className="relative z-10 mt-11.5 flex flex-1 flex-col gap-5 overflow-hidden border-t border-l border-border bg-surface pt-5 pl-5 font-sans"
      >
        <div className="flex w-full items-center border-b border-border">
          {TABS.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={cn("flex items-center gap-1 px-2.5 py-2.5", active ? "border-b border-fg" : "opacity-50")}
            >
              <Icon className="size-3.5 text-fg" />
              <span className="text-2xs text-fg">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 overflow-hidden">
          {ENVIRONMENT_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-fg">{group.title}</span>
                  <span className="bg-fg/10 px-1 py-0.5 text-2xs leading-none text-fg/50">{group.count}</span>
                </div>
                <span className="text-2xs text-fg/50">Show All</span>
              </div>
              <div className="flex gap-2.5 overflow-hidden">
                {group.items.map((env, i) => (
                  <EnvironmentCard key={`${group.title}-${env.name}-${i}`} env={env} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
