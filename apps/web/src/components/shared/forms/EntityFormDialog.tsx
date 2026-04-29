/**
 * EntityFormDialog — generic create/edit dialog for Control-section forms.
 *
 * The Control screens (Operations, Machines, Routes, Locations, BOMs, etc.)
 * all need the same shape: a centered modal with a title, a stack of fields,
 * and a Cancel/Save footer. Rather than re-roll <Dialog> in every file we wrap
 * it once here.
 *
 * Children should normally be `<MwFormField>` blocks (or any custom layout).
 * On Save, `onSubmit()` runs; if it returns a Promise the dialog disables the
 * Save button until it resolves and closes on success. Throw or return false
 * to keep the dialog open after a validation error.
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';

export interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Modal title — typically "New {entity}" or "Edit {entity}". */
  title: string;
  /** Optional one-line context shown beneath the title. */
  description?: React.ReactNode;
  /** Form body — usually `<MwFormField>` blocks. */
  children: React.ReactNode;
  /**
   * Called when the user clicks Save. Returning `false` keeps the dialog
   * open (use for validation failure). Async functions are awaited and the
   * Save button shows a spinner.
   */
  onSubmit: () => boolean | void | Promise<boolean | void>;
  /** Save button label. Defaults to "Save". */
  submitLabel?: string;
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Disable Save (e.g. invalid form). */
  submitDisabled?: boolean;
  /** Width override — defaults to sm:max-w-lg from DialogContent. */
  className?: string;
}

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  className,
}: EntityFormDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting || submitDisabled) return;
      setSubmitting(true);
      try {
        const result = await onSubmit();
        if (result !== false) onOpenChange(false);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, onOpenChange, submitting, submitDisabled],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg', className)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">{children}</div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || submitDisabled}
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            >
              {submitting && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
