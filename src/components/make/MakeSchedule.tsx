/**
 * Make Schedule — Gantt chart, month calendar, and list view for production scheduling
 */

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChartGantt, Factory, List, Plus } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { GanttChart, type GanttTask } from '@/components/shared/schedule/GanttChart';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';

type MOStatus = 'in_progress' | 'scheduled' | 'completed' | 'overdue';

interface MO {
  id: string;
  moNumber: string;
  job: string;
  product: string;
  workCenter: string;
  startDay: number;
  durationDays: number;
  status: MOStatus;
  operator: string;
}

const TODAY_OFFSET = 2;

const MOs: MO[] = [
  { id: '1', moNumber: 'MO-0045', job: 'MW-089', product: 'Server Rack Chassis', workCenter: 'Cutting', startDay: 0, durationDays: 2, status: 'completed', operator: 'DL' },
  { id: '2', moNumber: 'MO-0046', job: 'MW-089', product: 'Server Rack Chassis', workCenter: 'Forming', startDay: 2, durationDays: 2, status: 'in_progress', operator: 'EW' },
  { id: '3', moNumber: 'MO-0047', job: 'MW-089', product: 'Server Rack Chassis', workCenter: 'Welding', startDay: 4, durationDays: 3, status: 'scheduled', operator: 'MT' },
  { id: '4', moNumber: 'MO-0048', job: 'MW-089', product: 'Server Rack Chassis', workCenter: 'Finishing', startDay: 7, durationDays: 1, status: 'scheduled', operator: 'SC' },
  { id: '5', moNumber: 'MO-0044', job: 'MW-088', product: 'Rail Platform Components', workCenter: 'Cutting', startDay: 1, durationDays: 3, status: 'in_progress', operator: 'DL' },
  { id: '6', moNumber: 'MO-0049', job: 'MW-088', product: 'Rail Platform Components', workCenter: 'Welding', startDay: 4, durationDays: 4, status: 'scheduled', operator: 'TB' },
  { id: '7', moNumber: 'MO-0050', job: 'MW-087', product: 'Aluminium Enclosures', workCenter: 'Machining', startDay: 0, durationDays: 4, status: 'overdue', operator: 'EW' },
  { id: '8', moNumber: 'MO-0051', job: 'MW-087', product: 'Aluminium Enclosures', workCenter: 'Forming', startDay: 5, durationDays: 2, status: 'scheduled', operator: 'SC' },
  { id: '9', moNumber: 'MO-0052', job: 'MW-091', product: 'Structural Bracket Type A', workCenter: 'Cutting', startDay: 3, durationDays: 1, status: 'scheduled', operator: 'DL' },
  { id: '10', moNumber: 'MO-0053', job: 'MW-091', product: 'Structural Bracket Type A', workCenter: 'Welding', startDay: 4, durationDays: 1, status: 'scheduled', operator: 'MT' },
  { id: '11', moNumber: 'MO-0054', job: 'MW-091', product: 'Structural Bracket Type A', workCenter: 'Finishing', startDay: 6, durationDays: 1, status: 'scheduled', operator: 'SC' },
  { id: '12', moNumber: 'MO-0055', job: 'MW-090', product: 'Machine Guards', workCenter: 'Machining', startDay: 5, durationDays: 3, status: 'scheduled', operator: 'TB' },
];

const STATUS_CONFIG: Record<MOStatus, { bar: string; badge: string; text: string; label: string }> = {
  completed: { bar: 'var(--mw-yellow-400)', badge: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Completed' },
  in_progress: { bar: 'var(--chart-scale-mid)', badge: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'In progress' },
  scheduled: { bar: 'var(--neutral-400)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-600)]', label: 'Scheduled' },
  overdue: { bar: 'var(--neutral-700)', badge: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Overdue' },
};

const START_DATE = new Date(2026, 2, 18);
const NUM_DAYS = 15;
/** Prototype “today” so the marker aligns with mock data (Mar 20, 2026). */
const DEMO_TODAY = new Date(2026, 2, 20);

const STATUS_TO_PROGRESS: Record<MOStatus, number> = {
  completed: 100,
  in_progress: 50,
  scheduled: 0,
  overdue: 30,
};

function useGanttTasks(): { tasks: GanttTask[]; startDate: Date; endDate: Date } {
  return useMemo(() => {
    const tasks: GanttTask[] = MOs.map((mo) => ({
      id: mo.id,
      label: `${mo.moNumber} — ${mo.workCenter}`,
      start: addDays(START_DATE, mo.startDay),
      end: addDays(START_DATE, mo.startDay + mo.durationDays - 1),
      progress: STATUS_TO_PROGRESS[mo.status],
      color: STATUS_CONFIG[mo.status].bar,
      meta: {
        moNumber: mo.moNumber,
        job: mo.job,
        product: mo.product,
        workCenter: mo.workCenter,
        operator: mo.operator,
        status: mo.status,
        qty: 12 + Math.floor(Math.random() * 40), // mock qty
      },
    }));
    const endDate = addDays(START_DATE, NUM_DAYS - 1);
    return { tasks, startDate: START_DATE, endDate };
  }, []);
}

const TOOLTIP_STATUS_STYLES: Record<MOStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-[var(--mw-success)]/10', text: 'text-[var(--mw-success)]', label: 'Completed' },
  in_progress: { bg: 'bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10', text: 'text-foreground', label: 'In Progress' },
  scheduled: { bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-[var(--neutral-600)] dark:text-[var(--neutral-400)]', label: 'Scheduled' },
  overdue: { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]', label: 'Overdue' },
};

function GanttTooltip({ task }: { task: GanttTask }) {
  const meta = task.meta as {
    moNumber: string;
    job: string;
    product: string;
    workCenter: string;
    operator: string;
    status: MOStatus;
    qty: number;
  } | undefined;

  if (!meta) return null;

  const statusStyle = TOOLTIP_STATUS_STYLES[meta.status];
  const progress = task.progress ?? 0;

  return (
    <div className="w-72 rounded-lg bg-white dark:bg-neutral-800 border border-[var(--border)] shadow-lg p-3 space-y-3 pointer-events-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground tabular-nums">{meta.moNumber}</span>
        <Badge className={cn('border-0 text-[10px] px-1.5 py-0.5', statusStyle.bg, statusStyle.text)}>
          {statusStyle.label}
        </Badge>
      </div>
      {/* Product */}
      <p className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">{meta.product}</p>
      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <span className="text-[var(--neutral-500)]">Job</span>
          <p className="font-medium text-foreground tabular-nums">{meta.job}</p>
        </div>
        <div>
          <span className="text-[var(--neutral-500)]">Qty</span>
          <p className="font-medium text-foreground tabular-nums">{meta.qty} units</p>
        </div>
        <div>
          <span className="text-[var(--neutral-500)]">Operator</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-[8px] font-medium text-white dark:bg-[var(--neutral-600)]">
              {meta.operator}
            </div>
          </div>
        </div>
        <div>
          <span className="text-[var(--neutral-500)]">Work Centre</span>
          <p className="font-medium text-foreground">{meta.workCenter}</p>
        </div>
        <div>
          <span className="text-[var(--neutral-500)]">Start</span>
          <p className="font-medium text-foreground tabular-nums">{format(task.start, 'd MMM')}</p>
        </div>
        <div>
          <span className="text-[var(--neutral-500)]">End</span>
          <p className="font-medium text-foreground tabular-nums">{format(task.end, 'd MMM')}</p>
        </div>
      </div>
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[var(--neutral-500)]">Progress</span>
          <span className="text-[10px] font-medium text-foreground tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-700)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: progress >= 100 ? 'var(--mw-success)' : progress > 0 ? 'var(--mw-yellow-400)' : 'var(--neutral-300)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function useCalendarEvents(): CalendarEvent[] {
  return useMemo(
    () =>
      MOs.map((mo) => ({
        id: mo.id,
        title: `${mo.moNumber} — ${mo.workCenter}`,
        date: addDays(START_DATE, mo.startDay),
        endDate: addDays(START_DATE, mo.startDay + mo.durationDays - 1),
        color: STATUS_CONFIG[mo.status].bar,
      })),
    [],
  );
}

const fmtDate = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

const listColumns: MwColumnDef<MO>[] = [
  { key: 'moNumber', header: 'MO #', tooltip: 'Manufacturing order number', cell: (mo) => (
    <span className="font-medium tabular-nums text-foreground inline-flex items-center gap-1.5">
      <Factory className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
      {mo.moNumber}
    </span>
  ) },
  { key: 'job', header: 'Job', tooltip: 'Associated job reference', cell: (mo) => <span className="font-medium tabular-nums text-foreground">{mo.job}</span> },
  { key: 'product', header: 'Product', cell: (mo) => <span className="text-foreground">{mo.product}</span> },
  { key: 'workCenter', header: 'Work Centre', tooltip: 'Assigned work centre', cell: (mo) => <span className="text-[var(--neutral-600)]">{mo.workCenter}</span> },
  {
    key: 'operator',
    header: 'Operator',
    cell: (mo) => (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-[10px] font-medium text-white">
        {mo.operator}
      </div>
    ),
  },
  {
    key: 'start',
    header: 'Start',
    cell: (mo) => {
      const d = new Date(START_DATE);
      d.setDate(d.getDate() + mo.startDay);
      return <span className="text-[var(--neutral-600)] tabular-nums">{fmtDate(d)}</span>;
    },
  },
  {
    key: 'end',
    header: 'End',
    cell: (mo) => {
      const d = new Date(START_DATE);
      d.setDate(d.getDate() + mo.startDay + mo.durationDays - 1);
      return <span className="text-[var(--neutral-600)] tabular-nums">{fmtDate(d)}</span>;
    },
  },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Current schedule status',
    cell: (mo) => (
      <StatusBadge status={mo.status} />
    ),
  },
];

function ListView() {
  return (
    <MwDataTable
      columns={listColumns}
      data={MOs}
      keyExtractor={(mo) => mo.id}
      selectable
      onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
      onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
    />
  );
}

type ScheduleView = 'gantt' | 'calendar' | 'list';

export function MakeSchedule() {
  const [view, setView] = useState<ScheduleView>('gantt');
  const { tasks, startDate, endDate } = useGanttTasks();
  const calendarEvents = useCalendarEvents();
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(START_DATE.getFullYear(), START_DATE.getMonth(), 1),
  );

  const statusCounts = {
    in_progress: MOs.filter((m) => m.status === 'in_progress').length,
    scheduled: MOs.filter((m) => m.status === 'scheduled').length,
    overdue: MOs.filter((m) => m.status === 'overdue').length,
    completed: MOs.filter((m) => m.status === 'completed').length,
  };

  return (
    <PageShell>
      <PageHeader
        title="Production schedule"
        subtitle={`${statusCounts.in_progress} in progress · ${statusCounts.scheduled} scheduled${statusCounts.overdue > 0 ? ` · ${statusCounts.overdue} overdue` : ''} · ${statusCounts.completed} completed`}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ToolbarFilterButton />
            <ToolbarPrimaryButton icon={Plus}>New MO</ToolbarPrimaryButton>
            <IconViewToggle
              value={view}
              onChange={(k) => setView(k as ScheduleView)}
              options={[
                { key: 'gantt', icon: ChartGantt, label: 'Gantt chart' },
                { key: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                { key: 'list', icon: List, label: 'List' },
              ]}
            />
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: statusCounts.in_progress, sub: 'Active operations', bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'Scheduled', value: statusCounts.scheduled, sub: 'Upcoming orders', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Overdue', value: statusCounts.overdue, sub: 'Past due date', bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
          { label: 'Completed', value: statusCounts.completed, sub: `${MOs.length} total MOs`, bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
        ].map(s => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: cfg.bar }} />
            <span className="text-xs text-[var(--neutral-500)]">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 border-t-2 border-dashed border-[var(--mw-yellow-400)]" />
          <span className="text-xs text-[var(--neutral-500)]">
            Today ({DEMO_TODAY.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })})
          </span>
        </div>
      </div>

      {view === 'gantt' && (
        <motion.div className="w-full min-w-0" variants={staggerItem}>
          <GanttChart
            tasks={tasks}
            startDate={startDate}
            endDate={endDate}
            today={DEMO_TODAY}
            renderTooltip={(task) => <GanttTooltip task={task} />}
          />
        </motion.div>
      )}

      {view === 'calendar' && (
        <motion.div variants={staggerItem}>
          <ScheduleCalendar
            events={calendarEvents}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        </motion.div>
      )}

      {view === 'list' && (
        <motion.div variants={staggerItem}>
          <ListView />
        </motion.div>
      )}
    </PageShell>
  );
}
