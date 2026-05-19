/**
 * Chatter Store — drives the global ChatterSheet and tracks per-thread read state.
 *
 * Pattern mirrors notificationStore: persisted Zustand slice with createZustandStorage.
 * Persisted shape is intentionally minimal — open/close is ephemeral, only read
 * cursors and drafts survive reload.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createZustandStorage } from '@/lib/platform/storage';
import { chatterService, type ChatterEntityType } from '@/services/chatterService';

interface OpenContext {
  threadId: string;
  postedOnType: ChatterEntityType;
  postedOnId: string;
}

interface ChatterState {
  openContext: OpenContext | null;
  /** ISO timestamp of the latest message the current user has read, per thread. */
  lastReadAt: Record<string, string>;
  /** In-flight composer text per thread — survives Sheet close. */
  draftBody: Record<string, string>;
  /** Bumped whenever a message is posted — consumers subscribe to re-render. */
  messagesVersion: number;

  openFor: (entity: { type: ChatterEntityType; id: string }) => void;
  close: () => void;
  markRead: (threadId: string) => void;
  setDraft: (threadId: string, body: string) => void;
  clearDraft: (threadId: string) => void;
  bumpMessagesVersion: () => void;

  getUnreadCount: (threadId: string) => number;
}

export const useChatterStore = create<ChatterState>()(
  persist(
    (set, get) => ({
      openContext: null,
      lastReadAt: {},
      draftBody: {},
      messagesVersion: 0,

      openFor: ({ type, id }) => {
        const thread = chatterService.threadForEntity(type, id);
        set({
          openContext: {
            threadId: thread.id,
            postedOnType: type,
            postedOnId: id,
          },
        });
      },

      close: () => {
        const ctx = get().openContext;
        if (ctx) {
          // Mark read on close — typical Slack/Odoo behaviour.
          get().markRead(ctx.threadId);
        }
        set({ openContext: null });
      },

      markRead: (threadId) => {
        const latest = chatterService.listMessages(threadId).at(-1)?.createdAt;
        if (!latest) return;
        set((s) => ({ lastReadAt: { ...s.lastReadAt, [threadId]: latest } }));
      },

      setDraft: (threadId, body) => {
        set((s) => ({ draftBody: { ...s.draftBody, [threadId]: body } }));
      },

      clearDraft: (threadId) => {
        set((s) => {
          const next = { ...s.draftBody };
          delete next[threadId];
          return { draftBody: next };
        });
      },

      bumpMessagesVersion: () => {
        set((s) => ({ messagesVersion: s.messagesVersion + 1 }));
      },

      getUnreadCount: (threadId) => {
        const cursor = get().lastReadAt[threadId];
        const msgs = chatterService.listMessages(threadId);
        if (!cursor) return msgs.length;
        return msgs.filter((m) => m.createdAt > cursor).length;
      },
    }),
    {
      name: 'mw-chatter',
      storage: createJSONStorage(() => createZustandStorage('local')),
      partialize: (state) => ({
        lastReadAt: state.lastReadAt,
        draftBody: state.draftBody,
      }),
    },
  ),
);
