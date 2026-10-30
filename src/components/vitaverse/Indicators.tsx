import { Meter } from "@/components/vitaverse/Shell";
import { DIMENSIONS, type DimensionValues } from "@/lib/dimensions";

/** Renders the six VITAVERSE Recovery Indicators (prototype indicators, not medical diagnoses). */
export function DimensionMeters({ values }: { values: Partial<DimensionValues> }) {
  return (
    <>
      {DIMENSIONS.map((d) => (
        <Meter key={d.key} label={d.label} value={values[d.key] ?? 0} />
      ))}
    </>
  );
}
