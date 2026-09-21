import { FigureLabel } from "@/components/ui/FigureLabel";
import { BRIDGE_STEPS } from "@/data/bridge";

/**
 * The four steps, each with what an observer sees once it has happened.
 * The "visible" line is the point of the section: a privacy tool that only
 * lists its own strengths is advertising, not documentation.
 */
export function Steps() {
  return (
    <div className="grid grid-cols-1 border-t border-border md:grid-cols-2 lg:grid-cols-4">
      {BRIDGE_STEPS.map((step, index) => (
        <div
          key={step.n}
          className={`flex flex-col gap-3 border-border p-4 md:p-5 ${
            index < BRIDGE_STEPS.length - 1 ? "border-b lg:border-r lg:border-b-0" : ""
          } ${index === 1 ? "md:border-r-0 lg:border-r" : ""}`}
        >
          <FigureLabel n={index + 1} />
          <div className="flex items-baseline gap-2 text-xl lg:text-h3-title">
            <span className="opacity-50">{step.n}</span>
            <span>{step.title}</span>
          </div>
          <p className="text-sm leading-140 text-fg-muted">{step.body}</p>
          <p className="mt-auto pt-2 text-2xs leading-140 text-fg-faint">
            <span className="label-2xs text-fg-subtle">Visible</span> · {step.visible}
          </p>
        </div>
      ))}
    </div>
  );
}
