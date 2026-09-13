import { CircleCheck, Star } from "lucide-react";
import type { EnvironmentCard as EnvironmentCardData } from "@/data/environments";

const TAG = "px-1 py-0.5 bg-fg/6 text-2xs leading-none text-fg/50";

/** One card in the Environment Hub mock (owner, stars, name, description, tags, status). */
export function EnvironmentCard({ env }: { env: EnvironmentCardData }) {
  return (
    <div className="flex w-79.75 shrink-0 flex-col gap-5 overflow-hidden bg-surface-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2.5 bg-fg/20" />
          <span className="text-2xs text-fg/50">{env.owner}</span>
        </div>
        <div className="flex items-center gap-1" aria-label={`${env.stars} stars`}>
          <span className="text-2xs text-fg">{env.stars}</span>
          <Star className="size-3.5 text-fg/50" aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs leading-none text-fg">{env.name}</p>
        <p className="line-clamp-3 text-xs leading-130 text-fg-muted">{env.description}</p>
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {env.tags.map((tag) => (
            <span key={tag} className={TAG}>
              {tag}
            </span>
          ))}
          {env.extraTags > 0 && <span className={TAG}>+{env.extraTags}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CircleCheck className="size-3 text-available" aria-hidden="true" />
            <span className="text-2xs text-fg/50">{env.updated}</span>
          </div>
          <span className="text-2xs text-fg/50">{env.version}</span>
        </div>
      </div>
    </div>
  );
}
