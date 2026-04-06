/**
 * AgentConversationList — Collapsible sidebar within the Agent panel
 * showing conversation history with actions to create, switch, and delete.
 */

import React from 'react';
import { MessageSquarePlus, Trash2, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/components/ui/utils';
import { useAgentStore } from '@/store/agentStore';
import type { AgentModule } from './agent-types';

interface AgentConversationListProps {
  currentModule: AgentModule;
  onClose: () => void;
}

export function AgentConversationList({ currentModule, onClose }: AgentConversationListProps) {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
    clearAllConversations,
  } = useAgentStore();

  const handleNewChat = () => {
    createConversation(currentModule);
    onClose();
  };

  const handleSelect = (id: string) => {
    setCurrentConversation(id);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const handleClearAll = () => {
    if (conversations.length === 0) return;
    clearAllConversations();
  };

  // Group conversations: today, this week, older
  const now = Date.now();
  const dayMs = 86400000;
  const weekMs = dayMs * 7;

  const today = conversations.filter((c) => now - c.updatedAt < dayMs);
  const thisWeek = conversations.filter(
    (c) => now - c.updatedAt >= dayMs && now - c.updatedAt < weekMs,
  );
  const older = conversations.filter((c) => now - c.updatedAt >= weekMs);

  const renderGroup = (label: string, items: typeof conversations) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--neutral-400)] px-3 mb-1.5">
          {label}
        </p>
        <div className="space-y-0.5">
          {items.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left group',
                'transition-colors duration-150',
                conv.id === currentConversationId
                  ? 'bg-[var(--mw-agent-50)] dark:bg-[var(--mw-agent)]/10 text-foreground'
                  : 'text-[var(--neutral-600)] dark:text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-200)]',
              )}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 opacity-50" />
              <span className="flex-1 text-xs truncate">{conv.title}</span>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--neutral-200)] dark:hover:bg-[var(--neutral-300)] transition-opacity"
                aria-label="Delete conversation"
              >
                <X className="w-3 h-3 text-[var(--neutral-400)]" />
              </button>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="absolute inset-0 z-10 bg-[var(--card)] dark:bg-[var(--card)] flex flex-col rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <p className="text-sm font-medium text-foreground">Conversations</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-200)] transition-colors"
          aria-label="Close conversation list"
        >
          <X className="w-4 h-4 text-[var(--neutral-500)]" />
        </button>
      </div>

      {/* New chat button */}
      <div className="px-3 py-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--mw-agent)] hover:bg-[var(--mw-agent-600)] text-white text-xs font-medium transition-colors"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-1 py-1" style={{ scrollbarWidth: 'none' }}>
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-[var(--neutral-300)] dark:text-[var(--neutral-400)] mb-2" />
            <p className="text-xs text-[var(--neutral-400)]">No conversations yet</p>
            <p className="text-[10px] text-[var(--neutral-300)] dark:text-[var(--neutral-500)] mt-1">
              Start chatting with Agent
            </p>
          </div>
        ) : (
          <>
            {renderGroup('Today', today)}
            {renderGroup('This Week', thisWeek)}
            {renderGroup('Older', older)}
          </>
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] text-[var(--neutral-400)] hover:text-[var(--mw-error)] hover:bg-[var(--mw-error-light)] dark:hover:bg-[var(--mw-error)]/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear All History
          </button>
        </div>
      )}
    </motion.div>
  );
}
