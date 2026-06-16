import { AlertTriangle, MessageSquareMore, PauseCircle, Plus, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurrentStepCard } from './CurrentStepCard';
import type {
  ExecutionExceptionSummary,
  ExecutionState,
  IssueType,
  WorkOrderExecutionSnapshot,
} from './types';

interface ActionConsoleProps {
  snapshot: WorkOrderExecutionSnapshot;
  executionState: ExecutionState;
  revisionAcknowledged: boolean;
  quantity: {
    good: number;
    scrap: number;
    target: number;
  };
  completionPercent: number;
  elapsedLabel: string;
  primaryActionLabel: string;
  primaryActionDescription: string;
  primaryActionDisabled?: boolean;
  handoverNote?: string;
  exceptions: ExecutionExceptionSummary[];
  onAcknowledgeHandoverNote: () => void;
  onPrimaryAction: () => void;
  onAdjustQuantity: (bucket: 'good' | 'scrap' | 'undo') => void;
  onOpenException: (type: IssueType) => void;
  onOpenHandover: () => void;
  onViewRouting: () => void;
}

export function ActionConsole({
  snapshot,
  revisionAcknowledged,
  quantity,
  completionPercent,
  elapsedLabel,
  primaryActionLabel,
  primaryActionDescription,
  primaryActionDisabled,
  handoverNote,
  exceptions,
  onAcknowledgeHandoverNote,
  onPrimaryAction,
  onAdjustQuantity,
  onOpenException,
  onOpenHandover,
  onViewRouting,
}: ActionConsoleProps) {
  return (
    <Card className="flex min-h-0 w-full flex-col overflow-hidden rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card shadow-xs xl:w-[460px]">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 p-6">
          {!revisionAcknowledged && snapshot.revisionRequiresAck ? (
            <Card className="rounded-[var(--shape-md)] border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] p-4 shadow-none">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Revision acknowledgement required
              </div>
              <div className="mt-2 text-base text-[var(--neutral-800)]">
                {snapshot.revision} must be acknowledged before the job can continue.
              </div>
            </Card>
          ) : null}

          {handoverNote ? (
            <Card className="rounded-[var(--shape-md)] border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                    Shift handover note
                  </div>
                  <p className="mt-2 text-sm text-[var(--neutral-700)]">
                    {handoverNote}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                  onClick={onAcknowledgeHandoverNote}
                >
                  Acknowledge
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-none">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Primary next action
            </div>
            <div className="mt-2 text-sm text-[var(--neutral-600)]">
              {primaryActionDescription}
            </div>
            <Button
              type="button"
              size="lg"
              className="mt-5 h-14 w-full bg-[var(--mw-yellow-400)] text-base text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={onPrimaryAction}
              disabled={primaryActionDisabled}
            >
              {primaryActionLabel}
            </Button>
          </Card>

          <CurrentStepCard snapshot={snapshot} onViewRouting={onViewRouting} />

          <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-none">
            <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                  Parts built
                </div>
                <div className="text-sm font-medium text-[var(--neutral-600)] tabular-nums">
                  {completionPercent}% complete
                </div>
              </div>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold leading-none text-[var(--neutral-900)] tabular-nums">
                  {quantity.good}
                </span>
                <span className="pb-1 text-xl text-[var(--neutral-500)] tabular-nums">
                  / {quantity.target}
                </span>
              </div>

              <Progress
                value={completionPercent}
                className="mt-4 h-3 bg-[var(--neutral-200)] [&_[data-slot=progress-indicator]]:bg-[var(--mw-yellow-400)]"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryMetric label="Scrap" value={String(quantity.scrap)} />
              <SummaryMetric label="Elapsed" value={elapsedLabel} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={() => onAdjustQuantity('good')}
              >
                <Plus className="h-5 w-5" />
                Good +1
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={() => onAdjustQuantity('scrap')}
              >
                <AlertTriangle className="h-5 w-5" />
                Scrap +1
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={() => onAdjustQuantity('undo')}
              >
                <RefreshCcw className="h-5 w-5" />
                Undo last
              </Button>
            </div>
          </Card>

          <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-none">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Fast exceptions
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={() => onOpenException('tooling')}
              >
                <PauseCircle className="h-5 w-5" />
                Blocked
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={() => onOpenException('quality')}
              >
                <AlertTriangle className="h-5 w-5" />
                Quality issue
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={() => onOpenException('material')}
              >
                <AlertTriangle className="h-5 w-5" />
                Material issue
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
                onClick={onOpenHandover}
              >
                <MessageSquareMore className="h-5 w-5" />
                Handover
              </Button>
            </div>
          </Card>

          {exceptions.length > 0 ? (
            <Card className="rounded-[var(--shape-lg)] border-[var(--neutral-200)] bg-card p-6 shadow-none">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                Open issues
              </div>
              <div className="mt-4 space-y-3">
                {exceptions.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-medium text-[var(--neutral-900)]">
                        {issue.title}
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                        {issue.createdAtLabel}
                      </span>
                    </div>
                    {issue.note ? (
                      <p className="mt-2 text-sm text-[var(--neutral-600)]">
                        {issue.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </ScrollArea>
    </Card>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-[var(--neutral-900)] tabular-nums">
        {value}
      </div>
    </div>
  );
}
