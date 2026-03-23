'use client';

import * as React from 'react';
import {
  useAnimation,
  type AnimationControls,
  type Variants,
} from 'motion/react';

// ── Context ───────────────────────────────────────────────────
interface AnimateIconContextValue {
  controls: AnimationControls;
}

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(
  null,
);

export function useAnimateIconContext() {
  const ctx = React.useContext(AnimateIconContext);
  if (!ctx) throw new Error('useAnimateIconContext must be used inside IconWrapper');
  return ctx;
}

// ── Types ─────────────────────────────────────────────────────
export interface IconProps<V extends string = string>
  extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  size?: number | string;
  variant?: V;
  animateOnHover?: boolean;
  animateOnTap?: boolean;
}

// ── getVariants helper ────────────────────────────────────────
export function getVariants<
  A extends Record<string, Record<string, Variants>>,
>(
  animations: A,
  variant?: string,
): Record<string, Variants> {
  const key = variant ?? Object.keys(animations)[0]!;
  return (animations as any)[key] ?? (animations as any)[Object.keys(animations)[0]!];
}

// ── IconWrapper ───────────────────────────────────────────────
interface IconWrapperProps<V extends string = string> extends IconProps<V> {
  icon: React.ComponentType<IconProps<V>>;
}

export function IconWrapper<V extends string = string>({
  icon: Icon,
  animateOnHover,
  animateOnTap,
  ...props
}: IconWrapperProps<V>) {
  const controls = useAnimation();

  const handleStart = React.useCallback(() => {
    controls.start('animate');
  }, [controls]);

  const handleEnd = React.useCallback(() => {
    controls.start('initial');
  }, [controls]);

  return (
    <AnimateIconContext.Provider value={{ controls }}>
      <span
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={animateOnHover ? handleStart : undefined}
        onMouseLeave={animateOnHover ? handleEnd : undefined}
        onMouseDown={animateOnTap ? handleStart : undefined}
        onMouseUp={animateOnTap ? handleEnd : undefined}
      >
        <Icon {...props} />
      </span>
    </AnimateIconContext.Provider>
  );
}
