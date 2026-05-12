/**
 * LogActivityModal — shared activity-logging Sheet used everywhere a user
 * can log a sales/customer activity (email, call, meeting, task, note).
 *
 * Promoted from SellOpportunityQuickActivitySheet. Generic across the
 * entities an activity can attach to (opportunity, customer, quote).
 */

import * as React from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, Phone, Users, CheckSquare, MessageSquare } from 'lucide-react';
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
  type ActivityType,
  ACTIVITY_TYPE_LABELS,
  MOCK_CURRENT_USER_NAME,
  TEAM_MEMBERS,
} from '@/components/sell/sell-activity-shared';

export type ActivityPriority = 'low' | 'med' | 'high';

const PRIORITY_OPTIONS: { value: ActivityPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const ACTIVITY_TYPE_ICON: Record<ActivityType, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  note: <MessageSquare className="h-4 w-4" />,
};

/** A logged activity payload — what the modal emits on save. */
export interface ActivityDraft {
  type: ActivityType;
  title: string;
  description: string;
  dueAt: string; // ISO
  priority: ActivityPriority;
  assignedTo: string;
  entityKind: 'opportunity' | 'customer' | 'quote';
  entityId: string;
}

export interface LogActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Default activity type. If omitted, user picks. */
  defaultType?: ActivityType;
  /** Pre-fill title (e.g. "Follow up on quote acceptance"). */
  defaultTitle?: string;
  /** Default due date — defaults to now + 1 day. */
  defaultDueAt?: Date;
  /** Default priority — defaults to "med". */
  defaultPriority?: ActivityPriority;
  /** The entity this activity belongs to. */
  entity: {
    kind: 'opportunity' | 'customer' | 'quote';
    id: string;
    /** Display label e.g. "Sydney Rail Corp — Machine Guards". */
    label: string;
  };
  onSaved?: (activity: ActivityDraft) => void;
}

export function LogActivityModal({
  open,
  onOpenChange,
  defaultType,
  defaultTitle,
  defaultDueAt,
  defaultPriority = 'med',
  entity,
  onSaved,
}: LogActivityModalProps) {
  const [type, setType] = React.useState<ActivityType>(defaultType ?? 'task');
  const [title, setTitle] = React.useState(defaultTitle ?? '');
  const [assignedTo, setAssignedTo] = React.useState<string>(MOCK_CURRENT_USER_NAME);
  const [priority, setPriority] = React.useState<ActivityPriority>(defaultPriority);
  const [dueAt, setDueAt] = React.useState<Date>(
    defaultDueAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
  );
  const [description, setDescription] = React.useState('');
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setType(defaultType ?? 'task');
      setTitle(defaultTitle ?? '');
      setAssignedTo(MOCK_CURRENT_USER_NAME);
      setPriority(defaultPriority);
      setDueAt(defaultDueAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000));
      setDescription('');
    }
  }, [open, defaultType, defaultTitle, defaultDueAt, defaultPriority]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Add an activity title');
      return;
    }
    const draft: ActivityDraft = {
      type,
      title: title.trim(),
      description: description.trim(),
      dueAt: dueAt.toISOString(),
      priority,
      assignedTo,
      entityKind: entity.kind,
      entityId: entity.id,
    };
    onSaved?.(draft);
    toast.success('Activity saved', {
      description: `${ACTIVITY_TYPE_LABELS[type]} · ${format(dueAt, 'MMM d, h:mm a')}`,
    });
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
          <SheetTitle className="text-foreground">Log activity</SheetTitle>
          <SheetDescription>
            Create a sales activity for this {entity.kind}. Type, priority, and assignee default
            from your selection.
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
            <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
              <SelectTrigger className="h-12 min-h-[48px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="inline-flex items-center gap-2">
                      {ACTIVITY_TYPE_ICON[t]}
                      {ACTIVITY_TYPE_LABELS[t]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="la-title" className="text-sm font-medium text-[var(--neutral-700)]">
              Title <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <Input
              id="la-title"
              placeholder="Activity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Assigned to + Priority side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="la-assign" className="text-sm font-medium text-[var(--neutral-700)]">
                Assigned to
              </Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id="la-assign" className="h-12 min-h-[48px]">
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
            <div className="grid gap-1.5">
              <Label htmlFor="la-prio" className="text-sm font-medium text-[var(--neutral-700)]">
                Priority
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ActivityPriority)}>
                <SelectTrigger id="la-prio" className="h-12 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due */}
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

          {/* Entity */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-[var(--neutral-700)]">
              Related {entity.kind}
            </Label>
            <p className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-3 py-2 text-sm text-foreground">
              {entity.label}
              <Badge variant="outline" className="ml-2 border-[var(--border)] text-xs tabular-nums">
                {entity.id}
              </Badge>
            </p>
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="la-desc" className="text-sm font-medium text-[var(--neutral-700)]">
              Description
            </Label>
            <Textarea
              id="la-desc"
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
            disabled={!title.trim()}
          >
            Save activity
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
