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

/** Default Recharts motion — subtle */
export const MW_RECHARTS_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 400,
  animationEasing: "ease-out" as const,
};

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
