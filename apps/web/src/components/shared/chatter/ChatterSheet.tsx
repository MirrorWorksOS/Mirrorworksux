/**
 * ChatterSheet — global, single-instance right-side Sheet for record-following chat.
 *
 * Driven by chatterStore.openContext — mounted once (in App / routes) and re-renders
 * with whatever entity the user opened. Loads messages on open, posts via service,
 * collapses chain pill in the header for context.
 */

import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatterMessage } from './ChatterMessage';
import { ChatterComposer } from './ChatterComposer';
import { ChatterChainFilter } from './ChatterChainFilter';
import { useChatterStore } from '@/store/chatterStore';
import { useNotificationStore, type NotificationModule } from '@/store/notificationStore';
import { chatterService, type ChatterMessage as ChatterMessageType, type ChatterEntityType } from '@/services/chatterService';
import { mockUserContext } from '@/lib/mock-user-context';

const ENTITY_LABEL: Record<ChatterEntityType, string> = {
  opportunity: 'Opportunity',
  quote: 'Quote',
  sales_order: 'Sales order',
  job: 'Job',
  work_order: 'Work order',
  manufacturing_order: 'Manufacturing order',
  invoice: 'Invoice',
};

const ENTITY_NOTIF_MODULE: Record<ChatterEntityType, NotificationModule> = {
  opportunity: 'sell',
  quote: 'sell',
  sales_order: 'sell',
  job: 'plan',
  work_order: 'make',
  manufacturing_order: 'make',
  invoice: 'book',
};

const ENTITY_URL: Record<ChatterEntityType, (id: string) => string> = {
  opportunity: (id) => `/sell/opportunities/${id}`,
  quote: (id) => `/sell/quotes/${id}`,
  sales_order: (id) => `/sell/orders/${id}`,
  job: (id) => `/plan/jobs/${id}`,
  work_order: (id) => `/make/work-orders/${id}`,
  manufacturing_order: (id) => `/make/manufacturing-orders/${id}`,
  invoice: (id) => `/book/invoices/${id}`,
};

function groupByDay(messages: ChatterMessageType[]): { day: string; messages: ChatterMessageType[] }[] {
  const groups: Record<string, ChatterMessageType[]> = {};
  const today = new Date();
  const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    let label: string;
    if (ymd(d) === ymd(today)) {
      label = 'Today';
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (ymd(d) === ymd(yesterday)) label = 'Yesterday';
      else
        label = d.toLocaleDateString('en-AU', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
    }
    groups[label] ??= [];
    groups[label].push(msg);
  }
  return Object.entries(groups).map(([day, messages]) => ({ day, messages }));
}

export function ChatterSheet() {
  const openContext = useChatterStore((s) => s.openContext);
  const close = useChatterStore((s) => s.close);
  const setDraft = useChatterStore((s) => s.setDraft);
  const clearDraft = useChatterStore((s) => s.clearDraft);
  const markRead = useChatterStore((s) => s.markRead);
  const bumpMessagesVersion = useChatterStore((s) => s.bumpMessagesVersion);
  const messagesVersion = useChatterStore((s) => s.messagesVersion);

  const isOpen = openContext !== null;

  useEffect(() => {
    if (isOpen && openContext) {
      markRead(openContext.threadId);
    }
  }, [isOpen, openContext, markRead]);

  const allMessages = useMemo(() => {
    if (!openContext) return [];
    return chatterService.listMessages(openContext.threadId);
  }, [openContext, messagesVersion]);

  // Initial composer body read once per thread — bypassing the subscription
  // avoids the Sheet re-rendering on every keystroke from the composer.
  const initialDraft = openContext
    ? useChatterStore.getState().draftBody[openContext.threadId] ?? ''
    : '';

  const chain = useMemo(() => {
    if (!openContext) return [];
    return chatterService.chainForThread(openContext.threadId);
  }, [openContext]);

  const currentDoc = useMemo(() => {
    if (!openContext) return null;
    return chain.find((c) => c.type === openContext.postedOnType && c.id === openContext.postedOnId)
      ?? { type: openContext.postedOnType, id: openContext.postedOnId, label: openContext.postedOnId };
  }, [openContext, chain]);

  // Chain filter: which chain doc labels are currently included. Default to all.
  // Resets when the opener context (thread) changes.
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(() => new Set(chain.map((c) => c.label)));
  useEffect(() => {
    setSelectedDocs(new Set(chain.map((c) => c.label)));
  }, [openContext?.threadId, chain]);

  const messages = useMemo(
    () => allMessages.filter((m) => selectedDocs.has(m.postedOn.label)),
    [allMessages, selectedDocs],
  );

  const grouped = useMemo(() => groupByDay(messages), [messages]);

  const toggleDoc = (label: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const resetFilter = () => {
    setSelectedDocs(new Set(chain.map((c) => c.label)));
  };

  const hiddenCount = allMessages.length - messages.length;

  const handleSend = ({ body, mentions }: { body: string; mentions: string[] }) => {
    if (!openContext || !currentDoc) return;
    chatterService.post(openContext.threadId, {
      postedOn: currentDoc,
      authorId: 'emp-current',
      authorName: mockUserContext.displayName,
      authorAvatar: mockUserContext.avatarUrl,
      body,
      mentions,
    });
    clearDraft(openContext.threadId);
    bumpMessagesVersion();
    // Surface @mentions as bell notifications. Front-end-only fan-out for the
    // demo — in production this would be a server-side per-mention push.
    if (mentions.length > 0) {
      const addNotification = useNotificationStore.getState().addNotification;
      const preview = body.length > 90 ? `${body.slice(0, 87).trimEnd()}…` : body;
      const actionUrl = ENTITY_URL[currentDoc.type as ChatterEntityType](currentDoc.id);
      const module = ENTITY_NOTIF_MODULE[currentDoc.type as ChatterEntityType];
      addNotification({
        type: 'info',
        title: `${mockUserContext.displayName} mentioned you on ${currentDoc.label}`,
        message: preview,
        module,
        actionUrl,
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (!o) close(); }}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-md md:max-w-lg"
      >
        <SheetHeader className="border-b border-[var(--border)] px-5 py-3 space-y-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            Chatter
            {currentDoc && (
              <span className="text-xs font-normal text-[var(--neutral-500)]">
                — {ENTITY_LABEL[currentDoc.type as ChatterEntityType]}
              </span>
            )}
          </SheetTitle>
          {currentDoc && chain.length > 1 && (
            <ChatterChainFilter
              chain={chain}
              selected={selectedDocs}
              anchorLabel={currentDoc.label}
              onToggle={toggleDoc}
              onReset={resetFilter}
            />
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-5 px-5 py-4">
            {messages.length === 0 && allMessages.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--neutral-500)]">
                No messages yet — start the conversation.
              </p>
            )}
            {messages.length === 0 && allMessages.length > 0 && (
              <div className="py-8 text-center text-xs text-[var(--neutral-500)]">
                <p>No messages match the current filter.</p>
                <button
                  type="button"
                  onClick={resetFilter}
                  className="mt-2 text-[var(--mw-mirage)] underline-offset-2 hover:underline dark:text-foreground"
                >
                  Show all
                </button>
              </div>
            )}
            {hiddenCount > 0 && messages.length > 0 && (
              <p className="text-[10px] text-[var(--neutral-400)] tabular-nums">
                Showing {messages.length} of {allMessages.length} — {hiddenCount} hidden by filter.{' '}
                <button
                  type="button"
                  onClick={resetFilter}
                  className="underline-offset-2 hover:underline"
                >
                  Show all
                </button>
              </p>
            )}
            {grouped.map(({ day, messages }) => (
              <div key={day} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex-1 border-t border-[var(--border)]" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                    {day}
                  </span>
                  <span className="flex-1 border-t border-[var(--border)]" />
                </div>
                {messages.map((m) => (
                  <ChatterMessage
                    key={m.id}
                    message={m}
                    currentDocLabel={currentDoc?.label}
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>

        {openContext && (
          <ChatterComposer
            key={openContext.threadId}
            initialBody={initialDraft}
            onChangeBody={(b) => setDraft(openContext.threadId, b)}
            onSend={handleSend}
            placeholder={`Message — posting on ${currentDoc?.label ?? 'this document'}`}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
