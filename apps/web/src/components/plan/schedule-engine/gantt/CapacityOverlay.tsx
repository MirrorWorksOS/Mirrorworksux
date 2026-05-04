/**
 * Red-tinted angled overlay marking time windows where the work centre's
 * load exceeds 100%. Sits behind the job blocks but above shift bands.
 */
import { DAY_START_HOUR, HOUR_PX } from '../constants';

interface CapacityOverlayProps {
  /** Hourly load array — index 0 = DAY_START_HOUR. Values >100 trigger the overlay. */
  hourlyLoad?: number[];
}

export function CapacityOverlay({ hourlyLoad }: CapacityOverlayProps) {
  if (!hourlyLoad?.length) return null;

  // Coalesce contiguous overload hours into rectangles.
  const rects: Array<{ startIdx: number; endIdx: number }> = [];
  let openStart: number | null = null;
  hourlyLoad.forEach((load, idx) => {
    if (load > 100 && openStart === null) openStart = idx;
    if ((load <= 100 || idx === hourlyLoad.length - 1) && openStart !== null) {
      const endIdx = load > 100 ? idx + 1 : idx;
      rects.push({ startIdx: openStart, endIdx });
      openStart = null;
    }
  });

  if (rects.length === 0) return null;

  return (
    <>
      {rects.map((r, idx) => (
        <div
          key={`overload-${idx}`}
          aria-hidden
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: r.startIdx * HOUR_PX,
            width: (r.endIdx - r.startIdx) * HOUR_PX,
            background:
              'repeating-linear-gradient(135deg, rgba(222,53,11,0.18) 0 6px, rgba(222,53,11,0.06) 6px 12px)',
            borderLeft: '1px solid rgba(222,53,11,0.25)',
            borderRight: '1px solid rgba(222,53,11,0.25)',
          }}
          title={`Overloaded ${DAY_START_HOUR + r.startIdx}:00–${DAY_START_HOUR + r.endIdx}:00`}
        />
      ))}
    </>
  );
}
