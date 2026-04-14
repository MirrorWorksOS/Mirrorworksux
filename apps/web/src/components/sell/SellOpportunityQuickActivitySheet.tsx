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
  type ActivityType,
  ACTIVITY_TYPE_LABELS,
  MOCK_CURRENT_USER_NAME,
  TEAM_MEMBERS,
} from '@/components/sell/sell-activity-shared';

export interface QuickActivityPreset {
  activityType: ActivityType;
  defaultTitle: string;
}

export interface SellOpportunityQuickActivitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: QuickActivityPreset | null;
  scheduledAt: Date;
  onScheduledAtChange: (date: Date) => void;
  opportunityId: string;
  opportunityLabel: string;
}

export function SellOpportunityQuickActivitySheet({
  open,
  onOpenChange,
  preset,
  scheduledAt,
  onScheduledAtChange,
  opportunityId,
  opportunityLabel,
}: SellOpportunityQuickActivitySheetProps) {
  const [title, setTitle] = React.useState('');
  const [assignedTo, setAssignedTo] = React.useState<string>(MOCK_CURRENT_USER_NAME);
  const [description, setDescription] = React.useState('');
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open && preset) {
      setTitle(preset.defaultTitle);
      setAssignedTo(MOCK_CURRENT_USER_NAME);
      setDescription('');
    }
  }, [open, preset]);

  const activityType = preset?.activityType;

  const handleSave = () => {
    if (!preset || !title.trim()) {
      toast.error('Add an activity title');
      return;
    }
    toast.success('Activity saved', {
      description: `${ACTIVITY_TYPE_LABELS[preset.activityType]} · ${format(scheduledAt, 'MMM d, h:mm a')}`,
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
          <SheetTitle className="text-foreground">Quick activity</SheetTitle>
          <SheetDescription>
            Create a sales activity for this opportunity. Type and assignee default from your selection.
          </SheetDescription>
        </SheetHeader>

        <div
          ref={setPopoverContainer}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4"
        >
          {activityType ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </span>
              <Badge variant="secondary" className="font-normal">
                {ACTIVITY_TYPE_LABELS[activityType]}
              </Badge>
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="qa-title" className="text-sm font-medium text-[var(--neutral-700)]">
              Title <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <Input
              id="qa-title"
              placeholder="Activity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="qa-assign" className="text-sm font-medium text-[var(--neutral-700)]">
              Assigned to
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="qa-assign" className="h-12 min-h-[48px]">
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
            <Label className="text-sm font-medium text-[var(--neutral-700)]">
              Due <span className="text-[var(--mw-error)]">*</span>
            </Label>
            <DateTimePicker
              value={scheduledAt}
              onChange={(d) => d && onScheduledAtChange(d)}
              popoverContainer={popoverContainer}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-[var(--neutral-700)]">Related opportunity</Label>
            <p className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-3 py-2 text-sm text-foreground">
              {opportunityLabel}
              <span className="ml-2 tabular-nums text-xs text-muted-foreground">{opportunityId}</span>
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="qa-desc" className="text-sm font-medium text-[var(--neutral-700)]">
              Description
            </Label>
            <Textarea
              id="qa-desc"
              placeholder="Add details about this activity…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-[var(--neutral-200)] bg-background px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-12 min-h-[48px]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]"
            onClick={handleSave}
            disabled={!preset || !title.trim()}
          >
            Save activity
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
