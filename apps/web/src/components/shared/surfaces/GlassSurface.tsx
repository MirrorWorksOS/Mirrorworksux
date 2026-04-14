/**
 * GlassSurface — frosted glass card with backdrop-filter blur.
 * Inspired by ReactBits GlassSurface. CSS-only, GPU-composited.
 *
 * AI surfaces use brand tint. Non-AI surfaces use neutral.
 */

import { type ReactNode } from "react";
import { cn } from "@/components/ui/utils";

export interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  /** Blur intensity in px — default 20 */
  blur?: number;
  /** Background opacity — default 0.6 */
  opacity?: number;
  /** Border radius class — default rounded-3xl */
  radius?: string;
  /** Use AI-themed tint (agent teal + yellow border) */
  aiTint?: boolean;
}

export function GlassSurface({
  children,
  className,
  blur = 20,
  opacity = 0.6,
  radius = "rounded-3xl",
  aiTint = false,
}: GlassSurfaceProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        radius,
        // Border: hairline, themed
        aiTint
          ? "border border-[var(--mw-agent)]/10 dark:border-[var(--mw-agent)]/15"
          : "border border-white/20 dark:border-white/10",
        className,
      )}
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: aiTint
          ? `color-mix(in srgb, var(--card) ${Math.round(opacity * 100)}%, var(--mw-agent) 3%)`
          : `color-mix(in srgb, var(--card) ${Math.round(opacity * 100)}%, transparent)`,
      }}
    >
      {/* Subtle top-edge highlight for light refraction effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          aiTint
            ? "bg-gradient-to-r from-transparent via-[var(--mw-agent)]/15 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10",
        )}
      />
      {children}
    </div>
  );
}
