/**
 * AgentLogomark — Custom SVG logomark for the Agent AI assistant.
 * Replaces placeholder Lucide icons with the official Agent brand mark.
 *
 * The original artwork is 480.89 × 396.15 — we preserve this ratio.
 * `size` sets the height; width scales proportionally.
 */

import React from 'react';
import { cn } from '@/components/ui/utils';

interface AgentLogomarkProps {
  className?: string;
  /** Height in px — width scales proportionally (ratio ≈ 1.214:1). Defaults to 24. */
  size?: number;
}

const RATIO = 480.89 / 396.15; // ≈ 1.214

export function AgentLogomark({ className, size = 24 }: AgentLogomarkProps) {
  return (
    <svg
      viewBox="0 0 480.89 396.15"
      xmlns="http://www.w3.org/2000/svg"
      width={Math.round(size * RATIO * 100) / 100}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M195,0h90.89C393.52,0,480.89,87.38,480.89,195v199.77c0,.77-.62,1.39-1.39,1.39H195C87.38,396.15,0,308.78,0,201.15v-6.15C0,87.38,87.38,0,195,0Z"
        fill="currentColor"
        className="text-[var(--mw-yellow-400)]"
      />
      <path
        d="M202.41,50h87.71c75.6,0,136.97,61.37,136.97,136.97v159.18h-230.36c-78.88,0-142.93-64.04-142.93-142.93v-4.62c0-82.02,66.59-148.61,148.61-148.61Z"
        fill="currentColor"
        className="text-[#1d190f] dark:text-[#1d190f]"
      />
      <circle cx="145.3" cy="198.08" r="30" fill="currentColor" className="text-[var(--mw-yellow-400)]" />
      <circle cx="240.45" cy="198.08" r="30" fill="currentColor" className="text-[var(--mw-yellow-400)]" />
      <circle cx="335.59" cy="198.08" r="30" fill="currentColor" className="text-[var(--mw-yellow-400)]" />
    </svg>
  );
}
