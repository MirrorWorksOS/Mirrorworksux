/**
 * Agent Store — Zustand state management for the Agent AI chat system.
 *
 * Persists conversations to localStorage with a 50-conversation limit.
 * Manages panel open/close state, current conversation, and panel size.
 */

import { create } from 'zustand';
import type {
  AgentConversation,
  AgentMessage,
  AgentModule,
  AgentPanelSize,
} from '@/components/shared/agent/agent-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'mw-agent-store';
const MAX_CONVERSATIONS = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Derive a conversation title from the first user message. */
function titleFromMessage(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= 50) return trimmed;
  return trimmed.slice(0, 47) + '...';
}

/** Load persisted state from localStorage. */
function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

/** Persist state to localStorage. */
function persistState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage quota exceeded — silently fail
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersistedState {
  conversations: AgentConversation[];
  currentConversationId: string | null;
  panelSize: AgentPanelSize;
}

interface AgentStoreState extends PersistedState {
  isOpen: boolean;
  isTyping: boolean;
  hasProactiveInsight: boolean;

  // Panel actions
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setPanelSize: (size: AgentPanelSize) => void;
  togglePanelSize: () => void;

  // Conversation actions
  createConversation: (module: AgentModule) => string;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;

  // Message actions
  addUserMessage: (content: string, module: AgentModule) => void;
  addAgentMessage: (content: string, contentType?: AgentMessage['contentType']) => void;
  setIsTyping: (typing: boolean) => void;
  setHasProactiveInsight: (has: boolean) => void;

  // Selectors
  getCurrentConversation: () => AgentConversation | null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const persisted = loadPersistedState();

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  // Persisted state (restored from localStorage)
  conversations: persisted?.conversations ?? [],
  currentConversationId: persisted?.currentConversationId ?? null,
  panelSize: persisted?.panelSize ?? 'compact',

  // Ephemeral state
  isOpen: false,
  isTyping: false,
  hasProactiveInsight: true, // Start with a pulse to draw attention on first visit

  // -- Panel actions ----------------------------------------------------------

  setOpen: (open) => set({ isOpen: open }),

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  setPanelSize: (size) => {
    set({ panelSize: size });
    const s = get();
    persistState({
      conversations: s.conversations,
      currentConversationId: s.currentConversationId,
      panelSize: size,
    });
  },

  togglePanelSize: () => {
    const next = get().panelSize === 'compact' ? 'expanded' : 'compact';
    get().setPanelSize(next);
  },

  // -- Conversation actions ---------------------------------------------------

  createConversation: (module) => {
    const id = generateId();
    const conversation: AgentConversation = {
      id,
      title: 'New conversation',
      messages: [],
      module,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((s) => {
      const updated = [conversation, ...s.conversations].slice(0, MAX_CONVERSATIONS);
      persistState({
        conversations: updated,
        currentConversationId: id,
        panelSize: s.panelSize,
      });
      return { conversations: updated, currentConversationId: id };
    });

    return id;
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id });
    const s = get();
    persistState({
      conversations: s.conversations,
      currentConversationId: id,
      panelSize: s.panelSize,
    });
  },

  deleteConversation: (id) => {
    set((s) => {
      const updated = s.conversations.filter((c) => c.id !== id);
      const nextId =
        s.currentConversationId === id
          ? updated[0]?.id ?? null
          : s.currentConversationId;
      persistState({
        conversations: updated,
        currentConversationId: nextId,
        panelSize: s.panelSize,
      });
      return { conversations: updated, currentConversationId: nextId };
    });
  },

  clearAllConversations: () => {
    set({ conversations: [], currentConversationId: null });
    persistState({
      conversations: [],
      currentConversationId: null,
      panelSize: get().panelSize,
    });
  },

  // -- Message actions --------------------------------------------------------

  addUserMessage: (content, module) => {
    const s = get();
    let convId = s.currentConversationId;

    // Auto-create a conversation if none exists
    if (!convId || !s.conversations.find((c) => c.id === convId)) {
      convId = get().createConversation(module);
    }

    const message: AgentMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      contentType: 'text',
      module,
    };

    set((state) => {
      const updated = state.conversations.map((c) => {
        if (c.id !== convId) return c;
        const isFirst = c.messages.filter((m) => m.role === 'user').length === 0;
        return {
          ...c,
          title: isFirst ? titleFromMessage(content) : c.title,
          messages: [...c.messages, message],
          updatedAt: Date.now(),
        };
      });

      persistState({
        conversations: updated,
        currentConversationId: convId,
        panelSize: state.panelSize,
      });

      return { conversations: updated };
    });
  },

  addAgentMessage: (content, contentType = 'text') => {
    const s = get();
    const convId = s.currentConversationId;
    if (!convId) return;

    const message: AgentMessage = {
      id: generateId(),
      role: 'agent',
      content,
      timestamp: Date.now(),
      contentType,
    };

    set((state) => {
      const updated = state.conversations.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: [...c.messages, message],
          updatedAt: Date.now(),
        };
      });

      persistState({
        conversations: updated,
        currentConversationId: convId,
        panelSize: state.panelSize,
      });

      return { conversations: updated, isTyping: false };
    });
  },

  setIsTyping: (typing) => set({ isTyping: typing }),

  setHasProactiveInsight: (has) => set({ hasProactiveInsight: has }),

  // -- Selectors --------------------------------------------------------------

  getCurrentConversation: () => {
    const s = get();
    return s.conversations.find((c) => c.id === s.currentConversationId) ?? null;
  },
}));
