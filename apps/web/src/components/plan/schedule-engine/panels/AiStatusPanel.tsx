/**
 * AI status stepper anchored top-right while the auto-schedule run is in
 * progress. Uses the AI teal accent (hsl(172 68% 58%)) and the shared
 * `.ai-card-glow--animating` halo to signal "AI is working" — never yellow.
 */
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

import { AgentLogomarkAnimated } from '@/components/shared/agent/AgentLogomarkAnimated';

import { AI_STEPS } from '../constants';

const AI_TEAL = 'hsl(172 68% 58%)';

interface AiStatusPanelProps {
  visible: boolean;
  currentStepIndex: number;
  onCancel: () => void;
}

export function AiStatusPanel({ visible, currentStepIndex, onCancel }: AiStatusPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
          className="ai-card-glow ai-card-glow--animating fixed right-8 top-24 z-50 w-[360px] rounded-[var(--shape-lg)] bg-card p-5"
        >
          <header className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <AgentLogomarkAnimated size={22} animating />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: AI_TEAL }}>
                  Auto-schedule
                </p>
                <p className="mt-0.5 text-sm text-[var(--neutral-600)]">Sequencing now</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] font-medium text-[var(--neutral-500)] hover:text-[var(--neutral-900)]"
            >
              Cancel
            </button>
          </header>

          <ol className="mt-4 space-y-3">
            {AI_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    {isDone ? (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: AI_TEAL }}>
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                    ) : isActive ? (
                      <span className="relative inline-flex h-3 w-3 items-center justify-center">
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          style={{ backgroundColor: AI_TEAL }}
                        />
                        <span
                          className="relative inline-flex h-3 w-3 rounded-full"
                          style={{ backgroundColor: AI_TEAL }}
                        />
                      </span>
                    ) : (
                      <span className="inline-flex h-3 w-3 rounded-full bg-[var(--neutral-200)]" />
                    )}
                  </span>
                  <span
                    className={`text-sm leading-snug ${
                      isActive
                        ? 'font-medium text-[var(--neutral-900)]'
                        : isDone
                          ? 'text-[var(--neutral-400)]'
                          : 'text-[var(--neutral-700)]'
                    }`}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
