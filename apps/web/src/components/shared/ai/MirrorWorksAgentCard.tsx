import React from 'react';
import { ChevronDown, ChevronUp, CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { BorderGlow } from '@/components/shared/surfaces/BorderGlow';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { AgentLogomarkAnimated } from '@/components/shared/agent/AgentLogomarkAnimated';

export type AgentCardTone = 'neutral' | 'opportunity' | 'risk' | 'success';
export type AgentSurfaceState =
  | 'idle'
  | 'loading'
  | 'streaming'
  | 'suggested'
  | 'applied'
  | 'dismissed'
  | 'needs_review'
  | 'error';
export type AgentEvidenceLevel = 'hidden' | 'expandable' | 'always-visible';
export type AgentBrandVariant = 'default' | 'compact';

export interface AgentPrimaryAction {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface AgentReviewItem {
  id: string;
  title: string;
  summary: string;
  status: string;
  source: string;
  detail?: React.ReactNode;
}

export interface AgentEvidenceProps {
  level?: AgentEvidenceLevel;
  content?: React.ReactNode;
}

export interface AgentCardProps {
  title: string;
  suggestion: React.ReactNode;
  primaryAction?: AgentPrimaryAction;
  secondaryAction?: AgentPrimaryAction;
  tone?: AgentCardTone;
  state?: AgentSurfaceState;
  brandVariant?: AgentBrandVariant;
  detailContent?: React.ReactNode;
  evidenceLevel?: AgentEvidenceLevel;
  statusLabel?: string;
  statusText?: string;
  detailLabel?: string;
  headerAction?: React.ReactNode;
  className?: string;
}

/**
 * Tone communicates intent via the status chip only — no border stroke on the
 * card itself. The BorderGlow provides the sole edge treatment (matching the
 * app-level AI search bar) so the card doesn't end up with a double outline.
 */
const TONE_STYLES: Record<AgentCardTone, { chip: string; icon: React.ElementType }> = {
  neutral: {
    chip: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
    icon: CircleAlert,
  },
  opportunity: {
    chip: 'bg-[var(--mw-info)]/10 text-[var(--mw-info)]',
    icon: CircleCheck,
  },
  risk: {
    chip: 'bg-[var(--mw-warning)]/12 text-[var(--mw-yellow-700)] dark:text-[var(--mw-yellow-400)]',
    icon: TriangleAlert,
  },
  success: {
    chip: 'bg-[var(--mw-green)]/12 text-[var(--mw-green)]',
    icon: CircleCheck,
  },
};

function defaultStatusLabel(state: AgentSurfaceState): string | undefined {
  switch (state) {
    case 'loading':
      return 'Processing';
    case 'streaming':
      return 'Updating';
    case 'applied':
      return 'Applied';
    case 'needs_review':
      return 'Needs review';
    case 'error':
      return 'Attention needed';
    default:
      return undefined;
  }
}

export function MirrorWorksAgentCard({
  title,
  suggestion,
  primaryAction,
  secondaryAction,
  tone = 'neutral',
  state = 'suggested',
  brandVariant = 'default',
  detailContent,
  evidenceLevel = 'hidden',
  statusLabel,
  statusText,
  detailLabel = 'Details',
  headerAction,
  className,
}: AgentCardProps) {
  const [expanded, setExpanded] = React.useState(evidenceLevel === 'always-visible');
  const toneStyle = TONE_STYLES[tone];
  const ToneIcon = toneStyle.icon;
  const resolvedStatusLabel = statusLabel ?? defaultStatusLabel(state);
  const isAnimated = state === 'loading' || state === 'streaming';
  const canToggleDetail = evidenceLevel === 'expandable' && detailContent;
  const showDetail = Boolean(detailContent) && (evidenceLevel === 'always-visible' || expanded);

  return (
    <SpotlightCard
      radius="rounded-[var(--shape-lg)]"
      overflow="visible"
      className={cn('min-h-0', className)}
      spotlightColor="rgba(77, 221, 201, 0.07)"
      spotlightColorDark="rgba(125, 232, 217, 0.1)"
    >
      {/* Edge glow matches the app-level AI search bar (AiCommandBar) at +15%
          intensity so the card reads as a distinctive agent surface without a
          separate stroke. DO NOT add `border` to the inner div — that's the
          double-stroke bug we're avoiding. */}
      <BorderGlow
        borderRadius={16}
        edgeSensitivity={10}
        glowRadius={22}
        glowIntensity={0.221}
        coneSpread={30}
        fillOpacity={0.152}
        animated={isAnimated}
        className="bg-card"
      >
        <div className={cn('rounded-[var(--shape-lg)] bg-card p-4')}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 pt-0.5">
              <AgentLogomarkAnimated size={brandVariant === 'compact' ? 18 : 22} animating={isAnimated} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--neutral-500)]">
                      MirrorWorks Agent
                    </span>
                    {resolvedStatusLabel && (
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', toneStyle.chip)}>
                        <ToneIcon className="h-3 w-3" />
                        {resolvedStatusLabel}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{title}</h4>
                </div>
                {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
              </div>

              <div className="text-sm leading-relaxed text-[var(--neutral-600)]">{suggestion}</div>

              {showDetail && detailContent && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-3 text-xs leading-relaxed text-[var(--neutral-600)]"
                >
                  {detailContent}
                </motion.div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {primaryAction ? (
                  <Button
                    size="sm"
                    className="h-9 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
                    disabled={primaryAction.disabled || primaryAction.loading}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.loading ? 'Working…' : primaryAction.label}
                  </Button>
                ) : null}
                {secondaryAction ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 text-[var(--neutral-500)]"
                    disabled={secondaryAction.disabled || secondaryAction.loading}
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.loading ? 'Working…' : secondaryAction.label}
                  </Button>
                ) : null}
                {canToggleDetail ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-9 gap-1 text-[var(--neutral-500)]"
                    onClick={() => setExpanded((prev) => !prev)}
                  >
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {expanded ? `Hide ${detailLabel.toLowerCase()}` : `Show ${detailLabel.toLowerCase()}`}
                  </Button>
                ) : null}
                {!canToggleDetail && statusText ? (
                  <span className="ml-auto text-xs text-[var(--neutral-400)]">{statusText}</span>
                ) : null}
              </div>

              {canToggleDetail && statusText ? (
                <div className="mt-1 text-xs text-[var(--neutral-400)]">{statusText}</div>
              ) : null}
            </div>
          </div>
        </div>
      </BorderGlow>
    </SpotlightCard>
  );
}
