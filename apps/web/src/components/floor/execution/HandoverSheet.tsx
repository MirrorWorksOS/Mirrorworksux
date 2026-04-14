import { MessageSquareMore } from 'lucide-react';

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

interface HandoverSheetProps {
  open: boolean;
  note: string;
  suggestedSummary?: string;
  onNoteChange: (note: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onGenerateSummary?: () => void;
  onInsertSummary?: () => void;
  onSwitchOperator?: () => void;
}

export function HandoverSheet({
  open,
  note,
  suggestedSummary,
  onNoteChange,
  onOpenChange,
  onSave,
  onGenerateSummary,
  onInsertSummary,
  onSwitchOperator,
}: HandoverSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-[var(--neutral-200)] bg-card sm:max-w-[500px]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[var(--neutral-900)]">
            <MessageSquareMore className="h-5 w-5 text-[var(--mw-yellow-400)]" />
            Shift handover
          </SheetTitle>
          <SheetDescription className="text-[var(--neutral-500)]">
            Leave the next operator a plain-language note about the current job state.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            Suggested structure
          </div>
          <div className="mt-3 space-y-2 text-sm text-[var(--neutral-700)]">
            <p>Current state: what is running or blocked right now</p>
            <p>Last good part: what has been checked and accepted</p>
            <p>Next action: what the next operator should do first</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
            onClick={onGenerateSummary}
            type="button"
          >
            Generate AI summary
          </Button>
          {suggestedSummary ? (
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
              onClick={onInsertSummary}
              type="button"
            >
              Insert summary
            </Button>
          ) : null}
        </div>

        {suggestedSummary ? (
          <div className="mt-4 rounded-[var(--shape-md)] border border-[var(--mw-yellow-300)] bg-[var(--mw-yellow-50)] p-4">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              AI draft
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-[var(--neutral-700)]">
              {suggestedSummary}
            </p>
          </div>
        ) : null}

        <Textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Example: First-off passed. Tool offset checked. Resume batch from part 13 and watch flange angle."
          className="mt-6 min-h-[220px] rounded-[var(--shape-md)] border-[var(--neutral-200)] bg-[var(--neutral-100)] text-base"
        />

        <SheetFooter className="mt-8">
          <Button
            variant="outline"
            size="lg"
            className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
            onClick={onSave}
          >
            Save handover
          </Button>
          {onSwitchOperator ? (
            <Button
              size="lg"
              className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={onSwitchOperator}
            >
              Save and switch operator
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
