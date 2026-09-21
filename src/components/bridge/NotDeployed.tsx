import { FigureLabel } from "@/components/ui/FigureLabel";
import { BRIDGE_NOT_DEPLOYED, BRIDGE_REQUIREMENTS } from "@/data/bridge";
import { VEIL } from "@/data/site";

const ADDRESSES = [
  { key: "Entrypoint", value: VEIL.entrypoint },
  { key: "PrivacyPool", value: VEIL.pool },
  { key: "VeilGateway", value: VEIL.gateway },
  { key: "Relayer", value: VEIL.relayer },
] as const;

/**
 * Shown while the addresses in `src/data/site.ts` are still null.
 *
 * The roadmap's rule applies to pages too: nothing is described in the present
 * tense until it ships. Filling in the addresses is what turns this panel off.
 */
export function NotDeployed() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <FigureLabel n={2} />
      <div className="text-xl lg:text-h3-title">{BRIDGE_NOT_DEPLOYED.title}</div>
      <p className="text-sm leading-140 text-fg-muted">{BRIDGE_NOT_DEPLOYED.body}</p>

      <dl className="flex flex-col border border-border">
        {ADDRESSES.map(({ key, value }, index) => {
          const why = BRIDGE_REQUIREMENTS[index]?.why;
          return (
            <div key={key} className="flex flex-col gap-1 border-b border-border px-3 py-2 last:border-b-0">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="label-2xs text-fg-subtle">{key}</dt>
                <dd className={`font-mono text-2xs ${value ? "text-fg-muted" : "text-chart-2"}`}>
                  {value ?? "not deployed"}
                </dd>
              </div>
              {why && <p className="text-2xs text-fg-faint">{why}</p>}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
