/**
 * 7-stage horizontal progress strip rendered on every Order detail page
 * — the document spine from workflow decision D1: Quote → Sales Order →
 * Job → Manufacturing → Work Orders → Dispatch → Invoice. BoM / MRP /
 * Schedule are Job-stage detail (spokes), not spine stops. Shows where
 * the order is, which stages have been completed, and any gate failure
 * at the current stage.
 */
import { Check, Circle, AlertCircle } from 'lucide-react';
import type { JourneyStage } from '@/types/entities';

const STAGES: { id: JourneyStage; label: string }[] = [
  { id: 'quote', label: 'Quote' },
  { id: 'sales_order', label: 'Sales Order' },
  { id: 'job', label: 'Job' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'work_orders', label: 'Work Orders' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'invoice', label: 'Invoice' },
];

export interface JourneyStepperProps {
  /** Furthest stage reached (highlights as current). */
  currentStage: JourneyStage;
  /** Stages already complete (rendered ✓). */
  completedStages?: JourneyStage[];
  /** When true, current stage is blocked by gate failures. */
  blocked?: boolean;
  onStageClick?: (stage: JourneyStage) => void;
}

export function JourneyStepper({
  currentStage,
  completedStages = [],
  blocked,
  onStageClick,
}: JourneyStepperProps) {
  const currentIdx = STAGES.findIndex((s) => s.id === currentStage);
  const completedSet = new Set(completedStages);
  return (
    <nav
      aria-label="Order journey"
      className="flex w-full items-center gap-1 overflow-x-auto rounded-md border bg-card px-3 py-2 text-xs"
    >
      {STAGES.map((stage, idx) => {
        const isCurrent = stage.id === currentStage;
        const isComplete = completedSet.has(stage.id) || idx < currentIdx;
        const isFuture = idx > currentIdx && !completedSet.has(stage.id);
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onStageClick?.(stage.id)}
            disabled={!onStageClick}
            className={[
              'flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition-colors',
              isCurrent
                ? blocked
                  ? 'bg-destructive/10 text-destructive ring-1 ring-destructive'
                  : 'bg-primary/10 text-primary ring-1 ring-primary'
                : isComplete
                  ? 'text-foreground hover:bg-muted'
                  : isFuture
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground',
              onStageClick ? 'cursor-pointer' : 'cursor-default',
            ].join(' ')}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {isComplete ? (
              <Check className="h-3 w-3" aria-hidden />
            ) : isCurrent && blocked ? (
              <AlertCircle className="h-3 w-3" aria-hidden />
            ) : (
              <Circle
                className={`h-3 w-3 ${isCurrent ? 'fill-current' : ''}`}
                aria-hidden
              />
            )}
            <span>{stage.label}</span>
            {idx < STAGES.length - 1 && (
              <span aria-hidden className="text-muted-foreground/40">
                →
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
