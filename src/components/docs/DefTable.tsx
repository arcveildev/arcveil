import { cn } from "@/lib/cn";

export type DefRow = {
  readonly key: string;
  readonly value: string;
  /** The key is an identifier — a field path, a function name — not a label. */
  readonly code?: boolean;
  /** The value is an address, a hash or a type — render it monospace. */
  readonly mono?: boolean;
};

/**
 * Two-column reference table. Same hairline shape as the specs table on the
 * home page, so a field list and a spec list read as the same object.
 */
export function DefTable({
  rows,
  caption,
  head,
}: {
  rows: readonly DefRow[];
  /** Screen-reader description of what the table lists. */
  caption: string;
  /** Optional visible column headings. */
  head?: readonly [string, string];
}) {
  return (
    <table className="w-full table-fixed border-collapse border border-border text-left">
      <caption className="sr-only">{caption}</caption>
      {head !== undefined && (
        <thead>
          <tr className="border-b border-border">
            {head.map((title, i) => (
              <th
                key={title}
                scope="col"
                className={cn(
                  "label-2xs px-4 py-3 font-normal text-fg-faint md:px-5",
                  i === 0 && "w-[38%] md:w-64",
                )}
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-border last:border-b-0">
            <th
              scope="row"
              className={cn(
                "w-[38%] px-4 py-3.5 align-top font-normal md:w-64 md:px-5 md:py-4",
                row.code === true
                  ? "font-mono text-xs break-all text-fg"
                  : "label-2xs text-fg-subtle",
              )}
            >
              {row.key}
            </th>
            <td
              className={cn(
                "px-4 py-3.5 align-top leading-140 text-fg md:px-5 md:py-4",
                row.mono === true ? "font-mono text-xs break-all text-fg-muted" : "text-sm",
              )}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
