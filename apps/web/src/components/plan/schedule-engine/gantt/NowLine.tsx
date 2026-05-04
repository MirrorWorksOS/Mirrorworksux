/**
 * Vertical MW Yellow line marking the current local clock time, with a
 * Mirage label anchored at the top of the timeline body.
 */
import { useEffect, useState } from 'react';

import { DAY_END_HOUR, DAY_START_HOUR } from '../constants';
import { pxNow } from './ganttGeometry';

export function NowLine() {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 60_000); // 1 min refresh
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  if (hour < DAY_START_HOUR || hour >= DAY_END_HOUR) return null;

  const left = pxNow();
  const label = `NOW · ${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0"
      style={{ left, width: 0 }}
    >
      <div className="absolute inset-y-0 w-[2px] bg-[var(--mw-yellow-400)]" />
      <span className="absolute -top-6 left-1 inline-block whitespace-nowrap rounded-[var(--shape-xs)] bg-[var(--mw-mirage)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-wide text-white">
        {label}
      </span>
    </div>
  );
}
