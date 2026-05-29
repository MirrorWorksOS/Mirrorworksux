/**
 * Single "Advance to next stage" CTA. Runs the relevant gate set; on pass
 * fires the mutation; on fail surfaces the failures via the GateBanner.
 *
 * The actual gate + mutation are passed in by the parent so this stays
 * decoupled from any specific journey stage.
 */
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GateFailureDetail } from '@/types/entities';
import { GateFailure } from '@/services/workflowService';

export interface AdvanceButtonProps {
  /** Label rendered on the button ("Confirm SO", "Release to Floor", etc.). */
  label: string;
  /** Disabled state — surfaced when no advance is possible (e.g. invoiced). */
  disabled?: boolean;
  /**
   * Synchronous gate evaluator. If non-empty, the button surfaces the
   * failures and never calls onAdvance.
   */
  evaluate: () => GateFailureDetail[];
  /** Mutation to fire when gates pass. */
  onAdvance: () => Promise<unknown>;
  /** Reports failures back to the parent (so the GateBanner can render them). */
  onFailures?: (failures: GateFailureDetail[]) => void;
  /** Fires after a successful advance. */
  onSuccess?: () => void;
}

export function AdvanceButton({
  label,
  disabled,
  evaluate,
  onAdvance,
  onFailures,
  onSuccess,
}: AdvanceButtonProps) {
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    const failures = evaluate();
    if (failures.length > 0) {
      onFailures?.(failures);
      return;
    }
    setBusy(true);
    try {
      await onAdvance();
      onSuccess?.();
      onFailures?.([]);
    } catch (e) {
      if (e instanceof GateFailure) {
        onFailures?.(e.details);
      } else {
        onFailures?.([
          {
            code: 'unknown',
            message: e instanceof Error ? e.message : 'Unknown error during advance.',
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button
      onClick={handleClick}
      disabled={disabled || busy}
      className="gap-2"
      size="lg"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <ArrowRight className="h-4 w-4" aria-hidden />
      )}
      {label}
    </Button>
  );
}
