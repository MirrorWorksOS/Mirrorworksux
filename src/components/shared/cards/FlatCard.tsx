import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface FlatCardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function FlatCard({
  title,
  actions,
  children,
  className,
  noPadding = false,
}: FlatCardProps) {
  const hasHeader = title !== undefined || actions !== undefined;

  return (
    <Card
      variant="flat"
      className={cn(
        noPadding ? "p-0" : "p-6",
        className,
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex items-center justify-between gap-4",
            !noPadding && "mb-4",
            noPadding && "px-6 pt-6 pb-4",
          )}
        >
          {title !== undefined ? (
            <h3 className="text-base font-medium text-foreground">{title}</h3>
          ) : (
            <span />
          )}
          {actions !== undefined && (
            <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {noPadding && hasHeader ? (
        <div className="px-6 pb-6">{children}</div>
      ) : (
        children
      )}
    </Card>
  );
}
