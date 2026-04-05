/**
 * AgentPanel — Slide-up chat panel container for the Agent assistant.
 *
 * Features:
 * - Two size states: compact (420px tall) and expanded (85vh)
 * - Module context badge in header
 * - Conversation history sidebar toggle
 * - Resize, minimize, and keyboard shortcut hints
 * - Positioned bottom-right, doesn't block sidebar
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  Bot,
  Minimize2,
  Maximize2,
  MessageSquare,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/components/ui/utils';
import { useAgentStore } from '@/store/agentStore';
import { AgentChat } from './AgentChat';
import { AgentConversationList } from './AgentConversationList';
import { getModuleLabel } from './agent-mock-responses';
import type { AgentModule } from './agent-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive the current module from the URL pathname. */
function getModuleFromPath(pathname: string): AgentModule {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();

  const moduleMap: Record<string, AgentModule> = {
    sell: 'sell',
    buy: 'buy',
    plan: 'plan',
    make: 'make',
    ship: 'ship',
    book: 'book',
    control: 'control',
  };

  return moduleMap[first] ?? 'dashboard';
}

// ---------------------------------------------------------------------------
// Panel Dimensions
// ---------------------------------------------------------------------------

const PANEL_SIZES = {
  compact: { width: 400, height: 520 },
  expanded: { width: 480, height: '85vh' as const },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgentPanel() {
  const location = useLocation();
  const [showHistory, setShowHistory] = useState(false);

  const {
    isOpen,
    panelSize,
    setOpen,
    togglePanelSize,
  } = useAgentStore();

  const currentModule = getModuleFromPath(location.pathname);
  const moduleLabel = getModuleLabel(currentModule);

  const dims = PANEL_SIZES[panelSize];

  // Close panel on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, setOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — subtle, click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{
              duration: 0.25,
              ease: [0.2, 0, 0, 1],
            }}
            className="fixed z-50 bottom-6 right-6 flex flex-col bg-[var(--card)] dark:bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
            style={{
              width: dims.width,
              height: dims.height,
              maxHeight: 'calc(100vh - 48px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)] dark:bg-[var(--card)]">
              <div className="flex items-center gap-2.5">
                {/* Agent icon */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--mw-purple)] to-[var(--mw-purple-600)] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">Agent</p>
                  <p className="text-[10px] text-[var(--mw-purple)] dark:text-[var(--mw-purple-light)] font-medium">
                    {moduleLabel} Module
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Conversation history */}
                <button
                  onClick={() => setShowHistory((s) => !s)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    showHistory
                      ? 'bg-[var(--mw-purple-50)] dark:bg-[var(--mw-purple)]/10 text-[var(--mw-purple)]'
                      : 'text-[var(--neutral-400)] hover:text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-200)]',
                  )}
                  aria-label="Conversation history"
                  title="Conversation history"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                {/* Resize */}
                <button
                  onClick={togglePanelSize}
                  className="p-1.5 rounded-lg text-[var(--neutral-400)] hover:text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-200)] transition-colors"
                  aria-label={panelSize === 'compact' ? 'Expand panel' : 'Compact panel'}
                  title={panelSize === 'compact' ? 'Expand' : 'Compact'}
                >
                  {panelSize === 'compact' ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--neutral-400)] hover:text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-200)] transition-colors"
                  aria-label="Close Agent"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-hidden">
              <AgentChat currentModule={currentModule} />

              {/* Conversation list overlay */}
              <AnimatePresence>
                {showHistory && (
                  <AgentConversationList
                    currentModule={currentModule}
                    onClose={() => setShowHistory(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
