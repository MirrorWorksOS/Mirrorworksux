/**
 * MwGantt — pixel/date geometry helpers. Multi-zoom: day / week / month.
 *
 * - Day view: single-day 24-hour grid, 1 hour per column, 56px each.
 *   Items that overlap "today" render at their actual hours. Whole-day or
 *   no-time items appear in an all-day banner above the hour grid (handled
 *   in MwGantt rendering, not here).
 * - Week view: 1 day per column, 96px each.
 * - Month view: rendered as a 7×N calendar grid by `MwGanttCalendar`, not as
 *   a horizontal timeline. The geometry below is only used by the existing
 *   timeline scaffold for backward-compatibility.
 *
 * Geometry helpers are pure functions of the `windowStart` reference and the
 * zoom level.
 */
import { addDays, differenceInMinutes, endOfDay, startOfDay } from 'date-fns';

import type { MwGanttZoom } from './types';

/** Day-view hour-column width. Slightly tighter than Schedule Engine (64) so 24h fits more comfortably. */
export const DAY_HOUR_PX = 56;
/** Number of hour columns rendered in Day view. Full 24h coverage. */
export const DAY_HOUR_COUNT = 24;

export const DAY_PX_BY_ZOOM: Record<MwGanttZoom, number> = {
  day: DAY_HOUR_PX * DAY_HOUR_COUNT,
  week: 96,
  month: 32,
};

export const HOUR_PX_BY_ZOOM: Record<MwGanttZoom, number> = {
  day: DAY_HOUR_PX,
  // For week/month zoom, hour resolution is sub-pixel — bars are clamped to day boundaries below.
  week: 96 / 24,
  month: 32 / 24,
};

export const ROW_HEIGHT_PX = 56;
export const ROW_LABEL_PX = 200;
export const BAR_HEIGHT_PX = 32;
export const HEADER_HEIGHT_PX = 48;

/** How many columns to render across the window. */
export function columnsInWindow(start: Date, end: Date, zoom: MwGanttZoom): number {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
  switch (zoom) {
    case 'day':
      return DAY_HOUR_COUNT;
    case 'week':
    case 'month':
      return days;
  }
}

/** Column width in pixels. */
export function colPx(zoom: MwGanttZoom): number {
  return zoom === 'day' ? DAY_HOUR_PX : DAY_PX_BY_ZOOM[zoom];
}

/** Total timeline width in px (gutter excluded). */
export function timelineWidthPx(start: Date, end: Date, zoom: MwGanttZoom): number {
  return columnsInWindow(start, end, zoom) * colPx(zoom);
}

/** Left edge in px for a given date inside the window. */
export function pxLeft(date: Date, windowStart: Date, zoom: MwGanttZoom): number {
  if (zoom === 'day') {
    // Day view: window start is the focused day's midnight; columns run 00:00–24:00.
    const minutes = differenceInMinutes(date, startOfDay(windowStart));
    return Math.max(0, (minutes / 60) * DAY_HOUR_PX);
  }
  // Week/month: 1 day per column
  const days = (date.getTime() - startOfDay(windowStart).getTime()) / 86_400_000;
  return Math.max(0, days * DAY_PX_BY_ZOOM[zoom]);
}

/** Width in px for a bar spanning [start, end]. Minimum 24px so bars stay readable. */
export function pxWidth(start: Date, end: Date, zoom: MwGanttZoom): number {
  if (zoom === 'day') {
    const minutes = Math.max(1, differenceInMinutes(end, start));
    return Math.max(24, (minutes / 60) * DAY_HOUR_PX);
  }
  const days = Math.max(0.25, (end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(24, days * DAY_PX_BY_ZOOM[zoom]);
}

/** Left edge for the now-indicator. Returns null when out of window. */
export function pxNow(now: Date, windowStart: Date, windowEnd: Date, zoom: MwGanttZoom): number | null {
  if (now.getTime() < windowStart.getTime() || now.getTime() > windowEnd.getTime()) return null;
  return pxLeft(now, windowStart, zoom);
}

/** True when an item's [start,end] overlaps the focused day window. */
export function itemOverlapsDay(itemStart: Date, itemEnd: Date, dayStart: Date): boolean {
  const dayStartMs = startOfDay(dayStart).getTime();
  const dayEndMs = endOfDay(dayStart).getTime();
  return itemEnd.getTime() >= dayStartMs && itemStart.getTime() <= dayEndMs;
}

/**
 * Heuristic: an item is "all-day" if its span covers ≥ 22 hours and doesn't
 * start at a non-midnight hour. These items render in the all-day banner
 * rather than the hour grid (where they'd swamp visible blocks).
 */
export function isAllDayItem(itemStart: Date, itemEnd: Date): boolean {
  const spanH = (itemEnd.getTime() - itemStart.getTime()) / 3_600_000;
  return spanH >= 22;
}

/** Header tick labels. */
export interface MwGanttTick {
  key: string;
  /** Top label (e.g. month/week label spanning multiple columns). */
  primary?: string;
  /** Per-column label (e.g. hour or day). */
  label: string;
  px: number;
  width: number;
  isToday?: boolean;
}

export function buildTicks(windowStart: Date, _windowEnd: Date, zoom: MwGanttZoom): MwGanttTick[] {
  const colWidth = colPx(zoom);
  if (zoom === 'day') {
    // Show full 24-hour day. Primary header carries the day label.
    const dayLabel = `${shortWeekday(windowStart)} ${windowStart.getDate()} ${monthShort(windowStart)}`;
    return Array.from({ length: DAY_HOUR_COUNT }, (_, i) => ({
      key: `h${i}`,
      label: `${String(i).padStart(2, '0')}:00`,
      px: i * colWidth,
      width: colWidth,
      primary: i === 0 ? dayLabel : undefined,
    }));
  }
  const cols = columnsInWindow(windowStart, _windowEnd, zoom);
  const todayMs = startOfDay(new Date()).getTime();
  return Array.from({ length: cols }, (_, i) => {
    const day = addDays(startOfDay(windowStart), i);
    const isToday = day.getTime() === todayMs;
    const label =
      zoom === 'week'
        ? `${shortWeekday(day)} ${day.getDate()}`
        : `${day.getDate()}`;
    const primary =
      i === 0 || day.getDate() === 1
        ? `${monthShort(day)} ${day.getFullYear()}`
        : undefined;
    return {
      key: `d${i}`,
      primary,
      label,
      px: i * colWidth,
      width: colWidth,
      isToday,
    };
  });
}

/** Default window for a zoom level — used when caller doesn't supply one. */
export function defaultWindow(zoom: MwGanttZoom, anchor: Date = new Date()): { start: Date; end: Date } {
  switch (zoom) {
    case 'day':
      return { start: startOfDay(anchor), end: endOfDay(anchor) };
    case 'week':
      // Window centered on today: 3 days back, 11 days forward (~2 weeks)
      return { start: startOfDay(addDays(anchor, -3)), end: endOfDay(addDays(anchor, 11)) };
    case 'month':
      return { start: startOfDay(addDays(anchor, -7)), end: endOfDay(addDays(anchor, 30)) };
  }
}

// ─── helpers ───────────────────────────────────────────────────────────

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function shortWeekday(d: Date): string {
  return SHORT_DAYS[d.getDay()];
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthShort(d: Date): string {
  return SHORT_MONTHS[d.getMonth()];
}
