/**
 * Pixel/time helpers for the Schedule Engine Gantt.
 */
import { DAY_START_HOUR, HOUR_PX, HOURS_IN_VIEW } from '../constants';

export function minuteOffset(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() - DAY_START_HOUR) * 60 + d.getMinutes();
}

export function pxLeft(iso: string): number {
  return (minuteOffset(iso) / 60) * HOUR_PX;
}

export function pxWidth(start: string, end: string): number {
  const diff = minuteOffset(end) - minuteOffset(start);
  return Math.max((diff / 60) * HOUR_PX, 24);
}

/** Convert "HH:MM" to a px offset from the row's left edge. */
export function pxFromClock(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return ((h - DAY_START_HOUR) * 60 + (m ?? 0)) / 60 * HOUR_PX;
}

/** Width of the timeline body in px (label gutter excluded). */
export const TIMELINE_WIDTH_PX = HOURS_IN_VIEW * HOUR_PX;

/** Px offset from the row's left edge for the current local clock time. */
export function pxNow(): number {
  const d = new Date();
  return ((d.getHours() - DAY_START_HOUR) * 60 + d.getMinutes()) / 60 * HOUR_PX;
}
