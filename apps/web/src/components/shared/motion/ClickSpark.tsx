/**
 * ClickSpark — subtle particle burst on click.
 * Inspired by ReactBits ClickSpark. Canvas-free: spawns tiny divs with CSS animation.
 */

import {
  useRef,
  useCallback,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "@/components/ui/utils";
import { useReducedMotion } from "./use-reduced-motion";

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export interface ClickSparkProps {
  children: ReactNode;
  /** Spark color — default white */
  sparkColor?: string;
  /** Number of sparks — default 8 */
  sparkCount?: number;
  /** Burst radius in px — default 20 */
  sparkRadius?: number;
  /** Duration in ms — default 400 */
  duration?: number;
  className?: string;
  /**
   * Caller-provided onClick. Composed with the spark trigger so this
   * wrapper plays nicely with Radix `asChild` triggers (Popover,
   * Dropdown, etc.) — Radix passes its own onClick via asChild and we
   * don't want to clobber it.
   */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

let sparkId = 0;

export function ClickSpark({
  children,
  sparkColor = "rgba(160, 160, 160, 0.6)",
  sparkCount = 8,
  sparkRadius = 20,
  duration = 400,
  className,
  onClick,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const prefersReduced = useReducedMotion();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Always run the caller's onClick first so it isn't swallowed,
      // even when reduced motion is on.
      onClick?.(e);

      if (prefersReduced) return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        id: ++sparkId,
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
      }));

      setSparks((prev) => [...prev, ...newSparks]);

      setTimeout(() => {
        setSparks((prev) =>
          prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)),
        );
      }, duration);
    },
    [prefersReduced, sparkCount, duration, onClick],
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={cn("relative", className)}
    >
      {children}
      {sparks.map((s) => (
        <span
          key={s.id}
          className="pointer-events-none absolute z-50"
          style={{
            left: s.x,
            top: s.y,
            width: 3,
            height: 3,
            borderRadius: "50%",
            backgroundColor: sparkColor,
            animation: `clickspark-burst ${duration}ms ease-out forwards`,
            ["--spark-tx" as string]: `${Math.cos(s.angle) * sparkRadius}px`,
            ["--spark-ty" as string]: `${Math.sin(s.angle) * sparkRadius}px`,
          }}
        />
      ))}
    </div>
  );
}
