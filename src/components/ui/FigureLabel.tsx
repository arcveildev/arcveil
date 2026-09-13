/** Tiny "FIG.1" caption used above each diagram panel. */
export function FigureLabel({ n }: { n: number | string }) {
  return (
    <div className="px-3 py-2 lg:py-3">
      <p className="text-2xs font-favorit uppercase text-fg-faint">FIG.{n}</p>
    </div>
  );
}
