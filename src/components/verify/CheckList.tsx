import { CHECK_TITLES } from "@/data/receiptClaims";
import type { ReceiptReport } from "@/lib/receipt/types";
import { StatusPill } from "./StatusPill";

const shortId = (id: string) => `${id.slice(0, 10)}…${id.slice(-4)}`;

export function CheckList({ report, index }: { report: ReceiptReport; index: number }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-3 bg-surface-raised px-4 py-2">
        <p className="label-2xs text-fg-muted">
          Receipt {index + 1} · <span className="font-mono normal-case">{shortId(report.id)}</span>
        </p>
        <StatusPill status={report.status} />
      </div>
      <ul>
        {report.checks.map((check) => (
          <li key={check.id} className="flex flex-col gap-1 border-t border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-fg">{CHECK_TITLES[check.id]}</p>
              <StatusPill status={check.status} />
            </div>
            <p className="text-2xs leading-140 text-fg-muted">{check.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
