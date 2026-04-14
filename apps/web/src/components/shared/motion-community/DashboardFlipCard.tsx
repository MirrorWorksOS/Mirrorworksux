/**
 * 3D flip card — hover to reveal back (slow tween, M3-style ease).
 * @see https://animate-ui.com/docs/components/community/flip-card
 */

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { AnimatedCount } from "@/components/shared/motion/AnimatedCount";
import { useReducedMotion } from "@/components/shared/motion/use-reduced-motion";
import { mwHairlineBorder, mwPillYellowClass } from "@/lib/dashboard-ui";

/** M3 emphasized decelerate — slow, confident flip */
const FLIP_EASE: [number, number, number, number] = [0.05, 0.7, 0.1, 1];
const FLIP_DURATION = 0.95;
const LIFT_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

export interface DashboardFlipCardProps {
  className?: string;
  frontIcon?: LucideIcon;
  frontTitle: string;
  frontMetric: string;
  frontHint: string;
  backInsight: string;
  backActionLabel: string;
  backTo: string;
}

export function DashboardFlipCard({
  className,
  frontIcon: FrontIcon = ClipboardCheck,
  frontTitle,
  frontMetric,
  frontHint,
  backInsight,
  backActionLabel,
  backTo,
}: DashboardFlipCardProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);

  const metricIsPercent = frontMetric.trim().endsWith("%");
  const metricN = Number.parseInt(
    frontMetric.replace(/%/g, "").trim(),
    10,
  );
  const useAnimatedMetric = Number.isFinite(metricN);

  const showBack = reduceMotion ? keyboardOpen : hovered || keyboardOpen;

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "flex min-h-[220px] flex-col justify-between rounded-[var(--shape-xl)] bg-card p-6 shadow-xs",
          mwHairlineBorder,
          className,
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <FrontIcon
              className="h-5 w-5 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className={cn("inline-flex px-2.5 py-0.5 text-xs uppercase tracking-wider", mwPillYellowClass)}>
              {frontTitle}
            </p>
          </div>
          <p className="mt-3 text-5xl font-bold tabular-nums tracking-tight text-foreground sm:text-6xl">
            {useAnimatedMetric ? (
              <>
                <AnimatedCount value={metricN} />
                {metricIsPercent ? <span aria-hidden>%</span> : null}
              </>
            ) : (
              frontMetric
            )}
          </p>
          <p className="mt-3 text-base font-light leading-relaxed text-muted-foreground">
            {frontHint}
          </p>
          <p className="mt-4 text-base font-light leading-relaxed text-foreground">{backInsight}</p>
        </div>
        <Button
          asChild
          className="mt-4 w-full bg-[var(--mw-yellow-400)] font-bold text-[#2C2C2C] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-500)]"
        >
          <Link to={backTo} className="flex items-center justify-center gap-2">
            {backActionLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("perspective-[1000px]", className)}
      style={{ perspective: "1000px" }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.5, ease: LIFT_EASE }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative min-h-[220px] w-full rounded-[var(--shape-xl)] outline-none"
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
        style={{ transformStyle: "preserve-3d" }}
        tabIndex={0}
        role="group"
        aria-label={`${frontTitle}. Hover to see details.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setKeyboardOpen((o) => !o);
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setKeyboardOpen(false);
            setHovered(false);
          }
        }}
      >
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between rounded-[var(--shape-xl)] bg-card p-6 shadow-xs",
            mwHairlineBorder,
            showBack && "pointer-events-none",
          )}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          aria-hidden={showBack}
        >
          <div>
            <div className="flex items-center gap-2">
              <FrontIcon
                className="h-5 w-5 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className={cn("inline-flex px-2.5 py-0.5 text-xs uppercase tracking-wider", mwPillYellowClass)}>
                {frontTitle}
              </p>
            </div>
            <p className="mt-3 text-5xl font-bold tabular-nums tracking-tight text-foreground sm:text-6xl">
              {useAnimatedMetric ? (
                <>
                  <AnimatedCount value={metricN} />
                  {metricIsPercent ? <span aria-hidden>%</span> : null}
                </>
              ) : (
                frontMetric
              )}
            </p>
            <p className="mt-3 text-base font-light leading-relaxed text-muted-foreground">
              {frontHint}
            </p>
          </div>
          <p className="text-xs font-light text-muted-foreground">
            Hover to flip · Enter to toggle
          </p>
        </div>

        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between rounded-[var(--shape-xl)] bg-card p-6 shadow-xs",
            mwHairlineBorder,
            !showBack && "pointer-events-none",
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          aria-hidden={!showBack}
        >
          <p className="text-base font-light leading-relaxed text-foreground">{backInsight}</p>
          <Button
            asChild
            className="w-full border-0 bg-[var(--mw-yellow-400)] font-bold text-[#2C2C2C] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-500)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={backTo} className="flex items-center justify-center gap-2">
              {backActionLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
