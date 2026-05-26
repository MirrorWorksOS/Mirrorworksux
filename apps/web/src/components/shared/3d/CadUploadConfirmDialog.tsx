/**
 * CadUploadConfirmDialog — the small modal that opens after a file is
 * dropped onto a MirrorView surface. Auto-fills the next revision label
 * (Rev C → Rev D), captures an optional "what changed" note, and gives the
 * engineer a chance to override before the upload kicks off.
 *
 * Used by:
 *   - <MirrorViewer enableUpload …/> (MO, Plan Job, Plan CAD Import)
 *   - ProductDetail's outer dropzone
 *   - PlanCADImport's drop zone
 *
 * The auto-bump default is computed via `nextRevisionLabel()` from
 * apps/web/src/services/mirrorViewerUpload.ts.
 */
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CadUploadConfirmValue {
  revisionLabel: string;
  revisionNotes: string;
}

interface CadUploadConfirmDialogProps {
  /** Set to a File to open the dialog; null/undefined to close. */
  file: File | null;
  /** Pre-filled revision label — typically nextRevisionLabel(existing). */
  suggestedLabel: string;
  onCancel: () => void;
  onConfirm: (value: CadUploadConfirmValue) => void;
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CadUploadConfirmDialog({
  file,
  suggestedLabel,
  onCancel,
  onConfirm,
}: CadUploadConfirmDialogProps) {
  const [label, setLabel] = useState(suggestedLabel);
  const [notes, setNotes] = useState('');

  // Reset fields each time a new file is dropped.
  useEffect(() => {
    if (file) {
      setLabel(suggestedLabel);
      setNotes('');
    }
  }, [file, suggestedLabel]);

  const handleConfirm = () => {
    const trimmedLabel = label.trim() || suggestedLabel;
    onConfirm({ revisionLabel: trimmedLabel, revisionNotes: notes.trim() });
  };

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Upload to MirrorView</DialogTitle>
          <DialogDescription>
            Tag this revision so operators see what changed.
          </DialogDescription>
        </DialogHeader>

        {file && (
          <div className="rounded-md border border-[var(--border)] bg-[var(--neutral-50)] p-3 text-sm">
            <p className="truncate font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-[var(--neutral-500)]">{formatMb(file.size)}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rev-label" className="text-xs uppercase tracking-wide text-[var(--neutral-500)]">
              Revision
            </Label>
            <Input
              id="rev-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={suggestedLabel}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rev-notes" className="text-xs uppercase tracking-wide text-[var(--neutral-500)]">
              What changed <span className="text-[var(--neutral-400)] normal-case">(optional)</span>
            </Label>
            <Input
              id="rev-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Hole spacing 75 → 80 mm; added countersink"
              className="h-10"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
            onClick={handleConfirm}
          >
            Upload as {label.trim() || suggestedLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
