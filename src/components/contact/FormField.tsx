import type { ReactNode } from "react";

export const INPUT_CLASS =
  "w-full bg-surface-card border border-border px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:border-fg/40 outline-none aria-[invalid=true]:border-chart-5/60";

export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-2xs text-fg-muted">
        {label}
        <span aria-hidden="true" className="ml-0.5 text-chart-5">
          *
        </span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-2xs text-chart-5">
          {error}
        </p>
      )}
    </div>
  );
}
