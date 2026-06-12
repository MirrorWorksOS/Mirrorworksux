import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { IssueType } from './types';

interface ExceptionSheetProps {
  open: boolean;
  defaultType: IssueType;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { type: IssueType; title: string; note: string }) => void;
}

const REASON_MAP: Record<IssueType, string[]> = {
  quality: ['First-off out of tolerance', 'Surface finish concern', 'Dimensional recheck needed'],
  material: ['Wrong material at machine', 'Material missing from station', 'Sheet or kit damaged'],
  tooling: ['Tooling mismatch', 'Consumable change required', 'Machine needs setup help'],
  drawing: ['Revision mismatch', 'Drawing unclear at machine', 'Missing instruction or traveler'],
  safety: ['Safety check required', 'Guard or fixture issue', 'Need supervisor now'],
};

export function ExceptionSheet({
  open,
  defaultType,
  onOpenChange,
  onSubmit,
}: ExceptionSheetProps) {
  const [issueType, setIssueType] = useState<IssueType>(defaultType);
  const reasons = useMemo(() => REASON_MAP[issueType], [issueType]);
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    setIssueType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    setReason(REASON_MAP[issueType][0]);
  }, [issueType]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-[var(--neutral-200)] bg-card sm:max-w-[480px]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[var(--neutral-900)]">
            <AlertTriangle className="h-5 w-5 text-[var(--mw-yellow-400)]" />
            Log shop-floor issue
          </SheetTitle>
          <SheetDescription className="text-[var(--neutral-500)]">
            Two taps should be enough. Pick the issue type, then choose the closest reason.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Issue type
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(
                [
                  'quality',
                  'material',
                  'tooling',
                  'drawing',
                  'safety',
                ] as IssueType[]
              ).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  size="lg"
                  className={
                    issueType === type
                      ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--neutral-900)]'
                      : 'border-[var(--neutral-200)] bg-card text-[var(--neutral-700)]'
                  }
                  onClick={() => setIssueType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Quick reasons
            </div>
            <div className="mt-3 space-y-3">
              {reasons.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setReason(entry)}
                  className={`w-full rounded-[var(--shape-md)] border px-4 py-4 text-left text-base transition-colors ${
                    reason === entry
                      ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--neutral-900)]'
                      : 'border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-700)]'
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Optional note
            </div>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a short note for the next operator or supervisor"
              className="mt-3 min-h-[140px] rounded-[var(--shape-md)] border-[var(--neutral-200)] bg-[var(--neutral-100)] text-base"
            />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <Button
            variant="outline"
            size="lg"
            className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={() => {
              onSubmit({
                type: issueType,
                title: reason,
                note,
              });
              setNote('');
              onOpenChange(false);
            }}
          >
            Log issue
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
