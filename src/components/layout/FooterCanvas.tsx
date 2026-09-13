"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive "Be your own Lab." text made of dots that scatter away
 * from the cursor (approximation of the original canvas effect).
 */
export function FooterCanvas({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let particles: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = [];
    const pointer = { x: -9999, y: -9999 };

    const build = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      if (width < 2 || height < 2) {
        particles = [];
        return;
      }
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = Math.floor(width);
      off.height = Math.floor(height);
      const octx = off.getContext("2d");
      if (!octx) return;
      const fontSize = Math.min(width / 9, height * 0.9);
      octx.font = `500 ${fontSize}px ${getComputedStyle(canvas).fontFamily}`;
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText(text, 0, height / 2);
      const data = octx.getImageData(0, 0, off.width, off.height).data;

      const step = 4;
      const next: typeof particles = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) {
            next.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
          }
        }
      }
      particles = next;
    };

    const color = () => getComputedStyle(canvas).color;

    const tick = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color();
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 70) {
          const force = (70 - dist) / 70;
          p.vx += (dx / (dist || 1)) * force * 2.2;
          p.vy += (dy / (dist || 1)) * force * 2.2;
        }
        p.vx += (p.ox - p.x) * 0.06;
        p.vy += (p.oy - p.y) * 0.06;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    tick();
    const observer = new ResizeObserver(build);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return (
    <div className="relative hidden h-51.25 w-full max-w-166.5 md:block" aria-label={text}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full cursor-crosshair font-sans text-fg" />
      <span className="sr-only">{text}</span>
    </div>
  );
}
