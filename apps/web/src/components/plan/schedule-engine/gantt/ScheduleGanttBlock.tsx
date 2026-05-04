/**
 * A single status-coloured job block on the Gantt. Hover for the full job
 * context (job number, customer, qty, due date, op, status). Click opens
 * the job detail sheet.
 */
import { motion, useMotionValue, type PanInfo } from 'motion/react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { ScheduleBlock } from '@/types/entities';
import type { JobScheduleStatus } from '@/types/common';

import { BLOCK_HEIGHT_PX, HOUR_PX, STATUS_COLOUR, STATUS_FOREGROUND, STATUS_LABEL } from '../constants';
import { pxLeft, pxWidth } from './ganttGeometry';

/** 1 hour = HOUR_PX → 15-min slot is HOUR_PX/4 px wide. Round drag delta to a 15-min snap. */
const SNAP_PX = HOUR_PX / 4;
function snapDeltaPxToMinutes(deltaPx: number): number {
  return Math.round(deltaPx / SNAP_PX) * 15;
}

interface ScheduleGanttBlockProps {
  block: ScheduleBlock;
  isProposed?: boolean;
  isMoved?: boolean;
}

function formatDueShort(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const TOOLTIP_STATUS_STYLES: Record<JobScheduleStatus, { bg: string; text: string }> = {
  queued: { bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-[var(--neutral-600)] dark:text-[var(--neutral-400)]' },
  setup: { bg: 'bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10', text: 'text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-300)]' },
  running: { bg: 'bg-[var(--mw-success)]/10', text: 'text-[var(--mw-success)]' },
  done: { bg: 'bg-[var(--mw-success)]/10', text: 'text-[var(--mw-success)]' },
  blocked: { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]' },
  late: { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]' },
  at_risk: { bg: 'bg-[var(--mw-warning)]/10', text: 'text-[var(--mw-warning)]' },
};

function statusToProgress(status: JobScheduleStatus): number {
  switch (status) {
    case 'done': return 100;
    case 'running': return 50;
    case 'setup': return 10;
    case 'late': return 30;
    case 'at_risk': return 20;
    case 'blocked': return 0;
    default: return 0;
  }
}

export function ScheduleGanttBlock({ block, isProposed, isMoved }: ScheduleGanttBlockProps) {
  const openJobDetail = useScheduleEngineStore((s) => s.openJobDetail);
  const moveBlock = useScheduleEngineStore((s) => s.moveBlock);
  const runState = useScheduleEngineStore((s) => s.runState);
  const proposedExists = useScheduleEngineStore((s) => s.proposed !== null);

  // Drag is disabled while AI is running OR a proposal is awaiting approval.
  const isDraggable = runState === 'idle' && !proposedExists;
  const dragX = useMotionValue(0);

  const status: JobScheduleStatus = block.status ?? 'queued';
  const fill = STATUS_COLOUR[status];
  const fg = STATUS_FOREGROUND[status];

  const left = pxLeft(block.startTime);
  const width = pxWidth(block.startTime, block.endTime);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const deltaMin = snapDeltaPxToMinutes(info.offset.x);
    if (deltaMin === 0) {
      dragX.set(0);
      return;
    }
    const newStart = new Date(block.startTime);
    const newEnd = new Date(block.endTime);
    newStart.setMinutes(newStart.getMinutes() + deltaMin);
    newEnd.setMinutes(newEnd.getMinutes() + deltaMin);
    moveBlock(block.id, newStart.toISOString(), newEnd.toISOString());
    dragX.set(0); // Reset drag offset; the new `left` will reflect the committed time.
  }

  const statusStyle = TOOLTIP_STATUS_STYLES[status];
  const progress = statusToProgress(status);
  const progressColour =
    progress >= 100
      ? 'var(--mw-success)'
      : progress > 0
        ? 'var(--mw-yellow-400)'
        : 'var(--neutral-300)';

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <motion.button
          type="button"
          layout
          layoutId={block.id}
          transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] }}
          drag={isDraggable ? 'x' : false}
          dragMomentum={false}
          dragElastic={0}
          dragSnapToOrigin={false}
          onDragEnd={handleDragEnd}
          onClick={() => openJobDetail(block.jobId)}
          className={`absolute top-1 flex items-center gap-2 overflow-hidden rounded-[var(--shape-sm)] px-2 text-left shadow-[var(--card-shadow-rest)] transition-shadow hover:shadow-[var(--card-shadow-elevated)] ${
            isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          }`}
          style={{
            left,
            width,
            height: BLOCK_HEIGHT_PX,
            backgroundColor: fill,
            color: fg,
            x: dragX,
            outline: isProposed && isMoved ? '2px solid hsl(172 68% 58%)' : 'none',
            outlineOffset: 0,
          }}
        >
          {block.isRush && (
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mw-mirage)]"
              aria-label="Rush"
            />
          )}
          <span className="shrink-0 text-[11px] font-medium tabular-nums">{block.jobNumber}</span>
          {width >= 110 && block.customerName && (
            <span className="truncate text-[11px] opacity-80">{block.customerName}</span>
          )}
          {width >= 160 && block.qty != null && (
            <span className="ml-auto shrink-0 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
              {block.qty} ea
            </span>
          )}
        </motion.button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={8}
        className="pointer-events-none w-72 space-y-3 rounded-lg border border-[var(--border)] bg-card p-3 shadow-[var(--card-shadow-elevated)]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium tabular-nums text-foreground">{block.jobNumber}</span>
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        {block.customerName && (
          <p className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
            {block.customerName}
          </p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div>
            <span className="text-[var(--neutral-500)]">Operation</span>
            <p className="font-medium text-foreground">{block.operationName}</p>
          </div>
          <div>
            <span className="text-[var(--neutral-500)]">Qty</span>
            <p className="font-medium tabular-nums text-foreground">
              {block.qty != null ? `${block.qty} ea` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[var(--neutral-500)]">Work centre</span>
            <p className="font-medium text-foreground">{block.workCenterName}</p>
          </div>
          <div>
            <span className="text-[var(--neutral-500)]">Due</span>
            <p className="font-medium tabular-nums text-foreground">
              {formatDueShort(block.dueDate)}
            </p>
          </div>
          <div>
            <span className="text-[var(--neutral-500)]">Start</span>
            <p className="font-medium tabular-nums text-foreground">{formatTime(block.startTime)}</p>
          </div>
          <div>
            <span className="text-[var(--neutral-500)]">End</span>
            <p className="font-medium tabular-nums text-foreground">{formatTime(block.endTime)}</p>
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-[var(--neutral-500)]">Progress</span>
            <span className="text-[10px] font-medium tabular-nums text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: progressColour }}
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

