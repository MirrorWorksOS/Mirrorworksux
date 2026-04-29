/**
 * EntityFormDialog — Generic dialog wrapper for create/edit forms.
 * Keeps dialog chrome consistent across all control-screen entity dialogs.
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Submit button label — defaults to "Save" */
  submitLabel?: string;
  onSubmit: () => void;
  children: React.ReactNode;
  /** Extra width class — defaults to "max-w-lg" */
  widthClass?: string;
}

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Save',
  onSubmit,
  children,
  widthClass = 'max-w-lg',
}: EntityFormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${widthClass} rounded-[var(--shape-lg)] border-[var(--border)] bg-white/95 dark:bg-card/95 backdrop-blur-xl p-6`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-[var(--neutral-500)]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children}

          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              className="h-12 w-full bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            >
              {submitLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full text-[var(--neutral-500)]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
