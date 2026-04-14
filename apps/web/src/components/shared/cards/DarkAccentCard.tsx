import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

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
    <Card variant="dark" className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-white/70">{label}</p>
          <p className="text-3xl font-medium text-white tabular-nums">{value}</p>
          {subtext !== undefined && (
            <p className="text-xs text-white/60">{subtext}</p>
          )}
        </div>
        {Icon !== undefined && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Icon className="h-5 w-5 text-white" aria-hidden />
          </div>
        )}
      </div>
      {children !== undefined && children !== null && (
        <div className="mt-4 border-t border-white/10 pt-4">{children}</div>
      )}
    </Card>
  );
}
