/**
 * PillNav — canonical pill-shaped tab strip for dashboards, detail pages,
 * and any multi-section nav.
 *
 * Built on the base `Tabs` / `TabsList` / `TabsTrigger` primitives in
 * `@/components/ui/tabs`. Those primitives supply the motion-animated white
 * card indicator (spring, `layoutId`). PillNav layers on additional polish:
 *
 *   • Subtle hover lift on each pill (-1px translate)
 *   • Icon micro-animation when a tab becomes active (spring scale bump)
 *   • Count-badge entrance/exit via AnimatePresence with scale-spring
 *   • Optional `magnify` prop — macOS-dock-style cursor magnification
 *
 * The design is deliberately modular: each tab renders through an internal
 * `PillTrigger` component so individual behaviour (scale transforms, icon
 * animations, badge entrance) is easy to tweak in one place.
 *
 * Usage:
 *   <PillNav
 *     tabs={[
 *       { key: 'overview', label: 'Overview' },
 *       { key: 'quotes',   label: 'Quotes',     count: 2 },
 *       { key: 'activity', label: 'Activities', count: 4, icon: Activity },
 *     ]}
 *     value={tab}
 *     onValueChange={setTab}
 *     magnify                 // optional, default off
 *   />
 */

'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/components/ui/utils';

/**
 * Motion-wrapped TabsTrigger so we can bind a `MotionValue` to `style.scale`
 * for dock-style magnification. The underlying TabsTrigger forwards refs,
 * so Radix's roving-focus still works.
 */
const MotionTabsTrigger = motion.create(TabsTrigger);

export interface PillNavTab {
  key: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

export interface PillNavProps {
  tabs: PillNavTab[];
  value: string;
  onValueChange: (value: string) => void;
  /** Extra class on the outer `<Tabs>` wrapper. */
  className?: string;
  /** Extra class on the `<TabsList>` (the pill group container). */
  listClassName?: string;
  /** Extra class applied to every `<TabsTrigger>`. */
  triggerClassName?: string;
  /**
   * When true, pills scale up as the cursor approaches (macOS-dock style).
   * Default: false. Use sparingly — best on wall-display / hero nav bars.
   */
  magnify?: boolean;
  'aria-label'?: string;
}

/** Distance (px) from a pill's centre where magnification fades to zero. */
const MAGNIFY_REACH = 120;
/** Max additional scale factor at the centre of the magnify lens. */
const MAGNIFY_MAX = 0.14;

export function PillNav({
  tabs,
  value,
  onValueChange,
  className,
  listClassName,
  triggerClassName,
  magnify = false,
  ...rest
}: PillNavProps) {
  // Shared mouseX for dock magnification. Infinity = cursor outside bar.
  const mouseX = useMotionValue<number>(Number.POSITIVE_INFINITY);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!magnify) return;
      mouseX.set(e.clientX);
    },
    [magnify, mouseX],
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!magnify) return;
    mouseX.set(Number.POSITIVE_INFINITY);
  }, [magnify, mouseX]);

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn('flex w-full flex-col gap-0', className)}
    >
      <TabsList
        aria-label={rest['aria-label']}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'h-auto min-h-11 flex-wrap justify-start gap-1 p-1',
          listClassName,
        )}
      >
        {tabs.map((tab) => (
          <PillTrigger
            key={tab.key}
            tab={tab}
            isActive={value === tab.key}
            triggerClassName={triggerClassName}
            magnify={magnify}
            mouseX={mouseX}
          />
        ))}
      </TabsList>
    </Tabs>
  );
}

interface PillTriggerProps {
  tab: PillNavTab;
  isActive: boolean;
  triggerClassName?: string;
  magnify: boolean;
  mouseX: MotionValue<number>;
}

/**
 * Internal: one pill trigger. Owns the per-item motion state (magnify scale,
 * icon scale, count-badge entrance). Split out so each pill has its own
 * stable refs and motion values.
 */
function PillTrigger({
  tab,
  isActive,
  triggerClassName,
  magnify,
  mouseX,
}: PillTriggerProps) {
  const { key, label, count, icon: Icon } = tab;
  const ref = React.useRef<HTMLButtonElement>(null);

  // Distance from cursor to this pill's centre (x-axis only).
  const distance = useTransform(mouseX, (x) => {
    if (!Number.isFinite(x)) return Number.POSITIVE_INFINITY;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Number.POSITIVE_INFINITY;
    return x - bounds.x - bounds.width / 2;
  });

  // Distance → scale factor. Peak at 0; flat at ±MAGNIFY_REACH.
  const scaleTarget = useTransform(distance, (d) => {
    if (!magnify || !Number.isFinite(d)) return 1;
    const abs = Math.abs(d);
    if (abs >= MAGNIFY_REACH) return 1;
    const t = 1 - abs / MAGNIFY_REACH;
    return 1 + MAGNIFY_MAX * t;
  });

  // Smooth out with a spring so the lens glides instead of snapping.
  const scale = useSpring(scaleTarget, {
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  });

  return (
    <MotionTabsTrigger
      ref={ref}
      value={key}
      className={cn(
        // Subtle hover lift — cheap CSS, always on.
        'transition-transform duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
        'hover:-translate-y-[1px] active:translate-y-0',
        'gap-2 px-3 sm:px-4',
        triggerClassName,
      )}
      style={magnify ? { scale } : undefined}
    >
      {Icon ? (
        <motion.span
          initial={false}
          animate={{ scale: isActive ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="inline-flex shrink-0"
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </motion.span>
      ) : null}
      <span className="truncate">{label}</span>
      <AnimatePresence initial={false}>
        {count != null && count > 0 ? (
          <motion.span
            key={`count-${count}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className={cn(
              'ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0 text-xs tabular-nums',
              isActive
                ? 'bg-[var(--neutral-300)] text-foreground/80'
                : 'bg-[var(--neutral-200)] text-foreground/60',
            )}
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </MotionTabsTrigger>
  );
}
