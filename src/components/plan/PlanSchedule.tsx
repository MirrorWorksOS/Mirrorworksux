/**
 * PlanSchedule — Standalone cross-job schedule overview at /plan/schedule.
 *
 * Shows all jobs across a time horizon (unlike PlanScheduleTab which is per-job).
 * Reuses shared GanttChart and ScheduleCalendar components.
 */

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChartGantt, Filter } from 'lucide-react';
import { addDays } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { GanttChart, type GanttTask } from '@/components/shared/schedule/GanttChart';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';

type ViewMode = 'gantt' | 'calendar';
type FilterMode = 'all' | 'active' | 'scheduled' | 'completed';

interface ScheduleJob {
  id: string;
  jobNumber: string;
  name: string;
  customer: string;
  startDay: number;
  durationDays: number;
  status: FilterMode;
  color: string;
  progress: number;
}

const MONTH_BASE = new Date(2026, 3, 1); // April 2026

const JOBS: ScheduleJob[] = [
  { id: '1', jobNumber: 'JOB-2026-0012', name: 'Server Rack Chassis', customer: 'TechCorp Industries', startDay: 0, durationDays: 14, status: 'active', color: 'var(--mw-yellow-400)', progress: 35 },
  { id: '2', jobNumber: 'JOB-2026-0013', name: 'Structural Steel Package', customer: 'BHP Contractors', startDay: 3, durationDays: 20, status: 'active', color: 'var(--mw-mirage)', progress: 15 },
  { id: '3', jobNumber: 'JOB-2026-0014', name: 'Custom Brackets (50 units)', customer: 'Pacific Fab', startDay: 7, durationDays: 5, status: 'scheduled', color: 'var(--mw-blue)', progress: 0 },
  { id: '4', jobNumber: 'JOB-2026-0015', name: 'Rail Platform Components', customer: 'Sydney Rail Corp', startDay: 10, durationDays: 18, status: 'scheduled', color: 'var(--mw-blue)', progress: 0 },
  { id: '5', jobNumber: 'JOB-2026-0011', name: 'Machine Guards', customer: 'Kemppi Australia', startDay: -5, durationDays: 8, status: 'completed', color: 'var(--mw-green)', progress: 100 },
  { id: '6', jobNumber: 'JOB-2026-0016', name: 'Aluminium Enclosures', customer: 'Hunter Steel Co', startDay: 15, durationDays: 10, status: 'scheduled', color: 'var(--mw-blue)', progress: 0 },
];

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  completed: 'Completed',
};

export function PlanSchedule() {
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [calendarMonth, setCalendarMonth] = useState(MONTH_BASE);

  const filtered = useMemo(
    () => JOBS.filter((j) => filterMode === 'all' || j.status === filterMode),
    [filterMode],
  );

  const ganttTasks: GanttTask[] = useMemo(
    () =>
      filtered.map((j) => ({
        id: j.id,
        label: `${j.jobNumber} — ${j.name}`,
        start: addDays(MONTH_BASE, j.startDay),
        end: addDays(MONTH_BASE, j.startDay + j.durationDays - 1),
        progress: j.progress,
        color: j.color,
      })),
    [filtered],
  );

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      filtered.map((j) => ({
        id: j.id,
        title: `${j.jobNumber} — ${j.name}`,
        date: addDays(MONTH_BASE, j.startDay),
        endDate: addDays(MONTH_BASE, j.startDay + j.durationDays - 1),
        color: j.color,
      })),
    [filtered],
  );

  const ganttStart = addDays(MONTH_BASE, -7);
  const ganttEnd = addDays(MONTH_BASE, 30);

  return (
    <PageShell>
      <PageHeader
        title="Schedule"
        subtitle="Cross-job production schedule overview"
        actions={
          <div className="flex items-center gap-2">
            <ToolbarFilterButton />
            <IconViewToggle
              value={viewMode}
              onChange={(k) => setViewMode(k as ViewMode)}
              options={[
                { key: 'gantt', icon: ChartGantt, label: 'Gantt chart' },
                { key: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              ]}
            />
          </div>
        }
      />

      {/* Filter pills */}
      <div className="flex items-center gap-2 px-6 pb-2">
        {(['all', 'active', 'scheduled', 'completed'] as FilterMode[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilterMode(f)}
            className={cn(
              'h-8 px-3 text-xs font-medium rounded-full transition-colors',
              filterMode === f
                ? 'bg-[var(--neutral-900)] text-white'
                : 'bg-[var(--neutral-100)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]',
            )}
          >
            {f === 'all' ? 'All Jobs' : STATUS_LABELS[f]}
            {f !== 'all' && (
              <Badge
                variant="secondary"
                className="ml-1.5 border-0 bg-white/20 px-1 py-0 text-xs tabular-nums"
              >
                {JOBS.filter((j) => j.status === f).length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-6 pt-2">
          <GanttChart tasks={ganttTasks} startDate={ganttStart} endDate={ganttEnd} />
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-auto p-6 pt-2">
          <ScheduleCalendar
            events={calendarEvents}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        </div>
      )}
    </PageShell>
  );
}
