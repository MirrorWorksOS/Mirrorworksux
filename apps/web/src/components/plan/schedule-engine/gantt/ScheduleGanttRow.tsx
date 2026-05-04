/**
 * A single Gantt row: work-centre label gutter on the left, timeline body
 * on the right with shift bands, capacity overlay, and job blocks.
 */
import type { ScheduleBlock, WorkCentre } from '@/types/entities';

import { BLOCK_HEIGHT_PX, ROW_LABEL_PX, STATUS_COLOUR } from '../constants';
import { CapacityOverlay } from './CapacityOverlay';
import { ScheduleGanttBlock } from './ScheduleGanttBlock';
import { ShiftBands } from './ShiftBands';
import { TIMELINE_WIDTH_PX } from './ganttGeometry';

interface ScheduleGanttRowProps {
  workCentre: WorkCentre;
  blocks: ScheduleBlock[];
  movedBlockIds?: Set<string>;
  isProposed?: boolean;
}

const LIVE_DOT: Record<NonNullable<WorkCentre['liveStatus']>, string> = {
  running: 'var(--mw-success)',
  setup: 'var(--mw-yellow-300)',
  blocked: 'var(--mw-error)',
  idle: 'var(--neutral-400)',
};

export function ScheduleGanttRow({
  workCentre,
  blocks,
  movedBlockIds,
  isProposed,
}: ScheduleGanttRowProps) {
  const liveColour = workCentre.liveStatus ? LIVE_DOT[workCentre.liveStatus] : 'var(--neutral-400)';
  const utilisation = workCentre.utilizationPercent;
  const overloaded = utilisation >= 95;
  const stretched = utilisation >= 85 && utilisation < 95;

  const utilisationFill = overloaded
    ? 'var(--mw-error)'
    : stretched
      ? 'var(--mw-warning)'
      : 'var(--mw-yellow-400)';

  return (
    <div
      className="flex items-stretch border-b border-[var(--neutral-100)]"
      style={{ minHeight: BLOCK_HEIGHT_PX + 24 }}
    >
      <div
        className="shrink-0 space-y-1 px-4 py-3"
        style={{ width: ROW_LABEL_PX }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: liveColour }}
            title={`Live status: ${workCentre.liveStatus ?? 'idle'}`}
          />
          <p className="truncate text-sm font-medium text-[var(--neutral-900)]">
            {workCentre.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--neutral-200)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(utilisation, 100)}%`,
                backgroundColor: utilisationFill,
              }}
            />
          </div>
          <span className="text-[11px] font-medium tabular-nums text-[var(--neutral-600)]">
            {utilisation}%
          </span>
        </div>
      </div>

      <div
        className="relative flex-1"
        style={{ minWidth: TIMELINE_WIDTH_PX, height: BLOCK_HEIGHT_PX + 24 }}
      >
        <ShiftBands shift={workCentre.shift} />
        <CapacityOverlay hourlyLoad={workCentre.hourlyLoad} />
        {blocks.map((block) => (
          <ScheduleGanttBlock
            key={block.id}
            block={block}
            isProposed={isProposed}
            isMoved={movedBlockIds?.has(block.id) ?? false}
          />
        ))}
      </div>
    </div>
  );
}

// Re-export the status colour map so the legend can stay in sync.
export { STATUS_COLOUR };
