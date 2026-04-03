/**
 * SVG pattern definitions for Recharts bar charts.
 *
 * Render as a direct child of any Recharts chart component (BarChart, etc.)
 * so the patterns are available via `fill="url(#mw-hatch-yellow)"` etc.
 *
 * Patterns come in matched pairs — original and inverted colour scheme:
 *   - Diagonal hatching (6×6) on yellow / dark
 *   - Polka dots (10×10) on yellow / dark
 *   - Fine cross-hatch lines (4×4) on neutral
 *
 * Scale-aware patterns mirror getChartScaleColour() thresholds:
 *   - high → diagonal hatching on chart-scale-high
 *   - mid  → polka dots on chart-scale-mid
 *   - low  → fine cross-hatch on chart-scale-low
 */
export function ChartPatternDefs() {
  return (
    <defs>
      {/* ── Yellow-ground patterns ── */}
      <pattern id="mw-hatch-yellow" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="var(--mw-yellow-400)" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="#191406" fillOpacity={0.33} />
      </pattern>

      <pattern id="mw-dots-yellow" patternUnits="userSpaceOnUse" width="10" height="10">
        <rect width="10" height="10" fill="var(--mw-yellow-400)" />
        <circle cx="1.5" cy="1.5" r="1.5" fill="#191406" fillOpacity={0.33} />
        <circle cx="6.5" cy="6.5" r="1.5" fill="#191406" fillOpacity={0.33} />
      </pattern>

      {/* ── Dark-ground patterns (inversions) ── */}
      <pattern id="mw-hatch-dark" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="var(--mw-mirage)" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="var(--mw-yellow-400)" fillOpacity={0.5} />
      </pattern>

      <pattern id="mw-dots-dark" patternUnits="userSpaceOnUse" width="10" height="10">
        <rect width="10" height="10" fill="var(--mw-mirage)" />
        <circle cx="1.5" cy="1.5" r="1.5" fill="var(--mw-yellow-400)" fillOpacity={0.5} />
        <circle cx="6.5" cy="6.5" r="1.5" fill="var(--mw-yellow-400)" fillOpacity={0.5} />
      </pattern>

      {/* ── Neutral-ground pattern ── */}
      <pattern id="mw-hatch-neutral" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="var(--neutral-300)" />
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="var(--mw-mirage)" strokeWidth={0.75} strokeOpacity={0.2} />
      </pattern>

      {/* ── Scale-aware patterns (match getChartScaleColour thresholds) ── */}
      <pattern id="mw-hatch-scale-high" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="var(--chart-scale-high)" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="#191406" fillOpacity={0.25} />
      </pattern>

      <pattern id="mw-dots-scale-mid" patternUnits="userSpaceOnUse" width="10" height="10">
        <rect width="10" height="10" fill="var(--chart-scale-mid)" />
        <circle cx="1.5" cy="1.5" r="1.5" fill="var(--mw-yellow-400)" fillOpacity={0.4} />
        <circle cx="6.5" cy="6.5" r="1.5" fill="var(--mw-yellow-400)" fillOpacity={0.4} />
      </pattern>

      <pattern id="mw-hatch-scale-low" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="var(--chart-scale-low)" />
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="var(--mw-mirage)" strokeWidth={0.75} strokeOpacity={0.15} />
      </pattern>
    </defs>
  );
}
