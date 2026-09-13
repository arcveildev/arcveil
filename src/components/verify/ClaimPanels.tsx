import { RECEIPT_DOES_NOT_PROVE, RECEIPT_PROVES } from "@/data/receiptClaims";

function Panel({ title, items, tone }: { title: string; items: readonly string[]; tone: "pass" | "limit" }) {
  return (
    <div className="flex flex-col gap-3 border-border p-4 md:p-5 lg:border-r lg:last:border-r-0">
      <p className="label text-fg-muted">{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-140 text-fg-muted">
            <span aria-hidden="true" className={tone === "pass" ? "text-accent" : "text-fg-faint"}>
              {tone === "pass" ? "+" : "—"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClaimPanels() {
  return (
    <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
      <Panel title="What a receipt proves" items={RECEIPT_PROVES} tone="pass" />
      <Panel title="What it does not prove" items={RECEIPT_DOES_NOT_PROVE} tone="limit" />
    </div>
  );
}
