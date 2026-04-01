/**
 * Sell Activities - Track sales activities across all opportunities
 */

import React, { useMemo, useState } from 'react';
import { Search, Filter, List, Calendar, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { ScheduleCalendar, type CalendarEvent } from '@/components/shared/datetime/ScheduleCalendar';
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
    className: 'border-0 bg-blue-100 text-blue-800',
  },
  call: {
    label: 'Call',
    className: 'border-0 bg-green-100 text-green-800',
  },
  meeting: {
    label: 'Meeting',
    className: 'border-0 bg-purple-100 text-purple-800',
  },
  task: {
    label: 'Task',
    className: 'border-0 bg-amber-100 text-amber-800',
  },
};

/** Calendar event colours keyed by activity type */
const TYPE_CALENDAR_COLOR: Record<ActivityType, string> = {
  email: '#3b82f6',   // blue-500
  call: '#22c55e',    // green-500
  meeting: '#eab308', // yellow-500
  task: '#737373',    // neutral-500
};

const STATUS_BADGE: Record<ActivityStatus, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'border-0 bg-blue-50 text-blue-700',
  },
  overdue: {
    label: 'Overdue',
    className: 'border-0 bg-red-50 text-red-700',
  },
  in_progress: {
    label: 'In Progress',
    className: 'border-0 bg-amber-50 text-amber-700',
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
    <PageShell>
      <PageHeader
        title="Activities"
        subtitle="Track sales activities across all opportunities"
        actions={
          <Button
            className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]"
            onClick={() => setShowNewActivity(true)}
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
            New Activity
          </Button>
        }
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-[var(--shape-md)] border border-[var(--border)] bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--mw-yellow-400)] focus:ring-2 focus:ring-[var(--mw-yellow-400)]/20"
          />
        </div>
        <Button variant="outline" size="sm" className="border-[var(--border)]">
          <Filter className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Filter
        </Button>
        <div className="flex items-center rounded-[var(--shape-md)] border border-[var(--border)] bg-white p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-[var(--shape-sm)] p-1.5 transition-colors',
              viewMode === 'list'
                ? 'bg-[var(--neutral-100)] text-[var(--neutral-900)]'
                : 'text-[var(--neutral-400)] hover:text-[var(--neutral-600)]',
            )}
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              'rounded-[var(--shape-sm)] p-1.5 transition-colors',
              viewMode === 'calendar'
                ? 'bg-[var(--neutral-100)] text-[var(--neutral-900)]'
                : 'text-[var(--neutral-400)] hover:text-[var(--neutral-600)]',
            )}
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ---- LIST VIEW ---- */}
      {viewMode === 'list' && (
        <div className="px-6 pb-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--neutral-50)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Description</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Opportunity</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Assigned To</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Due Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--neutral-600)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((activity) => {
                    const typeBadge = TYPE_BADGE[activity.type];
                    const statusBadge = STATUS_BADGE[activity.status];
                    return (
                      <tr
                        key={activity.id}
                        className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--neutral-50)]"
                      >
                        <td className="px-4 py-3">
                          <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">
                          {activity.description}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={activity.opportunityPath}
                            className="text-[var(--mw-yellow-700)] underline-offset-2 hover:underline"
                          >
                            {activity.opportunity}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-[var(--neutral-600)]">{activity.assignedTo}</td>
                        <td className="px-4 py-3 tabular-nums text-[var(--neutral-600)]">{activity.dueDate}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
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
                        <span className="text-xs font-semibold text-[var(--neutral-900)]">
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
                      <div key={activity.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
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
                      <div key={activity.id} className="flex items-center gap-4 px-4 py-3">
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
                Title <span className="text-red-500">*</span>
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
                Type <span className="text-red-500">*</span>
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
                Due Date <span className="text-red-500">*</span>
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
