/**
 * AISuggestion — Actionable AI suggestion card with Apply/Dismiss.
 * Used in Intelligence Hub tabs for manufacturing-specific AI recommendations.
 */

import React, { useState } from 'react';
import { MirrorWorksAgentCard } from './MirrorWorksAgentCard';

interface AISuggestionProps {
  title: string;
  confidence: number; // 0-100
  source?: string;
  impact?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onDismiss?: () => void;
}

export function AISuggestion({ title, confidence, source, impact, children, onApply, onDismiss }: AISuggestionProps) {
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  if (dismissed) return null;

  const recommendationLabel =
    confidence >= 85 ? 'Recommended' : confidence >= 70 ? 'Worth reviewing' : 'Needs confirmation';

  const detailContent = (source || impact) ? (
    <div className="space-y-1">
      {source ? <p><span className="font-medium">Context:</span> {source}</p> : null}
      {impact ? <p><span className="font-medium">Expected impact:</span> {impact}</p> : null}
    </div>
  ) : undefined;

  return (
    <MirrorWorksAgentCard
      title={title}
      suggestion={<div className="text-sm leading-relaxed text-[var(--neutral-700)]">{children}</div>}
      tone={applied ? 'success' : confidence >= 80 ? 'opportunity' : confidence >= 60 ? 'neutral' : 'risk'}
      state={applied ? 'applied' : 'suggested'}
      statusLabel={recommendationLabel}
      primaryAction={!applied ? {
        label: 'Apply',
        onClick: () => {
          setApplied(true);
          onApply?.();
        },
      } : undefined}
      secondaryAction={!applied ? {
        label: 'Dismiss',
        onClick: () => {
          setDismissed(true);
          onDismiss?.();
        },
      } : undefined}
      detailContent={detailContent}
      detailLabel="Context"
      evidenceLevel={detailContent ? 'expandable' : 'hidden'}
      statusText={applied ? 'Applied to this workflow' : undefined}
    />
  );
}
