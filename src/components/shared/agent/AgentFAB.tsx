/**
 * AgentFAB — Floating Action Button for the Agent AI assistant.
 *
 * Positioned bottom-right of the viewport. Shows a pulse/glow animation
 * when Agent has proactive insights. Click to toggle the Agent panel.
 * Includes keyboard shortcut (Cmd+J).
 */

import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/components/ui/utils';
import { useAgentStore } from '@/store/agentStore';
import { AgentPanel } from './AgentPanel';

export function AgentFAB() {
  const { isOpen, toggleOpen, hasProactiveInsight } = useAgentStore();

  // Global keyboard shortcut: Cmd+J to toggle Agent
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggleOpen();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleOpen]);

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.2, 0, 0, 1],
            }}
            className="fixed bottom-6 right-6 z-40"
          >
            {/* Pulse ring for proactive insight */}
            {hasProactiveInsight && (
              <span className="absolute inset-0 rounded-2xl">
                <span className="agent-fab-pulse absolute inset-0 rounded-2xl bg-[var(--mw-purple)]/30" />
              </span>
            )}

            <button
              onClick={toggleOpen}
              className={cn(
                'relative w-14 h-14 rounded-2xl',
                'bg-gradient-to-br from-[var(--mw-purple)] to-[var(--mw-purple-600)]',
                'flex items-center justify-center',
                'shadow-lg shadow-[var(--mw-purple)]/25',
                'hover:shadow-xl hover:shadow-[var(--mw-purple)]/30',
                'hover:scale-105 active:scale-95',
                'transition-all duration-200 ease-[var(--ease-standard)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-purple)] focus-visible:ring-offset-2',
              )}
              aria-label="Open Agent AI assistant"
              title="Agent (⌘J)"
            >
              <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />

              {/* Proactive insight badge */}
              {hasProactiveInsight && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--mw-yellow-400)] border-2 border-[var(--card)] flex items-center justify-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                </motion.span>
              )}
            </button>

            {/* Shortcut hint — only shown initially, fades after interaction */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--card)] dark:bg-[var(--card)] border border-[var(--border)] shadow-md text-[11px] text-[var(--neutral-500)]">
                <kbd className="px-1 py-0.5 rounded bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[10px] font-medium">
                  ⌘
                </kbd>
                <kbd className="px-1 py-0.5 rounded bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[10px] font-medium">
                  J
                </kbd>
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AgentPanel />
    </>
  );
}
