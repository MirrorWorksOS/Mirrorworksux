/**
 * SpotlightCard — mouse-tracking radial gradient highlight on hover.
 * Inspired by ReactBits SpotlightCard (https://www.reactbits.dev/components/spotlight-card).
 *
 * Non-AI: subtle grey glow. Dark mode: soft light glow via globals `.dark .spotlight-card`.
 * Gradient sits behind content (z-0) for readable text.
 */

import {
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "@/components/ui/utils";
import { useReducedMotion } from "@/components/shared/motion/use-reduced-motion";

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Light-mode spotlight colour — default subtle grey */
  spotlightColor?: string;
  /** Dark-mode spotlight colour — default soft white */
  spotlightColorDark?: string;
  /** Border radius class — default rounded-2xl */
  radius?: string;
  /**
   * Use `visible` when wrapping BorderGlow so outer glow layers are not clipped at corners/edges.
   * Default `hidden` keeps the spotlight vignette contained.
   */
  overflow?: "hidden" | "visible";
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(0, 0, 0, 0.1)",
  spotlightColorDark = "rgba(255, 255, 255, 0.18)",
  radius = "rounded-2xl",
  overflow = "hidden",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = cardRef.current;
      if (!el) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
        el.style.setProperty("--spot-opacity", "1");
      });
    },
    [reducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    el.style.setProperty("--spot-opacity", "0");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={reducedMotion ? undefined : handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "spotlight-card relative",
        overflow === "visible" ? "overflow-visible" : "overflow-hidden",
        radius,
        className,
      )}
      style={
        {
          "--spot-color": spotlightColor,
          "--spot-color-dark": spotlightColorDark,
          "--spot-opacity": "0",
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
        aria-hidden
        style={{
          opacity: "var(--spot-opacity)",
          background:
            "radial-gradient(380px circle at var(--spot-x) var(--spot-y), var(--spot-color), transparent 78%)",
        }}
      />
      <div className="relative z-10 isolate flex h-full min-h-0 w-full flex-col">
        {children}
      </div>
    </div>
  );
}
