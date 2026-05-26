/**
 * CadMarkupCaptureDialog — modal opened when the engineer clicks the
 * "Pin a comment" button on a MirrorView surface. Camera + selection are
 * captured synchronously at click-time; the dialog just captures the body
 * text and an optional "needs follow-up" tone before persisting via
 * api.mirrorview.createMarkup.
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface CadMarkupCaptureValue {
  body: string;
}

interface CadMarkupCaptureDialogProps {
  /** Set to true to open; false to close. */
  open: boolean;
  /** Optional preview hint — number of parts pinned, for visual context. */
  isolatedCount?: number;
  onCancel: () => void;
  onConfirm: (value: CadMarkupCaptureValue) => void;
}

export function CadMarkupCaptureDialog({
  open,
  isolatedCount,
  onCancel,
  onConfirm,
}: CadMarkupCaptureDialogProps) {
  const [body, setBody] = useState('');

  useEffect(() => {
    if (open) setBody('');
  }, [open]);

  const handleConfirm = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onConfirm({ body: trimmed });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Pin a comment</DialogTitle>
          <DialogDescription>
            Captures the current camera{isolatedCount ? ` + ${isolatedCount} part${isolatedCount === 1 ? '' : 's'}` : ''}
            . Engineering sees the pin on the same viewpoint.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="markup-body" className="text-xs uppercase tracking-wide text-[var(--neutral-500)]">
            Comment
          </Label>
          <Textarea
            id="markup-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Burr on this edge after laser cut — review feed/speed for next batch."
            className="min-h-[96px]"
            autoFocus
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
            onClick={handleConfirm}
            disabled={!body.trim()}
          >
            Pin comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
