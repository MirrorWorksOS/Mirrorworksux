/**
 * AgentLogomarkAnimated — Agent logomark with dot sweep while thinking.
 * Shell matches Agent_Logomark.svg; dots pulse teal on a #1d190f base.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/components/ui/utils';
import { useReducedMotion } from '@/components/shared/motion/use-reduced-motion';
import {
  AgentLogomark,
  AGENT_LOGOMARK_VIEWBOX,
  AGENT_SHELL_PATH_D,
  AGENT_DOTS,
  AGENT_DOT_FILL,
} from './AgentLogomark';

const TEAL = '#68c7bd';

const EASE_STANDARD = [0.2, 0, 0, 1] as const;

interface AgentLogomarkAnimatedProps {
  className?: string;
  /** Width and height in px (square). */
  size?: number;
  /** When false, renders static mark (same as AgentLogomark). */
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

  const dot0 = phase === 1 ? TEAL : AGENT_DOT_FILL;
  const dot1 = phase === 2 ? TEAL : AGENT_DOT_FILL;
  const dot2 = phase === 3 ? TEAL : AGENT_DOT_FILL;
  const fills = [dot0, dot1, dot2];

  return (
    <svg
      viewBox={AGENT_LOGOMARK_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d={AGENT_SHELL_PATH_D}
        fill="currentColor"
        className="text-[var(--mw-yellow-400)]"
      />
      {AGENT_DOTS.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          initial={false}
          animate={{ fill: fills[i] }}
          transition={{ duration: 0.4, ease: EASE_STANDARD }}
        />
      ))}
    </svg>
  );
}
