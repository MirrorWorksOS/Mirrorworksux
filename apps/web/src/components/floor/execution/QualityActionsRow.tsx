import { Check, PauseCircle, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface QualityActionsRowProps {
  onPass: () => void;
  onFail: () => void;
  onHold: () => void;
  onReportScrap: () => void;
  disabled?: boolean;
  passGateMessage?: string;
}

export function QualityActionsRow({
  onPass,
  onFail,
  onHold,
  onReportScrap,
  disabled,
  passGateMessage,
}: QualityActionsRowProps) {
  const gated = !!passGateMessage;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          size="lg"
          className={`h-14 text-base text-white ${
            gated
              ? 'bg-[var(--neutral-300)] hover:bg-[var(--neutral-300)]'
              : 'bg-[var(--mw-success)] hover:bg-[var(--mw-success)]/90'
          }`}
          onClick={onPass}
          disabled={disabled}
          title={passGateMessage}
        >
          <Check className="h-5 w-5" />
          PASS
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-14 bg-[var(--mw-error)] text-base text-white hover:bg-[var(--mw-error)]/90"
          onClick={onFail}
          disabled={disabled}
        >
          <X className="h-5 w-5" />
          FAIL
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-14 bg-[var(--mw-yellow-400)] text-base text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
          onClick={onHold}
          disabled={disabled}
        >
          <PauseCircle className="h-5 w-5" />
          HOLD
        </Button>
      </div>
      <div className="flex items-center justify-between">
        {passGateMessage ? (
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            {passGateMessage}
          </span>
        ) : <span />}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-12 text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]"
          onClick={onReportScrap}
        >
          <Trash2 className="h-4 w-4" />
          Report scrap
        </Button>
      </div>
    </div>
  );
}
