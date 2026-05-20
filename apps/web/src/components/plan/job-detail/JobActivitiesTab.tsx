/**
 * JobActivitiesTab — per-job activity inbox surfaced under the Activities tab
 * on `/plan/jobs/:id`. Phase-1: List view only with header time-summary card,
 * inline timers, and template-apply suggestion for empty / configurable jobs.
 */

import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { GanttChart as GanttIcon, List, Plus, Sparkles, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { isToday, parseISO } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { cn } from '@/components/ui/utils';

import { useJobActivityStore } from '@/store/jobActivityStore';
import { JobActivityCard } from '../activities/JobActivityCard';
import { LogJobActivityModal } from '../LogJobActivityModal';
import { JobActivityTimeSummary } from './JobActivityTimeSummary';
import {
  JOB_ACTIVITY_STATUS_LABELS,
  JOB_ACTIVITY_TYPE_COLOUR,
  activityToTimeRange,
  formatMinutes,
  isActivityOverdue,
} from '../plan-activity-shared';
import type { JobActivity, JobActivityStatus } from '@/types/job-activity';
import {
  MwGantt,
  MW_GANTT_LEGEND,
  MW_GANTT_STATUS_COLOUR,
  tokenFor,
  type MwGanttItem,
  type MwGanttRowDef,
  type MwGanttZoom,
} from '@/components/shared/gantt';
import { selectTemplatesForProductKind } from '@/store/jobActivityStore';
import { jobs as MOCK_JOBS, workCentres as MOCK_WCS } from '@/services/mock/data';

interface JobActivitiesTabProps {
  jobId: string;
}

const STATUS_FILTER_ORDER: (JobActivityStatus | 'all')[] = [
  'all',
  'todo',
  'in_progress',
  'blocked',
  'completed',
];

export function JobActivitiesTab({ jobId }: JobActivitiesTabProps) {
  // Match by either internal job id or jobNumber — URLs in the codebase use
  // both forms depending on where the link was generated.
  const activities = useJobActivityStore(
    useShallow((s) => s.activities.filter((a) => a.jobId === jobId || a.jobNumber === jobId)),
  );
  const applyTemplate = useJobActivityStore((s) => s.applyTemplate);
  const hasAppliedTemplate = useJobActivityStore((s) => s.hasAppliedTemplate);
  const markTemplateApplied = useJobActivityStore((s) => s.markTemplateApplied);

  const job = useMemo(
    () => MOCK_JOBS.find((j) => j.id === jobId || j.jobNumber === jobId),
    [jobId],
  );
  // Live registry — picks up admin edits in Plan Settings ▸ Templates.
  const suggestedTemplates = useJobActivityStore(
    useShallow(selectTemplatesForProductKind(job?.productKind)),
  );

  const [statusFilter, setStatusFilter] = useState<JobActivityStatus | 'all'>('all');
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [view, setView] = useState<'list' | 'gantt'>('list');
  const [ganttZoom, setGanttZoom] = useState<MwGanttZoom>('week');

  const filtered = useMemo(
    () =>
      activities
        .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
        .slice()
        .sort((a, b) => {
          // Open first, completed last; then by due
          const ao = a.status === 'completed' || a.status === 'cancelled' ? 1 : 0;
          const bo = b.status === 'completed' || b.status === 'cancelled' ? 1 : 0;
          if (ao !== bo) return ao - bo;
          const ad = a.dueDate ? parseISO(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bd = b.dueDate ? parseISO(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          return ad - bd;
        }),
    [activities, statusFilter],
  );

  const summary = useMemo(() => {
    const open = activities.filter(
      (a) => a.status !== 'completed' && a.status !== 'cancelled',
    ).length;
    const overdue = activities.filter((a) => isActivityOverdue(a)).length;
    const blocked = activities.filter((a) => a.status === 'blocked').length;
    const dueToday = activities.filter((a) => a.dueDate && isToday(parseISO(a.dueDate))).length;
    const loggedTodayMin = activities.reduce((sum, a) => {
      const todayMin = a.timeEntries.reduce((s, e) => {
        if (!e.stoppedAt) return s;
        return isToday(parseISO(e.stoppedAt)) ? s + (e.minutes ?? 0) : s;
      }, 0);
      return sum + todayMin;
    }, 0);
    return { open, overdue, blocked, dueToday, loggedTodayMin };
  }, [activities]);

  const handleApplyTemplate = (templateId: string) => {
    if (!job) return;
    const created = applyTemplate(job.id, job.jobNumber, templateId, job.startDate);
    toast.success(`Template applied — ${created} activities created`, {
      description: 'Due dates anchored to the job stage timeline.',
    });
  };

  const jobOption = job
    ? { jobId: job.id, jobNumber: job.jobNumber, title: job.title, productKind: job.productKind }
    : undefined;

  return (
    <div className="space-y-5">
      {/* Time summary card */}
      <JobActivityTimeSummary activities={activities} />

      {/* Top KPI strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-[260px] flex-1">
          <ToolbarSummaryBar
            segments={[
              { key: 'open', label: 'Open', value: summary.open, color: 'var(--neutral-400)' },
              { key: 'due_today', label: 'Due today', value: summary.dueToday, color: 'var(--mw-yellow-300)' },
              { key: 'blocked', label: 'Blocked', value: summary.blocked, color: 'var(--mw-yellow-500)' },
              { key: 'overdue', label: 'Overdue', value: summary.overdue, color: 'var(--mw-mirage)' },
            ]}
            formatValue={(v) => String(v)}
          />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mw-yellow-400)]/15 px-3 py-1 text-xs font-medium text-foreground">
          <span className="text-[var(--neutral-500)]">Logged today</span>
          <span className="tabular-nums">{formatMinutes(summary.loggedTodayMin)}</span>
        </span>
      </div>

      {/* Template suggestion banner — only shown if no template applied yet and any suggested */}
      {!hasAppliedTemplate(jobId) && suggestedTemplates.length > 0 && (
        <Card
          variant="flat"
          className="flex items-start gap-3 rounded-[var(--shape-lg)] border-[var(--mw-yellow-400)]/30 bg-[var(--mw-yellow-50,_#FFFBEB)] p-4 dark:bg-amber-900/10"
        >
          <Sparkles className="mt-0.5 h-4 w-4 text-[var(--mw-yellow-700)] dark:text-yellow-300" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Suggested templates for this {job?.productKind ?? ''} job
            </p>
            <p className="mt-0.5 text-xs text-[var(--neutral-600)] dark:text-neutral-300">
              Apply a recipe to seed the planning + QC gates. You can edit individual activities after.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedTemplates.map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  className="bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]"
                  onClick={() => handleApplyTemplate(t.id)}
                >
                  Apply &ldquo;{t.name}&rdquo;
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markTemplateApplied(jobId)}
                className="text-[var(--neutral-600)]"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => markTemplateApplied(jobId)}
            className="rounded p-1 text-[var(--neutral-500)] hover:bg-black/5"
            aria-label="Dismiss template suggestion"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {/* Toolbar: status chips + new */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTER_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === s
                ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground'
                : 'border-[var(--border)] bg-card text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] dark:text-neutral-400 dark:hover:bg-neutral-800',
            )}
          >
            {s === 'all' ? 'All' : JOB_ACTIVITY_STATUS_LABELS[s]}
            <Badge variant="outline" className="ml-2 border-transparent bg-transparent text-[10px] tabular-nums">
              {s === 'all' ? activities.length : activities.filter((a) => a.status === s).length}
            </Badge>
          </button>
        ))}
        <div className="flex-1" />

        {/* View toggle */}
        <div className="inline-flex overflow-hidden rounded-full border border-[var(--border)] bg-card">
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              view === 'list'
                ? 'bg-[var(--mw-yellow-400)] text-[#2C2C2C]'
                : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] dark:text-neutral-400 dark:hover:bg-neutral-800',
            )}
            aria-pressed={view === 'list'}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView('gantt')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              view === 'gantt'
                ? 'bg-[var(--mw-yellow-400)] text-[#2C2C2C]'
                : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] dark:text-neutral-400 dark:hover:bg-neutral-800',
            )}
            aria-pressed={view === 'gantt'}
          >
            <GanttIcon className="h-3.5 w-3.5" />
            Gantt
          </button>
        </div>

        {suggestedTemplates.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Apply template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Templates for this job</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {suggestedTemplates.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => handleApplyTemplate(t.id)}>
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          size="sm"
          className="bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]"
          onClick={() => setShowNewActivity(true)}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New activity
        </Button>
      </div>

      {/* List view */}
      {view === 'list' && (
        filtered.length === 0 ? (
          <Card variant="flat" className="rounded-[var(--shape-lg)] border-[var(--border)] p-12 text-center">
            <p className="text-sm text-[var(--neutral-500)]">
              {activities.length === 0
                ? 'No activities yet. Apply a template or create one to get started.'
                : 'No activities match this filter.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((a: JobActivity) => (
                <JobActivityCard key={a.id} activity={a} hideJobLink />
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* Gantt view */}
      {view === 'gantt' && (
        <JobGanttView
          activities={filtered}
          zoom={ganttZoom}
          onZoomChange={setGanttZoom}
        />
      )}

      <LogJobActivityModal
        open={showNewActivity}
        onOpenChange={setShowNewActivity}
        job={jobOption}
        workCentreOptions={MOCK_WCS.map((w) => ({ id: w.id, name: w.name }))}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// JobGanttView — per-job Gantt grouped by work centre (or "Job-wide")
// ─────────────────────────────────────────────────────────────────────

function JobGanttView({
  activities,
  zoom,
  onZoomChange,
}: {
  activities: JobActivity[];
  zoom: MwGanttZoom;
  onZoomChange: (z: MwGanttZoom) => void;
}) {
  const rowsAndItems = useMemo(() => {
    const rows: MwGanttRowDef[] = [];
    const items: MwGanttItem[] = [];
    const seen = new Set<string>();
    const ensureRow = (id: string, label: string) => {
      if (seen.has(id)) return;
      seen.add(id);
      rows.push({ id, label });
    };

    for (const a of activities) {
      const rowId = a.workCentreId ?? 'job-wide';
      const rowLabel = a.workCentreName ?? 'Job-wide';
      ensureRow(rowId, rowLabel);

      const { start, end } = activityToTimeRange(a);

      const predecessorBlocked = (a.blockedBy ?? []).some((pid) => {
        const pred = activities.find((x) => x.id === pid);
        return pred && pred.status !== 'completed' && pred.status !== 'cancelled';
      });

      // Status-driven monochrome — type icon stays on activity cards.
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
      });
    }
    return { rows, items };
  }, [activities]);

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

  if (rowsAndItems.items.length === 0) {
    return (
      <Card variant="flat" className="rounded-[var(--shape-lg)] border-[var(--border)] p-12 text-center">
        <p className="text-sm text-[var(--neutral-500)]">No activities to chart.</p>
      </Card>
    );
  }

  return (
    <div className="h-[520px]">
      <MwGantt
        rows={rowsAndItems.rows}
        items={rowsAndItems.items}
        dependencies={dependencies}
        zoom={zoom}
        onZoomChange={onZoomChange}
        windowStart={window?.start}
        windowEnd={window?.end}
        statusColour={MW_GANTT_STATUS_COLOUR}
        legend={[...MW_GANTT_LEGEND]}
      />
    </div>
  );
}
