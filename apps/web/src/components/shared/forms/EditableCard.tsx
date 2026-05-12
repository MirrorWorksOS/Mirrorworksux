/**
 * EditableCard — app-wide editable section pattern.
 *
 * A Card with a pencil button top-right. Click it: children re-render in
 * edit mode, a Save/Cancel footer appears. Save calls `onSave`; on success
 * shows a toast and returns to read mode. Cancel reverts to read mode
 * without persisting.
 *
 * Children receive `{ mode }` so the same composition renders both states.
 *
 *   <EditableCard title="Company information" onSave={async () => { … }}>
 *     {({ mode }) => mode === 'edit'
 *       ? <EditField label="Company" value={draft.company} onChange={…} />
 *       : <Field label="Company" value={value.company} />}
 *   </EditableCard>
 */

import * as React from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

export type EditableCardMode = 'read' | 'edit';

export interface EditableCardChildProps {
  mode: EditableCardMode;
}

export interface EditableCardProps {
  /** Card heading rendered top-left. */
  title?: React.ReactNode;
  /** Optional subtitle under the title. */
  subtitle?: React.ReactNode;
  /** Optional right-aligned content rendered next to the edit button (e.g. external link). */
  headerExtra?: React.ReactNode;
  /** Render-prop receiving the current mode. */
  children: (props: EditableCardChildProps) => React.ReactNode;
  /**
   * Save handler. Return a promise; the card waits on it before exiting
   * edit mode. Throw to keep the card open (toast is left to the caller
   * if you throw a specific message).
   */
  onSave: () => void | Promise<void>;
  /** Called when the user clicks cancel — use to revert draft state. */
  onCancel?: () => void;
  /** When false, the pencil button is hidden (e.g. locked records). */
  editable?: boolean;
  /** Override the toast message on successful save. Set to false to suppress. */
  successMessage?: string | false;
  className?: string;
}

export function EditableCard({
  title,
  subtitle,
  headerExtra,
  children,
  onSave,
  onCancel,
  editable = true,
  successMessage = 'Saved',
  className,
}: EditableCardProps) {
  const [mode, setMode] = React.useState<EditableCardMode>('read');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      if (successMessage !== false) toast.success(successMessage);
      setMode('read');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save changes';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setMode('read');
  };

  return (
    <Card className={cn('p-6', className)}>
      {(title || headerExtra || editable) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-medium text-foreground">{title}</h2>}
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--neutral-500)]">{subtitle}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerExtra}
            {editable && mode === 'read' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 border-[var(--border)] px-3 text-xs"
                onClick={() => setMode('edit')}
                aria-label="Edit section"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {children({ mode })}

      {mode === 'edit' && (
        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-[var(--border)]"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={handleSave}
            disabled={saving}
          >
            <Check className="mr-1.5 h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </Card>
  );
}
