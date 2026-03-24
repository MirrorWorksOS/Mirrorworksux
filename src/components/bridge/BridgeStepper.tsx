import { useBridge } from '@/hooks/useBridge';
import { cn } from '@/components/ui/utils';
import { CheckCircle } from 'lucide-react';
import type { BridgeStep } from '@/types/bridge';

const STEP_LABELS: Record<BridgeStep, string> = {
  source: 'Source',
  scope: 'Your shop',
  upload: 'Upload',
  mapping: 'Map fields',
  manual_entry: 'Enter data',
  review: 'Review',
  results: 'Results',
  team_setup: 'Team',
};

export function BridgeStepper() {
  const { activeSteps, currentStepIndex, goToStep } = useBridge();

  return (
    <nav aria-label="Bridge wizard progress" className="w-full">
      <ol className="flex items-center gap-1">
        {activeSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => isCompleted && goToStep(step)}
                disabled={isFuture}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  isCompleted && 'text-green-600 cursor-pointer hover:text-green-700',
                  isCurrent && 'text-foreground',
                  isFuture && 'text-muted-foreground/50 cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors',
                    isCompleted && 'bg-green-100 text-green-600',
                    isCurrent && 'bg-[#FFCF4B] text-[#191406]',
                    isFuture && 'bg-muted text-muted-foreground/50'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="hidden sm:inline whitespace-nowrap">
                  {STEP_LABELS[step]}
                </span>
              </button>

              {index < activeSteps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2',
                    isCompleted ? 'bg-green-300' : 'bg-border'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
