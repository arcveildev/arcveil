import { SectionHeading } from "@/components/ui/SectionHeading";
import { SPEC_ROWS, type SpecStatus } from "@/data/specs";
import { cn } from "@/lib/cn";

/** chart-1 (== accent) for shipped, chart-2 for in progress, muted for planned. */
const STATUS_CLASS: Record<SpecStatus, string> = {
  shipped: "border-accent/35 text-accent",
  "in progress": "border-chart-2/35 text-chart-2",
  planned: "border-border text-fg-subtle",
};

function StatusChip({ status }: { status: SpecStatus }) {
  return (
    <span
      className={cn(
        "label-2xs inline-flex shrink-0 items-center border px-1.5 py-1",
        STATUS_CLASS[status],
      )}
    >
      {status}
    </span>
  );
}

/**
 * The protocol table. The chips are the point: a planned row must never be
 * readable as something that already exists.
 */
export function Specs() {
  return (
    <section
      id="specs"
      className="mb-5 flex flex-col border border-border scroll-mt-17 md:mb-8 lg:mb-17.5"
    >
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">Protocol</span>
        <SectionHeading
          title="Specifications."
          tagline="What it runs on, and what is not built yet."
        />
      </div>

      <table className="w-full table-fixed border-collapse border-t border-border text-left">
        <caption className="sr-only">
          Protocol specifications, each with its current build status.
        </caption>
        <tbody>
          {SPEC_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-border last:border-b-0">
              <th
                scope="row"
                className="label-2xs w-[38%] px-4 py-3.5 align-top font-normal text-fg-subtle md:w-64 md:px-5 md:py-4"
              >
                {row.key}
              </th>
              <td className="px-4 py-3.5 align-top md:px-5 md:py-4">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-140 text-fg">
                  <span>{row.value}</span>
                  <StatusChip status={row.status} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
