/**
 * Plan Activities — Production calendar (month grid) with optional list view
 */

import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EventDetailSheet, type CalendarEventDetail } from '@/components/shared/calendar/EventDetailSheet';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { MW_CHART_COLOURS } from '@/components/shared/charts/chart-theme';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { toast } from 'sonner';

type EventType = 'job' | 'maintenance' | 'qc';

interface PlanEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
}

const mockEvents: PlanEvent[] = [
  { id: '1', title: 'JOB-2026-0012 - Start Fabrication', type: 'job', date: '2026-03-20', time: '08:00' },
  { id: '2', title: 'Laser Cutter - Scheduled Maintenance', type: 'maintenance', date: '2026-03-22', time: '14:00' },
  { id: '3', title: 'QC Checkpoint - Weld Inspection', type: 'qc', date: '2026-03-21', time: '10:00' },
  { id: '4', title: 'JOB-2026-0011 - Final Assembly', type: 'job', date: '2026-03-23', time: '09:00' },
];

const typeLabel: Record<EventType, string> = {
  job: 'Job',
  maintenance: 'Maintenance',
  qc: 'QC',
};

const typeColor: Record<EventType, string> = {
  job: MW_CHART_COLOURS[0],
  maintenance: MW_CHART_COLOURS[1],
  qc: MW_CHART_COLOURS[2],
};

function toCalendarEvents(events: PlanEvent[]): CalendarEvent[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: parseISO(`${e.date}T12:00:00`),
    color: typeColor[e.type],
  }));
}

function planEventToDetail(ev: PlanEvent): CalendarEventDetail {
  const start = parseISO(`${ev.date}T${ev.time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const typeMap: Record<EventType, CalendarEventDetail['type']> = {
    job: 'task',
    maintenance: 'follow-up',
    qc: 'meeting',
  };
  return {
    id: ev.id,
    title: ev.title,
    start,
    end,
    type: typeMap[ev.type],
    description: ev.type === 'job' ? 'Production job scheduled for the shop floor.' : ev.type === 'maintenance' ? 'Scheduled maintenance window for equipment.' : 'Quality control checkpoint.',
    status: 'scheduled',
    priority: ev.type === 'qc' ? 'high' : 'medium',
  };
}

export function PlanActivities() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [month, setMonth] = useState(() => new Date(2026, 2, 1));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDetail | null>(null);

  const calendarEvents = useMemo(() => toCalendarEvents(mockEvents), []);

  const countJob = mockEvents.filter(e => e.type === 'job').length;
  const countMaintenance = mockEvents.filter(e => e.type === 'maintenance').length;
  const countQc = mockEvents.filter(e => e.type === 'qc').length;

  const listColumns: MwColumnDef<PlanEvent>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        tooltip: 'Event name or description',
        cell: (row) => <span className="font-medium text-foreground">{row.title}</span>,
      },
      {
        key: 'type',
        header: 'Type',
        tooltip: 'Event category',
        cell: (row) => (
          <StatusBadge variant="neutral">{typeLabel[row.type]}</StatusBadge>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        tooltip: 'Scheduled date',
        className: 'tabular-nums',
        headerClassName: 'text-right',
        cell: (row) => (
          <span className="text-[var(--neutral-600)]">
            {format(parseISO(`${row.date}T12:00:00`), 'd MMM yyyy')}
          </span>
        ),
      },
      {
        key: 'time',
        header: 'Time',
        tooltip: 'Scheduled start time',
        className: 'text-right tabular-nums',
        headerClassName: 'text-right',
        cell: (row) => <span className="text-[var(--neutral-600)]">{row.time}</span>,
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Production calendar"
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ToolbarFilterButton />
            <ToolbarPrimaryButton icon={Plus}>New event</ToolbarPrimaryButton>
            <IconViewToggle
              value={view}
              onChange={(k) => setView(k as 'calendar' | 'list')}
              options={[
                { key: 'calendar', icon: CalendarIcon, label: 'Calendar view' },
                { key: 'list', icon: List, label: 'List view' },
              ]}
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-6">
        {(Object.keys(typeLabel) as EventType[]).map((t) => (
          <div key={t} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm border border-[var(--neutral-200)]"
              style={{ backgroundColor: `color-mix(in srgb, ${typeColor[t]} 35%, white)` }}
            />
            <span className="text-sm text-[var(--neutral-500)]">{typeLabel[t]}</span>
          </div>
        ))}
      </div>

      {view === 'calendar' && (
        <motion.div variants={staggerItem}>
          <ScheduleCalendar
            events={calendarEvents}
            month={month}
            onMonthChange={setMonth}
          />
        </motion.div>
      )}

      {view === 'list' && (
        <motion.div variants={staggerItem} className="space-y-4">
          <ToolbarSummaryBar
            segments={[
              { key: 'job', label: 'Jobs', value: countJob, color: 'var(--mw-yellow-400)' },
              { key: 'maintenance', label: 'Maintenance', value: countMaintenance, color: 'var(--mw-mirage)' },
              { key: 'qc', label: 'QC', value: countQc, color: 'var(--neutral-400)' },
            ]}
            formatValue={(v) => String(v)}
          />
          <MwDataTable
            columns={listColumns}
            data={mockEvents}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => setSelectedEvent(planEventToDetail(row))}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items\u2026`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items\u2026`)}
          />
        </motion.div>
      )}
      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </PageShell>
  );
}
