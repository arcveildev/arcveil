import type { CodeLine } from "@/components/ui/CodeBlock";

const isBlank = (line: string) => line.trim().length === 0;

const isComment = (line: string) => {
  const text = line.trimStart();
  return text.startsWith("//") || text.startsWith("#");
};

const indentOf = (line: string) => line.length - line.trimStart().length;

/**
 * Turns a template literal into the lines <CodeBlock> renders: the blank first
 * and last line are dropped, the shared indentation is removed, and comments
 * are toned down so the code itself carries the contrast.
 *
 * Docs snippets are written inline in src/data/docs, which means they are
 * indented by whatever nesting they sit in — the dedent is what keeps the
 * rendered block flush left without the data file having to fight its own
 * formatting.
 */
export function toCodeLines(source: string): readonly CodeLine[] {
  const raw = source.split("\n");
  const start = raw.findIndex((line) => !isBlank(line));
  if (start === -1) return [];

  let end = raw.length - 1;
  while (isBlank(raw[end])) end -= 1;

  const body = raw.slice(start, end + 1);
  const indent = body
    .filter((line) => !isBlank(line))
    .reduce((min, line) => Math.min(min, indentOf(line)), Number.POSITIVE_INFINITY);

  return body.map((line) => {
    const text = isBlank(line) ? "" : line.slice(indent);
    return { text, tone: isComment(text) ? "muted" : "fg" } as const;
  });
}
