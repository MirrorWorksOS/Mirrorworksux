/**
 * Make Schedule — Gantt chart, month calendar, and list view for production scheduling
 */

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChartGantt, List, Plus } from 'lucide-react';
import { addDays } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
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
  completed: { bar: 'var(--mw-yellow-400)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Completed' },
  in_progress: { bar: 'var(--chart-scale-mid)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'In progress' },
  scheduled: { bar: 'var(--neutral-400)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-600)]', label: 'Scheduled' },
  overdue: { bar: 'var(--neutral-700)', badge: 'bg-[var(--neutral-100)]', text: 'text-[var(--mw-mirage)]', label: 'Overdue' },
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
    }));
    const endDate = addDays(START_DATE, NUM_DAYS - 1);
    return { tasks, startDate: START_DATE, endDate };
  }, []);
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
  { key: 'moNumber', header: 'MO #', cell: (mo) => <span className="font-medium tabular-nums text-[var(--mw-mirage)]">{mo.moNumber}</span> },
  { key: 'job', header: 'Job', cell: (mo) => <span className="tabular-nums text-[var(--mw-mirage)]">{mo.job}</span> },
  { key: 'product', header: 'Product', cell: (mo) => <span className="text-[var(--mw-mirage)]">{mo.product}</span> },
  { key: 'workCenter', header: 'Work Centre', cell: (mo) => <span className="text-[var(--neutral-600)]">{mo.workCenter}</span> },
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
      return <span className="text-[var(--neutral-600)]">{fmtDate(d)}</span>;
    },
  },
  {
    key: 'end',
    header: 'End',
    cell: (mo) => {
      const d = new Date(START_DATE);
      d.setDate(d.getDate() + mo.startDay + mo.durationDays - 1);
      return <span className="text-[var(--neutral-600)]">{fmtDate(d)}</span>;
    },
  },
  {
    key: 'status',
    header: 'Status',
    cell: (mo) => {
      const cfg = STATUS_CONFIG[mo.status];
      return (
        <Badge className={cn('rounded-full border-0 px-2 py-0.5 text-xs', cfg.badge, cfg.text)}>
          {cfg.label}
        </Badge>
      );
    },
  },
];

function ListView() {
  return (
    <MwDataTable
      columns={listColumns}
      data={MOs}
      keyExtractor={(mo) => mo.id}
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
          <GanttChart tasks={tasks} startDate={startDate} endDate={endDate} today={DEMO_TODAY} />
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
