import type { ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

import { cn } from "@/components/ui/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && (
                    <ChevronRight
                      aria-hidden
                      className="h-3 w-3 shrink-0 text-muted-foreground/70"
                    />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      to={crumb.href}
                      className="truncate transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "truncate",
                        isLast && "text-foreground font-medium",
                      )}
                    >
                      {crumb.label}
                    </span>
                  )}
                </Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
