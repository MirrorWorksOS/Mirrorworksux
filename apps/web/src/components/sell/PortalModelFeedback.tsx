/**
 * PortalModelFeedback — free-form feedback on the 3D model, mounted directly
 * under the viewer canvas in the customer portal.
 *
 * Distinct from spatial markups (which pin to a specific part) and from
 * `PortalQuoteChat` (general quote-level chat). One linear thread per
 * (entityKind, entityId), persisted via `markupService` using a sentinel
 * `partId === MODEL_FEEDBACK_PART_ID` so the spatial markup list can filter
 * these out cleanly.
 */

import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import { markupService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import type { ModelMarkup, MarkupEntityKind } from '@/types/entities';

export const MODEL_FEEDBACK_PART_ID = '__model_feedback__';

interface PortalModelFeedbackProps {
  entityKind: MarkupEntityKind;
  entityId: string;
  modelRef: string;
  revision: string;
  customerId: string;
  /**
   * Pre-filtered list of feedback markups for this entity (the parent
   * already calls `markupService.listFor` and splits it; passing the slice
   * down keeps both panes in sync after mutations).
   */
  feedback: ModelMarkup[];
  /** Called after any mutation so the parent can re-fetch the list. */
  onChange?: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  );
}

export function PortalModelFeedback({
  entityKind,
  entityId,
  modelRef,
  revision,
  customerId,
  feedback,
  onChange,
}: PortalModelFeedbackProps) {
  const { hasPermission, identity } = useAuth();
  const canPost = hasPermission('portal.markup.create') || hasPermission('portal.markup.reply');

  const actorSide: 'customer' | 'internal' =
    identity.kind === 'customer' ? 'customer' : 'internal';
  const actorContactId =
    identity.kind === 'customer' ? identity.contact.id : identity.user.id;

  // Single canonical feedback thread per (entityKind, entityId).
  const thread = useMemo(() => {
    if (feedback.length === 0) return null;
    return feedback.reduce((earliest, m) =>
      m.createdAt < earliest.createdAt ? m : earliest,
    );
  }, [feedback]);

  // Flatten the thread into a chat-style message list.
  const messages = useMemo(() => {
    if (!thread) return [];
    return thread.thread.map((c) => ({
      id: c.id,
      side: c.authorSide,
      body: c.body,
      createdAt: c.createdAt,
    }));
  }, [thread]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    const body = input.trim();
    if (!body) return;
    try {
      if (!thread) {
        markupService.create({
          entityKind,
          entityId,
          modelRef,
          revision,
          anchor: {
            partId: MODEL_FEEDBACK_PART_ID,
            pointLocal: [0, 0, 0],
            normalLocal: [0, 1, 0],
          },
          authorContactId: actorContactId,
          authorSide: actorSide,
          body,
        });
      } else {
        markupService.reply({
          markupId: thread.id,
          authorContactId: actorContactId,
          authorSide: actorSide,
          body,
        });
      }
      setInput('');
      onChange?.();
    } catch (err) {
      toast.error('Could not post feedback', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // Suppress unused-var lint on customerId — it's part of the contract for
  // future RLS scoping (markupService.listFor already takes it upstream).
  void customerId;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h4 className="text-sm font-medium text-foreground">Model feedback</h4>
        <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
          {messages.length === 0
            ? 'Share your thoughts on this design — your engineer will reply here.'
            : `${messages.length} message${messages.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="max-h-[360px] space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-xs text-[var(--neutral-400)]">
            No feedback yet. Be the first to leave a note.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex max-w-[80%] flex-col',
              m.side === 'customer' ? 'ml-auto items-end' : 'mr-auto items-start',
            )}
          >
            <div
              className={cn(
                'rounded-xl px-3 py-2 text-sm',
                m.side === 'customer'
                  ? 'rounded-br-sm bg-[var(--mw-blue,#3b82f6)] text-white'
                  : 'rounded-bl-sm bg-[var(--neutral-100)] text-foreground',
              )}
            >
              {m.body}
            </div>
            <span className="mt-1 text-[10px] text-[var(--neutral-400)]">
              {m.side === 'customer' ? 'You' : 'Alliance Metal'} · {formatTime(m.createdAt)}
            </span>
          </div>
        ))}
      </div>

      {canPost && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Leave feedback on this model…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[var(--neutral-400)]"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-8 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </Card>
  );
}
