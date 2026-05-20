/**
 * MwGantt — multi-zoom Gantt with rows + bars. Visually aligned with the
 * Schedule Engine Gantt (yellow now-line, Mirage timestamp pill, hatched
 * gridlines) but generic across modules.
 *
 * Render contract: caller supplies `rows` (left gutter content) and `items`
 * (bars positioned by date). Zoom defaults to "week"; supply `onZoomChange`
 * to expose the zoom selector.
 */
import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';

import {
  HEADER_HEIGHT_PX,
  ROW_HEIGHT_PX,
  ROW_LABEL_PX,
  buildTicks,
  defaultWindow,
  isAllDayItem,
  itemOverlapsDay,
  pxLeft,
  pxNow,
  pxWidth,
  timelineWidthPx,
} from './geometry';
import { MwGanttCalendar } from './MwGanttCalendar';
import { MwGanttRow } from './MwGanttRow';
import { MwGanttToolbar } from './MwGanttToolbar';
import { NowLine } from './NowLine';
import type { MwGanttProps, MwGanttZoom } from './types';

export function MwGantt({
  rows,
  items,
  dependencies,
  zoom: zoomProp,
  onZoomChange,
  windowStart: windowStartProp,
  windowEnd: windowEndProp,
  today,
  onItemClick,
  toolbar,
  statusColour,
  legend,
  emptyMessage = 'No items in this window.',
  rowLabelPx = ROW_LABEL_PX,
  rowHeightPx = ROW_HEIGHT_PX,
  className,
}: MwGanttProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Allow uncontrolled zoom when consumer doesn't pass onZoomChange handler.
  const [internalZoom, setInternalZoom] = useState<MwGanttZoom>(zoomProp);
  const zoom = onZoomChange ? zoomProp : internalZoom;
  const handleZoom = (z: MwGanttZoom) => {
    if (onZoomChange) onZoomChange(z);
    else setInternalZoom(z);
  };

  /**
   * Window is always a single day in Day zoom (use the focused-day anchor),
   * regardless of any caller-supplied range. For Week/Month, honour caller
   * range when provided, else fall back to the zoom default.
   */
  const window = useMemo(() => {
    if (zoom === 'day') {
      return defaultWindow('day', today);
    }
    if (windowStartProp && windowEndProp) {
      return { start: windowStartProp, end: windowEndProp };
    }
    return defaultWindow(zoom, today);
  }, [windowStartProp, windowEndProp, zoom, today]);

  const ticks = useMemo(() => buildTicks(window.start, window.end, zoom), [window, zoom]);
  const timelineWidth = useMemo(
    () => timelineWidthPx(window.start, window.end, zoom),
    [window, zoom],
  );

  /**
   * Effective items shown in the timeline. In Day zoom we filter to items
   * overlapping the focused day so the hour grid isn't bombarded with bars
   * positioned far outside its window.
   */
  const timelineItems = useMemo(() => {
    if (zoom !== 'day') return items;
    return items.filter((it) => itemOverlapsDay(it.start, it.end, window.start));
  }, [items, window.start, zoom]);

  /** Split day-zoom items into "all-day" (banner row) vs. time-positioned. */
  const dayAllDayByRow = useMemo(() => {
    const map = new Map<string, typeof items>();
    if (zoom !== 'day') return map;
    rows.forEach((r) => map.set(r.id, []));
    timelineItems.forEach((item) => {
      if (isAllDayItem(item.start, item.end)) {
        map.get(item.rowId)?.push(item);
      }
    });
    return map;
  }, [rows, timelineItems, zoom]);

  const itemsByRow = useMemo(() => {
    const map = new Map<string, typeof items>();
    rows.forEach((r) => map.set(r.id, []));
    const allDaySet =
      zoom === 'day'
        ? new Set(
            Array.from(dayAllDayByRow.values()).flatMap((arr) => arr.map((i) => i.id)),
          )
        : null;
    timelineItems.forEach((item) => {
      if (allDaySet && allDaySet.has(item.id)) return;
      const list = map.get(item.rowId);
      if (list) list.push(item);
    });
    return map;
  }, [rows, timelineItems, dayAllDayByRow, zoom]);

  const nowPx = useMemo(
    () => pxNow(today ?? new Date(), window.start, window.end, zoom),
    [today, window, zoom],
  );

  const handleJumpToNow = () => {
    if (nowPx === null || !scrollerRef.current) return;
    scrollerRef.current.scrollTo({ left: Math.max(0, nowPx - 200), behavior: 'smooth' });
  };

  // Pre-compute item positions so the dependency overlay can hit the bar centres.
  const itemPositions = useMemo(() => {
    const map = new Map<string, { left: number; width: number; rowIndex: number }>();
    const rowIndex = new Map(rows.map((r, i) => [r.id, i]));
    items.forEach((it) => {
      const ri = rowIndex.get(it.rowId);
      if (ri === undefined) return;
      map.set(it.id, {
        left: pxLeft(it.start, window.start, zoom),
        width: pxWidth(it.start, it.end, zoom),
        rowIndex: ri,
      });
    });
    return map;
  }, [rows, items, window.start, zoom]);

  const arrowEdges = useMemo(() => {
    if (!dependencies || dependencies.length === 0) return [];
    const edges: Array<{ key: string; d: string; color: string }> = [];
    dependencies.forEach((dep) => {
      const from = itemPositions.get(dep.from);
      const to = itemPositions.get(dep.to);
      if (!from || !to) return;
      const fromX = from.left + from.width;
      const toX = to.left;
      const fromY = from.rowIndex * rowHeightPx + rowHeightPx / 2;
      const toY = to.rowIndex * rowHeightPx + rowHeightPx / 2;
      // Cubic curve elbow.
      const midX = fromX + Math.max(20, (toX - fromX) / 2);
      const d = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
      edges.push({
        key: `${dep.from}-${dep.to}`,
        d,
        color: dep.color ?? 'var(--neutral-400)',
      });
    });
    return edges;
  }, [dependencies, itemPositions, rowHeightPx]);

  // Group ticks for primary header (month/year labels in week/month zoom)
  const primaryGroups = useMemo(() => {
    if (zoom === 'day') return [];
    const groups: Array<{ label: string; left: number; width: number }> = [];
    ticks.forEach((t) => {
      if (t.primary) {
        groups.push({ label: t.primary, left: t.px, width: 0 });
      }
      if (groups.length > 0) {
        groups[groups.length - 1].width = t.px + t.width - groups[groups.length - 1].left;
      }
    });
    return groups;
  }, [ticks, zoom]);

  // Month zoom: defer to the calendar grid renderer. Horizontal-timeline
  // bars at 32px/day look like dots at that density.
  if (zoom === 'month') {
    return (
      <Card
        variant="flat"
        className={cn('relative flex h-full min-h-0 flex-col overflow-hidden p-0', className)}
      >
        <MwGanttToolbar
          zoom={zoom}
          onZoomChange={handleZoom}
          leadingActions={toolbar}
        />
        <div className="min-h-0 flex-1 overflow-auto">
          <MwGanttCalendar
            items={items}
            statusColour={statusColour}
            initialMonth={today ?? new Date()}
            onItemClick={onItemClick}
          />
        </div>
        {legend && legend.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--neutral-100)] px-4 py-3 text-[11px] text-[var(--neutral-600)]">
            {legend.map((entry) => (
              <span key={entry.key} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.label}
              </span>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card variant="flat" className={cn('relative flex h-full min-h-0 flex-col overflow-hidden p-0', className)}>
      <MwGanttToolbar
        zoom={zoom}
        onZoomChange={handleZoom}
        onJumpToNow={nowPx !== null ? handleJumpToNow : undefined}
        leadingActions={toolbar}
      />

      <div
        ref={scrollerRef}
        className="relative min-h-0 flex-1 overflow-auto"
      >
        <div style={{ minWidth: rowLabelPx + timelineWidth }}>
          {/* Primary header (months) — only for week/month zoom */}
          {primaryGroups.length > 0 && (
            <div className="flex border-b border-[var(--neutral-100)]">
              <div
                className="shrink-0 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-400)]"
                style={{ width: rowLabelPx }}
              >
                &nbsp;
              </div>
              <div className="relative" style={{ width: timelineWidth, height: 24 }}>
                {primaryGroups.map((g) => (
                  <div
                    key={g.label + g.left}
                    className="absolute inset-y-0 border-r border-[var(--neutral-100)] py-1 pl-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]"
                    style={{ left: g.left, width: g.width }}
                  >
                    {g.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary header (per-column labels) */}
          <div className="flex border-b border-[var(--neutral-200)]">
            <div
              className="shrink-0 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]"
              style={{ width: rowLabelPx }}
            >
              {/* Caller can override per-row, this is just a placeholder */}
              &nbsp;
            </div>
            <div className="relative" style={{ width: timelineWidth, height: HEADER_HEIGHT_PX - 16 }}>
              {ticks.map((t) => (
                <div
                  key={t.key}
                  className={cn(
                    'absolute inset-y-0 border-r border-[var(--neutral-100)] py-2 text-center text-[11px] font-medium tabular-nums',
                    t.isToday ? 'text-[var(--mw-yellow-700)]' : 'text-[var(--neutral-500)]',
                  )}
                  style={{ left: t.px, width: t.width }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {/* Now line overlay — absolutely positioned over the body, sitting in front of grid but behind bars */}
            <div
              className="absolute"
              style={{ left: rowLabelPx, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}
            >
              <NowLine leftPx={nowPx} />
            </div>

            {/* Dependency arrows — SVG overlay above the row gridlines, behind the bars. */}
            {arrowEdges.length > 0 && (
              <svg
                className="pointer-events-none absolute"
                style={{
                  left: rowLabelPx,
                  top: 0,
                  width: timelineWidth,
                  height: rows.length * rowHeightPx,
                }}
                aria-hidden
              >
                <defs>
                  <marker
                    id="mw-gantt-arrowhead"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--neutral-500)" />
                  </marker>
                </defs>
                {arrowEdges.map((e) => (
                  <path
                    key={e.key}
                    d={e.d}
                    fill="none"
                    stroke={e.color}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    markerEnd="url(#mw-gantt-arrowhead)"
                    opacity={0.7}
                  />
                ))}
              </svg>
            )}

            {rows.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[var(--neutral-500)]">{emptyMessage}</div>
            ) : (
              rows.map((row) => {
                const allDay = zoom === 'day' ? dayAllDayByRow.get(row.id) ?? [] : [];
                return (
                  <div key={row.id}>
                    {allDay.length > 0 && (
                      <div
                        className="flex items-stretch border-b border-dashed border-[var(--neutral-200)] bg-[var(--neutral-50)]/30 dark:bg-neutral-900/10"
                        style={{ minHeight: 32 }}
                      >
                        <div
                          className="shrink-0 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--neutral-400)]"
                          style={{ width: rowLabelPx }}
                        >
                          All day
                        </div>
                        <div
                          className="relative flex-1 px-2 py-1"
                          style={{ minWidth: timelineWidth }}
                        >
                          <div className="flex flex-wrap gap-1">
                            {allDay.map((it) => {
                              const fill =
                                it.color ??
                                (it.status && statusColour ? statusColour[it.status] : undefined) ??
                                'var(--mw-yellow-400)';
                              return (
                                <button
                                  key={it.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onItemClick?.(it);
                                  }}
                                  className="inline-flex max-w-[260px] items-center gap-1 truncate rounded-full px-2 py-0.5 text-[10px] hover:opacity-90"
                                  style={{
                                    backgroundColor: `color-mix(in srgb, ${fill} 22%, transparent)`,
                                  }}
                                  title={it.label}
                                >
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: fill }}
                                  />
                                  <span className="truncate text-foreground">{it.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    <MwGanttRow
                      row={row}
                      items={itemsByRow.get(row.id) ?? []}
                      windowStart={window.start}
                      windowEnd={window.end}
                      zoom={zoom}
                      statusColour={statusColour}
                      rowLabelPx={rowLabelPx}
                      rowHeightPx={rowHeightPx}
                      onItemClick={onItemClick}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--neutral-100)] px-4 py-3 text-[11px] text-[var(--neutral-600)]">
          {legend.map((entry) => (
            <span key={entry.key} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
