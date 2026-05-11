/**
 * AgentEmailDraftCard — Renders a list of AI-drafted follow-up emails
 * for the "Chase late POs" Buy-module scenario.
 *
 * Each draft row collapses to recipient + subject + a "late by X days" chip.
 * Expanding reveals the full mock email body. A per-draft "Send" button fires
 * a toast and marks the draft as sent. A top-level "Send all" CTA sends every
 * outstanding draft at once.
 */

import React, { useState } from 'react';
import { ChevronDown, Mail, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/components/ui/utils';
import type { AgentEmailDraft } from './agent-types';

interface AgentEmailDraftCardProps {
  drafts: AgentEmailDraft[];
}

export function AgentEmailDraftCard({ drafts }: AgentEmailDraftCardProps) {
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const idFor = (d: AgentEmailDraft) => d.relatedPo;

  const handleSend = (draft: AgentEmailDraft) => {
    const id = idFor(draft);
    if (sentIds.has(id)) return;
    setSentIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast.success(`Email sent to ${draft.vendor}`);
  };

  const outstanding = drafts.filter((d) => !sentIds.has(idFor(d)));
  const handleSendAll = () => {
    if (outstanding.length === 0) return;
    setSentIds(new Set(drafts.map(idFor)));
    toast.success(`Sent ${outstanding.length} follow-up email${outstanding.length === 1 ? '' : 's'}`);
  };

  return (
    <div className="mt-2 rounded-xl border border-[var(--mw-agent-100)] dark:border-[var(--mw-agent)]/20 bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--mw-agent-100)] dark:border-[var(--mw-agent)]/20 bg-[var(--mw-agent-50)] dark:bg-[var(--mw-agent)]/10">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-[var(--mw-agent-600)] dark:text-[var(--mw-agent-light)] shrink-0" />
          <span className="text-[11px] font-medium text-[var(--mw-agent-600)] dark:text-[var(--mw-agent-light)] truncate">
            {drafts.length} draft{drafts.length === 1 ? '' : 's'} ready to send
          </span>
        </div>
        <button
          type="button"
          onClick={handleSendAll}
          disabled={outstanding.length === 0}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
            outstanding.length > 0
              ? 'bg-[var(--mw-agent)] text-white hover:bg-[var(--mw-agent-600)]'
              : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed',
          )}
        >
          <Send className="w-3 h-3" />
          Send all
        </button>
      </div>

      {/* Drafts list */}
      <ul className="divide-y divide-[var(--neutral-100)] dark:divide-[var(--neutral-200)]">
        {drafts.map((draft) => {
          const id = idFor(draft);
          const isSent = sentIds.has(id);
          const isExpanded = expandedId === id;
          return (
            <li key={id} className={cn('px-3 py-2.5 transition-colors', isSent && 'opacity-60')}>
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : id)}
                  className="flex-1 min-w-0 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Mail className="w-3 h-3 text-[var(--neutral-400)] shrink-0" />
                    <span className="text-[11px] text-[var(--neutral-500)] truncate">
                      {draft.to}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                        draft.lateByDays >= 5
                          ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                          : 'bg-[var(--mw-yellow-100)] text-[var(--mw-yellow-900)]',
                      )}
                    >
                      Late {draft.lateByDays}d
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        'text-[12px] font-medium text-foreground truncate',
                        isSent && 'line-through text-[var(--neutral-400)]',
                      )}
                    >
                      {draft.subject}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 ml-auto shrink-0 text-[var(--neutral-400)] transition-transform',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </div>
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pl-5 pr-1">
                      <p className="text-[11px] text-[var(--neutral-500)] mb-1">
                        <span className="font-medium text-[var(--neutral-600)] dark:text-[var(--neutral-500)]">
                          Vendor:
                        </span>{' '}
                        {draft.vendor}
                      </p>
                      <p className="text-[11px] text-[var(--neutral-500)] mb-2">
                        <span className="font-medium text-[var(--neutral-600)] dark:text-[var(--neutral-500)]">
                          Subject:
                        </span>{' '}
                        {draft.subject}
                      </p>
                      <div className="rounded-lg bg-[var(--neutral-50)] dark:bg-[var(--neutral-100)] p-2.5 mb-2">
                        <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-[var(--neutral-700)] dark:text-[var(--neutral-600)]">
                          {draft.body}
                        </p>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleSend(draft)}
                          disabled={isSent}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                            isSent
                              ? 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed'
                              : 'bg-[var(--mw-agent)] text-white hover:bg-[var(--mw-agent-600)]',
                          )}
                        >
                          <Send className="w-3 h-3" />
                          {isSent ? 'Sent' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
