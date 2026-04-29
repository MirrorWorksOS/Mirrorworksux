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
import { cn } from "@/components/ui/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
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
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
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
