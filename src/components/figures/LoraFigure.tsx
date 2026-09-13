/** FIG.4 — LoRA hot-swapping diagram shipped as a static SVG asset. */
export function LoraFigure() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/backgrounds/lora-hot-swapping.svg"
      alt="LoRA adapters hot-swapped on top of a shared base model"
      loading="lazy"
      decoding="async"
      className="h-auto w-full max-w-114 select-none object-contain"
    />
  );
}
