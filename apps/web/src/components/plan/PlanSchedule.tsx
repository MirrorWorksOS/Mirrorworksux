/**
 * PlanSchedule — Standalone cross-job schedule overview at /plan/schedule.
 *
 * Shows all jobs across a time horizon (unlike PlanScheduleTab which is per-job).
 * Reuses shared GanttChart and ScheduleCalendar components.
 */

import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Calendar as CalendarIcon, ChartGantt } from 'lucide-react';
import { addDays } from 'date-fns';
import { GanttChart, type GanttTask } from '@/components/shared/schedule/GanttChart';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarFilterPills, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { PlanScheduleEngine } from '@/components/plan/PlanScheduleEngine';

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

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--mw-mirage)',
  scheduled: 'var(--neutral-300)',
  completed: 'var(--mw-yellow-400)',
};

const JOBS: ScheduleJob[] = [
  { id: '1', jobNumber: 'JOB-2026-0012', name: 'Server Rack Chassis', customer: 'TechCorp Industries', startDay: 0, durationDays: 14, status: 'active', color: STATUS_COLORS.active, progress: 35 },
  { id: '2', jobNumber: 'JOB-2026-0013', name: 'Structural Steel Package', customer: 'BHP Contractors', startDay: 3, durationDays: 20, status: 'active', color: STATUS_COLORS.active, progress: 15 },
  { id: '3', jobNumber: 'JOB-2026-0014', name: 'Custom Brackets (50 units)', customer: 'Pacific Fab', startDay: 7, durationDays: 5, status: 'scheduled', color: STATUS_COLORS.scheduled, progress: 0 },
  { id: '4', jobNumber: 'JOB-2026-0015', name: 'Rail Platform Components', customer: 'Sydney Rail Corp', startDay: 10, durationDays: 18, status: 'scheduled', color: STATUS_COLORS.scheduled, progress: 0 },
  { id: '5', jobNumber: 'JOB-2026-0011', name: 'Machine Guards', customer: 'Kemppi Australia', startDay: -5, durationDays: 8, status: 'completed', color: STATUS_COLORS.completed, progress: 100 },
  { id: '6', jobNumber: 'JOB-2026-0016', name: 'Aluminium Enclosures', customer: 'Hunter Steel Co', startDay: 15, durationDays: 10, status: 'scheduled', color: STATUS_COLORS.scheduled, progress: 0 },
];

export function PlanSchedule() {
  const location = useLocation();
  // Honour `?view=calendar` so the legacy `/plan/activities` redirect lands on
  // the calendar tab instead of the default Gantt.
  const initialView: ViewMode = useMemo(() => {
    const param = new URLSearchParams(location.search).get('view');
    return param === 'calendar' ? 'calendar' : 'gantt';
  }, [location.search]);

  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
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
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Schedule"
        subtitle="Cross-job production schedule overview"
      />

      <PageToolbar>
        <ToolbarFilterPills
          value={filterMode}
          onChange={(k) => setFilterMode(k as FilterMode)}
          options={[
            { key: 'all', label: 'All Jobs', count: JOBS.length },
            { key: 'active', label: 'Active', count: JOBS.filter((j) => j.status === 'active').length },
            { key: 'scheduled', label: 'Scheduled', count: JOBS.filter((j) => j.status === 'scheduled').length },
            { key: 'completed', label: 'Completed', count: JOBS.filter((j) => j.status === 'completed').length },
          ]}
        />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <IconViewToggle
          value={viewMode}
          onChange={(k) => setViewMode(k as ViewMode)}
          options={[
            { key: 'gantt', icon: ChartGantt, label: 'Gantt chart' },
            { key: 'calendar', icon: CalendarIcon, label: 'Calendar' },
          ]}
        />
      </PageToolbar>

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <GanttChart tasks={ganttTasks} startDate={ganttStart} endDate={ganttEnd} />
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <ScheduleCalendar
          events={calendarEvents}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      )}

      <div className="space-y-4 border-t border-[var(--border)] pt-6">
        <h2 className="text-sm font-medium text-foreground">Finite capacity engine</h2>
        <p className="text-xs text-[var(--neutral-500)]">
          Work-centre load and finite scheduling view (prototype).
        </p>
        <PlanScheduleEngine />
      </div>
    </PageShell>
  );
}
