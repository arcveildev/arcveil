import { CodeBlock } from "@/components/ui/CodeBlock";
import { toCodeLines } from "@/lib/code";

/**
 * A code sample with the file or command it belongs to written above it.
 * Takes the source as one string so the data files stay readable.
 */
export function Snippet({
  source,
  caption,
  label,
}: {
  source: string;
  /** Where this runs: a file name, or the shell it is typed into. */
  caption?: string;
  /** Accessible name, used when the caption alone would not say enough. */
  label?: string;
}) {
  return (
    <figure className="flex max-w-3xl flex-col">
      {caption !== undefined && (
        <figcaption className="label-2xs border border-b-0 border-border bg-surface-raised px-3 py-2.5 text-fg-subtle">
          {caption}
        </figcaption>
      )}
      <CodeBlock lines={toCodeLines(source)} label={label ?? caption ?? "Code sample"} />
    </figure>
  );
}
