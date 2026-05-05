/**
 * Auto-map confirmation dialog. Shows fuzzy-match suggestions for any
 * unmapped MW categories, lets the user uncheck rows they don't want,
 * and applies the rest in bulk.
 */
import { useEffect, useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type {
  AutoMapSuggestion,
} from '@/services/xeroService';

export interface AutoMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: AutoMapSuggestion[];
  onApply: (selected: AutoMapSuggestion[]) => void;
}

export function AutoMapDialog({
  open,
  onOpenChange,
  suggestions,
  onApply,
}: AutoMapDialogProps) {
  // Default-checked: only confidently matched rows (score >= 0.5).
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setCheckedKeys(
        new Set(
          suggestions
            .filter((s) => s.suggestedCode && s.score >= 0.5)
            .map((s) => s.sourceKey),
        ),
      );
    }
  }, [open, suggestions]);

  const toggle = (key: string) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applyDisabled = checkedKeys.size === 0;

  const sortedSuggestions = useMemo(
    () => [...suggestions].sort((a, b) => b.score - a.score),
    [suggestions],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Auto-map unmapped categories</DialogTitle>
          <DialogDescription>
            We matched MirrorWorks categories to Xero accounts by name.
            Uncheck any you don't want to apply, then click Apply.
          </DialogDescription>
        </DialogHeader>

        {sortedSuggestions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nothing to suggest — every category is already mapped.
          </div>
        ) : (
          <ul className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
            {sortedSuggestions.map((s) => {
              const noMatch = !s.suggestedCode;
              const isChecked = checkedKeys.has(s.sourceKey);
              return (
                <li
                  key={s.sourceKey}
                  className="flex items-center gap-3 rounded-[var(--shape-md)] border border-[var(--border)] px-3 py-2"
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={noMatch}
                    onCheckedChange={() => toggle(s.sourceKey)}
                    aria-label={`Apply suggestion for ${s.sourceLabel}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.sourceLabel}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    {noMatch ? (
                      <span className="text-xs italic text-muted-foreground">
                        No confident match
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {s.suggestedCode}
                        </span>
                        <span className="truncate text-sm">
                          {s.suggestedName}
                        </span>
                      </span>
                    )}
                  </div>
                  {!noMatch && (
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-full text-[10px] tabular-nums"
                    >
                      {Math.round(s.score * 100)}%
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="gap-2 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            disabled={applyDisabled}
            onClick={() => {
              const selected = suggestions.filter(
                (s) => checkedKeys.has(s.sourceKey) && s.suggestedCode,
              );
              onApply(selected);
              onOpenChange(false);
            }}
          >
            Apply {checkedKeys.size > 0 ? `(${checkedKeys.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
