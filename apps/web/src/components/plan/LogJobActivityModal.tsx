/**
 * LogJobActivityModal — sheet for creating a job activity. Manufacturing-context
 * variant of the Sell LogActivityModal: wider type set, work-centre + traveller
 * linkage, estimated minutes, and an optional pre-bound job.
 */

import * as React from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/shared/datetime/DateTimePicker';
import { cn } from '@/components/ui/utils';
import {
  CANONICAL_JOB_ACTIVITY_TYPES,
  JOB_ACTIVITY_PRIORITY_LABELS,
  iconForName,
  resolveActivityType,
} from './plan-activity-shared';
import type {
  JobActivityType,
  JobActivityPriority,
  ProductKind,
} from '@/types/job-activity';
import {
  PLAN_TEAM_MEMBERS,
  PLAN_CURRENT_USER,
} from '@/data/plan-activities-mock';
import { useJobActivityStore } from '@/store/jobActivityStore';

export interface JobOption {
  jobId: string;
  jobNumber: string;
  title?: string;
  productKind?: ProductKind;
}

export interface WorkCentreOption {
  id: string;
  name: string;
}

export interface LogJobActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Default activity type. */
  defaultType?: JobActivityType;
  /** Pre-bound job. If omitted, the user selects from `jobOptions`. */
  job?: JobOption;
  /** Available jobs for the selector when `job` is omitted. */
  jobOptions?: JobOption[];
  workCentreOptions?: WorkCentreOption[];
  /** Pre-fill assignee (defaults to current user). */
  defaultAssignedTo?: string;
  onCreated?: (activityId: string) => void;
}

const PRIORITY_OPTIONS = Object.keys(JOB_ACTIVITY_PRIORITY_LABELS) as JobActivityPriority[];

export function LogJobActivityModal({
  open,
  onOpenChange,
  defaultType = 'task',
  job,
  jobOptions = [],
  workCentreOptions = [],
  defaultAssignedTo = PLAN_CURRENT_USER,
  onCreated,
}: LogJobActivityModalProps) {
  const addActivity = useJobActivityStore((s) => s.addActivity);
  const customTypes = useJobActivityStore((s) => s.customActivityTypes);
  const typeOptions = React.useMemo<JobActivityType[]>(
    () => [...CANONICAL_JOB_ACTIVITY_TYPES, ...customTypes.map((t) => t.id)],
    [customTypes],
  );

  const [type, setType] = React.useState<JobActivityType>(defaultType);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedJobId, setSelectedJobId] = React.useState<string>(job?.jobId ?? jobOptions[0]?.jobId ?? '');
  const [workCentreId, setWorkCentreId] = React.useState<string>('none');
  const [assignedTo, setAssignedTo] = React.useState<string>(defaultAssignedTo);
  const [priority, setPriority] = React.useState<JobActivityPriority>('med');
  const [estimatedMinutes, setEstimatedMinutes] = React.useState<string>('');
  const [dueAt, setDueAt] = React.useState<Date>(
    () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  );
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setType(defaultType);
      setTitle('');
      setDescription('');
      setSelectedJobId(job?.jobId ?? jobOptions[0]?.jobId ?? '');
      setWorkCentreId('none');
      setAssignedTo(defaultAssignedTo);
      setPriority('med');
      setEstimatedMinutes('');
      setDueAt(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  }, [open, defaultType, job, jobOptions, defaultAssignedTo]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Add an activity title');
      return;
    }
    const selectedJob = job ?? jobOptions.find((j) => j.jobId === selectedJobId);
    if (!selectedJob) {
      toast.error('Pick a job');
      return;
    }
    const wc = workCentreOptions.find((w) => w.id === workCentreId);
    const created = addActivity({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      jobId: selectedJob.jobId,
      jobNumber: selectedJob.jobNumber,
      workCentreId: wc?.id,
      workCentreName: wc?.name,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      dueDate: dueAt.toISOString(),
      priority,
      assignedTo,
      productKind: selectedJob.productKind,
    });
    toast.success('Activity created', {
      description: `${JOB_ACTIVITY_TYPE_LABELS[type]} · ${selectedJob.jobNumber} · due ${format(dueAt, 'MMM d, h:mm a')}`,
    });
    onCreated?.(created.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className={cn(
          'flex h-full w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg',
        )}
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-[var(--neutral-200)] px-6 pb-4 pt-6 text-left">
          <SheetTitle className="text-foreground">New activity</SheetTitle>
          <SheetDescription>
            Create a task, check, or note against a job. Optionally link to a work centre.
          </SheetDescription>
        </SheetHeader>

        <div
          ref={setPopoverContainer}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4"
        >
          {/* Type */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-[var(--neutral-700)]">
              Type <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as JobActivityType)}>
              <SelectTrigger className="h-12 min-h-[48px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent portalContainer={popoverContainer}>
                {typeOptions.map((t) => {
                  const meta = resolveActivityType(t, customTypes, Object.fromEntries(
                    customTypes.map((ct) => [ct.iconName, iconForName(ct.iconName)]),
                  ));
                  const Icon = meta.icon;
                  return (
                    <SelectItem key={t} value={t}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: meta.colour }} />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="ja-title" className="text-sm font-medium text-[var(--neutral-700)]">
              Title <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <Input
              id="ja-title"
              placeholder="Activity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Job */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-[var(--neutral-700)]">
              Job <span className="text-[var(--mw-error)]">*</span>
            </Label>
            {job ? (
              <p className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-3 py-2 text-sm text-foreground">
                {job.title ?? job.jobNumber}
                <Badge variant="outline" className="ml-2 border-[var(--border)] text-xs tabular-nums">
                  {job.jobNumber}
                </Badge>
              </p>
            ) : (
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="h-12 min-h-[48px]">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent portalContainer={popoverContainer}>
                  {jobOptions.map((j) => (
                    <SelectItem key={j.jobId} value={j.jobId}>
                      <span className="inline-flex items-center gap-2">
                        <span className="tabular-nums text-xs text-[var(--neutral-500)]">{j.jobNumber}</span>
                        <span>{j.title ?? ''}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Work centre (optional) */}
          {workCentreOptions.length > 0 && (
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-[var(--neutral-700)]">
                Work centre (optional)
              </Label>
              <Select value={workCentreId} onValueChange={setWorkCentreId}>
                <SelectTrigger className="h-12 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent portalContainer={popoverContainer}>
                  <SelectItem value="none">None</SelectItem>
                  {workCentreOptions.map((wc) => (
                    <SelectItem key={wc.id} value={wc.id}>
                      {wc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assigned + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-[var(--neutral-700)]">Assigned to</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-12 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent portalContainer={popoverContainer}>
                  {PLAN_TEAM_MEMBERS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-[var(--neutral-700)]">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as JobActivityPriority)}>
                <SelectTrigger className="h-12 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent portalContainer={popoverContainer}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {JOB_ACTIVITY_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due — full width so DatePicker + TimePicker have breathing room */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-[var(--neutral-700)]">
              Due <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <DateTimePicker
              value={dueAt}
              onChange={(d) => d && setDueAt(d)}
              popoverContainer={popoverContainer}
            />
          </div>

          {/* Estimated minutes — own row */}
          <div className="grid gap-1.5">
            <Label htmlFor="ja-est" className="text-sm font-medium text-[var(--neutral-700)]">
              Estimated minutes
            </Label>
            <Input
              id="ja-est"
              type="number"
              min={0}
              placeholder="e.g. 30"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="h-12 min-h-[48px]"
            />
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="ja-desc" className="text-sm font-medium text-[var(--neutral-700)]">
              Description
            </Label>
            <Textarea
              id="ja-desc"
              placeholder="Add details about this activity…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-[var(--neutral-200)] bg-background px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[48px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]"
            onClick={handleSave}
            disabled={!title.trim() || (!job && !selectedJobId)}
          >
            Create activity
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
