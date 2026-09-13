import { SectionHeading } from "@/components/ui/SectionHeading";
import { THREAT_COLUMNS, THREAT_NOTE, THREAT_ROWS } from "@/data/threatModel";
import { cn } from "@/lib/cn";

const CELL = "px-4 py-3.5 align-top md:px-5 md:py-4";

/**
 * Who sees what. Every other privacy claim on this page is downstream of this
 * table, so each row names an adversary instead of gesturing at "private".
 */
export function ThreatModel() {
  return (
    <section
      id="threat"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5"
    >
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">Who sees what</span>
        <SectionHeading title="Threat model." tagline="Privacy from whom, exactly." />
      </div>

      <div className="scrollbar-none overflow-x-auto border-t border-border">
        <table className="w-full min-w-160 border-collapse text-left">
          <caption className="sr-only">
            Each party involved in an agent action, and what it can and cannot observe.
          </caption>
          <thead>
            <tr className="border-b border-border">
              {THREAT_COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className={cn(CELL, "label-2xs font-normal text-fg-faint")}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {THREAT_ROWS.map((row) => (
              <tr
                key={row.party}
                className={cn(
                  "border-b border-border last:border-b-0",
                  row.accent && "bg-accent/5",
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    CELL,
                    "w-[26%] text-sm leading-140 font-normal whitespace-nowrap",
                    row.accent ? "text-accent" : "text-fg",
                  )}
                >
                  {row.party}
                </th>
                <td className={cn(CELL, "w-[37%] text-sm leading-140 text-fg-muted")}>
                  {row.sees}
                </td>
                <td
                  className={cn(
                    CELL,
                    "w-[37%] text-sm leading-140",
                    row.accent ? "text-fg-subtle" : "text-fg-muted",
                  )}
                >
                  {row.neverSees}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-border px-4 py-5 text-sm leading-140 text-fg-muted md:px-5 md:py-6">
        {THREAT_NOTE}
      </p>
    </section>
  );
}
