/**
 * NowLine — yellow vertical line marking "now" with a Mirage timestamp pill.
 * Generic version usable across modules (Sell, Plan, Schedule Engine). The
 * caller supplies the left-pixel position; this component just renders and
 * ticks every minute.
 */
import { useEffect, useState } from 'react';

import { format } from 'date-fns';

interface NowLineProps {
  /** Pixel offset from the timeline's left edge. */
  leftPx: number | null;
  /** Now reference — defaults to current local time. */
  now?: Date;
  /** Hide the time pill (use compact line only). */
  hidePill?: boolean;
}

export function NowLine({ leftPx, now: nowProp, hidePill = false }: NowLineProps) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (leftPx === null) return null;
  const now = nowProp ?? new Date();
  const label = `NOW · ${format(now, 'HH:mm')}`;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0"
      style={{ left: leftPx, width: 0 }}
    >
      <div className="absolute inset-y-0 w-[2px] bg-[var(--mw-yellow-400)]" />
      {!hidePill && (
        <span className="absolute -top-6 left-1 inline-block whitespace-nowrap rounded-[var(--shape-xs)] bg-[var(--mw-mirage)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-wide text-white">
          {label}
        </span>
      )}
    </div>
  );
}
