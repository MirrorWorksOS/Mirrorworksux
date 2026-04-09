/**
 * AISuggestion — Actionable AI suggestion card with Apply/Dismiss.
 * Used in Intelligence Hub tabs for manufacturing-specific AI recommendations.
 */

import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentLogomark } from '@/components/shared/agent/AgentLogomark';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { cn } from '../../ui/utils';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';

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
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  const confidenceColor = confidence >= 80 ? 'var(--mw-green)' : confidence >= 60 ? 'var(--mw-yellow-500)' : 'var(--neutral-500)';

  return (
    <SpotlightCard
      radius="rounded-[var(--shape-lg)]"
      spotlightColor="rgba(77, 221, 201, 0.12)"
      spotlightColorDark="rgba(125, 232, 217, 0.16)"
    >
    <Card className={cn(
      "overflow-hidden rounded-[var(--shape-lg)] border transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
      applied ? "border-[var(--mw-green)]/50 bg-[var(--mw-green)]/5" : "border-[var(--border)] bg-card"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--mw-purple)]/15 flex items-center justify-center shrink-0 mt-0.5">
            <AgentLogomark size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground">{title}</h4>
              <Badge className="border-0 text-[10px] px-1.5 py-0" style={{ backgroundColor: `${confidenceColor}20`, color: confidenceColor }}>
                {confidence}% confidence
              </Badge>
            </div>
            <div className="text-sm text-[var(--neutral-700)] leading-relaxed">{children}</div>

            {(source || impact) && expanded && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1">
                {source && <p className="text-xs text-[var(--neutral-500)]"><span className="font-medium">Source:</span> {source}</p>}
                {impact && <p className="text-xs text-[var(--neutral-500)]"><span className="font-medium">Impact:</span> {impact}</p>}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              {!applied ? (
                <>
                  <Button
                    size="sm"
                    className="h-8 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] text-xs"
                    onClick={() => { setApplied(true); onApply?.(); }}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-[var(--neutral-500)]"
                    onClick={() => { setDismissed(true); onDismiss?.(); }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Dismiss
                  </Button>
                </>
              ) : (
                <Badge className="border-0 bg-[var(--mw-green)]/15 text-[var(--mw-green)] text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Applied
                </Badge>
              )}
              {(source || impact) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-[var(--neutral-500)] ml-auto"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
    </SpotlightCard>
  );
}
