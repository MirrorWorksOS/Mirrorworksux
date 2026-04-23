/**
 * PortalMarkupViewer — 3D model review + threaded commentary for quotes.
 *
 * MVP scope:
 *   - Renders the existing GlbViewer read-only on the left.
 *   - Right-side panel shows all markups for this quote (open + resolved),
 *     each expandable to reveal the comment thread and reply box.
 *   - "Add markup" button opens a dialog for creating a new pin. We capture
 *     a free-form body + a part id (selected from seen part-ids or typed
 *     fresh). Real spatial pin placement (raycasting into the GLB and
 *     projecting the anchor point back to 2D each frame) is phase 2 — the
 *     anchor shape is already wired through markupService so the upgrade
 *     path is additive.
 *
 * Permission matrix (from AuthContext):
 *   - `portal.markup.create`  → show "Add markup" button
 *   - `portal.markup.reply`   → show reply composer
 *   - `portal.markup.resolve` → show resolve / reopen buttons (internal only)
 *
 * Resolving a markup writes an audit event on the parent quote via
 * markupService → auditService, so the quote timeline picks it up.
 */

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Plus,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Send,
  User as UserIcon,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { GlbViewer } from '@/components/shared/3d/GlbViewer';
import { markupService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ModelMarkup,
  MarkupComment,
  MarkupEntityKind,
} from '@/types/entities';

interface PortalMarkupViewerProps {
  entityKind: MarkupEntityKind;
  entityId: string;
  modelSrc: string; // e.g. "/models/diff.glb"
  modelRef: string; // canonical id stored on the markup
  revision: string; // e.g. "rev-1"
  customerId: string;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function contactDisplay(
  contactId: string,
  side: 'customer' | 'internal',
): string {
  if (side === 'internal') return `Alliance Metal · ${contactId.slice(-4)}`;
  return `Customer · ${contactId.slice(-4)}`;
}

export function PortalMarkupViewer({
  entityKind,
  entityId,
  modelSrc,
  modelRef,
  revision,
  customerId,
}: PortalMarkupViewerProps) {
  const { hasPermission, identity } = useAuth();

  const canCreate = hasPermission('portal.markup.create');
  const canReply = hasPermission('portal.markup.reply');
  const canResolve = hasPermission('portal.markup.resolve');

  // Pull + local mirror so mutations re-render without re-fetching.
  const [markups, setMarkups] = useState<ModelMarkup[]>(() =>
    markupService.listFor(entityKind, entityId, {
      scopeCustomerId: customerId,
    }),
  );

  const refresh = () => {
    setMarkups(
      markupService.listFor(entityKind, entityId, {
        scopeCustomerId: customerId,
      }),
    );
  };

  const actorSide: 'customer' | 'internal' =
    identity.kind === 'customer' ? 'customer' : 'internal';
  const actorContactId =
    identity.kind === 'customer'
      ? identity.contact.id
      : identity.user.id;

  // Extract part-ids we've seen so authors can reuse rather than retyping.
  const knownPartIds = useMemo(() => {
    const set = new Set<string>();
    for (const m of markups) set.add(m.anchor.partId);
    // Seed with a couple of common ones for demo
    set.add('part-housing');
    set.add('part-cover');
    set.add('part-bracket');
    return Array.from(set).sort();
  }, [markups]);

  // Active thread (right panel focus)
  const [activeId, setActiveId] = useState<string | null>(
    markups.find((m) => m.status === 'open')?.id ?? markups[0]?.id ?? null,
  );
  const [replyDraft, setReplyDraft] = useState('');

  // New-markup dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newPartId, setNewPartId] = useState('');
  const [newPartCustom, setNewPartCustom] = useState('');
  const [newBody, setNewBody] = useState('');

  const activeMarkup = activeId
    ? markups.find((m) => m.id === activeId)
    : undefined;

  const openCount = markups.filter((m) => m.status === 'open').length;
  const resolvedCount = markups.filter((m) => m.status !== 'open').length;

  const handleCreate = () => {
    const partId = (newPartCustom || newPartId).trim();
    if (!partId || !newBody.trim()) {
      toast.error('Part id and a note are both required.');
      return;
    }
    const created = markupService.create({
      entityKind,
      entityId,
      modelRef,
      revision,
      anchor: {
        partId,
        // MVP: placeholder anchor — spatial picking lands in phase 2.
        pointLocal: [0, 0, 0],
        normalLocal: [0, 1, 0],
      },
      authorContactId: actorContactId,
      authorSide: actorSide,
      body: newBody.trim(),
    });
    toast.success('Markup added', {
      description: `Thread opened on ${partId}.`,
    });
    setNewBody('');
    setNewPartCustom('');
    setNewPartId('');
    setAddOpen(false);
    refresh();
    setActiveId(created.id);
  };

  const handleReply = () => {
    if (!activeMarkup || !replyDraft.trim()) return;
    try {
      markupService.reply({
        markupId: activeMarkup.id,
        authorContactId: actorContactId,
        authorSide: actorSide,
        body: replyDraft.trim(),
      });
      setReplyDraft('');
      refresh();
    } catch (err) {
      toast.error('Could not post reply', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleResolve = (markup: ModelMarkup, status: 'resolved' | 'wont_fix' | 'open') => {
    try {
      markupService.resolve({
        markupId: markup.id,
        resolvedByContactId: actorContactId,
        resolvedBySide: actorSide,
        status,
      });
      toast.success(
        status === 'open'
          ? 'Markup re-opened'
          : status === 'resolved'
            ? 'Markup resolved'
            : "Marked won't fix",
      );
      refresh();
    } catch (err) {
      toast.error('Could not update markup', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-yellow-50)]">
            <MessageSquare
              className="h-4 w-4 text-[var(--mw-yellow-700)]"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              3D model review
            </p>
            <p className="text-xs text-[var(--neutral-500)]">
              {openCount} open · {resolvedCount} closed · revision{' '}
              <span className="font-mono">{revision}</span>
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            size="sm"
            className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            Add markup
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* 3D viewer */}
        <Card variant="flat" className="overflow-hidden p-0">
          <div className="aspect-[4/3] w-full">
            <GlbViewer src={modelSrc} className="h-full w-full" />
          </div>
          <div className="border-t border-[var(--border)] bg-[var(--neutral-50)] px-3 py-2 text-[11px] text-[var(--neutral-500)]">
            Drag to orbit · scroll to zoom · right-click to pan
          </div>
        </Card>

        {/* Threads panel */}
        <Card variant="flat" className="overflow-hidden p-0">
          <Tabs defaultValue="open" className="flex h-full flex-col">
            <TabsList className="m-3 grid grid-cols-2">
              <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
              <TabsTrigger value="all">All ({markups.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="flex-1 overflow-y-auto px-3 pb-3">
              <MarkupList
                markups={markups.filter((m) => m.status === 'open')}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </TabsContent>
            <TabsContent value="all" className="flex-1 overflow-y-auto px-3 pb-3">
              <MarkupList
                markups={markups}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Active thread detail */}
      {activeMarkup && (
        <Card variant="flat" className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Thread on{' '}
                  <span className="font-mono text-[var(--neutral-700)]">
                    {activeMarkup.anchor.partId}
                  </span>
                </p>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase ${
                    activeMarkup.status === 'open'
                      ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-800)]'
                      : ''
                  }`}
                >
                  {activeMarkup.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                Started by {contactDisplay(activeMarkup.authorContactId, activeMarkup.authorSide)}{' '}
                · {formatTimestamp(activeMarkup.createdAt)}
              </p>
            </div>
            {canResolve && activeMarkup.status === 'open' && (
              <div className="flex shrink-0 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolve(activeMarkup, 'resolved')}
                >
                  <CheckCircle2
                    className="mr-1 h-3.5 w-3.5"
                    strokeWidth={1.5}
                  />
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleResolve(activeMarkup, 'wont_fix')}
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                  Won't fix
                </Button>
              </div>
            )}
            {canResolve && activeMarkup.status !== 'open' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleResolve(activeMarkup, 'open')}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
                Re-open
              </Button>
            )}
          </div>

          {/* Comments */}
          <ul className="mt-4 space-y-3">
            {activeMarkup.thread.map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))}
          </ul>

          {/* Reply composer */}
          {canReply && activeMarkup.status === 'open' && (
            <div className="mt-4 flex items-end gap-2 border-t border-[var(--border)] pt-3">
              <Textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={2}
                placeholder="Reply to this thread…"
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (
                    (e.metaKey || e.ctrlKey) &&
                    e.key === 'Enter' &&
                    replyDraft.trim()
                  ) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyDraft.trim()}
                className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Add-markup dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a markup</DialogTitle>
            <DialogDescription>
              Note a region of the model you'd like reviewed. Your engineer
              will reply here and on the quote thread.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="markup-part">Part</Label>
              <Select value={newPartId} onValueChange={setNewPartId}>
                <SelectTrigger id="markup-part">
                  <SelectValue placeholder="Pick a known part…" />
                </SelectTrigger>
                <SelectContent>
                  {knownPartIds.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[var(--neutral-500)]">
                Or type a new part id:
              </p>
              <Input
                value={newPartCustom}
                onChange={(e) => setNewPartCustom(e.target.value)}
                placeholder="part-my-region"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="markup-body">Note</Label>
              <Textarea
                id="markup-body"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={4}
                placeholder="What would you like reviewed or changed?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!newBody.trim() || !(newPartCustom || newPartId).trim()}
              className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            >
              Create markup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function MarkupList({
  markups,
  activeId,
  onSelect,
}: {
  markups: ModelMarkup[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (markups.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-[var(--neutral-400)]">
        No markups here yet.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {markups.map((m) => {
        const firstComment = m.thread[0];
        const preview = firstComment?.body ?? '';
        const isActive = m.id === activeId;
        return (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect(m.id)}
              className={`w-full rounded-[var(--shape-md)] border px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? 'border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-50)]'
                  : 'border-[var(--border)] hover:bg-[var(--neutral-50)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-medium text-foreground">
                  {m.anchor.partId}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase ${
                    m.status === 'open'
                      ? 'border-[var(--mw-yellow-400)] bg-white text-[var(--mw-yellow-800)]'
                      : ''
                  }`}
                >
                  {m.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--neutral-600)]">
                {preview}
              </p>
              <p className="mt-1 text-[10px] text-[var(--neutral-400)]">
                {m.thread.length} comment{m.thread.length === 1 ? '' : 's'} ·{' '}
                {formatTimestamp(m.createdAt)}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CommentRow({ comment }: { comment: MarkupComment }) {
  const isInternal = comment.authorSide === 'internal';
  return (
    <li className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isInternal
            ? 'bg-[var(--mw-mirage)] text-white'
            : 'bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-800)]'
        }`}
      >
        <UserIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-foreground">
            {contactDisplay(comment.authorContactId, comment.authorSide)}
          </span>
          <span className="text-[var(--neutral-400)]">·</span>
          <span className="text-[var(--neutral-500)]">
            {formatTimestamp(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-foreground whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>
    </li>
  );
}
