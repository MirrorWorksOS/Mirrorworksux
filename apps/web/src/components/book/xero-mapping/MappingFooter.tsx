/**
 * Sticky footer that appears once there are unsaved changes. Shows the
 * number of pending diffs plus Discard / Save buttons.
 */
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';

export interface MappingFooterProps {
  diffCount: number;
  saving: boolean;
  blockedReason?: string;
  onDiscard: () => void;
  onSave: () => void;
}

export function MappingFooter({
  diffCount,
  saving,
  blockedReason,
  onDiscard,
  onSave,
}: MappingFooterProps) {
  if (diffCount === 0 && !saving) return null;
  return (
    <div className="sticky bottom-4 z-10 mx-auto w-full max-w-[1200px] px-4">
      <Card
        className={cn(
          'flex flex-wrap items-center gap-3 px-4 py-3 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]',
          'border border-[var(--mw-yellow-400)]/40 bg-card',
        )}
      >
        <span className="text-sm font-medium text-foreground">
          {diffCount} unsaved {diffCount === 1 ? 'change' : 'changes'}
        </span>
        {blockedReason && (
          <span className="text-xs text-[var(--mw-error)]">
            · {blockedReason}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={onDiscard}
            disabled={saving}
          >
            Discard
          </Button>
          <Button
            size="sm"
            className="gap-2 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={onSave}
            disabled={saving || !!blockedReason}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save mapping'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
