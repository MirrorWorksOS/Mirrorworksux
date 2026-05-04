/**
 * Top-level Schedule Engine Gantt: header (hour labels), rows (work centres
 * or jobs), now-line, and a footer status legend.
 */
import { useMemo, useRef } from 'react';

import { Card } from '@/components/ui/card';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { ScheduleBlock, ScheduleSnapshot } from '@/types/entities';
import type { JobScheduleStatus } from '@/types/common';

import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_PX,
  HOURS_IN_VIEW,
  ROW_LABEL_PX,
  STATUS_COLOUR,
  STATUS_LABEL,
} from '../constants';
import { NowLine } from './NowLine';
import { ScheduleGanttRow } from './ScheduleGanttRow';
import { ScheduleGanttToolbar } from './ScheduleGanttToolbar';
import { ScheduleHeatmap } from './ScheduleHeatmap';
import { TIMELINE_WIDTH_PX, pxNow } from './ganttGeometry';

interface ScheduleGanttProps {
  snapshot: ScheduleSnapshot;
  /** When set, blocks animate to new positions and moved blocks get a yellow border. */
  isProposed?: boolean;
  movedBlockIds?: Set<string>;
  /** Run-state hint for visual treatments during the Auto-Schedule sequence. */
  runState?: 'idle' | 'confirming' | 'running' | 'awaiting_approval';
  currentStepIndex?: number;
}

const LEGEND_STATUSES: JobScheduleStatus[] = [
  'queued',
  'setup',
  'running',
  'done',
  'blocked',
  'late',
];

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function applyFilter(blocks: ScheduleBlock[], filter: string): ScheduleBlock[] {
  switch (filter) {
    case 'late':
      return blocks.filter((b) => b.status === 'late');
    case 'at_risk':
      return blocks.filter((b) => b.status === 'at_risk');
    case 'rush':
      return blocks.filter((b) => b.isRush);
    case 'today':
      return blocks.filter((b) => isToday(b.startTime));
    default:
      return blocks;
  }
}

export function ScheduleGantt({
  snapshot,
  isProposed,
  movedBlockIds,
  runState = 'idle',
  currentStepIndex = 0,
}: ScheduleGanttProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const ganttFilter = useScheduleEngineStore((s) => s.ganttFilter);
  const ganttGroupBy = useScheduleEngineStore((s) => s.ganttGroupBy);
  const ganttZoom = useScheduleEngineStore((s) => s.ganttZoom);

  const filteredBlocks = useMemo(
    () => applyFilter(snapshot.blocks, ganttFilter),
    [snapshot.blocks, ganttFilter],
  );

  const groupedByWorkCentre = useMemo(() => {
    const map = new Map<string, ScheduleBlock[]>();
    snapshot.workCentres.forEach((wc) => map.set(wc.id, []));
    filteredBlocks.forEach((b) => {
      const arr = map.get(b.workCenterId);
      if (arr) arr.push(b);
    });
    return map;
  }, [snapshot.workCentres, filteredBlocks]);

  const hourLabels = useMemo(
    () =>
      Array.from({ length: HOURS_IN_VIEW + 1 }, (_, i) => {
        const h = DAY_START_HOUR + i;
        return `${String(h).padStart(2, '0')}:00`;
      }),
    [],
  );

  const handleJumpToNow = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, pxNow() - 200), behavior: 'smooth' });
  };

  const isShimmering = runState === 'running' && currentStepIndex >= 2 && currentStepIndex <= 3;
  const isPulsing = runState === 'running' && currentStepIndex === 4;
  const isDimming = runState === 'running' && currentStepIndex === 1;

  // Week / Month views render as a load heatmap rather than a per-block Gantt
  // — at those zooms 15-min blocks are illegible. Day view keeps the full
  // Gantt with drag-to-reschedule.
  if (ganttZoom !== 'day') {
    return (
      <div className="space-y-3">
        <Card variant="flat" className="p-0">
          <ScheduleGanttToolbar onJumpToNow={handleJumpToNow} />
        </Card>
        <ScheduleHeatmap snapshot={snapshot} zoom={ganttZoom} />
      </div>
    );
  }

  return (
    <Card variant="flat" className="relative flex h-full min-h-0 flex-col overflow-hidden p-0">
      {isProposed && (
        <span
          className="ai-card-glow absolute left-4 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-900)]"
        >
          AI proposal
        </span>
      )}

      <ScheduleGanttToolbar onJumpToNow={handleJumpToNow} />

      <div
        ref={scrollerRef}
        className="relative min-h-0 flex-1 overflow-auto"
        aria-busy={runState === 'running'}
      >
        {/* Loading shimmer overlay (steps 3–4) — AI teal, never yellow. */}
        {isShimmering && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, hsla(172,68%,58%,0.18) 50%, transparent 100%)',
              backgroundSize: '40% 100%',
              animation: 'mw-shimmer 2s linear infinite',
            }}
          />
        )}
        {isPulsing && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 animate-pulse"
            style={{ background: 'rgba(54,179,126,0.10)' }}
          />
        )}

        <div style={{ minWidth: ROW_LABEL_PX + TIMELINE_WIDTH_PX }}>
          {/* Hour header */}
          <div className="flex border-b border-[var(--neutral-200)]">
            <div
              className="shrink-0 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]"
              style={{ width: ROW_LABEL_PX }}
            >
              Work centre
            </div>
            <div className="relative" style={{ width: TIMELINE_WIDTH_PX, height: 32 }}>
              <div className="flex h-full">
                {hourLabels.slice(0, -1).map((h) => (
                  <div
                    key={h}
                    className="border-r border-[var(--neutral-100)] py-2 text-center text-[11px] font-medium tabular-nums text-[var(--neutral-500)]"
                    style={{ width: HOUR_PX }}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          <div
            className="relative transition-opacity duration-300"
            style={{ opacity: isDimming ? 0.55 : 1 }}
          >
            <div
              className="absolute"
              style={{ left: ROW_LABEL_PX, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}
            >
              <NowLine />
            </div>
            {ganttGroupBy === 'workCentre'
              ? snapshot.workCentres.map((wc) => (
                  <ScheduleGanttRow
                    key={wc.id}
                    workCentre={wc}
                    blocks={groupedByWorkCentre.get(wc.id) ?? []}
                    movedBlockIds={movedBlockIds}
                    isProposed={isProposed}
                  />
                ))
              : (() => {
                  // Group by job — synthesise pseudo-rows. Visual fidelity is fine for the demo.
                  const byJob = new Map<string, ScheduleBlock[]>();
                  filteredBlocks.forEach((b) => {
                    const list = byJob.get(b.jobNumber) ?? [];
                    list.push(b);
                    byJob.set(b.jobNumber, list);
                  });
                  return Array.from(byJob.entries()).map(([jobNumber, blocks]) => {
                    const first = blocks[0];
                    return (
                      <ScheduleGanttRow
                        key={jobNumber}
                        workCentre={{
                          id: jobNumber,
                          name: jobNumber,
                          type: first.customerName ?? '',
                          capacityHoursPerDay: 0,
                          utilizationPercent: 0,
                          activeJobs: blocks.length,
                          liveStatus: 'idle',
                          shift: snapshot.workCentres[0]?.shift,
                        }}
                        blocks={blocks}
                        movedBlockIds={movedBlockIds}
                        isProposed={isProposed}
                      />
                    );
                  });
                })()}
          </div>
        </div>
      </div>

      {/* Legend */}
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
          {DAY_START_HOUR}:00 – {DAY_END_HOUR}:00 · day view
        </span>
      </div>

      <style>{`
        @keyframes mw-shimmer {
          0% { background-position: -40% 0; }
          100% { background-position: 140% 0; }
        }
      `}</style>
    </Card>
  );
}
