import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface EntityCardProps {
  name: string;
  subtitle?: string;
  avatarInitials: string;
  avatarColor?: string;
  meta?: { label: string; value: string }[];
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function EntityCard({
  name,
  subtitle,
  avatarInitials,
  avatarColor,
  meta,
  actions,
  onClick,
  className,
}: EntityCardProps) {
  const interactive = onClick !== undefined;

  return (
    <Card
      variant="flat"
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "p-6 transition-shadow duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
        "hover:shadow-sm",
        interactive && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: avatarColor ?? "var(--mw-mirage)" }}
        >
          {avatarInitials}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--neutral-900)]">{name}</p>
              {subtitle !== undefined && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions !== undefined && (
              <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {actions}
              </div>
            )}
          </div>
          {meta !== undefined && meta.length > 0 && (
            <dl className="mt-3 space-y-1.5 border-t border-[var(--neutral-200)] pt-3">
              {meta.map((row) => (
                <div key={`${row.label}-${row.value}`} className="flex items-baseline justify-between gap-4 text-xs">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="tabular-nums text-[var(--neutral-900)]">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Card>
  );
}
