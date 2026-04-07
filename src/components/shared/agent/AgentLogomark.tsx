/**
 * AgentLogomark — Official Agent logomark (MirrorWorks brand SVG).
 * Source: Agent_Logomark.svg — square 500×500 artwork; `size` is width and height.
 */

import React from 'react';
import { cn } from '@/components/ui/utils';

export const AGENT_LOGOMARK_VIEWBOX = '0 0 500 500';

/** Shell path from Agent_Logomark.svg */
export const AGENT_SHELL_PATH_D =
  'M202.75,44.05h94.51c111.9,0,202.75,90.85,202.75,202.75v207.7c0,.8-.65,1.44-1.44,1.44H202.75C90.85,455.95,0,365.1,0,253.2v-6.4C0,134.9,90.85,44.05,202.75,44.05Z';

/** Dot fill from brand file (.cls-2) */
export const AGENT_DOT_FILL = '#1d190f';

export const AGENT_DOTS = [
  { cx: 121.09, cy: 250, r: 40.65 },
  { cx: 250, cy: 250, r: 40.65 },
  { cx: 378.91, cy: 250, r: 40.65 },
] as const;

interface AgentLogomarkProps {
  className?: string;
  /** Width and height in px (square). Defaults to 24. */
  size?: number;
}

export function AgentLogomark({ className, size = 24 }: AgentLogomarkProps) {
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
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={AGENT_DOT_FILL} />
      ))}
    </svg>
  );
}
