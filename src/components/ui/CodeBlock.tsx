import { cn } from "@/lib/cn";

export type CodeTone = "accent" | "fg" | "muted";
export type CodeLine = { text: string; tone?: CodeTone };

const TONE_CLASS: Record<CodeTone, string> = {
  accent: "text-accent",
  fg: "text-fg",
  muted: "text-fg/44",
};

type CodeBlockProps = {
  lines: readonly CodeLine[];
  lineNumbers?: boolean;
  label?: string;
  className?: string;
};

/** Monospace snippet in a hairline card; optional gutter with line numbers. */
export function CodeBlock({ lines, lineNumbers = false, label, className }: CodeBlockProps) {
  return (
    <div
      className={cn("hairline flex items-start gap-3 overflow-x-auto bg-surface-card p-4 font-mono text-xs leading-normal", className)}
      role="figure"
      aria-label={label}
    >
      {lineNumbers && (
        <div aria-hidden="true" className="flex shrink-0 select-none flex-col text-right text-fg/12">
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
      )}
      <pre className="min-w-0 flex-1 whitespace-pre">
        {lines.map((line, i) => (
          <span key={i} className={cn("block", TONE_CLASS[line.tone ?? "muted"])}>
            {line.text.length > 0 ? line.text : " "}
          </span>
        ))}
      </pre>
    </div>
  );
}
