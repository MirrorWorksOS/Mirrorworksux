/**
 * MwGanttRow — one Gantt row: label gutter on the left, bars on a date-scaled
 * timeline on the right.
 *
 * Bars overlapping in time are lane-stacked: each item gets a vertical lane
 * inside the row (greedy interval packing) and the row grows to fit. Weekend
 * day columns are subtly shaded in week zoom for visual rhythm.
 */
import { useMemo } from 'react';
import { startOfDay } from 'date-fns';

import { cn } from '@/components/ui/utils';

import { BAR_HEIGHT_PX, ROW_HEIGHT_PX, ROW_LABEL_PX, buildTicks } from './geometry';
import { MwGanttBar } from './MwGanttBar';
import type { MwGanttItem, MwGanttRowDef, MwGanttZoom } from './types';

interface MwGanttRowProps {
  row: MwGanttRowDef;
  items: MwGanttItem[];
  windowStart: Date;
  windowEnd: Date;
  zoom: MwGanttZoom;
  statusColour?: Record<string, string>;
  rowLabelPx?: number;
  rowHeightPx?: number;
  onItemClick?: (item: MwGanttItem) => void;
}

/** Vertical spacing between stacked bars within a lane. */
const LANE_GAP_PX = 4;
const LANE_HEIGHT_PX = BAR_HEIGHT_PX;
const ROW_PAD_PX = 8;

/**
 * Greedy interval packing: returns the lane index for each input item
 * such that items in the same lane don't overlap in time.
 */
function assignLanes(items: MwGanttItem[]): { item: MwGanttItem; lane: number }[] {
  const sorted = [...items].sort((a, b) => a.start.getTime() - b.start.getTime());
  const lanesEndMs: number[] = [];
  return sorted.map((item) => {
    const startMs = item.start.getTime();
    const endMs = item.end.getTime();
    // Find first lane whose last item ends ≤ this item's start.
    let lane = lanesEndMs.findIndex((endsAt) => endsAt <= startMs);
    if (lane === -1) {
      lanesEndMs.push(endMs);
      lane = lanesEndMs.length - 1;
    } else {
      lanesEndMs[lane] = endMs;
    }
    return { item, lane };
  });
}

export function MwGanttRow({
  row,
  items,
  windowStart,
  windowEnd,
  zoom,
  statusColour,
  rowLabelPx = ROW_LABEL_PX,
  rowHeightPx = ROW_HEIGHT_PX,
  onItemClick,
}: MwGanttRowProps) {
  const ticks = useMemo(() => buildTicks(windowStart, windowEnd, zoom), [windowStart, windowEnd, zoom]);

  const positioned = useMemo(() => assignLanes(items), [items]);
  const laneCount = positioned.reduce((max, p) => Math.max(max, p.lane + 1), 1);

  // Row grows when there are multiple lanes; otherwise honour the caller-supplied
  // baseline so consistent rows still render at the same height.
  const computedHeight =
    laneCount === 1
      ? rowHeightPx
      : ROW_PAD_PX * 2 + laneCount * LANE_HEIGHT_PX + (laneCount - 1) * LANE_GAP_PX;

  return (
    <div
      className="flex items-stretch border-b border-[var(--neutral-100)]"
      style={{ minHeight: computedHeight }}
    >
      {/* Gutter */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ width: rowLabelPx }}
      >
        {row.renderLabel ? (
          row.renderLabel()
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-[var(--neutral-900)] dark:text-foreground">
                {row.label}
              </p>
              {items.length > 0 && (
                <span className="rounded-full bg-[var(--neutral-100)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-[var(--neutral-600)] dark:bg-[var(--neutral-200)]/40 dark:text-neutral-400">
                  {items.length}
                </span>
              )}
            </div>
            {row.sublabel && (
              <div className="text-[11px] text-[var(--neutral-500)]">{row.sublabel}</div>
            )}
          </div>
        )}
      </div>

      {/* Timeline body */}
      <div className="relative flex-1" style={{ minHeight: computedHeight }}>
        {/* Vertical gridlines + weekend/today shading */}
        {ticks.map((t) => {
          const isWeekend = isWeekendTick(t, windowStart, zoom);
          return (
            <div
              key={t.key}
              className={cn(
                'absolute inset-y-0 border-r border-[var(--neutral-100)]',
                isWeekend && 'bg-[var(--neutral-50)]/60 dark:bg-neutral-900/30',
                t.isToday && 'bg-[var(--mw-yellow-400)]/8',
              )}
              style={{ left: t.px, width: t.width }}
            />
          );
        })}

        {/* Bars — positioned with a per-lane vertical offset */}
        {positioned.map(({ item, lane }) => (
          <MwGanttBar
            key={item.id}
            item={item}
            windowStart={windowStart}
            zoom={zoom}
            topPx={ROW_PAD_PX + lane * (LANE_HEIGHT_PX + LANE_GAP_PX)}
            statusColour={statusColour}
            onClick={onItemClick}
          />
        ))}

        {/* Empty hint */}
        {items.length === 0 && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] italic text-[var(--neutral-400)]">
            —
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Is this tick a Sat/Sun in week zoom? (Day zoom is single-day hours — no
 * concept of weekend. Month zoom is delegated to MwGanttCalendar.)
 */
function isWeekendTick(
  tick: { key: string; px: number; width: number },
  windowStart: Date,
  zoom: MwGanttZoom,
): boolean {
  if (zoom !== 'week') return false;
  // Tick key is 'd0' .. 'dN' for day-zoom ticks.
  const m = /^d(\d+)$/.exec(tick.key);
  if (!m) return false;
  const dayIndex = Number(m[1]);
  const day = new Date(startOfDay(windowStart));
  day.setDate(day.getDate() + dayIndex);
  const dow = day.getDay();
  return dow === 0 || dow === 6;
}
