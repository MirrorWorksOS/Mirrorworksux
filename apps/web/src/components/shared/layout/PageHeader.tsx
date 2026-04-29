import type { ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouteBreadcrumbs } from "@/components/shared/layout/RouteBreadcrumbs";
import { cn } from "@/components/ui/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /**
   * Explicit breadcrumb trail. When omitted, breadcrumbs are auto-derived
   * from the current pathname using the static `ROUTE_LABELS` map. Pass
   * an empty array to render no breadcrumbs (e.g. on a module dashboard).
   */
  breadcrumbs?: { label: string; href?: string }[];
  /**
   * Override the final auto-derived crumb's label — typically the entity
   * title on a detail page (e.g. `currentBreadcrumb={customer.company}`).
   * Ignored when explicit `breadcrumbs` are passed.
   */
  currentBreadcrumb?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  currentBreadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  const auto = useRouteBreadcrumbs(currentBreadcrumb);
  // A single auto-derived crumb (e.g. "Sell" above an h1 of "Sell") is
  // visually redundant. Only show auto crumbs when the trail has at
  // least 2 levels — explicit `breadcrumbs` are always honored as-is.
  const resolved = breadcrumbs ?? (auto.length > 1 ? auto : []);
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {resolved.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              {resolved.map((crumb, index) => {
                const isLast = index === resolved.length - 1;
                return (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href && !isLast ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href} className="truncate">
                            {crumb.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage
                          className={cn("truncate", isLast && "font-medium")}
                        >
                          {crumb.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-2xl sm:text-3xl tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{subtitle}</div>
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
