/**
 * MwGanttBar — a single time-bar inside a row. Renders a rounded pill with
 * progress fill, status colour, optional outline highlight (used for "moved"
 * state in Schedule Engine), and a hover card.
 */
import { useState, type ReactNode } from 'react';
import { cn } from '@/components/ui/utils';
import { BAR_HEIGHT_PX, pxLeft, pxWidth } from './geometry';
import type { MwGanttItem, MwGanttZoom } from './types';

interface MwGanttBarProps {
  item: MwGanttItem;
  windowStart: Date;
  zoom: MwGanttZoom;
  /** Status → colour mapping supplied by caller. Item's `color` wins if set. */
  statusColour?: Record<string, string>;
  onClick?: (item: MwGanttItem) => void;
}

const DEFAULT_BAR_COLOUR = 'var(--mw-yellow-400)';

export function MwGanttBar({ item, windowStart, zoom, statusColour, onClick }: MwGanttBarProps) {
  const [hovered, setHovered] = useState(false);

  const left = pxLeft(item.start, windowStart, zoom);
  const width = pxWidth(item.start, item.end, zoom);
  const fill =
    item.color ??
    (item.status && statusColour ? statusColour[item.status] : undefined) ??
    DEFAULT_BAR_COLOUR;

  const progress = Math.max(0, Math.min(100, item.progress ?? 0));

  const hoverContent: ReactNode =
    item.renderHover?.(item) ?? (
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">{item.label}</p>
        <p className="text-[10px] text-[var(--neutral-500)]">
          {formatRange(item.start, item.end)}
        </p>
      </div>
    );

  return (
    <div
      className={cn(
        'absolute top-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-full transition-transform duration-150',
        item.highlight && 'ring-2 ring-[var(--mw-yellow-400)] ring-offset-1 ring-offset-card',
        item.dimmed && 'opacity-50',
        hovered && 'scale-y-[1.12] z-10',
      )}
      style={{
        left,
        width,
        height: BAR_HEIGHT_PX - 8,
        backgroundColor: `color-mix(in srgb, ${fill} 22%, transparent)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(item);
      }}
      role="button"
      tabIndex={0}
      aria-label={item.label}
    >
      {/* Progress fill (or full fill if no progress specified) */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
        style={{
          width: progress > 0 ? `${progress}%` : '100%',
          backgroundColor: fill,
          opacity: progress > 0 ? 1 : 0.85,
        }}
      />
      <div className="relative flex h-full items-center px-2.5">
        <span
          className={cn(
            'truncate text-[10px] font-medium tabular-nums',
            isYellowish(fill) ? 'text-[var(--mw-mirage)]' : 'text-white',
          )}
        >
          {item.renderContent?.(item) ?? item.label}
        </span>
      </div>

      {hovered && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[200px] max-w-[320px] rounded-md border border-[var(--neutral-200)] bg-popover/95 p-2 shadow-lg backdrop-blur-md">
          {hoverContent}
        </div>
      )}
    </div>
  );
}

function formatRange(start: Date, end: Date): string {
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · ${start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

/** Cheap test for whether a fill colour is yellow-family (use dark text). */
function isYellowish(fill: string): boolean {
  const lower = fill.toLowerCase();
  return lower.includes('yellow') || lower.includes('warning') || lower.includes('amber');
}
