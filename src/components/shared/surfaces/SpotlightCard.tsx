/**
 * SpotlightCard — mouse-tracking radial gradient highlight on hover.
 * Inspired by ReactBits SpotlightCard. Pure CSS, zero runtime cost.
 *
 * Non-AI elements: white/grey glow. Dark mode: soft white glow.
 */

import { useRef, useCallback, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/components/ui/utils";

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Light-mode spotlight color — default light grey */
  spotlightColor?: string;
  /** Dark-mode spotlight color — default off-white */
  spotlightColorDark?: string;
  /** Border radius class — default rounded-2xl */
  radius?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(0, 0, 0, 0.12)",
  spotlightColorDark = "rgba(255, 255, 255, 0.25)",
  radius = "rounded-2xl",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      el.style.setProperty("--spot-opacity", "1");
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--spot-opacity", "0");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "spotlight-card relative overflow-hidden",
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
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: "var(--spot-opacity)",
          background:
            "radial-gradient(350px circle at var(--spot-x) var(--spot-y), var(--spot-color), transparent 80%)",
        }}
      />
      {children}
    </div>
  );
}
