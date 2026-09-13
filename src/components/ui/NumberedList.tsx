export type NumberedItem = { n: string; text: string; detail?: string };

/** "1.1 Built on the open-source Verifiers library" list rows. */
export function NumberedList({ items }: { items: readonly NumberedItem[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 text-sm">
      {items.map((item) => (
        <div key={item.n} className="flex gap-2.5">
          <span className="z-10 w-5 whitespace-nowrap text-fg-faint">{item.n}</span>
          <span className="flex-1 text-fg-muted">
            {item.text}
            {item.detail && <span className="mt-1 block text-fg-subtle">{item.detail}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
