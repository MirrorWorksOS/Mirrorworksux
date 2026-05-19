/**
 * JobActivityCard — list-row card for a single job activity. Mirrors the
 * Sell `ActivityCard` look but with manufacturing context: traveller chip,
 * work-centre badge, time logged vs estimated, and an inline TimerPill.
 */

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Clock4, Edit3, MoreVertical, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';
import {
  JOB_ACTIVITY_STATUS_BADGE,
  JOB_ACTIVITY_PRIORITY_BADGE,
  formatMinutes,
  iconForName,
  isActivityOverdue,
  resolveActivityType,
} from '../plan-activity-shared';
import { TimerPill } from './TimerPill';
import { TimeEntryDialog } from './TimeEntryDialog';
import { useJobActivityStore } from '@/store/jobActivityStore';
import type { JobActivity } from '@/types/job-activity';

interface JobActivityCardProps {
  activity: JobActivity;
  /** When true, hide the job-link chip (e.g. inside the per-job tab). */
  hideJobLink?: boolean;
  onClick?: (activity: JobActivity) => void;
}

function ActivityCheckmark({
  completed,
  onToggle,
}: {
  completed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-200 ease-out',
        completed
          ? 'bg-[var(--mw-yellow-400)]'
          : 'border-2 border-[var(--neutral-300)] hover:border-[var(--neutral-400)] dark:border-neutral-600 dark:hover:border-neutral-500',
      )}
      aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
    >
      <AnimatePresence mode="wait">
        {completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Check className="h-3 w-3 text-[#2C2C2C]" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export const JobActivityCard = React.forwardRef<
  HTMLDivElement,
  JobActivityCardProps
>(function JobActivityCardImpl({ activity, hideJobLink = false, onClick }, ref) {
  const toggleComplete = useJobActivityStore((s) => s.toggleComplete);
  const deleteActivity = useJobActivityStore((s) => s.deleteActivity);
  const customTypes = useJobActivityStore((s) => s.customActivityTypes);
  const [timeDialogOpen, setTimeDialogOpen] = React.useState(false);

  const customIconRegistry = React.useMemo(
    () => Object.fromEntries(customTypes.map((t) => [t.iconName, iconForName(t.iconName)])),
    [customTypes],
  );
  const typeMeta = resolveActivityType(activity.type, customTypes, customIconRegistry);
  const Icon = typeMeta.icon;
  const typeColour = typeMeta.colour;
  const isOverdue = isActivityOverdue(activity);
  const isCompleted = activity.status === 'completed';
  const priorityBadge = JOB_ACTIVITY_PRIORITY_BADGE[activity.priority];
  const statusBadge = JOB_ACTIVITY_STATUS_BADGE[activity.status];

  const dueLabel = activity.dueDate
    ? format(parseISO(activity.dueDate), 'd MMM, h:mm a')
    : activity.plannedStart
      ? format(parseISO(activity.plannedStart), 'd MMM, h:mm a')
      : null;

  const estimated = activity.estimatedMinutes ?? 0;
  const logged = activity.loggedMinutes;
  const variance = estimated > 0 ? logged - estimated : 0;

  return (
    <>
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          variant="flat"
          className={cn(
            'cursor-pointer rounded-[var(--shape-lg)] border-[var(--border)] p-4 transition-colors',
            isOverdue && 'border-[var(--mw-error)]/30',
            isCompleted && 'opacity-70',
          )}
          onClick={() => onClick?.(activity)}
        >
          <div className="flex items-start gap-3">
            <ActivityCheckmark
              completed={isCompleted}
              onToggle={() => toggleComplete(activity.id)}
            />

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `color-mix(in srgb, ${typeColour} 18%, transparent)` }}
                    aria-label={typeMeta.label}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: typeColour }} />
                  </div>
                  <span
                    className={cn(
                      'truncate text-sm font-medium text-foreground',
                      isCompleted && 'text-[var(--neutral-500)] line-through',
                    )}
                  >
                    {activity.title}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge className={cn('text-[10px]', priorityBadge.className)}>
                    {priorityBadge.label}
                  </Badge>
                  {isOverdue && !isCompleted && (
                    <Badge className="border-0 bg-[var(--mw-error-light)] text-[10px] text-[var(--mw-error)] dark:bg-red-900/20 dark:text-red-300">
                      Overdue
                    </Badge>
                  )}
                  <Badge className={cn('text-[10px]', statusBadge.className)}>
                    {statusBadge.label}
                  </Badge>
                </div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--neutral-500)]">
                <span className="font-medium text-[var(--neutral-600)] dark:text-neutral-400">
                  {activity.assignedTo}
                </span>
                {dueLabel && <span className="tabular-nums">{dueLabel}</span>}
                {!hideJobLink && (
                  <Link
                    to={`/plan/jobs/${activity.jobId}?tab=activities`}
                    className="text-[var(--mw-yellow-700)] underline-offset-2 hover:underline dark:text-yellow-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activity.jobNumber}
                  </Link>
                )}
                {activity.workCentreName && (
                  <Badge variant="outline" className="border-[var(--border)] text-[10px]">
                    {activity.workCentreName}
                  </Badge>
                )}
                {activity.travellerStepLabel && (
                  activity.travellerId ? (
                    <Link
                      to={`/plan/jobs/${activity.jobId}?tab=travellers&traveller=${activity.travellerId}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--neutral-600)] hover:border-[var(--mw-yellow-400)] hover:text-foreground dark:text-neutral-400"
                      onClick={(e) => e.stopPropagation()}
                      title="Open this traveller step"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {activity.travellerStepLabel}
                    </Link>
                  ) : (
                    <Badge variant="outline" className="border-[var(--border)] text-[10px]">
                      {activity.travellerStepLabel}
                    </Badge>
                  )
                )}
                {(logged > 0 || estimated > 0) && (
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock4 className="h-3 w-3" />
                    <span className={cn(variance > 0 && 'text-[var(--mw-error)]')}>
                      {formatMinutes(logged)}
                    </span>
                    {estimated > 0 && (
                      <span className="text-[var(--neutral-400)]">/ {formatMinutes(estimated)}</span>
                    )}
                  </span>
                )}
              </div>

              {activity.description && (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--neutral-500)] dark:text-neutral-400">
                  {activity.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <TimerPill activity={activity} />
                <button
                  type="button"
                  className="text-xs text-[var(--neutral-500)] underline-offset-2 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeDialogOpen(true);
                  }}
                >
                  Log time
                </button>
                <div className="flex-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded p-1 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Activity actions"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setTimeDialogOpen(true)}
                    >
                      <Edit3 className="mr-2 h-3.5 w-3.5" />
                      Log time
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-[var(--mw-error)] focus:text-[var(--mw-error)]"
                      onClick={() => deleteActivity(activity.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <TimeEntryDialog
        open={timeDialogOpen}
        onOpenChange={setTimeDialogOpen}
        activityId={activity.id}
        activityTitle={activity.title}
      />
    </>
  );
  },
);
