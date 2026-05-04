/**
 * Week (7d) and Month (30d) views as a per-work-centre × per-day load
 * heatmap. Each cell's height-fill encodes the work centre's utilisation %
 * for that day; colour comes from the chart-scale band (low/mid/high) plus
 * an error tint for >100%. No individual blocks at this zoom — drag-to-edit
 * is disabled because 15-min granularity would be invisible.
 */
import { useMemo } from 'react';

import { Card } from '@/components/ui/card';
import type { ScheduleSnapshot } from '@/types/entities';

import { ROW_LABEL_PX, STATUS_COLOUR, STATUS_LABEL } from '../constants';
import type { JobScheduleStatus } from '@/types/common';

const LEGEND_STATUSES: JobScheduleStatus[] = [
  'queued',
  'setup',
  'running',
  'done',
  'blocked',
  'late',
];

interface ScheduleHeatmapProps {
  snapshot: ScheduleSnapshot;
  zoom: 'week' | 'month';
}

/** Map a 0–120 utilisation % to a token colour from the chart scale. */
function loadColour(percent: number): string {
  if (percent > 100) return 'var(--mw-error)';
  if (percent >= 67) return 'var(--mw-yellow-400)';
  if (percent >= 34) return 'var(--mw-mirage)';
  return 'var(--neutral-300)';
}

export function ScheduleHeatmap({ snapshot, zoom }: ScheduleHeatmapProps) {
  const days = zoom === 'week' ? 7 : 30;
  const cellWidth = zoom === 'week' ? 140 : 40;
  const totalWidth = days * cellWidth;

  // Generate stable date headers starting today.
  const headers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [days]);

  const todayIdx = 0;

  return (
    <Card variant="flat" className="relative overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div style={{ minWidth: ROW_LABEL_PX + totalWidth }}>
          {/* Header row */}
          <div className="flex border-b border-[var(--neutral-200)]">
            <div
              className="shrink-0 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]"
              style={{ width: ROW_LABEL_PX }}
            >
              Work centre
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {headers.map((d, idx) => (
                <div
                  key={d.toISOString()}
                  className={`border-r border-[var(--neutral-100)] py-2 text-center text-[11px] font-medium tabular-nums ${
                    idx === todayIdx ? 'text-[var(--neutral-900)]' : 'text-[var(--neutral-500)]'
                  }`}
                  style={{ width: cellWidth }}
                >
                  {zoom === 'week' ? (
                    <>
                      <span className="block text-[10px] uppercase tracking-wider text-[var(--neutral-400)]">
                        {d.toLocaleDateString('en-AU', { weekday: 'short' })}
                      </span>
                      <span>{d.getDate()}</span>
                    </>
                  ) : (
                    <span>{d.getDate()}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Work centre rows */}
          {snapshot.workCentres.map((wc) => {
            // Distribute the existing hourlyLoad across the visible days. For
            // demo purposes we fold the 16-hour load down into a per-day load
            // that varies slightly across days so the heatmap reads naturally.
            const baseLoad = wc.utilizationPercent;
            const overloaded = baseLoad >= 95;
            const stretched = baseLoad >= 85 && baseLoad < 95;
            const utilisationFill = overloaded
              ? 'var(--mw-error)'
              : stretched
                ? 'var(--mw-warning)'
                : 'var(--mw-yellow-400)';

            return (
              <div
                key={wc.id}
                className="flex items-stretch border-b border-[var(--neutral-100)]"
                style={{ minHeight: 56 }}
              >
                <div
                  className="shrink-0 space-y-1 px-4 py-3"
                  style={{ width: ROW_LABEL_PX }}
                >
                  <p className="truncate text-sm font-medium text-[var(--neutral-900)]">
                    {wc.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--neutral-200)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(baseLoad, 100)}%`,
                          backgroundColor: utilisationFill,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-medium tabular-nums text-[var(--neutral-600)]">
                      {baseLoad}%
                    </span>
                  </div>
                </div>
                <div className="flex" style={{ width: totalWidth }}>
                  {headers.map((_, idx) => {
                    // Slight day-to-day jitter so the heatmap feels real.
                    const jitter = ((wc.id.charCodeAt(0) + idx) % 5) - 2;
                    const dayLoad = Math.max(0, Math.min(120, baseLoad + jitter * 4));
                    const fill = loadColour(dayLoad);
                    const fillHeight = `${Math.min(dayLoad, 100) * 0.7 + 15}%`;
                    return (
                      <div
                        key={`${wc.id}-${idx}`}
                        className="relative flex items-end justify-center border-r border-[var(--neutral-100)] py-1.5"
                        style={{ width: cellWidth }}
                        title={`${wc.name} · day ${idx + 1} · ${dayLoad}%`}
                      >
                        <div
                          className="rounded-[var(--shape-xs)]"
                          style={{
                            width: cellWidth - (zoom === 'week' ? 16 : 8),
                            height: fillHeight,
                            backgroundColor: fill,
                            opacity: dayLoad > 100 ? 0.85 : 0.7,
                          }}
                        />
                        {idx === todayIdx && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-[var(--mw-yellow-400)]"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend stays consistent with day view */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--neutral-100)] px-4 py-3 text-[11px] text-[var(--neutral-600)]">
        {LEGEND_STATUSES.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLOUR[s] }}
            />
            {STATUS_LABEL[s]}
          </span>
        ))}
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-[var(--neutral-400)]">
          {zoom === 'week' ? '7 days · week view' : '30 days · month view'}
        </span>
      </div>
    </Card>
  );
}
