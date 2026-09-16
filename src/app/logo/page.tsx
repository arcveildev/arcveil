import type { Metadata } from "next";
import { MARKS } from "@/components/ui/marks";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: `${SITE.name} | Marks` };

const SIZES = [
  { px: 24, label: "24 — header" },
  { px: 40, label: "40" },
  { px: 96, label: "96" },
] as const;

/** Internal comparison sheet for the logo candidates. Delete once one wins. */
export default function LogoPage() {
  return (
    <div className="flex flex-col gap-5 pt-28 pb-20 xl:pt-36">
      <div className="flex flex-col gap-4 border border-border px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">Internal · not linked</span>
        <p className="font-sans text-7 leading-120">
          <span className="text-fg">Marks. </span>
          <span className="text-fg-muted">Four ways to draw the veil on an arch.</span>
        </p>
      </div>

      {MARKS.map(({ id, label, note, Mark }) => (
        <section key={id} className="flex flex-col border border-border">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3 md:px-5">
            <p className="label text-fg">{label}</p>
            <p className="text-2xs leading-140 text-fg-muted">{note}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex items-end gap-8 border-b border-border p-6 lg:border-r lg:border-b-0">
              {SIZES.map((size) => (
                <div key={size.px} className="flex flex-col items-center gap-3">
                  <Mark className="w-auto text-fg" style={{ height: size.px }} />
                  <span className="label-2xs text-fg-faint">{size.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center gap-6 p-6">
              <div className="flex items-center gap-2">
                <Mark className="h-6 w-auto text-fg" />
                <span className="font-favorit text-[15px] font-medium tracking-[0.04em] uppercase">
                  {SITE.name}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-fg p-3">
                <Mark className="h-6 w-auto text-surface" />
                <span className="font-favorit text-[15px] font-medium tracking-[0.04em] text-surface uppercase">
                  {SITE.name}
                </span>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
