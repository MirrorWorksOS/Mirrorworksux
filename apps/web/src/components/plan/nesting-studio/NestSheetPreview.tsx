// ─── NestSheetPreview — SVG render of a single packed sheet ──────────
// Shown in the right pane of the Nesting Studio. Each placed part is a
// rect filled by its part-row colour with the part number rendered in
// the centre. Hovering / clicking is left to the parent if it wants to
// wire up selection — this component is presentational.

import type { PackedSheet } from '@/lib/nesting/rectanglePacker';
import type { StudioPartRow } from './usePackedNest';
import type { SheetStock } from '@/types/entities';

export interface NestSheetPreviewProps {
  sheet: PackedSheet;
  sheetStock: SheetStock;
  parts: StudioPartRow[];
  /** Sheet thumbnail mode shrinks labels and hides annotations. */
  variant?: 'detailed' | 'thumbnail';
}

const PART_COLOURS = [
  'oklch(0.86 0.13 95)',   // brand yellow
  'oklch(0.74 0.14 30)',   // warm orange
  'oklch(0.75 0.15 200)',  // teal
  'oklch(0.78 0.12 130)',  // green
  'oklch(0.72 0.16 280)',  // purple
  'oklch(0.78 0.13 60)',   // amber
  'oklch(0.72 0.13 350)',  // pink
];

function colourForPart(partIndex: number): string {
  return PART_COLOURS[partIndex % PART_COLOURS.length];
}

export function NestSheetPreview({ sheet, sheetStock, parts, variant = 'detailed' }: NestSheetPreviewProps) {
  const W = sheetStock.widthMm;
  const H = sheetStock.heightMm;
  const isThumb = variant === 'thumbnail';

  // SVG strokes need to scale with sheet dimensions to render proportionally.
  const strokeBase = Math.max(W, H) * 0.0015;
  const fontSize = Math.max(W, H) * (isThumb ? 0 : 0.025);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-md border border-[var(--neutral-200)]"
      style={{
        backgroundColor: 'var(--neutral-100)',
        maxHeight: isThumb ? 120 : 480,
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        fill="var(--neutral-100)"
        stroke="var(--neutral-300)"
        strokeWidth={strokeBase * 1.5}
      />
      {sheet.placements.map((p) => {
        const part = parts[p.partIndex];
        const fill = colourForPart(p.partIndex);
        return (
          <g key={p.partId + '-' + p.xMm + '-' + p.yMm}>
            <rect
              x={p.xMm}
              y={p.yMm}
              width={p.widthMm}
              height={p.heightMm}
              fill={fill}
              opacity={0.85}
              stroke="oklch(0.20 0 0)"
              strokeWidth={strokeBase}
              rx={Math.min(p.widthMm, p.heightMm) * 0.02}
            />
            {!isThumb && fontSize > 0 && (
              <text
                x={p.xMm + p.widthMm / 2}
                y={p.yMm + p.heightMm / 2 + fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fill="oklch(0.15 0 0)"
                style={{ pointerEvents: 'none' }}
              >
                {part?.partNumber ?? '—'}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export { colourForPart };
