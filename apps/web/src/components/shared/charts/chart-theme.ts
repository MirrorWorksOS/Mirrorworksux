/**
 * **Chart colour strategies** (pick one per chart — document in a one-line comment):
 *
 * 1. **0–100 performance scale** — `getChartScaleColour(value)` / `marginToScalePercent` — one metric mapped to low / mid / high bands (grey → mirage → yellow).
 * 2. **Categorical slices** — `MW_CHART_COLOURS[i]` for distinct segments (supplier mix, budget type, series) — same ramp as the scale, not arbitrary semantic colours.
 *
 * Do not use `mw-info` blue as a generic “first slice” colour — use `MW_CHART_COLOURS[0]` or scale-based fills instead.
 */
export const MW_CHART_COLOURS = [
  "var(--chart-scale-high)",
  "var(--chart-scale-mid)",
  "var(--chart-scale-low)",
  "var(--neutral-400)",
  "var(--neutral-500)",
] as const;

/** @deprecated Use getChartScaleColour — kept for gradual migration */
export const MW_CHART_PURPLE = "var(--chart-scale-mid)";

export { getChartScaleColour, marginToScalePercent } from "@/components/shared/charts/chart-scale";

/** Normalised 0-100 → SVG pattern fill for bar charts (pairs with getChartScaleColour) */
export function getChartScalePattern(value0to100: number): string {
  const v = Math.max(0, Math.min(100, value0to100));
  if (v <= 33) return "url(#mw-hatch-scale-low)";
  if (v <= 66) return "url(#mw-hatch-scale-mid)";
  return "url(#mw-hatch-scale-high)";
}

/** Standard bar corner radii — horizontal bars (layout="vertical") */
export const MW_BAR_RADIUS_H: [number, number, number, number] = [0, 10, 10, 0];
/** Standard bar corner radii — vertical bars (default layout) */
export const MW_BAR_RADIUS_V: [number, number, number, number] = [10, 10, 0, 0];

/** Pattern fill constants for single-colour bars */
export const MW_FILL = {
  HATCH_YELLOW: "url(#mw-hatch-yellow)",
  HATCH_DARK: "url(#mw-hatch-dark)",
  HATCH_NEUTRAL: "url(#mw-hatch-neutral)",
} as const;

/** Default Recharts motion — smooth, ease-in-out */
export const MW_RECHARTS_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 1000,
  animationEasing: "ease-out" as const,
};

/** Bar charts — slightly longer tween than lines/areas */
export const MW_RECHARTS_ANIMATION_BAR = {
  isAnimationActive: true,
  animationDuration: 650,
  animationEasing: "ease-in-out" as const,
};

/**
 * Recharts default Cartesian tooltip cursor draws a grey band behind bars.
 * Pass as `<Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} />` on every BarChart.
 */
export const MW_BAR_TOOLTIP_CURSOR = { fill: "transparent" } as const;

export const MW_AXIS_TICK = {
  fontSize: 13,
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 300,
  fill: "var(--recharts-axis-tick, var(--neutral-500))",
  fontVariantNumeric: 'tabular-nums' as string,
};

export const MW_CARTESIAN_GRID = {
  strokeDasharray: "3 3",
  stroke: "var(--recharts-grid-stroke, var(--neutral-200))",
  vertical: false,
} as const;

export const MW_TOOLTIP_STYLE = {
  backgroundColor: "color-mix(in srgb, var(--popover) 95%, transparent)",
  backdropFilter: "blur(12px)",
  border: "1px solid var(--neutral-200)",
  borderRadius: "var(--shape-md)",
  boxShadow: "var(--elevation-3)",
  padding: "12px 16px",
} as const;
