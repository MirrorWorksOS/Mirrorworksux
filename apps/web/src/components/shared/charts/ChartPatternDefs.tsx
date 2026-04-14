/**
 * SVG pattern definitions for Recharts bar charts.
 *
 * **Usage**: call as a function, NOT as a component — Recharts only passes
 * through raw SVG elements, so the `<defs>` must be inlined:
 *
 *   <BarChart data={...}>
 *     {mwChartPatternDefs()}
 *     <Bar fill="url(#mw-hatch-yellow)" />
 *   </BarChart>
 *
 * Diagonal hatching in matched pairs — original and inverted colour scheme.
 * Fine cross-hatch variant for neutral / low-scale.
 *
 * Scale-aware patterns mirror getChartScaleColour() thresholds:
 *   - high → diagonal hatching on yellow
 *   - mid  → diagonal hatching on dark (inverted)
 *   - low  → fine cross-hatch on neutral grey
 */
export function mwChartPatternDefs() {
  return (
    <defs>
      {/* ── Yellow-ground hatching ── */}
      <pattern id="mw-hatch-yellow" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="#FFCF4B" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="#191406" fillOpacity={0.33} />
      </pattern>

      {/* ── Dark-ground hatching (inversion) ── */}
      <pattern id="mw-hatch-dark" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="#1A2732" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="#FFCF4B" fillOpacity={0.5} />
      </pattern>

      {/* ── Neutral-ground fine cross-hatch ── */}
      <pattern id="mw-hatch-neutral" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="#D4D4D4" />
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#1A2732" strokeWidth={0.75} strokeOpacity={0.2} />
      </pattern>

      {/* ── Scale-aware patterns (match getChartScaleColour thresholds) ── */}
      <pattern id="mw-hatch-scale-high" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="#FFCF4B" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="#191406" fillOpacity={0.25} />
      </pattern>

      <pattern id="mw-hatch-scale-mid" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="#1A2732" />
        <path d="M5 0h1L0 6V5zM6 5v1H5z" fill="#FFCF4B" fillOpacity={0.4} />
      </pattern>

      <pattern id="mw-hatch-scale-low" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="#D4D4D4" />
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#1A2732" strokeWidth={0.75} strokeOpacity={0.15} />
      </pattern>
    </defs>
  );
}
