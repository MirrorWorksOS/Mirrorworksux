/**
 * Single scale for Recharts fills: 0–33% light grey, 34–66% mirage, 67–100% mw-yellow.
 */

/** Normalised 0–100 performance value → CSS colour token */
export function getChartScaleColour(value0to100: number): string {
  const v = Math.max(0, Math.min(100, value0to100));
  if (v <= 33) return "var(--chart-scale-low)";
  if (v <= 66) return "var(--chart-scale-mid)";
  return "var(--chart-scale-high)";
}

/** Map profit margin (roughly -20…+40) to 0–100 for the same scale */
export function marginToScalePercent(margin: number): number {
  return Math.max(0, Math.min(100, ((margin + 15) / 45) * 100));
}
