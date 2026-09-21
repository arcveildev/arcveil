import { cn } from "@/lib/cn";
import type { CheckStatus } from "@arcveildev/sdk";

const STYLES: Record<CheckStatus, { dot: string; text: string; label: string }> = {
  pass: { dot: "bg-chart-1", text: "text-chart-1", label: "Pass" },
  fail: { dot: "bg-chart-5", text: "text-chart-5", label: "Fail" },
  unknown: { dot: "bg-chart-2", text: "text-chart-2", label: "Unknown" },
};

export function StatusPill({ status, className }: { status: CheckStatus; className?: string }) {
  const style = STYLES[status];
  return (
    <span className={cn("label-2xs inline-flex items-center gap-1.5", style.text, className)}>
      <span className={cn("size-1.5 shrink-0", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}
