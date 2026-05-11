// ─── NestSheetPreview — SVG render of a single packed sheet ──────────
// Shown in the right pane of the Nesting Studio. Each placed part is a
// rect filled by its part-row colour with the part number rendered in
// the centre. When the part has a parsed DXF polygon, the true outline
// is drawn over the bbox slot. Right-clicking a placement opens a
// context menu (rotate / remove / duplicate / view part) wired through
// the parent.

import { useState } from 'react';
import { RotateCw, Trash2, Copy, ExternalLink, FlipHorizontal2 } from 'lucide-react';

import type { PackedSheet } from '@/lib/nesting/rectanglePacker';
import type { StudioPartRow } from './usePackedNest';
import type { SheetStock } from '@/types/entities';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export interface NestSheetPreviewProps {
  sheet: PackedSheet;
  sheetStock: SheetStock;
  parts: StudioPartRow[];
  /** Sheet thumbnail mode shrinks labels and hides annotations. */
  variant?: 'detailed' | 'thumbnail';
  /** Right-click → rotate the underlying part row 90°. */
  onRotatePart?: (partIndex: number) => void;
  /** Right-click → toggle the part row's `allowMirror` flag. */
  onMirrorPart?: (partIndex: number) => void;
  /** Right-click → remove the part row from the nest. */
  onRemovePart?: (partIndex: number) => void;
  /** Right-click → bump the part's qty by one. */
  onDuplicatePart?: (partIndex: number) => void;
  /** Right-click → navigate to the product detail page. */
  onViewPart?: (partIndex: number) => void;
  /**
   * When true, the active sheet has a grain direction — mirror is force-off
   * and the menu item shows a disabled state with an explanatory hint.
   */
  mirrorBlockedByGrain?: boolean;
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

/**
 * Build an SVG `points` string for a polygon placed on the sheet. The
 * polygon lives in part-local coords [0..origW] × [0..origH]. The packer
 * may have rotated the part 0/90/180/270 and optionally mirrored it; we
 * apply the same transform here so the rendered shape matches the slot
 * the packer reserved.
 */
function polygonPoints(
  polygon: [number, number][],
  row: StudioPartRow,
  placement: PackedSheet['placements'][number],
): string {
  const origW = row.widthMm;
  const origH = row.heightMm;
  const rot = placement.rotationDeg;
  const mirror = placement.mirror === true;
  return polygon
    .map(([x, y]) => {
      let px = mirror ? origW - x : x;
      let py = y;
      switch (rot) {
        case 0:
          break;
        case 90:
          [px, py] = [origH - py, px]; break;
        case 180:
          [px, py] = [origW - px, origH - py]; break;
        case 270:
          [px, py] = [py, origW - px]; break;
      }
      return `${placement.xMm + px},${placement.yMm + py}`;
    })
    .join(' ');
}

export function NestSheetPreview({
  sheet,
  sheetStock,
  parts,
  variant = 'detailed',
  onRotatePart,
  onMirrorPart,
  onRemovePart,
  onDuplicatePart,
  onViewPart,
  mirrorBlockedByGrain = false,
}: NestSheetPreviewProps) {
  const W = sheetStock.widthMm;
  const H = sheetStock.heightMm;
  const isThumb = variant === 'thumbnail';
  const interactive = !isThumb && Boolean(
    onRotatePart || onMirrorPart || onRemovePart || onDuplicatePart || onViewPart,
  );

  const [activePartIndex, setActivePartIndex] = useState<number | null>(null);
  const activePart = activePartIndex !== null ? parts[activePartIndex] : null;

  // SVG strokes need to scale with sheet dimensions to render proportionally.
  const strokeBase = Math.max(W, H) * 0.0015;
  const fontSize = Math.max(W, H) * (isThumb ? 0 : 0.025);

  const svg = (
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
        const polygon = part?.outerPolygon && part.outerPolygon.length >= 3
          ? polygonPoints(part.outerPolygon, part, p)
          : null;
        return (
          <g
            key={p.partId + '-' + p.xMm + '-' + p.yMm}
            onContextMenu={interactive ? () => setActivePartIndex(p.partIndex) : undefined}
            style={interactive ? { cursor: 'context-menu' } : undefined}
          >
            {polygon ? (
              <>
                {/* Subtle bbox hint so users can still see the packer slot. */}
                <rect
                  x={p.xMm}
                  y={p.yMm}
                  width={p.widthMm}
                  height={p.heightMm}
                  fill="none"
                  stroke={fill}
                  strokeWidth={strokeBase * 0.6}
                  strokeDasharray={`${strokeBase * 4} ${strokeBase * 3}`}
                  opacity={0.5}
                  rx={Math.min(p.widthMm, p.heightMm) * 0.02}
                />
                <polygon
                  points={polygon}
                  fill={fill}
                  opacity={0.85}
                  stroke="oklch(0.20 0 0)"
                  strokeWidth={strokeBase}
                  strokeLinejoin="round"
                />
              </>
            ) : (
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
            )}
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

  if (!interactive) return svg;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{svg}</ContextMenuTrigger>
      <ContextMenuContent>
        {activePart && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono">
              {activePart.partNumber}
            </div>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem
          onSelect={() => activePartIndex !== null && onRotatePart?.(activePartIndex)}
          disabled={!onRotatePart}
        >
          <RotateCw className="h-4 w-4" /> Rotate 90°
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => activePartIndex !== null && onMirrorPart?.(activePartIndex)}
          disabled={!onMirrorPart || mirrorBlockedByGrain}
        >
          <FlipHorizontal2 className="h-4 w-4" />
          {activePart?.allowMirror ? 'Disable mirror' : 'Allow mirror'}
          {mirrorBlockedByGrain && (
            <span className="ml-auto text-xs text-muted-foreground">grain</span>
          )}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => activePartIndex !== null && onDuplicatePart?.(activePartIndex)}
          disabled={!onDuplicatePart}
        >
          <Copy className="h-4 w-4" /> Duplicate
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => activePartIndex !== null && onViewPart?.(activePartIndex)}
          disabled={!onViewPart || !activePart?.productId}
        >
          <ExternalLink className="h-4 w-4" /> View part
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          onSelect={() => activePartIndex !== null && onRemovePart?.(activePartIndex)}
          disabled={!onRemovePart}
        >
          <Trash2 className="h-4 w-4" /> Remove from nest
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export { colourForPart };
