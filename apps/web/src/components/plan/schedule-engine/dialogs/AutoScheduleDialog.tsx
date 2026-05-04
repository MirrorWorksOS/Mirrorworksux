/**
 * Auto-Schedule confirmation modal — collects optimisation priority, time
 * horizon, and lock options before kicking off the AI run.
 */
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AutoScheduleRequest } from '@/types/entities';

interface AutoScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (req: AutoScheduleRequest) => void;
}

const PRIORITY_OPTIONS: Array<{ value: AutoScheduleRequest['priority']; label: string; hint: string }> = [
  { value: 'balanced', label: 'Balanced', hint: 'Minimise late risk and balance load' },
  { value: 'throughput', label: 'Throughput', hint: 'Maximise units per shift' },
  { value: 'on_time', label: 'On-time delivery', hint: 'Prioritise due dates above all else' },
  { value: 'setup_minimisation', label: 'Setup minimisation', hint: 'Group similar jobs to reduce changeovers' },
];

const HORIZON_OPTIONS: Array<{ value: AutoScheduleRequest['horizon']; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'next_24h', label: 'Next 24 hours' },
  { value: 'next_7d', label: 'Next 7 days' },
  { value: 'next_14d', label: 'Next 14 days' },
];

export function AutoScheduleDialog({ open, onOpenChange, onConfirm }: AutoScheduleDialogProps) {
  const [priority, setPriority] = useState<AutoScheduleRequest['priority']>('balanced');
  const [horizon, setHorizon] = useState<AutoScheduleRequest['horizon']>('next_7d');
  const [lockSetupAndRunning, setLockSetupAndRunning] = useState(false);
  const [lockRushJobs, setLockRushJobs] = useState(false);

  const handleConfirm = () => {
    onConfirm({ priority, horizon, lockSetupAndRunning, lockRushJobs });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Run AI auto-schedule?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            The AI will analyse current work-centre capacity, job priorities, due dates, and
            operation dependencies. It will propose a new sequence designed to balance load and
            reduce late risk. Nothing will change on the floor until you approve the result.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Optimisation priority
            </label>
            <Select value={priority} onValueChange={(v) => setPriority(v as AutoScheduleRequest['priority'])}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-[var(--neutral-500)]">{opt.hint}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Time horizon
            </label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as AutoScheduleRequest['horizon'])}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORIZON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Lock options
            </label>
            <label className="flex items-center gap-3 text-sm text-[var(--neutral-800)]">
              <Checkbox
                checked={lockSetupAndRunning}
                onCheckedChange={(v) => setLockSetupAndRunning(v === true)}
              />
              Lock jobs already in setup or running
            </label>
            <label className="flex items-center gap-3 text-sm text-[var(--neutral-800)]">
              <Checkbox
                checked={lockRushJobs}
                onCheckedChange={(v) => setLockRushJobs(v === true)}
              />
              Lock rush-priority jobs to current sequence
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="h-14 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]"
          >
            Run auto-schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
