/**
 * DockNav — macOS-style magnification effect for navigation icons.
 * Inspired by ReactBits Dock. Uses motion/react springs.
 *
 * ── Why fixed slots? ────────────────────────────────────────────────────────
 * Earlier versions of this component animated each item's `width`/`height`
 * directly. That triggered a layout-shift feedback loop:
 *   1. The hovered icon grew → flex column re-flowed.
 *   2. Re-flow shifted every other icon's `getBoundingClientRect()` Y.
 *   3. The mouse-distance transform read those new positions next frame,
 *      recomputed targets, and the spring chased a moving goalpost.
 *   4. Net result: visible jitter on the icons next to the cursor, plus the
 *      tooltip slid sideways because it was anchored to the growing pill.
 *
 * The fix is the same trick the macOS dock uses internally: reserve a **fixed
 * slot** for every item at the maximum (magnification) size, and only animate
 * the inner pill inside the slot. The slot's rect never moves, so the distance
 * transform reads stable positions and the magnification stops oscillating.
 * The tooltip is anchored off the slot too so it stays put.
 *
 * Non-AI element: neutral colors only, no brand tint.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type SpringOptions,
} from "motion/react";
import { cn } from "@/components/ui/utils";
import { useReducedMotion } from "@/components/shared/motion/use-reduced-motion";

export interface DockItemData {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export interface DockNavProps {
  items: DockItemData[];
  className?: string;
  /** Max icon size on hover — default 56 */
  magnification?: number;
  /** Pixel radius for hover effect — default 140 */
  distance?: number;
  /** Default icon size — default 40 */
  baseItemSize?: number;
  /** Spring physics config */
  spring?: SpringOptions;
  /** Orientation — default "vertical" for sidebar */
  orientation?: "vertical" | "horizontal";
}

interface DockItemInternalProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
  className?: string;
  mousePos: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  magnification: number;
  baseItemSize: number;
  orientation: "vertical" | "horizontal";
  isActive?: boolean;
  prefersReduced: boolean;
}

function DockItem({
  icon,
  label,
  onClick,
  className,
  mousePos,
  spring,
  distance,
  magnification,
  baseItemSize,
  orientation,
  isActive,
  prefersReduced,
}: DockItemInternalProps) {
  // The ref lives on the FIXED slot, not on the growing pill, so the distance
  // transform always reads a stable rect. This is what kills the jitter.
  const slotRef = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mousePos, (val) => {
    const rect = slotRef.current?.getBoundingClientRect();
    if (!rect) return distance + 1;
    if (orientation === "vertical") {
      return val - rect.y - rect.height / 2;
    }
    return val - rect.x - rect.width / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, spring);

  const innerStyle = prefersReduced
    ? { width: baseItemSize, height: baseItemSize }
    : { width: size, height: size };

  return (
    <div
      ref={slotRef}
      // Slot is fixed at the max (magnification) size in BOTH axes so the
      // pill can grow inside it without nudging siblings. `pointer-events-none`
      // on the wrapper itself isn't needed — the inner pill handles all input.
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: magnification, height: magnification }}
    >
      <motion.div
        style={innerStyle}
        onHoverStart={() => isHovered.set(1)}
        onHoverEnd={() => isHovered.set(0)}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center rounded-xl cursor-pointer transition-colors",
          isActive
            ? "bg-[var(--mw-yellow-400)]/10 dark:bg-white/10"
            : "hover:bg-neutral-100 dark:hover:bg-white/5",
          className,
        )}
        tabIndex={0}
        role="button"
      >
        {icon}
      </motion.div>
      {/* Label is a sibling of the growing pill, anchored off the fixed slot,
          so it doesn't slide around when the pill resizes. */}
      <DockLabel isHovered={isHovered} orientation={orientation}>
        {label}
      </DockLabel>
    </div>
  );
}

interface DockLabelProps {
  children: React.ReactNode;
  isHovered: MotionValue<number>;
  orientation: "vertical" | "horizontal";
}

function DockLabel({ children, isHovered, orientation }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  const isVert = orientation === "vertical";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: isVert ? -4 : 0, y: isVert ? 0 : -4 }}
          animate={{ opacity: 1, x: isVert ? 8 : 0, y: isVert ? 0 : -10 }}
          exit={{ opacity: 0, x: isVert ? -4 : 0, y: isVert ? 0 : -4 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-md",
            isVert ? "left-full top-1/2 -translate-y-1/2" : "bottom-full left-1/2 -translate-x-1/2",
          )}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockNav({
  items,
  className,
  magnification = 56,
  distance = 140,
  baseItemSize = 40,
  spring = { mass: 0.1, stiffness: 170, damping: 14 },
  orientation = "vertical",
}: DockNavProps) {
  const mousePos = useMotionValue(Infinity);
  const prefersReduced = useReducedMotion();
  const isVert = orientation === "vertical";

  return (
    <div
      onMouseMove={(e) => {
        mousePos.set(isVert ? e.clientY : e.clientX);
      }}
      onMouseLeave={() => mousePos.set(Infinity)}
      className={cn(
        // No gap — slots already include their own breathing room since they
        // are sized to `magnification`, not `baseItemSize`.
        "flex items-center",
        isVert ? "flex-col" : "flex-row",
        className,
      )}
      role="toolbar"
      aria-label="Navigation dock"
    >
      {items.map((item, index) => (
        <DockItem
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={item.onClick}
          className={item.className}
          mousePos={mousePos}
          spring={spring}
          distance={distance}
          magnification={magnification}
          baseItemSize={baseItemSize}
          orientation={orientation}
          isActive={item.isActive}
          prefersReduced={prefersReduced}
        />
      ))}
    </div>
  );
}
