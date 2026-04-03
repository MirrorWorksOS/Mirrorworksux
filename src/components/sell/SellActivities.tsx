/**
 * Sell Activities - Track sales activities across all opportunities
 */

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { List, Calendar, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { EventDetailSheet, type CalendarEventDetail } from '@/components/shared/calendar/EventDetailSheet';
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarFilterButton } from '@/components/shared/layout/ToolbarFilterButton';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';

type CalendarGranularity = 'month' | 'week' | 'day';

type ActivityType = 'email' | 'call' | 'meeting' | 'task';
type ActivityStatus = 'completed' | 'scheduled' | 'overdue' | 'in_progress';

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  opportunity: string;
  opportunityPath: string;
  assignedTo: string;
  dueDate: string;
  status: ActivityStatus;
}

const initialActivities: Activity[] = [
  {
    id: '1',
    type: 'email',
    description: 'Send revised proposal to TechCorp',
    opportunity: 'OPP-0156',
    opportunityPath: '/sell/opportunities/OPP-0156',
    assignedTo: 'Sarah Chen',
    dueDate: '2026-04-02',
    status: 'scheduled',
  },
  {
    id: '2',
    type: 'call',
    description: 'Follow-up call with BHP on pricing',
    opportunity: 'OPP-0148',
    opportunityPath: '/sell/opportunities/OPP-0148',
    assignedTo: 'James Miller',
    dueDate: '2026-03-31',
    status: 'overdue',
  },
  {
    id: '3',
    type: 'meeting',
    description: 'On-site visit to review specifications',
    opportunity: 'OPP-0162',
    opportunityPath: '/sell/opportunities/OPP-0162',
    assignedTo: 'Sarah Chen',
    dueDate: '2026-04-05',
    status: 'scheduled',
  },
  {
    id: '4',
    type: 'task',
    description: 'Prepare cost breakdown for Pacific Fab RFQ',
    opportunity: 'OPP-0159',
    opportunityPath: '/sell/opportunities/OPP-0159',
    assignedTo: 'David Park',
    dueDate: '2026-04-01',
    status: 'in_progress',
  },
  {
    id: '5',
    type: 'email',
    description: 'Send contract amendment to Hunter Steel',
    opportunity: 'OPP-0144',
    opportunityPath: '/sell/opportunities/OPP-0144',
    assignedTo: 'James Miller',
    dueDate: '2026-03-28',
    status: 'completed',
  },
  {
    id: '6',
    type: 'call',
    description: 'Intro call with new lead from trade show',
    opportunity: 'OPP-0165',
    opportunityPath: '/sell/opportunities/OPP-0165',
    assignedTo: 'Sarah Chen',
    dueDate: '2026-04-03',
    status: 'scheduled',
  },
  {
    id: '7',
    type: 'meeting',
    description: 'Quarterly review with Sydney Rail Corp',
    opportunity: 'OPP-0138',
    opportunityPath: '/sell/opportunities/OPP-0138',
    assignedTo: 'David Park',
    dueDate: '2026-04-07',
    status: 'scheduled',
  },
  {
    id: '8',
    type: 'task',
    description: 'Update CRM records after AeroSpace negotiation',
    opportunity: 'OPP-0151',
    opportunityPath: '/sell/opportunities/OPP-0151',
    assignedTo: 'James Miller',
    dueDate: '2026-03-30',
    status: 'completed',
  },
];

const TYPE_BADGE: Record<ActivityType, { label: string; className: string }> = {
  email: {
    label: 'Email',
    className: 'border-0 bg-[var(--mw-info-light)] text-[var(--mw-info)]',
  },
  call: {
    label: 'Call',
    className: 'border-0 bg-[var(--mw-success-light)] text-[var(--mw-success)]',
  },
  meeting: {
    label: 'Meeting',
    className: 'border-0 bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  },
  task: {
    label: 'Task',
    className: 'border-0 bg-[var(--mw-warning-light)] text-[var(--mw-warning)]',
  },
};

/** Calendar event colours keyed by activity type */
const TYPE_CALENDAR_COLOR: Record<ActivityType, string> = {
  email: 'var(--mw-info)',
  call: 'var(--mw-success)',
  meeting: 'var(--mw-warning)',
  task: '#737373',
};

const STATUS_BADGE: Record<ActivityStatus, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'border-0 bg-[var(--mw-info-light)] text-[var(--mw-info)]',
  },
  overdue: {
    label: 'Overdue',
    className: 'border-0 bg-[var(--mw-error-light)] text-[var(--mw-error)]',
  },
  in_progress: {
    label: 'In Progress',
    className: 'border-0 bg-[var(--mw-warning-light)] text-[var(--mw-warning)]',
  },
};

const TEAM_MEMBERS = ['Sarah Chen', 'James Miller', 'David Park'];
const OPPORTUNITIES = [
  { id: 'OPP-0138', label: 'OPP-0138 - Sydney Rail Corp' },
  { id: 'OPP-0144', label: 'OPP-0144 - Hunter Steel' },
  { id: 'OPP-0148', label: 'OPP-0148 - BHP' },
  { id: 'OPP-0151', label: 'OPP-0151 - AeroSpace' },
  { id: 'OPP-0156', label: 'OPP-0156 - TechCorp' },
  { id: 'OPP-0159', label: 'OPP-0159 - Pacific Fab' },
  { id: 'OPP-0162', label: 'OPP-0162 - Spec Review' },
  { id: 'OPP-0165', label: 'OPP-0165 - Trade Show Lead' },
];

/* ------------------------------------------------------------------ */
/*  New Activity form state                                            */
/* ------------------------------------------------------------------ */
interface NewActivityForm {
  title: string;
  type: ActivityType | '';
  assignedTo: string;
  dueDate: string;
  opportunity: string;
  description: string;
}

const emptyForm: NewActivityForm = {
  title: '',
  type: '',
  assignedTo: '',
  dueDate: '',
  opportunity: '',
  description: '',
};

/* ------------------------------------------------------------------ */
/*  Mock attendees for event detail sheet                              */
/* ------------------------------------------------------------------ */
const MOCK_ATTENDEES: Record<string, { name: string; email: string }[]> = {
  '1': [
    { name: 'Sarah Chen', email: 'sarah.chen@mirrorworks.com' },
    { name: 'Tom Williams', email: 'tom.w@techcorp.com' },
  ],
  '2': [
    { name: 'James Miller', email: 'james.miller@mirrorworks.com' },
    { name: 'Karen Rhodes', email: 'karen.r@bhp.com.au' },
  ],
  '3': [
    { name: 'Sarah Chen', email: 'sarah.chen@mirrorworks.com' },
    { name: 'Michael Torres', email: 'm.torres@specreview.com' },
    { name: 'Lisa Park', email: 'lisa.park@mirrorworks.com' },
  ],
  '6': [
    { name: 'Sarah Chen', email: 'sarah.chen@mirrorworks.com' },
  ],
  '7': [
    { name: 'David Park', email: 'david.park@mirrorworks.com' },
    { name: 'Janet Liu', email: 'j.liu@sydneyrail.com.au' },
    { name: 'Peter Ng', email: 'peter.ng@sydneyrail.com.au' },
  ],
};

const MOCK_DESCRIPTIONS: Record<string, string> = {
  '1': 'Send the revised pricing proposal including updated lead times and shipping terms. Include the new volume discount schedule discussed last week.',
  '2': 'Follow up on the pricing negotiation from the last meeting. Key points: bulk discount threshold, payment terms, delivery schedule for Q3.',
  '3': 'On-site visit to review fabrication specifications for the custom enclosure project. Bring sample materials and updated drawings.',
  '7': 'Quarterly business review covering order volume, delivery performance, and upcoming project pipeline. Prepare slides with KPI dashboard.',
};

const MOCK_LOCATIONS: Record<string, string> = {
  '3': 'TechCorp HQ, Level 12, 200 George St, Sydney',
  '7': 'Sydney Rail Corp, Boardroom 3A, Central Station Complex',
};

function activityToEventDetail(activity: Activity): CalendarEventDetail {
  const startDate = new Date(`${activity.dueDate}T09:00:00`);
  const endDate = new Date(`${activity.dueDate}T10:00:00`);
  const opp = OPPORTUNITIES.find((o) => o.id === activity.opportunity);

  return {
    id: activity.id,
    title: activity.description,
    start: startDate,
    end: endDate,
    type: activity.type as CalendarEventDetail['type'],
    description: MOCK_DESCRIPTIONS[activity.id],
    attendees: MOCK_ATTENDEES[activity.id],
    location: MOCK_LOCATIONS[activity.id],
    relatedTo: activity.opportunity
      ? { type: 'Opportunity', label: opp?.label ?? activity.opportunity, path: activity.opportunityPath }
      : undefined,
    status: activity.status === 'in_progress' ? 'scheduled' : (activity.status as 'scheduled' | 'completed' | 'cancelled'),
    priority: activity.status === 'overdue' ? 'high' : activity.status === 'in_progress' ? 'medium' : 'low',
    notes: '',
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: convert activities to ScheduleCalendar events              */
/* ------------------------------------------------------------------ */
function toCalendarEvents(activities: Activity[]): CalendarEvent[] {
  return activities.map((a) => ({
    id: a.id,
    title: a.description,
    date: parseISO(`${a.dueDate}T12:00:00`),
    color: TYPE_CALENDAR_COLOR[a.type],
  }));
}

function activitiesOnDate(activities: Activity[], day: Date): Activity[] {
  const dateStr = format(day, 'yyyy-MM-dd');
  return activities.filter((a) => a.dueDate === dateStr);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function SellActivities() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 3, 1)); // April 2026
  const [calendarGranularity, setCalendarGranularity] = useState<CalendarGranularity>('month');
  const [weekAnchor, setWeekAnchor] = useState(() => new Date(2026, 3, 1));
  const [dayViewDate, setDayViewDate] = useState(() => new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [form, setForm] = useState<NewActivityForm>(emptyForm);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDetail | null>(null);

  const statusVariantMap: Record<ActivityStatus, 'neutral' | 'info' | 'error' | 'warning'> = {
    completed: 'neutral',
    scheduled: 'info',
    overdue: 'error',
    in_progress: 'warning',
  };

  const activityColumns: MwColumnDef<Activity>[] = [
    { key: 'type', header: 'Type', tooltip: 'Activity type (email, call, meeting, task)', cell: (a) => <Badge className={TYPE_BADGE[a.type].className}>{TYPE_BADGE[a.type].label}</Badge> },
    { key: 'description', header: 'Description', cell: (a) => <span className="font-medium text-[var(--neutral-900)]">{a.description}</span> },
    { key: 'opportunity', header: 'Opportunity', tooltip: 'Linked sales opportunity', cell: (a) => <a href={a.opportunityPath} className="text-[var(--mw-yellow-700)] underline-offset-2 hover:underline">{a.opportunity}</a> },
    { key: 'assignedTo', header: 'Assigned to', tooltip: 'Team member responsible', cell: (a) => <span className="text-[var(--neutral-600)]">{a.assignedTo}</span> },
    { key: 'dueDate', header: 'Due date', className: 'tabular-nums', cell: (a) => <span className="text-[var(--neutral-600)]">{a.dueDate}</span> },
    { key: 'status', header: 'Status', cell: (a) => <StatusBadge variant={statusVariantMap[a.status]}>{STATUS_BADGE[a.status].label}</StatusBadge> },
  ];

  // Filtered activities for the list view
  const filtered = activities.filter(
    (a) =>
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.opportunity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calendar events
  const calendarEvents = useMemo(() => toCalendarEvents(activities), [activities]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(weekAnchor, { weekStartsOn: 1 });
    const end = endOfWeek(weekAnchor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [weekAnchor]);

  const dayViewActivities = useMemo(
    () => activitiesOnDate(activities, dayViewDate),
    [activities, dayViewDate],
  );

  // Activities for the selected calendar date
  const selectedDateActivities = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return activities.filter((a) => a.dueDate === dateStr);
  }, [selectedDate, activities]);

  /* Handle calendar date click */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  /* Handle new activity save */
  const handleSave = () => {
    if (!form.title || !form.type || !form.dueDate) return;

    const newActivity: Activity = {
      id: String(Date.now()),
      type: form.type as ActivityType,
      description: form.title,
      opportunity: form.opportunity || '',
      opportunityPath: form.opportunity ? `/sell/opportunities/${form.opportunity}` : '',
      assignedTo: form.assignedTo || '',
      dueDate: form.dueDate,
      status: 'scheduled',
    };

    setActivities((prev) => [newActivity, ...prev]);
    setForm(emptyForm);
    setShowNewActivity(false);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setShowNewActivity(false);
  };

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Activities"
        subtitle="Track sales activities across all opportunities"
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'completed', label: 'Completed', value: activities.filter(a => a.status === 'completed').length, color: 'var(--mw-yellow-400)' },
          { key: 'scheduled', label: 'Scheduled', value: activities.filter(a => a.status === 'scheduled').length, color: 'var(--mw-mirage)' },
          { key: 'in_progress', label: 'In Progress', value: activities.filter(a => a.status === 'in_progress').length, color: 'var(--neutral-400)' },
          { key: 'overdue', label: 'Overdue', value: activities.filter(a => a.status === 'overdue').length, color: 'var(--neutral-200)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <PageToolbar>
        <ToolbarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search activities…" />
        <ToolbarSpacer />
        <ToolbarFilterButton />
        <IconViewToggle
          value={viewMode}
          onChange={(k) => setViewMode(k as 'list' | 'calendar')}
          options={[
            { key: 'list', icon: List, label: 'List view' },
            { key: 'calendar', icon: Calendar, label: 'Calendar view' },
          ]}
        />
        <ToolbarPrimaryButton icon={Plus} onClick={() => setShowNewActivity(true)}>
          New Activity
        </ToolbarPrimaryButton>
      </PageToolbar>

      {/* ---- LIST VIEW ---- */}
      {viewMode === 'list' && (
        <MwDataTable<Activity>
          columns={activityColumns}
          data={filtered}
          keyExtractor={(a) => a.id}
          onRowClick={(a) => setSelectedEvent(activityToEventDetail(a))}
          selectable
          onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        />
      )}

      {/* ---- CALENDAR VIEW ---- */}
      {viewMode === 'calendar' && (
        <div className="px-6 pb-6 space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6">
            {(Object.keys(TYPE_CALENDAR_COLOR) as ActivityType[]).map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm border border-[var(--neutral-200)]"
                  style={{ backgroundColor: `color-mix(in srgb, ${TYPE_CALENDAR_COLOR[t]} 35%, white)` }}
                />
                <span className="text-sm text-[var(--neutral-500)]">{TYPE_BADGE[t].label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)] mr-2">
              View
            </span>
            {(['month', 'week', 'day'] as CalendarGranularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setCalendarGranularity(g)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  calendarGranularity === g
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-[var(--neutral-900)]'
                    : 'border-[var(--border)] bg-white text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]',
                )}
              >
                {g}
              </button>
            ))}
          </div>

          {calendarGranularity === 'month' && (
            <ScheduleCalendar
              events={calendarEvents}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              onDateClick={handleDateClick}
            />
          )}

          {calendarGranularity === 'week' && (
            <Card className="overflow-hidden border border-[var(--border)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--neutral-50)] px-4 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => setWeekAnchor((d) => subWeeks(d, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-[var(--neutral-900)] tabular-nums">
                  {format(startOfWeek(weekAnchor, { weekStartsOn: 1 }), 'd MMM')}{' '}
                  – {format(endOfWeek(weekAnchor, { weekStartsOn: 1 }), 'd MMM yyyy')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => setWeekAnchor((d) => addWeeks(d, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-px bg-[var(--border)] p-px">
                {weekDays.map((day) => {
                  const dayActs = activitiesOnDate(activities, day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="min-h-[140px] bg-white p-2"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className="mb-2 w-full text-left"
                      >
                        <span className="text-xs font-medium text-[var(--neutral-900)]">
                          {format(day, 'EEE')}
                        </span>
                        <span className="ml-1 text-xs tabular-nums text-[var(--neutral-500)]">
                          {format(day, 'd')}
                        </span>
                      </button>
                      <ul className="space-y-1">
                        {dayActs.slice(0, 4).map((a) => (
                          <li
                            key={a.id}
                            className="truncate rounded border-l-2 pl-1.5 text-[10px] leading-tight text-[var(--neutral-800)]"
                            style={{ borderColor: TYPE_CALENDAR_COLOR[a.type] }}
                          >
                            {a.description}
                          </li>
                        ))}
                        {dayActs.length > 4 && (
                          <li className="text-[10px] text-[var(--neutral-500)]">
                            +{dayActs.length - 4} more
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {calendarGranularity === 'day' && (
            <Card className="overflow-hidden border border-[var(--border)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--neutral-50)] px-4 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => setDayViewDate((d) => subDays(d, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-[var(--neutral-900)]">
                  {dayViewDate.toLocaleDateString('en-AU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => setDayViewDate((d) => addDays(d, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {dayViewActivities.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[var(--neutral-500)]">
                  No activities scheduled for this day.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {dayViewActivities.map((activity) => {
                    const typeBadge = TYPE_BADGE[activity.type];
                    const statusBadge = STATUS_BADGE[activity.status];
                    return (
                      <div key={activity.id} className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--neutral-50)] transition-colors" onClick={() => setSelectedEvent(activityToEventDetail(activity))}>
                        <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                        <span className="flex-1 min-w-[120px] text-sm font-medium text-[var(--neutral-900)]">
                          {activity.description}
                        </span>
                        {activity.opportunity && (
                          <a
                            href={activity.opportunityPath}
                            className="text-sm text-[var(--mw-yellow-700)] underline-offset-2 hover:underline"
                          >
                            {activity.opportunity}
                          </a>
                        )}
                        <span className="text-sm text-[var(--neutral-600)]">{activity.assignedTo}</span>
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Selected-date detail panel (month + week) */}
          {selectedDate && calendarGranularity !== 'day' && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--neutral-50)] px-4 py-3">
                <h3 className="text-sm font-medium text-[var(--neutral-900)]">
                  Activities for{' '}
                  {selectedDate.toLocaleDateString('en-AU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="rounded-[var(--shape-sm)] p-1 text-[var(--neutral-400)] transition-colors hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-600)]"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              {selectedDateActivities.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--neutral-500)]">
                  No activities scheduled for this date.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {selectedDateActivities.map((activity) => {
                    const typeBadge = TYPE_BADGE[activity.type];
                    const statusBadge = STATUS_BADGE[activity.status];
                    return (
                      <div key={activity.id} className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[var(--neutral-50)] transition-colors" onClick={() => setSelectedEvent(activityToEventDetail(activity))}>
                        <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                        <span className="flex-1 text-sm font-medium text-[var(--neutral-900)]">
                          {activity.description}
                        </span>
                        {activity.opportunity && (
                          <a
                            href={activity.opportunityPath}
                            className="text-sm text-[var(--mw-yellow-700)] underline-offset-2 hover:underline"
                          >
                            {activity.opportunity}
                          </a>
                        )}
                        <span className="text-sm text-[var(--neutral-600)]">{activity.assignedTo}</span>
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ---- EVENT DETAIL SHEET ---- */}
      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />

      {/* ---- NEW ACTIVITY DIALOG ---- */}
      <Dialog open={showNewActivity} onOpenChange={setShowNewActivity}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Activity</DialogTitle>
            <DialogDescription>
              Create a new sales activity and assign it to a team member.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--neutral-700)]">
                Title <span className="text-[var(--mw-error)]">*</span>
              </label>
              <Input
                placeholder="Activity title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--neutral-700)]">
                Type <span className="text-[var(--mw-error)]">*</span>
              </label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm((f) => ({ ...f, type: val as ActivityType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--neutral-700)]">Assigned To</label>
              <Select
                value={form.assignedTo}
                onValueChange={(val) => setForm((f) => ({ ...f, assignedTo: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--neutral-700)]">
                Due Date <span className="text-[var(--mw-error)]">*</span>
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            {/* Related Opportunity */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--neutral-700)]">Related Opportunity</label>
              <Select
                value={form.opportunity}
                onValueChange={(val) => setForm((f) => ({ ...f, opportunity: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity" />
                </SelectTrigger>
                <SelectContent>
                  {OPPORTUNITIES.map((opp) => (
                    <SelectItem key={opp.id} value={opp.id}>
                      {opp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--neutral-700)]">Description</label>
              <Textarea
                placeholder="Add details about this activity..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]"
              onClick={handleSave}
              disabled={!form.title || !form.type || !form.dueDate}
            >
              Save Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
