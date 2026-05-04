/**
 * Background shading for non-shift hours and the lunch band.
 * Sits inside the timeline body, before the blocks layer.
 */
import { DAY_END_HOUR, DAY_START_HOUR, HOUR_PX } from '../constants';
import { pxFromClock } from './ganttGeometry';

interface ShiftBandsProps {
  shift?: { start: string; end: string; lunchStart?: string; lunchEnd?: string };
}

export function ShiftBands({ shift }: ShiftBandsProps) {
  if (!shift) return null;

  const startPx = pxFromClock(shift.start);
  const endPx = pxFromClock(shift.end);
  const dayWidthPx = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_PX;

  const lunchStart = shift.lunchStart ? pxFromClock(shift.lunchStart) : null;
  const lunchEnd = shift.lunchEnd ? pxFromClock(shift.lunchEnd) : null;

  return (
    <>
      {/* Pre-shift dimming */}
      {startPx > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: 0,
            width: startPx,
            background: 'var(--neutral-100)',
            opacity: 0.6,
          }}
        />
      )}
      {/* Post-shift dimming */}
      {endPx < dayWidthPx && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: endPx,
            width: dayWidthPx - endPx,
            background: 'var(--neutral-100)',
            opacity: 0.6,
          }}
        />
      )}
      {/* Lunch band */}
      {lunchStart !== null && lunchEnd !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: lunchStart,
            width: lunchEnd - lunchStart,
            background: 'var(--neutral-200)',
            opacity: 0.5,
          }}
        />
      )}
    </>
  );
}
