'use client';

/**
 * Subtle pointer-following glare overlay (React Bits–style).
 * @see https://www.reactbits.dev/animations/glare-hover
 */
import * as React from 'react';
import { cn } from '@/components/ui/utils';
import { useReducedMotion } from '@/components/shared/motion/use-reduced-motion';

export interface GlareHoverProps {
  children: React.ReactNode;
  className?: string;
  /** Radial gradient circle size in px */
  glareSize?: number;
  /** Maximum opacity of the glare when hovered */
  peakOpacity?: number;
}

export function GlareHover({
  children,
  className,
  glareSize = 380,
  peakOpacity = 0.11,
}: GlareHoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const reducedMotion = useReducedMotion();

  const onMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({
        x: ((e.clientX - r.left) / Math.max(r.width, 1)) * 100,
        y: ((e.clientY - r.top) / Math.max(r.height, 1)) * 100,
      });
    },
    [reducedMotion],
  );

  const onLeave = React.useCallback(() => {
    setPos({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={ref}
      className={cn('group/glare relative overflow-hidden rounded-[inherit]', className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-[var(--duration-medium1)] ease-[var(--ease-standard)] group-hover/glare:opacity-100"
          style={{
            background: `radial-gradient(${glareSize}px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,${peakOpacity * 2.2}), rgba(255,255,255,${peakOpacity * 0.35}) 38%, transparent 62%)`,
          }}
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
