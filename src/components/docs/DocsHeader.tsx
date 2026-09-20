import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Title block at the top of a docs page: label, heading, one paragraph of lede. */
export function DocsHeader({
  label,
  title,
  tagline,
  lede,
}: {
  label: string;
  title: string;
  tagline: string;
  lede: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border px-4 py-6 md:px-5 md:py-8">
      <span className="label text-fg-muted">{label}</span>
      <SectionHeading title={title} tagline={tagline} />
      <div className="max-w-2xl text-sm leading-140 text-fg-muted">{lede}</div>
    </header>
  );
}
