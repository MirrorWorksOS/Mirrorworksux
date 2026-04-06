/**
 * DockNav — macOS-style magnification effect for navigation icons.
 * Inspired by ReactBits Dock. Uses motion/react springs.
 *
 * Non-AI element: neutral colors only, no brand tint.
 */

import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from "react";
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
  children: React.ReactNode;
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
  children,
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
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mousePos, (val) => {
    const rect = ref.current?.getBoundingClientRect();
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

  const style = prefersReduced
    ? { width: baseItemSize, height: baseItemSize }
    : { width: size, height: size };

  return (
    <motion.div
      ref={ref}
      style={style}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors",
        isActive
          ? "bg-[var(--mw-yellow-400)]/10 dark:bg-white/10"
          : "hover:bg-neutral-100 dark:hover:bg-white/5",
        className,
      )}
      tabIndex={0}
      role="button"
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child,
      )}
    </motion.div>
  );
}

interface DockLabelProps {
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
  orientation: "vertical" | "horizontal";
}

function DockLabel({ children, isHovered, orientation }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
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
        "flex items-center gap-1",
        isVert ? "flex-col" : "flex-row",
        className,
      )}
      role="toolbar"
      aria-label="Navigation dock"
    >
      {items.map((item, index) => (
        <DockItem
          key={index}
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
        >
          <div className="flex items-center justify-center">{item.icon}</div>
          <DockLabel orientation={orientation}>{item.label}</DockLabel>
        </DockItem>
      ))}
    </div>
  );
}
