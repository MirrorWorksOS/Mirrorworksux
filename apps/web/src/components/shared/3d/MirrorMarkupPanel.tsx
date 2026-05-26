/**
 * MirrorMarkupPanel — anchored-comment side rail for a MirrorView surface.
 *
 * Subscribes to `api.mirrorview.listMarkups(modelId)` reactively, so new
 * pins + replies from other browser sessions stream in live.
 *
 * Operations:
 *   - **Pin a comment**: captures the current camera + isolation from the
 *     viewer handle, opens CadMarkupCaptureDialog, persists via
 *     createMarkup.
 *   - **Jump to view**: click a pin → restores the captured camera +
 *     isolation. Reuses the imperative MirrorViewer handle.
 *   - **Reply**: flat-thread replies under each root pin.
 *   - **Resolve / re-open**: status pill is clickable; admin+lead can
 *     flip it (UI-side gate via `canResolve` prop).
 *   - **Delete**: trash icon on root + reply rows (UI-side gate).
 */
import { useState, type RefObject } from 'react';
import {
  CheckCircle2,
  CornerDownRight,
  MessageCirclePlus,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/utils';

import { CadMarkupCaptureDialog } from './CadMarkupCaptureDialog';
import type { MirrorViewerHandle } from './MirrorViewer';

const REMOTE_MODE = import.meta.env.VITE_DATA_SOURCE === 'remote';

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' });
}

export interface MirrorMarkupPanelProps {
  modelId: Id<'mirrorviewModels'> | null;
  viewerRef: RefObject<MirrorViewerHandle | null>;
  author?: string;
  canResolve?: boolean;
  canDelete?: boolean;
  className?: string;
}

export function MirrorMarkupPanel({
  modelId,
  viewerRef,
  author,
  canResolve = false,
  canDelete = false,
  className,
}: MirrorMarkupPanelProps) {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    camera: ReturnType<NonNullable<MirrorViewerHandle['captureCamera']>>;
    dbIds: number[];
  } | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const markups = useQuery(
    api.mirrorview.listMarkups,
    REMOTE_MODE && modelId ? { modelId } : 'skip',
  );

  const createMarkup = useMutation(api.mirrorview.createMarkup);
  const replyToMarkup = useMutation(api.mirrorview.replyToMarkup);
  const resolveMarkup = useMutation(api.mirrorview.resolveMarkup);
  const reopenMarkup = useMutation(api.mirrorview.reopenMarkup);
  const deleteMarkup = useMutation(api.mirrorview.deleteMarkup);

  const handlePinClick = () => {
    if (!modelId) {
      toast.error('No model loaded — drop a CAD file before pinning a comment');
      return;
    }
    const camera = viewerRef.current?.captureCamera() ?? null;
    const dbIds = viewerRef.current?.captureSelection() ?? [];
    setPendingCapture({ camera, dbIds });
    setCaptureOpen(true);
  };

  const handleCaptureConfirm = ({ body }: { body: string }) => {
    if (!modelId || !pendingCapture) return;
    setCaptureOpen(false);
    const { camera, dbIds } = pendingCapture;
    void createMarkup({
      modelId,
      body,
      author,
      camera: camera ?? undefined,
      dbIds: dbIds.length > 0 ? dbIds : undefined,
    })
      .then(() => toast.success('Comment pinned'))
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : 'Pin failed'),
      );
    setPendingCapture(null);
  };

  const handleJumpToView = (markupId: Id<'mirrorviewMarkups'>) => {
    const markup = markups?.find((m) => m._id === markupId);
    if (!markup) return;
    if (markup.camera) {
      viewerRef.current?.restoreCamera({
        px: markup.camera.px, py: markup.camera.py, pz: markup.camera.pz,
        tx: markup.camera.tx, ty: markup.camera.ty, tz: markup.camera.tz,
        ux: markup.camera.ux, uy: markup.camera.uy, uz: markup.camera.uz,
      });
    }
    viewerRef.current?.isolate(markup.dbIds ?? []);
  };

  const handleReplySubmit = (parentMarkupId: Id<'mirrorviewMarkups'>) => {
    const body = (replyDraft[parentMarkupId] ?? '').trim();
    if (!body) return;
    void replyToMarkup({ parentMarkupId, body, author })
      .then(() => setReplyDraft((d) => ({ ...d, [parentMarkupId]: '' })))
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : 'Reply failed'),
      );
  };

  const openCount = (markups ?? []).filter((m) => m.status === 'open').length;
  const resolvedCount = (markups ?? []).filter((m) => m.status === 'resolved').length;

  return (
    <Card className={cn('flex h-full flex-col gap-2 p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">Comments</p>
          <p className="text-[11px] text-[var(--neutral-500)]">
            {openCount} open
            {resolvedCount > 0 ? ` · ${resolvedCount} resolved` : ''}
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
          onClick={handlePinClick}
          disabled={!modelId}
        >
          <MessageCirclePlus className="h-3.5 w-3.5" />
          Pin
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {!modelId && (
          <p className="rounded-md bg-[var(--neutral-50)] p-3 text-[11px] text-[var(--neutral-500)]">
            Load a model to pin comments on parts of the 3D view.
          </p>
        )}
        {modelId && markups && markups.length === 0 && (
          <p className="rounded-md bg-[var(--neutral-50)] p-3 text-[11px] text-[var(--neutral-500)]">
            No pins yet. Use the Pin button to flag a feature for engineering.
          </p>
        )}

        {(markups ?? []).map((root) => {
          const resolved = root.status === 'resolved';
          return (
            <div
              key={root._id}
              className={cn(
                'rounded-md border p-2.5 transition-colors',
                resolved
                  ? 'border-[var(--mw-success)]/30 bg-[var(--mw-success)]/5'
                  : 'border-[var(--border)] bg-card',
              )}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="mt-0.5 text-left text-sm leading-snug text-foreground hover:underline"
                  onClick={() => handleJumpToView(root._id)}
                  title="Jump to this view"
                >
                  {root.body}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      void deleteMarkup({ id: root._id })
                        .then(() => toast.success('Comment removed'))
                        .catch((err) =>
                          toast.error(err instanceof Error ? err.message : 'Delete failed'),
                        )
                    }
                    className="ml-auto rounded p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-error)]"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--neutral-500)]">
                <span className="font-medium text-[var(--neutral-700)]">
                  {root.author ?? 'Unknown'}
                </span>
                <span>·</span>
                <span title={new Date(root.createdAt).toLocaleString('en-AU')}>
                  {formatRelative(root.createdAt)}
                </span>
                {root.dbIds && root.dbIds.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{root.dbIds.length} part{root.dbIds.length === 1 ? '' : 's'}</span>
                  </>
                )}
                <span className="ml-auto">
                  {resolved ? (
                    canResolve ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]"
                        onClick={() =>
                          void reopenMarkup({ id: root._id }).catch((err) =>
                            toast.error(
                              err instanceof Error ? err.message : 'Re-open failed',
                            ),
                          )
                        }
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        Re-open
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mw-success)]/15 px-1.5 py-0.5 font-medium text-[var(--mw-success)]">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Resolved
                      </span>
                    )
                  ) : canResolve ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--mw-yellow-400)]/30 px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-[var(--mw-yellow-400)]/50"
                      onClick={() =>
                        void resolveMarkup({ id: root._id, resolvedBy: author }).catch((err) =>
                          toast.error(
                            err instanceof Error ? err.message : 'Resolve failed',
                          ),
                        )
                      }
                    >
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Resolve
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-1.5 py-0.5 font-medium text-[var(--neutral-700)]">
                      Open
                    </span>
                  )}
                </span>
              </div>

              {root.replies.length > 0 && (
                <ul className="mt-2 space-y-1 border-l border-[var(--border)] pl-2.5">
                  {root.replies.map((reply) => (
                    <li key={reply._id} className="flex items-start gap-2 text-[12px]">
                      <CornerDownRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--neutral-400)]" />
                      <div className="flex-1">
                        <p className="text-foreground">{reply.body}</p>
                        <p className="text-[10px] text-[var(--neutral-500)]">
                          <span className="font-medium text-[var(--neutral-700)]">
                            {reply.author ?? 'Unknown'}
                          </span>{' '}
                          · {formatRelative(reply.createdAt)}
                        </p>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            void deleteMarkup({ id: reply._id }).catch((err) =>
                              toast.error(
                                err instanceof Error ? err.message : 'Delete failed',
                              ),
                            )
                          }
                          className="rounded p-0.5 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-error)]"
                          aria-label="Delete reply"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {!resolved && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Input
                    value={replyDraft[root._id] ?? ''}
                    onChange={(e) =>
                      setReplyDraft((d) => ({ ...d, [root._id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReplySubmit(root._id);
                      }
                    }}
                    placeholder="Reply…"
                    className="h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(root._id)}
                    disabled={!(replyDraft[root._id] ?? '').trim()}
                    className="rounded-md p-1.5 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send reply"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CadMarkupCaptureDialog
        open={captureOpen}
        isolatedCount={pendingCapture?.dbIds.length ?? 0}
        onCancel={() => {
          setCaptureOpen(false);
          setPendingCapture(null);
        }}
        onConfirm={handleCaptureConfirm}
      />
    </Card>
  );
}
