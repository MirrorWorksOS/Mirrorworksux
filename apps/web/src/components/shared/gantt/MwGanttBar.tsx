/**
 * MwGanttBar — a single time-bar inside a row.
 *
 * Visually matches Schedule Engine: full status-colour fill with foreground
 * picked for contrast, optional icon prefix, smart content density that
 * adapts to bar width, hover card with full details.
 */
import { useState, type ReactNode } from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/components/ui/utils';

import { BAR_HEIGHT_PX, pxLeft, pxWidth } from './geometry';
import type { MwGanttItem, MwGanttZoom } from './types';

interface MwGanttBarProps {
  item: MwGanttItem;
  windowStart: Date;
  zoom: MwGanttZoom;
  /** Vertical offset within the row (set by the row when lane-stacking). */
  topPx?: number;
  /** Status → colour mapping supplied by caller. Item's `color` wins if set. */
  statusColour?: Record<string, string>;
  onClick?: (item: MwGanttItem) => void;
}

const DEFAULT_BAR_COLOUR = 'var(--mw-yellow-400)';
const MIN_BAR_WIDTH_PX = 36;

export function MwGanttBar({ item, windowStart, zoom, topPx = 4, statusColour, onClick }: MwGanttBarProps) {
  const [hovered, setHovered] = useState(false);

  const left = pxLeft(item.start, windowStart, zoom);
  const width = Math.max(MIN_BAR_WIDTH_PX, pxWidth(item.start, item.end, zoom));
  const fill =
    item.color ??
    (item.status && statusColour ? statusColour[item.status] : undefined) ??
    DEFAULT_BAR_COLOUR;

  const useDarkText = isLightFill(fill);
  const fgColour = useDarkText ? 'var(--mw-mirage)' : 'white';
  const fgOpacity = useDarkText ? 0.8 : 0.85;

  const progress = Math.max(0, Math.min(100, item.progress ?? 0));

  const hoverContent: ReactNode =
    item.renderHover?.(item) ?? (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        <p className="text-[10px] tabular-nums text-[var(--neutral-500)]">
          {formatRange(item.start, item.end)}
        </p>
        {item.status && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${fill} 18%, transparent)`,
              color: fill,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: fill }} />
            {item.status.replace(/_/g, ' ')}
          </span>
        )}
        {item.progress !== undefined && item.progress > 0 && (
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-[var(--neutral-500)]">Progress</span>
              <span className="font-medium tabular-nums text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: fill }}
              />
            </div>
          </div>
        )}
      </div>
    );

  const showLabel = width >= 80;
  const showMeta = width >= 160;

  return (
    <HoverCard openDelay={250} closeDelay={50}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            'absolute flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-md px-2 text-left shadow-[var(--card-shadow-rest)] transition-all duration-150',
            'hover:shadow-[var(--card-shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)] focus-visible:ring-offset-1',
            item.highlight && 'ring-2 ring-[var(--mw-yellow-400)] ring-offset-1 ring-offset-card',
            item.dimmed && 'opacity-50',
            hovered && 'z-10 scale-y-[1.08]',
          )}
          style={{
            left,
            width,
            top: topPx,
            height: BAR_HEIGHT_PX - 4,
            backgroundColor: fill,
            color: fgColour,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(item);
          }}
          aria-label={item.label}
        >
          {/* Progress fill — slight inner highlight over the right portion not yet done */}
          {progress > 0 && progress < 100 && (
            <span
              aria-hidden
              className="absolute inset-y-0 right-0 bg-black/12 dark:bg-white/10"
              style={{ width: `${100 - progress}%` }}
            />
          )}

          {/* Custom content slot wins */}
          {item.renderContent ? (
            <span className="relative z-[1] flex w-full items-center gap-1.5">
              {item.renderContent(item)}
            </span>
          ) : (
            <>
              {showLabel ? (
                <span
                  className="relative z-[1] truncate text-[11px] font-medium leading-none tabular-nums"
                  style={{ opacity: fgOpacity }}
                >
                  {item.label}
                </span>
              ) : (
                // Narrow bar: show a single dot so the bar reads as content rather than padding.
                <span
                  aria-hidden
                  className="relative z-[1] mx-auto h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: fgColour, opacity: 0.7 }}
                />
              )}
              {showMeta && item.status && (
                <span
                  className="relative z-[1] ml-auto shrink-0 rounded-full bg-black/12 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: fgColour, opacity: 0.9 }}
                >
                  {item.status.replace(/_/g, ' ')}
                </span>
              )}
            </>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={8}
        className="pointer-events-none w-72 rounded-lg border border-[var(--border)] bg-card p-3 shadow-[var(--card-shadow-elevated)]"
      >
        {hoverContent}
      </HoverCardContent>
    </HoverCard>
  );
}

function formatRange(start: Date, end: Date): string {
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · ${start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

/**
 * Heuristic: pick dark text on light-ish fills (yellows, light-neutrals,
 * info-light), else white. Looks at the colour token name and a tiny set
 * of known yellow/warning-family tokens. Defaults to "use white".
 */
function isLightFill(fill: string): boolean {
  const lower = fill.toLowerCase();
  return (
    lower.includes('yellow') ||
    lower.includes('warning') ||
    lower.includes('amber') ||
    lower.includes('--neutral-200') ||
    lower.includes('--neutral-100') ||
    lower.includes('--neutral-300') ||
    lower.includes('--neutral-400')
  );
}
