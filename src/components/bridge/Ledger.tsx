import { SectionHeading } from "@/components/ui/SectionHeading";
import { BRIDGE_LEDGER, BRIDGE_THREATS } from "@/data/bridge";

const KIND_LABEL = {
  public: "Public",
  private: "Private",
  seen: "Seen by one party",
} as const;

const KIND_CLASS = {
  public: "text-chart-5",
  private: "text-chart-1",
  seen: "text-chart-2",
} as const;

/**
 * What is hidden and what is not, side by side.
 *
 * Listing the public column first is deliberate. The interesting claim on this
 * page is a single line in the middle of it, and it only means anything once a
 * reader has seen how much is not hidden.
 */
export function Ledger() {
  return (
    <section className="flex flex-col border-t border-border">
      <div className="flex flex-col gap-4 px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">The honest ledger</span>
        <SectionHeading title="What this hides." tagline="And everything it does not." />
      </div>

      <div className="border-t border-border">
        {BRIDGE_LEDGER.map((row) => (
          <div
            key={row.fact}
            className="grid grid-cols-1 gap-1 border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-baseline md:gap-4 md:px-5"
          >
            <span className="text-sm leading-140">{row.fact}</span>
            <span className="text-xs text-fg-muted">{row.who}</span>
            <span className={`label-2xs ${KIND_CLASS[row.kind]}`}>{KIND_LABEL[row.kind]}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-4 py-6 md:px-5 md:py-8">
        <span className="label text-fg-muted">Threat model</span>
        <SectionHeading title="What could go wrong." tagline="Including the parts that are not settled." />
      </div>

      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
        {BRIDGE_THREATS.map((row, index) => (
          <div
            key={row.threat}
            className={`flex flex-col gap-2 border-border p-4 md:p-5 ${
              index < BRIDGE_THREATS.length - 1 ? "border-b" : ""
            } ${index % 2 === 0 ? "lg:border-r" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm leading-140">{row.threat}</span>
              <span className={`label-2xs shrink-0 ${row.settled ? "text-chart-1" : "text-chart-2"}`}>
                {row.settled ? "Answered" : "Open"}
              </span>
            </div>
            <p className="text-xs leading-140 text-fg-muted">{row.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
