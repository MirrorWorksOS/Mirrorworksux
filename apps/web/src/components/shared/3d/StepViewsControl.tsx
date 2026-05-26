/**
 * StepViewsControl — labelled "go to this view" dropdown for a MirrorView
 * surface. Engineers capture per-routing-step viewpoints (camera + isolation)
 * once; operators jump between them with one tap, no orbit gymnastics.
 *
 * UI is intentionally tiny — a Select dropdown + an optional "Save current
 * view" button (gated to admin/lead). Reactive: any view added by an
 * engineer streams in live on every open operator screen via Convex push.
 */
import { useState, type RefObject } from 'react';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';

import type { MirrorViewerHandle } from './MirrorViewer';

const REMOTE_MODE = import.meta.env.VITE_DATA_SOURCE === 'remote';

export interface StepViewsControlProps {
  modelId: Id<'mirrorviewModels'> | null;
  viewerRef: RefObject<MirrorViewerHandle | null>;
  /** Author label persisted on saveStepView (employee name). */
  author?: string;
  /** Gates the "Save current view" + delete affordances. */
  canCapture?: boolean;
  className?: string;
}

export function StepViewsControl({
  modelId,
  viewerRef,
  author,
  canCapture = false,
  className,
}: StepViewsControlProps) {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const [activeId, setActiveId] = useState<Id<'mirrorviewStepViews'> | null>(
    null,
  );

  const stepViews = useQuery(
    api.mirrorview.listStepViews,
    REMOTE_MODE && modelId ? { modelId } : 'skip',
  );
  const saveStepView = useMutation(api.mirrorview.saveStepView);
  const deleteStepView = useMutation(api.mirrorview.deleteStepView);

  const handleSelect = (id: string) => {
    const view = stepViews?.find((v) => v._id === (id as Id<'mirrorviewStepViews'>));
    if (!view) return;
    setActiveId(view._id);
    viewerRef.current?.restoreCamera({
      px: view.camera.px, py: view.camera.py, pz: view.camera.pz,
      tx: view.camera.tx, ty: view.camera.ty, tz: view.camera.tz,
      ux: view.camera.ux, uy: view.camera.uy, uz: view.camera.uz,
    });
    viewerRef.current?.isolate(view.dbIds ?? []);
  };

  const openCapture = () => {
    if (!modelId) {
      toast.error('No model loaded — drop a CAD file before saving a view');
      return;
    }
    setDraftLabel('');
    setCaptureOpen(true);
  };

  const handleCaptureConfirm = () => {
    const label = draftLabel.trim();
    if (!modelId || !label) return;
    const camera = viewerRef.current?.captureCamera();
    if (!camera) {
      toast.error('Camera unavailable — wait for the model to finish loading');
      return;
    }
    const dbIds = viewerRef.current?.captureSelection() ?? [];
    setCaptureOpen(false);
    void saveStepView({
      modelId,
      label,
      camera,
      dbIds: dbIds.length > 0 ? dbIds : undefined,
      capturedBy: author,
    })
      .then(() => toast.success(`Saved step view: ${label}`))
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : 'Save failed'),
      );
  };

  const hasViews = (stepViews?.length ?? 0) > 0;
  const activeView = stepViews?.find((v) => v._id === activeId);

  // No model yet → keep the bar minimal so it doesn't crowd the empty state.
  if (!modelId) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Bookmark className="h-4 w-4 text-[var(--neutral-500)]" />
      <span className="text-xs text-[var(--neutral-500)]">Step views</span>
      <Select
        value={activeId ?? undefined}
        onValueChange={handleSelect}
        disabled={!hasViews}
      >
        <SelectTrigger className="h-8 min-w-[180px] text-xs">
          <SelectValue placeholder={hasViews ? 'Jump to a step…' : 'No views saved yet'} />
        </SelectTrigger>
        <SelectContent>
          {(stepViews ?? []).map((view) => (
            <SelectItem key={view._id} value={view._id} className="text-xs">
              {view.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canCapture && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={openCapture}
        >
          <Plus className="h-3.5 w-3.5" />
          Save current view
        </Button>
      )}
      {canCapture && activeView && (
        <button
          type="button"
          className="rounded p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-error)]"
          aria-label={`Delete step view ${activeView.label}`}
          title={`Delete "${activeView.label}"`}
          onClick={() => {
            void deleteStepView({ id: activeView._id })
              .then(() => {
                toast.success(`Removed step view: ${activeView.label}`);
                setActiveId(null);
              })
              .catch((err) =>
                toast.error(err instanceof Error ? err.message : 'Delete failed'),
              );
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <Dialog open={captureOpen} onOpenChange={setCaptureOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Save current view</DialogTitle>
            <DialogDescription>
              Captures the current camera + isolated parts under a labelled
              shortcut. Operators jump back to it with one tap.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="stepview-label" className="text-xs uppercase tracking-wide text-[var(--neutral-500)]">
              Label
            </Label>
            <Input
              id="stepview-label"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="Bend sequence · weld this seam · finish inspection"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCaptureConfirm();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCaptureOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
              onClick={handleCaptureConfirm}
              disabled={!draftLabel.trim()}
            >
              Save view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
