import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

/**
 * Stat tile for headline numbers (Total groups, Active orders, etc.).
 * Light card surface with a yellow icon well for brand presence — keeps the
 * page hierarchy calm in light mode while still standing apart from regular
 * Cards. In dark mode the surface follows --card (mirage-tinted) so the tile
 * blends with adjacent cards instead of forcing a black banner.
 *
 * Component name kept for callsite stability; the "DarkAccent" label is now
 * historical — the accent is yellow + mirage icon, not a dark fill.
 */
interface DarkAccentCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
}

export function DarkAccentCard({
  label,
  value,
  subtext,
  icon: Icon,
  children,
  className,
}: DarkAccentCardProps) {
  return (
    <Card variant="flat" className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-medium text-foreground tabular-nums">{value}</p>
          {subtext !== undefined && (
            <p className="text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        {Icon !== undefined && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--mw-yellow-100)] dark:bg-[var(--mw-yellow-400)]/15">
            <Icon className="h-5 w-5 text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]" aria-hidden />
          </div>
        )}
      </div>
      {children !== undefined && children !== null && (
        <div className="mt-4 border-t border-border pt-4">{children}</div>
      )}
    </Card>
  );
}
