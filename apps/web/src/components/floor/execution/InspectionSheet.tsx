import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { InspectionGate, WorkOrderExecutionSnapshot } from './types';

interface InspectionSheetProps {
  open: boolean;
  gate: InspectionGate;
  snapshot: WorkOrderExecutionSnapshot;
  checkedChecklistItemIds: string[];
  onOpenChange: (open: boolean) => void;
  onChecklistChange: (checkedItemIds: string[]) => void;
  onSubmit: (payload: {
    gate: InspectionGate;
    result: 'pass' | 'fail';
    note: string;
  }) => void;
}

const GATE_LABELS: Record<InspectionGate, string> = {
  first_off: 'First-off inspection',
  in_process: 'In-process inspection',
  final: 'Final inspection',
};

export function InspectionSheet({
  open,
  gate,
  snapshot,
  onOpenChange,
  checkedChecklistItemIds,
  onChecklistChange,
  onSubmit,
}: InspectionSheetProps) {
  const [note, setNote] = useState('');
  const checklist = useMemo(() => {
    const match = snapshot.routing.find((step) => step.inspectionGate === gate);
    return match?.checklist ?? snapshot.currentStep.checklist;
  }, [gate, snapshot.currentStep.checklist, snapshot.routing]);
  const [checkedIds, setCheckedIds] = useState<string[]>(checkedChecklistItemIds);

  useEffect(() => {
    setCheckedIds(checkedChecklistItemIds);
  }, [checkedChecklistItemIds, gate, open]);

  const allRequiredChecksCompleted = checklist.every((item) =>
    checkedIds.includes(item.id)
  );

  const toggleChecklistItem = (itemId: string, nextChecked: boolean) => {
    const currentIndex = checklist.findIndex((item) => item.id === itemId);
    const previousItemId = currentIndex > 0 ? checklist[currentIndex - 1]?.id : null;
    const previousCompleted = previousItemId
      ? checkedIds.includes(previousItemId)
      : true;

    if (!previousCompleted && nextChecked) {
      return;
    }

    const nextIds = nextChecked
      ? Array.from(new Set([...checkedIds, itemId]))
      : checkedIds.filter((id) => {
          if (id === itemId) return false;
          const idIndex = checklist.findIndex((item) => item.id === id);
          return idIndex >= 0 ? idIndex < currentIndex : true;
        });

    setCheckedIds(nextIds);
    onChecklistChange(nextIds);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-[var(--neutral-200)] bg-card sm:max-w-[500px]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[var(--neutral-900)]">
            <ClipboardCheck className="h-5 w-5 text-[var(--mw-yellow-400)]" />
            {GATE_LABELS[gate]}
          </SheetTitle>
          <SheetDescription className="text-[var(--neutral-500)]">
            Record the inspection before the job can continue.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Required checks
            </div>
            <div className="mt-3 space-y-3">
              {checklist.map((item, index) => {
                const checked = checkedIds.includes(item.id);
                const previousChecked = index === 0 || checkedIds.includes(checklist[index - 1].id);
                const locked = !previousChecked && !checked;

                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-[var(--shape-sm)] border px-3 py-3 transition ${
                      checked
                        ? 'border-[var(--mw-success)] bg-[var(--mw-success)]/5'
                        : 'border-[var(--neutral-200)] bg-card'
                    } ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleChecklistItem(item.id, value === true)}
                      disabled={locked}
                      className="mt-0.5 border-[var(--neutral-300)] data-[state=checked]:border-[var(--mw-success)] data-[state=checked]:bg-[var(--mw-success)]"
                    />
                    <span className="flex-1 text-base text-[var(--neutral-800)]">
                      {item.label}
                    </span>
                    {checked ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--mw-success)]" />
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Optional note
            </div>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Record dimensions, observations, or handover detail"
              className="mt-3 min-h-[140px] rounded-[var(--shape-md)] border-[var(--neutral-200)] bg-[var(--neutral-100)] text-base"
            />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <Button
            variant="outline"
            size="lg"
            className="border-[var(--mw-error)] bg-card text-[var(--mw-error)] hover:bg-[var(--mw-error)]/5"
            onClick={() => {
              onSubmit({
                gate,
                result: 'fail',
                note,
              });
              setNote('');
              onOpenChange(false);
            }}
          >
            Inspection failed
          </Button>
          <Button
            size="lg"
            className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            disabled={!allRequiredChecksCompleted}
            onClick={() => {
              onSubmit({
                gate,
                result: 'pass',
                note,
              });
              setNote('');
              onOpenChange(false);
            }}
          >
            Confirm inspection
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
