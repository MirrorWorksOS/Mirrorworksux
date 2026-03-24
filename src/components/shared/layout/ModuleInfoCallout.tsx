/**
 * Informational callout — v2.0 flat card (white surface, neutral border, Mirage title).
 * Use for module intros, tips, and non-destructive notices. Not a full-width yellow strip.
 */

import React from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';

export type ModuleInfoCalloutProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  /** When false, only title + description are shown (no icon column). */
  showIcon?: boolean;
  /** Rendered inside the neutral icon well; defaults to Info. */
  icon?: React.ReactNode;
  /** Extra classes for the description wrapper (e.g. warning body colour). */
  descriptionClassName?: string;
  className?: string;
};

export function ModuleInfoCallout({
  title,
  description,
  showIcon = true,
  icon,
  descriptionClassName,
  className,
}: ModuleInfoCalloutProps) {
  const iconNode = icon ?? <Info className="w-5 h-5" />;

  return (
    <Card
      className={cn(
        'bg-white border border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)] p-6',
        className
      )}
    >
      {showIcon ? (
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--shape-lg)] bg-[var(--neutral-100)] text-[var(--mw-mirage)]"
            aria-hidden
          >
            {iconNode}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-2">{title}</h3>
            <div
              className={cn(
                'text-sm leading-relaxed text-muted-foreground',
                descriptionClassName
              )}
            >
              {description}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-2">{title}</h3>
          <div
            className={cn(
              'text-sm leading-relaxed text-muted-foreground',
              descriptionClassName
            )}
          >
            {description}
          </div>
        </div>
      )}
    </Card>
  );
}
