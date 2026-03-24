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

/** Default Recharts motion — smooth, ease-in-out */
export const MW_RECHARTS_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 550,
  animationEasing: "ease-in-out" as const,
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
  fontSize: 12,
  fontFamily: "'Roboto', sans-serif",
  fill: "var(--neutral-500)",
} as const;

export const MW_CARTESIAN_GRID = {
  strokeDasharray: "3 3",
  stroke: "var(--neutral-200)",
  vertical: false,
} as const;

export const MW_TOOLTIP_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "1px solid var(--neutral-200)",
  borderRadius: "var(--shape-md)",
  boxShadow: "var(--elevation-3)",
  padding: "12px 16px",
} as const;
