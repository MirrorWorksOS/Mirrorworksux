/**
 * PlanActivities — module-level inbox for job activity management.
 *
 * Views: List (grouped by due-date bucket), Calendar (month), Kanban (status board).
 * Phase 1: Gantt view is deferred; toggle is hidden until Phase 2 lands MwGantt.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CalendarRange,
  ClipboardList,
  Columns3,
  GanttChart as GanttIcon,
  List,
  Plus,
  Target,
  Users,
  Briefcase,
  Factory,
  Layers,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  format,
  isSameDay,
  isThisWeek,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from 'date-fns';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { EventDetailSheet, type CalendarEventDetail } from '@/components/shared/calendar/EventDetailSheet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';

import { useJobActivityStore, type ActivityGanttGroupBy } from '@/store/jobActivityStore';
import {
  MwGantt,
  MW_GANTT_LEGEND,
  MW_GANTT_STATUS_COLOUR,
  tokenFor,
  type MwGanttItem,
  type MwGanttRowDef,
} from '@/components/shared/gantt';
import { PLAN_CURRENT_USER, PLAN_TEAM_MEMBERS } from '@/data/plan-activities-mock';
import { JobActivityCard } from './activities/JobActivityCard';
import { TimerPill } from './activities/TimerPill';
import { LogJobActivityModal } from './LogJobActivityModal';
import {
  JOB_ACTIVITY_TYPE_LABELS,
  JOB_ACTIVITY_TYPE_COLOUR,
  JOB_ACTIVITY_TYPE_ICON,
  JOB_ACTIVITY_STATUS_LABELS,
  JOB_ACTIVITY_PRIORITY_BADGE,
  PRODUCT_KIND_LABELS,
  activityToTimeRange,
  formatMinutes,
  isActivityOverdue,
} from './plan-activity-shared';
import type { JobActivity, JobActivityStatus } from '@/types/job-activity';
import { jobs as MOCK_JOBS, workCentres as MOCK_WCS } from '@/services/mock/data';

// ─────────────────────────────────────────────────────────────────────
// Filter schema
// ─────────────────────────────────────────────────────────────────────

const MODULE_ID = 'plan.activities';

const planActivitiesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Activities',
  facets: [
    {
      id: 'type',
      label: 'Type',
      kind: 'multi',
      pinned: true,
      icon: ClipboardList,
      options: (Object.keys(JOB_ACTIVITY_TYPE_LABELS) as Array<keyof typeof JOB_ACTIVITY_TYPE_LABELS>).map(
        (t) => ({
          value: t,
          label: JOB_ACTIVITY_TYPE_LABELS[t],
          color: JOB_ACTIVITY_TYPE_COLOUR[t],
        }),
      ),
    },
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: (Object.keys(JOB_ACTIVITY_STATUS_LABELS) as JobActivityStatus[]).map((s) => ({
        value: s,
        label: JOB_ACTIVITY_STATUS_LABELS[s],
      })),
    },
    {
      id: 'priority',
      label: 'Priority',
      kind: 'multi',
      options: [
        { value: 'high', label: 'High', color: 'var(--mw-error)' },
        { value: 'med', label: 'Medium', color: 'var(--mw-warning)' },
        { value: 'low', label: 'Low', color: 'var(--mw-secondary)' },
      ],
    },
    {
      id: 'assignedTo',
      label: 'Assignee',
      kind: 'select',
      icon: Users,
      options: PLAN_TEAM_MEMBERS.map((m) => ({ value: m, label: m })),
    },
    {
      id: 'jobNumber',
      label: 'Job',
      kind: 'select',
      icon: Briefcase,
      options: MOCK_JOBS.map((j) => ({ value: j.jobNumber, label: `${j.jobNumber} — ${j.title}` })),
    },
    {
      id: 'workCentreName',
      label: 'Work centre',
      kind: 'select',
      icon: Factory,
      options: MOCK_WCS.map((w) => ({ value: w.name, label: w.name })),
    },
    {
      id: 'productKind',
      label: 'Product kind',
      kind: 'multi',
      icon: Layers,
      options: [
        { value: 'widget', label: PRODUCT_KIND_LABELS.widget },
        { value: 'configurable', label: PRODUCT_KIND_LABELS.configurable },
        { value: 'mixed', label: PRODUCT_KIND_LABELS.mixed },
      ],
    },
    {
      id: 'dueDate',
      label: 'Due',
      kind: 'date',
      icon: CalendarIcon,
      placeholder: 'Any date',
    },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: List },
    { id: 'kanban', label: 'Kanban', icon: Columns3 },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'gantt', label: 'Gantt', icon: GanttIcon },
  ],
  defaultView: 'list',
  dateFacetId: 'dueDate',
};

function todayRange(): { from: string; to: string } {
  const t = new Date().toISOString().slice(0, 10);
  return { from: t, to: t };
}
function nextSevenDays(): { from: string; to: string } {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  return { from: now.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

registerSystemPresets(MODULE_ID, [
  {
    name: 'Mine — due this week',
    icon: Target,
    iconTone: 'yellow',
    state: {
      values: { assignedTo: PLAN_CURRENT_USER, dueDate: nextSevenDays() },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Overdue — all jobs',
    icon: AlertTriangle,
    iconTone: 'error',
    state: {
      values: {
        status: ['todo', 'in_progress', 'blocked'],
        dueDate: { from: '', to: new Date().toISOString().slice(0, 10) },
      },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Today’s standup',
    icon: CalendarRange,
    iconTone: 'info',
    state: {
      values: { dueDate: todayRange() },
      search: '',
      view: 'kanban',
    },
  },
  {
    name: 'Blocked',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { status: ['blocked'] }, search: '', view: 'kanban' },
  },
]);

// ─────────────────────────────────────────────────────────────────────
// Date grouping (list view)
// ─────────────────────────────────────────────────────────────────────

const DATE_GROUP_ORDER: Record<string, number> = {
  Overdue: 0,
  Today: 1,
  Tomorrow: 2,
  'This week': 3,
  Later: 4,
  Yesterday: 5,
  Earlier: 6,
  'No due date': 7,
};

function getDateGroup(activity: JobActivity): string {
  const iso = activity.dueDate;
  if (!iso) return 'No due date';
  const d = parseISO(iso);
  const now = new Date();
  const isDone = activity.status === 'completed' || activity.status === 'cancelled';
  if (d.getTime() < now.getTime() && !isToday(d)) {
    if (isYesterday(d)) return 'Yesterday';
    // Only label as Overdue if NOT done — completed past-due items go to Earlier.
    if (!isDone && now.getTime() - d.getTime() < 14 * 24 * 60 * 60 * 1000) return 'Overdue';
    return 'Earlier';
  }
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isThisWeek(d, { weekStartsOn: 1 })) return 'This week';
  return 'Later';
}

// ─────────────────────────────────────────────────────────────────────
// Kanban columns
// ─────────────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: { id: JobActivityStatus; label: string; tint: string }[] = [
  { id: 'todo', label: 'To do', tint: 'var(--neutral-300)' },
  { id: 'in_progress', label: 'In progress', tint: 'var(--mw-warning)' },
  { id: 'blocked', label: 'Blocked', tint: 'var(--mw-error)' },
  { id: 'completed', label: 'Completed', tint: 'var(--mw-success)' },
];

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function PlanActivities() {
  const activities = useJobActivityStore(useShallow((s) => s.activities));
  const ganttZoom = useJobActivityStore((s) => s.ganttZoom);
  const setGanttZoom = useJobActivityStore((s) => s.setGanttZoom);
  const ganttGroupBy = useJobActivityStore((s) => s.ganttGroupBy);
  const setGanttGroupBy = useJobActivityStore((s) => s.setGanttGroupBy);
  const filters = useModuleFilters(planActivitiesFilterSchema);
  const filterState = filters.state;
  const viewMode = (filterState.view ?? 'list') as 'list' | 'calendar' | 'kanban' | 'gantt';

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDetail | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: planActivitiesFilterSchema,
        state: filterState,
        rows: activities,
        getSearchText: (a) =>
          `${a.title} ${a.description ?? ''} ${a.jobNumber} ${a.assignedTo} ${a.workCentreName ?? ''}`,
        getFacetValue: (a, id) => {
          switch (id) {
            case 'type':
              return a.type;
            case 'status':
              return a.status;
            case 'priority':
              return a.priority;
            case 'assignedTo':
              return a.assignedTo;
            case 'jobNumber':
              return a.jobNumber;
            case 'workCentreName':
              return a.workCentreName;
            case 'productKind':
              return a.productKind;
            case 'dueDate':
              return a.dueDate ? a.dueDate.slice(0, 10) : undefined;
            default:
              return undefined;
          }
        },
      }),
    [activities, filterState],
  );

  const grouped = useMemo(() => {
    const groups: Record<string, JobActivity[]> = {};
    for (const a of filtered) {
      const g = getDateGroup(a);
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => (DATE_GROUP_ORDER[a] ?? 99) - (DATE_GROUP_ORDER[b] ?? 99),
    );
  }, [filtered]);

  const kpis = useMemo(() => {
    const open = activities.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').length;
    const overdue = activities.filter((a) => isActivityOverdue(a)).length;
    const dueToday = activities.filter((a) => a.dueDate && isToday(parseISO(a.dueDate))).length;
    const inProgress = activities.filter((a) => a.status === 'in_progress').length;
    const loggedTodayMin = activities.reduce((sum, a) => {
      const todayMin = a.timeEntries.reduce((s, e) => {
        if (!e.stoppedAt) return s;
        return isToday(parseISO(e.stoppedAt)) ? s + (e.minutes ?? 0) : s;
      }, 0);
      return sum + todayMin;
    }, 0);
    return { open, overdue, dueToday, inProgress, loggedTodayMin };
  }, [activities]);

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      filtered
        .filter((a) => !!a.dueDate)
        .map((a) => ({
          id: a.id,
          title: a.title,
          date: parseISO(a.dueDate as string),
          color: JOB_ACTIVITY_TYPE_COLOUR[a.type],
        })),
    [filtered],
  );

  const jobOptions = useMemo(
    () =>
      MOCK_JOBS.map((j) => ({
        jobId: j.id,
        jobNumber: j.jobNumber,
        title: j.title,
        productKind: j.productKind,
      })),
    [],
  );

  const handleActivityCardClick = (a: JobActivity) => {
    const detailStatus: CalendarEventDetail['status'] =
      a.status === 'cancelled' ? 'cancelled' : a.status === 'completed' ? 'completed' : 'scheduled';
    const detailPriority: CalendarEventDetail['priority'] =
      a.priority === 'med' ? 'medium' : a.priority;
    setSelectedEvent({
      id: a.id,
      title: a.title,
      start: a.plannedStart ? parseISO(a.plannedStart) : a.dueDate ? parseISO(a.dueDate) : new Date(),
      end: a.plannedEnd ? parseISO(a.plannedEnd) : a.dueDate ? parseISO(a.dueDate) : new Date(),
      type: 'task',
      description: a.description ?? '',
      status: detailStatus,
      priority: detailPriority,
    });
  };

  return (
    <PageShell>
      <PageHeader title="Activities" subtitle="Plan-side task and time management across jobs" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-[260px] flex-1">
          <ToolbarSummaryBar
            segments={[
              { key: 'open', label: 'Open', value: kpis.open, color: 'var(--neutral-400)' },
              { key: 'in_progress', label: 'In progress', value: kpis.inProgress, color: 'var(--mw-yellow-300)' },
              { key: 'due_today', label: 'Due today', value: kpis.dueToday, color: 'var(--mw-yellow-500)' },
              { key: 'overdue', label: 'Overdue', value: kpis.overdue, color: 'var(--mw-mirage)' },
            ]}
            formatValue={(v) => String(v)}
          />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mw-yellow-400)]/15 px-3 py-1 text-xs font-medium text-foreground">
          <span className="text-[var(--neutral-500)]">Logged today</span>
          <span className="tabular-nums">{formatMinutes(kpis.loggedTodayMin)}</span>
        </span>
      </div>

      <ModuleFilterBar
        schema={planActivitiesFilterSchema}
        filters={filters}
        searchPlaceholder="Search activities…"
        actions={
          <ToolbarPrimaryButton icon={Plus} onClick={() => setShowNewActivity(true)}>
            New Activity
          </ToolbarPrimaryButton>
        }
      />

      {/* ─── LIST ─── */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {grouped.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--neutral-500)]">
              No activities match your filters.
            </div>
          )}
          {grouped.map(([group, acts]) => (
            <div key={group}>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                {group}
                <span className="ml-2 text-[var(--neutral-400)]">{acts.length}</span>
              </h3>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {acts
                    .slice()
                    .sort((a, b) => {
                      const ad = a.dueDate ? parseISO(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                      const bd = b.dueDate ? parseISO(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                      return ad - bd;
                    })
                    .map((a) => (
                      <JobActivityCard key={a.id} activity={a} onClick={handleActivityCardClick} />
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── KANBAN ─── */}
      {viewMode === 'kanban' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((col) => {
            const items = filtered
              .filter((a) => a.status === col.id)
              .slice()
              .sort((a, b) => {
                const ap = a.priority === 'high' ? 0 : a.priority === 'med' ? 1 : 2;
                const bp = b.priority === 'high' ? 0 : b.priority === 'med' ? 1 : 2;
                if (ap !== bp) return ap - bp;
                const ad = a.dueDate ? parseISO(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bd = b.dueDate ? parseISO(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return ad - bd;
              });
            return (
              <div
                key={col.id}
                className="flex min-h-[400px] flex-col rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-3 dark:bg-neutral-900/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: col.tint }}
                    />
                    <span className="text-sm font-medium text-foreground">{col.label}</span>
                  </div>
                  <Badge variant="outline" className="border-[var(--border)] text-xs tabular-nums">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {items.map((a) => (
                      <KanbanCard key={a.id} activity={a} onClick={handleActivityCardClick} />
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <div className="rounded border border-dashed border-[var(--neutral-300)] py-6 text-center text-xs text-[var(--neutral-400)]">
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── CALENDAR ─── */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {(Object.keys(JOB_ACTIVITY_TYPE_LABELS) as Array<keyof typeof JOB_ACTIVITY_TYPE_LABELS>).map(
              (t) => (
                <div key={t} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-sm border border-[var(--neutral-200)] dark:border-neutral-600"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${JOB_ACTIVITY_TYPE_COLOUR[t]} 40%, white)`,
                    }}
                  />
                  <span className="text-sm text-[var(--neutral-500)]">{JOB_ACTIVITY_TYPE_LABELS[t]}</span>
                </div>
              ),
            )}
          </div>

          <ScheduleCalendar
            events={calendarEvents}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            onEventClick={(ev) => {
              const a = activities.find((x) => x.id === ev.id);
              if (a) handleActivityCardClick(a);
            }}
            onDateClick={(d) => setSelectedDay(d)}
          />

          {selectedDay && (
            <Card variant="flat" className="rounded-[var(--shape-lg)] border-[var(--border)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  Activities on {format(selectedDay, 'EEEE, d MMM yyyy')}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-[var(--neutral-500)] hover:text-foreground"
                >
                  Close
                </button>
              </div>
              {filtered.filter((a) => a.dueDate && isSameDay(parseISO(a.dueDate), selectedDay)).length === 0 ? (
                <p className="text-sm text-[var(--neutral-500)]">No activities on this day.</p>
              ) : (
                <div className="space-y-2">
                  {filtered
                    .filter((a) => a.dueDate && isSameDay(parseISO(a.dueDate), selectedDay))
                    .map((a) => (
                      <JobActivityCard key={a.id} activity={a} onClick={handleActivityCardClick} />
                    ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ─── GANTT ─── */}
      {viewMode === 'gantt' && (
        <GanttView
          activities={filtered}
          groupBy={ganttGroupBy}
          onGroupByChange={setGanttGroupBy}
          zoom={ganttZoom}
          onZoomChange={setGanttZoom}
          onItemClick={handleActivityCardClick}
        />
      )}

      <LogJobActivityModal
        open={showNewActivity}
        onOpenChange={setShowNewActivity}
        jobOptions={jobOptions}
        workCentreOptions={MOCK_WCS.map((w) => ({ id: w.id, name: w.name }))}
      />

      {selectedEvent && (
        <EventDetailSheet
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Kanban card (compact)
// ─────────────────────────────────────────────────────────────────────

function KanbanCard({
  activity,
  onClick,
}: {
  activity: JobActivity;
  onClick: (a: JobActivity) => void;
}) {
  const Icon = JOB_ACTIVITY_TYPE_ICON[activity.type];
  const colour = JOB_ACTIVITY_TYPE_COLOUR[activity.type];
  const overdue = isActivityOverdue(activity);
  const priorityBadge = JOB_ACTIVITY_PRIORITY_BADGE[activity.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        variant="flat"
        className={cn(
          'cursor-pointer rounded-[var(--shape-md)] border-[var(--border)] bg-card p-3 transition-colors',
          overdue && 'border-[var(--mw-error)]/30',
        )}
        onClick={() => onClick(activity)}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `color-mix(in srgb, ${colour} 18%, transparent)` }}
            >
              <Icon className="h-3 w-3" style={{ color: colour }} />
            </div>
            <span className="line-clamp-2 text-xs font-medium text-foreground">{activity.title}</span>
          </div>
          <Badge className={cn('text-[10px]', priorityBadge.className)}>{priorityBadge.label}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] text-[var(--neutral-500)]">
          <Link
            to={`/plan/jobs/${activity.jobId}?tab=activities`}
            className="hover:text-[var(--mw-yellow-700)]"
            onClick={(e) => e.stopPropagation()}
          >
            {activity.jobNumber}
          </Link>
          {activity.dueDate && (
            <span className={cn('tabular-nums', overdue && 'font-medium text-[var(--mw-error)]')}>
              {format(parseISO(activity.dueDate), 'd MMM')}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-[10px] text-[var(--neutral-500)]">{activity.assignedTo}</span>
          <TimerPill activity={activity} compact />
        </div>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Gantt view
// ─────────────────────────────────────────────────────────────────────

function GanttView({
  activities,
  groupBy,
  onGroupByChange,
  zoom,
  onZoomChange,
  onItemClick,
}: {
  activities: JobActivity[];
  groupBy: ActivityGanttGroupBy;
  onGroupByChange: (g: ActivityGanttGroupBy) => void;
  zoom: 'day' | 'week' | 'month';
  onZoomChange: (z: 'day' | 'week' | 'month') => void;
  onItemClick: (a: JobActivity) => void;
}) {
  const rowsAndItems = useMemo(() => {
    const rows: MwGanttRowDef[] = [];
    const items: MwGanttItem[] = [];
    const seen = new Set<string>();
    const ensureRow = (id: string, label: string, sublabel?: string) => {
      if (seen.has(id)) return;
      seen.add(id);
      rows.push({ id, label, sublabel });
    };

    for (const a of activities) {
      let rowId: string;
      let rowLabel: string;
      let rowSub: string | undefined;
      switch (groupBy) {
        case 'assignee':
          rowId = `u-${a.assignedTo}`;
          rowLabel = a.assignedTo;
          break;
        case 'workCentre':
          rowId = `wc-${a.workCentreId ?? 'none'}`;
          rowLabel = a.workCentreName ?? 'No work centre';
          break;
        case 'job':
        default:
          rowId = `j-${a.jobId}`;
          rowLabel = a.jobNumber;
          rowSub = a.productKind ? `${a.productKind}` : undefined;
          break;
      }
      ensureRow(rowId, rowLabel, rowSub);

      const { start, end } = activityToTimeRange(a);

      // Dim items whose predecessors aren't yet complete.
      const predecessorBlocked = (a.blockedBy ?? []).some((pid) => {
        const pred = activities.find((x) => x.id === pid);
        return pred && pred.status !== 'completed' && pred.status !== 'cancelled';
      });

      // Drive bar colour by STATUS not type — the canonical Gantt is
      // monochrome + yellow. The type icon still shows on the activity
      // card; bars just speak status.
      const isOverdueOpen =
        !!a.dueDate &&
        new Date(a.dueDate).getTime() < Date.now() &&
        a.status !== 'completed' &&
        a.status !== 'cancelled';
      const token = isOverdueOpen ? 'overdue' : tokenFor(a.status);
      items.push({
        id: a.id,
        rowId,
        start,
        end,
        label: a.title,
        status: token,
        progress: a.status === 'completed' ? 100 : a.status === 'in_progress' ? 50 : 0,
        dimmed: predecessorBlocked,
        meta: { activityId: a.id },
      });
    }
    return { rows, items };
  }, [activities, groupBy]);

  const dependencies = useMemo(() => {
    const edges: { from: string; to: string }[] = [];
    activities.forEach((a) => {
      (a.blockedBy ?? []).forEach((from) => edges.push({ from, to: a.id }));
    });
    return edges;
  }, [activities]);

  const window = useMemo(() => {
    if (rowsAndItems.items.length === 0) return undefined;
    const starts = rowsAndItems.items.map((i) => i.start.getTime());
    const ends = rowsAndItems.items.map((i) => i.end.getTime());
    return {
      start: new Date(Math.min(...starts) - 2 * 86_400_000),
      end: new Date(Math.max(...ends) + 2 * 86_400_000),
    };
  }, [rowsAndItems]);

  return (
    <div className="h-[640px]">
      {rowsAndItems.items.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--neutral-500)]">
          No activities match your filters.
        </div>
      ) : (
        <MwGantt
          rows={rowsAndItems.rows}
          items={rowsAndItems.items}
          dependencies={dependencies}
          zoom={zoom}
          onZoomChange={onZoomChange}
          windowStart={window?.start}
          windowEnd={window?.end}
          toolbar={<GanttGroupBySelector value={groupBy} onChange={onGroupByChange} />}
          statusColour={MW_GANTT_STATUS_COLOUR}
          legend={[...MW_GANTT_LEGEND]}
          onItemClick={(t) => {
            const a = activities.find((x) => x.id === t.id);
            if (a) onItemClick(a);
          }}
        />
      )}
    </div>
  );
}

function GanttGroupBySelector({
  value,
  onChange,
}: {
  value: ActivityGanttGroupBy;
  onChange: (g: ActivityGanttGroupBy) => void;
}) {
  const options: Array<{ key: ActivityGanttGroupBy; label: string }> = [
    { key: 'job', label: 'By job' },
    { key: 'assignee', label: 'By assignee' },
    { key: 'workCentre', label: 'By work centre' },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-[var(--border)] bg-card">
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-[var(--mw-mirage)] text-white'
                : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] dark:text-neutral-400 dark:hover:bg-neutral-800',
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
