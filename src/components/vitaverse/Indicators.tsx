import { Meter } from "@/components/vitaverse/Shell";
import type { ModuleDef } from "@/lib/modules";
import type { IndicatorValues } from "@/lib/vitaverse-store";

/** Renders the module's own recovery indicators from recorded values. */
export function IndicatorMeters({ mod, values }: { mod: ModuleDef; values: IndicatorValues }) {
  return (
    <>
      {mod.indicators.map((ind) => (
        <Meter key={ind.key} label={ind.label} value={values[ind.key] ?? 0} />
      ))}
    </>
  );
}
