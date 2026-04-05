/**
 * AgentChat — Core chat interface for the Agent AI assistant.
 *
 * Features:
 * - Context-aware module badge in header
 * - Message thread (user right, Agent left)
 * - Quick action chips
 * - Typing indicator
 * - Input bar with Enter/Shift+Enter support
 * - Empty state with welcome message
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/components/ui/utils';
import { useAgentStore } from '@/store/agentStore';
import { AgentMessageBubble, AgentTypingIndicator } from './AgentMessage';
import {
  getAgentResponse,
  getWelcomeMessage,
  getQuickActions,
} from './agent-mock-responses';
import type { AgentModule } from './agent-types';

interface AgentChatProps {
  currentModule: AgentModule;
}

export function AgentChat({ currentModule }: AgentChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevModuleRef = useRef<AgentModule>(currentModule);

  const {
    isTyping,
    setIsTyping,
    addUserMessage,
    addAgentMessage,
    getCurrentConversation,
    setHasProactiveInsight,
  } = useAgentStore();

  const conversation = getCurrentConversation();
  const messages = conversation?.messages ?? [];
  const quickActions = getQuickActions(currentModule);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Acknowledge module context change
  useEffect(() => {
    if (prevModuleRef.current !== currentModule && conversation && messages.length > 0) {
      const prevModule = prevModuleRef.current;
      prevModuleRef.current = currentModule;

      // Add a context-change message from Agent
      const moduleLabels: Record<string, string> = {
        dashboard: 'Dashboard',
        sell: 'Sell',
        buy: 'Buy',
        plan: 'Plan',
        make: 'Make',
        ship: 'Ship',
        book: 'Book',
        control: 'Control',
      };

      const newLabel = moduleLabels[currentModule] || currentModule;
      setIsTyping(true);
      setTimeout(() => {
        addAgentMessage(
          `I see you've switched to the **${newLabel}** module. I'll adjust my context accordingly. How can I help you here?`
        );
      }, 600);
    } else {
      prevModuleRef.current = currentModule;
    }
  }, [currentModule]);

  // Send message handler
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    // Dismiss proactive insight pulse
    setHasProactiveInsight(false);

    // Add user message
    addUserMessage(trimmed, currentModule);
    setInputValue('');

    // Simulate Agent response
    setIsTyping(true);
    const delay = 800 + Math.random() * 1200; // 0.8-2s delay

    setTimeout(() => {
      const { content, contentType } = getAgentResponse(trimmed, currentModule);
      addAgentMessage(content, contentType);
    }, delay);
  }, [inputValue, isTyping, currentModule, addUserMessage, addAgentMessage, setIsTyping, setHasProactiveInsight]);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action handler
  const handleQuickAction = (prompt: string) => {
    setInputValue('');
    setHasProactiveInsight(false);
    addUserMessage(prompt, currentModule);

    setIsTyping(true);
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const { content, contentType } = getAgentResponse(prompt, currentModule);
      addAgentMessage(content, contentType);
    }, delay);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto py-4 space-y-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {isEmpty ? (
          <EmptyState
            currentModule={currentModule}
            quickActions={quickActions}
            onQuickAction={handleQuickAction}
          />
        ) : (
          <>
            {messages.map((msg, i) => (
              <AgentMessageBubble key={msg.id} message={msg} index={i} />
            ))}
            <AnimatePresence>
              {isTyping && <AgentTypingIndicator />}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions — show only when there are messages and not typing */}
      {!isEmpty && !isTyping && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.slice(0, 2).map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className="px-3 py-1.5 text-[11px] rounded-full border border-[var(--mw-purple-100)] dark:border-[var(--mw-purple)]/20 text-[var(--mw-purple)] dark:text-[var(--mw-purple-light)] bg-[var(--mw-purple-50)] dark:bg-[var(--mw-purple)]/5 hover:bg-[var(--mw-purple-100)] dark:hover:bg-[var(--mw-purple)]/10 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="px-3 pb-3 pt-1">
        <div className="flex items-end gap-2 bg-[var(--input-background)] dark:bg-[var(--input-background)] border border-[var(--border)] rounded-2xl px-3 py-2 focus-within:border-[var(--mw-purple)] dark:focus-within:border-[var(--mw-purple-light)] focus-within:ring-1 focus-within:ring-[var(--mw-purple)]/20 transition-colors">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Agent anything..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[13px] leading-relaxed text-foreground placeholder:text-[var(--neutral-400)] max-h-[120px]"
            style={{ height: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              'p-2 rounded-xl transition-all shrink-0',
              inputValue.trim() && !isTyping
                ? 'bg-[var(--mw-purple)] text-white hover:bg-[var(--mw-purple-600)] shadow-sm'
                : 'text-[var(--neutral-300)] dark:text-[var(--neutral-400)] cursor-not-allowed',
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--neutral-400)] text-center mt-1.5">
          Agent is an AI assistant. Responses are simulated for this prototype.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({
  currentModule,
  quickActions,
  onQuickAction,
}: {
  currentModule: AgentModule;
  quickActions: ReturnType<typeof getQuickActions>;
  onQuickAction: (prompt: string) => void;
}) {
  const welcomeText = getWelcomeMessage(currentModule);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Agent Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--mw-purple)] to-[var(--mw-purple-600)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--mw-purple)]/20"
      >
        <Sparkles className="w-7 h-7 text-white" strokeWidth={1.5} />
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-center mb-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2">Agent</h3>
        <p className="text-xs text-[var(--neutral-500)] leading-relaxed max-w-[280px]">
          Your manufacturing AI assistant. Ask about your operations, get insights, and make decisions faster.
        </p>
      </motion.div>

      {/* Quick Action Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-full space-y-2"
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-400)] text-center mb-2">
          Suggested Prompts
        </p>
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onQuickAction(action.prompt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--mw-purple-100)] dark:hover:border-[var(--mw-purple)]/20 hover:bg-[var(--mw-purple-50)] dark:hover:bg-[var(--mw-purple)]/5 transition-colors group"
          >
            <span className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-500)] group-hover:text-[var(--mw-purple)] dark:group-hover:text-[var(--mw-purple-light)] transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
