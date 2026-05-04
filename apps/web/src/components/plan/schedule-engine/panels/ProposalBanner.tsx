/**
 * AI proposal banner. Wraps MirrorWorksAgentCard so the surface picks up the
 * teal `.ai-card-glow` halo, the Agent logomark, and the canonical primary /
 * secondary action layout. AI surfaces never use a yellow card background —
 * teal glow signals "this is AI", yellow is reserved for primary CTAs.
 */
import { MirrorWorksAgentCard } from '@/components/shared/ai/MirrorWorksAgentCard';

interface ProposalBannerProps {
  summary: string;
  onApply: () => void;
  onDiscard: () => void;
}

export function ProposalBanner({ summary, onApply, onDiscard }: ProposalBannerProps) {
  return (
    <MirrorWorksAgentCard
      title="AI proposal ready"
      suggestion={summary}
      tone="opportunity"
      state="needs_review"
      statusLabel="Needs review"
      primaryAction={{ label: 'Apply schedule', onClick: onApply }}
      secondaryAction={{ label: 'Discard', onClick: onDiscard }}
    />
  );
}
