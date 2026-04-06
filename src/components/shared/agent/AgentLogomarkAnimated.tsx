/**
 * AgentLogomarkAnimated — Agent mark with dot sweep (states 0→3) from brand SVGs.
 * State 0: all dots yellow. States 1–3: left, centre, right dot highlights (#68c7bd).
 * Colours match mirrorworks_agent_state_*.svg; shell matches AgentLogomark.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/components/ui/utils';
import { useReducedMotion } from '@/components/shared/motion/use-reduced-motion';
import { AgentLogomark } from './AgentLogomark';

const YELLOW = '#ffd04b';
const TEAL = '#68c7bd';

const RATIO = 480.89 / 396.15;

const EASE_STANDARD = [0.2, 0, 0, 1] as const;

interface AgentLogomarkAnimatedProps {
  className?: string;
  /** Height in px — width scales proportionally. */
  size?: number;
  /** When false, renders static state 0 (same as AgentLogomark). */
  animating?: boolean;
}

export function AgentLogomarkAnimated({
  className,
  size = 24,
  animating = true,
}: AgentLogomarkAnimatedProps) {
  const prefersReducedMotion = useReducedMotion();
  const staticMark = prefersReducedMotion || !animating;

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (staticMark) {
      setPhase(0);
      return;
    }
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 420);
    return () => window.clearInterval(id);
  }, [staticMark]);

  if (staticMark) {
    return <AgentLogomark className={className} size={size} />;
  }

  const dot0 = phase === 1 ? TEAL : YELLOW;
  const dot1 = phase === 2 ? TEAL : YELLOW;
  const dot2 = phase === 3 ? TEAL : YELLOW;

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
        className="text-[var(--mw-mirage)]"
      />
      <motion.circle
        cx="145.3"
        cy="198.08"
        r="30"
        initial={false}
        animate={{ fill: dot0 }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
      />
      <motion.circle
        cx="240.45"
        cy="198.08"
        r="30"
        initial={false}
        animate={{ fill: dot1 }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
      />
      <motion.circle
        cx="335.59"
        cy="198.08"
        r="30"
        initial={false}
        animate={{ fill: dot2 }}
        transition={{ duration: 0.4, ease: EASE_STANDARD }}
      />
    </svg>
  );
}
