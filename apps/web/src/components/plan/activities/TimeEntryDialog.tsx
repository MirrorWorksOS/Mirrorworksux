/**
 * TimeEntryDialog — manual back-dated time entry for a job activity.
 * Used when an operator forgot to start the timer, or when logging on
 * behalf of someone else.
 */

import * as React from 'react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobActivityStore } from '@/store/jobActivityStore';
import { PLAN_TEAM_MEMBERS, PLAN_CURRENT_USER } from '@/data/plan-activities-mock';

export interface TimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  activityTitle: string;
}

function toLocalInputValue(d: Date): string {
  // YYYY-MM-DDTHH:mm in the user's local time (datetime-local format)
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TimeEntryDialog({ open, onOpenChange, activityId, activityTitle }: TimeEntryDialogProps) {
  const addManualTimeEntry = useJobActivityStore((s) => s.addManualTimeEntry);

  const [startedAt, setStartedAt] = React.useState(() =>
    toLocalInputValue(new Date(Date.now() - 60 * 60 * 1000)),
  );
  const [durationMin, setDurationMin] = React.useState<string>('30');
  const [userName, setUserName] = React.useState<string>(PLAN_CURRENT_USER);
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setStartedAt(toLocalInputValue(new Date(Date.now() - 60 * 60 * 1000)));
      setDurationMin('30');
      setUserName(PLAN_CURRENT_USER);
      setNotes('');
    }
  }, [open]);

  const handleSave = () => {
    const minutes = Number(durationMin);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.error('Duration must be greater than zero');
      return;
    }
    const startDate = new Date(startedAt);
    if (Number.isNaN(startDate.getTime())) {
      toast.error('Pick a valid start time');
      return;
    }
    const stopDate = new Date(startDate.getTime() + minutes * 60_000);
    addManualTimeEntry(activityId, {
      startedAt: startDate.toISOString(),
      stoppedAt: stopDate.toISOString(),
      userName,
      notes: notes.trim() || undefined,
    });
    toast.success(`${minutes}m logged`, {
      description: `${userName} · ${format(startDate, 'd MMM, h:mm a')}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log time</DialogTitle>
          <DialogDescription>{activityTitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="te-start" className="text-sm font-medium text-[var(--neutral-700)]">
              Started at
            </Label>
            <Input
              id="te-start"
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="te-dur" className="text-sm font-medium text-[var(--neutral-700)]">
                Duration (min)
              </Label>
              <Input
                id="te-dur"
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-[var(--neutral-700)]">User</Label>
              <Select value={userName} onValueChange={setUserName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TEAM_MEMBERS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                      {name !== PLAN_CURRENT_USER && (
                        <span className="ml-1 text-xs text-[var(--neutral-500)]">(on behalf of)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="te-notes" className="text-sm font-medium text-[var(--neutral-700)]">
              Notes
            </Label>
            <Textarea
              id="te-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What did you do?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)]"
            onClick={handleSave}
          >
            Log time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
