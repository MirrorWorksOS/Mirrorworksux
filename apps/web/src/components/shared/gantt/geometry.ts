/**
 * MwGantt — pixel/date geometry helpers. Multi-zoom: day / week / month.
 *
 * Day view: 1 hour per column, 64px each (matches Schedule Engine).
 * Week view: 1 day per column, 96px each.
 * Month view: 1 day per column, 32px each (compact density).
 *
 * The window is anchored to today (configurable) and extends forward/backward
 * to provide useful context. Geometry helpers are pure functions of the
 * `windowStart` reference and the zoom level.
 */
import { addDays, differenceInMinutes, endOfDay, startOfDay } from 'date-fns';

import type { MwGanttZoom } from './types';

export const DAY_PX_BY_ZOOM: Record<MwGanttZoom, number> = {
  day: 64 * 15, // 15 visible hours per day at 64px each
  week: 96,
  month: 32,
};

export const HOUR_PX_BY_ZOOM: Record<MwGanttZoom, number> = {
  day: 64,
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
      return 15; // 6am–9pm
    case 'week':
    case 'month':
      return days;
  }
}

/** Column width in pixels. */
export function colPx(zoom: MwGanttZoom): number {
  return zoom === 'day' ? 64 : DAY_PX_BY_ZOOM[zoom];
}

/** Total timeline width in px (gutter excluded). */
export function timelineWidthPx(start: Date, end: Date, zoom: MwGanttZoom): number {
  return columnsInWindow(start, end, zoom) * colPx(zoom);
}

/** Left edge in px for a given date inside the window. */
export function pxLeft(date: Date, windowStart: Date, zoom: MwGanttZoom): number {
  if (zoom === 'day') {
    // Day view: window start is midnight; columns run 6am–9pm.
    const minutes = differenceInMinutes(date, addHours(startOfDay(windowStart), 6));
    return Math.max(0, (minutes / 60) * 64);
  }
  // Week/month: 1 day per column
  const days = (date.getTime() - startOfDay(windowStart).getTime()) / 86_400_000;
  return Math.max(0, days * DAY_PX_BY_ZOOM[zoom]);
}

/** Width in px for a bar spanning [start, end]. Minimum 24px so bars stay readable. */
export function pxWidth(start: Date, end: Date, zoom: MwGanttZoom): number {
  if (zoom === 'day') {
    const minutes = Math.max(1, differenceInMinutes(end, start));
    return Math.max(24, (minutes / 60) * 64);
  }
  const days = Math.max(0.25, (end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(24, days * DAY_PX_BY_ZOOM[zoom]);
}

/** Left edge for the now-indicator. Returns null when out of window. */
export function pxNow(now: Date, windowStart: Date, windowEnd: Date, zoom: MwGanttZoom): number | null {
  if (now.getTime() < windowStart.getTime() || now.getTime() > windowEnd.getTime()) return null;
  return pxLeft(now, windowStart, zoom);
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
    return Array.from({ length: 15 }, (_, i) => ({
      key: `h${i}`,
      label: `${String(6 + i).padStart(2, '0')}:00`,
      px: i * colWidth,
      width: colWidth,
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

function addHours(d: Date, h: number): Date {
  const x = new Date(d);
  x.setHours(x.getHours() + h);
  return x;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function shortWeekday(d: Date): string {
  return SHORT_DAYS[d.getDay()];
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthShort(d: Date): string {
  return SHORT_MONTHS[d.getMonth()];
}
