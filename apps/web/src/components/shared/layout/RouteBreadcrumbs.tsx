import { useLocation } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router";
import { Fragment } from "react";

import {
  buildBreadcrumbs,
  type BreadcrumbItem as BcItem,
} from "@/lib/navigation/breadcrumbs";
import { cn } from "@/components/ui/utils";

/**
 * Hook that returns the breadcrumb trail for the current pathname.
 * Pass `current` to override the last crumb's label with an entity
 * title (e.g. on detail pages: `useRouteBreadcrumbs(customer.company)`).
 *
 * When the static `ROUTE_LABELS` map doesn't cover the page (or an
 * entity-specific extension is needed), pages can still pass an
 * explicit array to `<PageHeader breadcrumbs={...}>`. This hook is
 * the convenience for the common case.
 */
export function useRouteBreadcrumbs(current?: string): BcItem[] {
  const { pathname } = useLocation();
  return buildBreadcrumbs(pathname, current);
}

export interface RouteBreadcrumbsProps {
  /** Override the final crumb's label — typically the entity title on a detail page. */
  current?: string;
  className?: string;
}

/**
 * Stand-alone breadcrumbs derived from the current route. Useful when
 * a page renders its own header instead of consuming `<PageHeader>`.
 *
 * For pages already using `<PageHeader>`, prefer:
 *
 *   <PageHeader breadcrumbs={useRouteBreadcrumbs(entity.title)} ... />
 *
 * since that keeps the title + crumbs visually aligned with the rest of
 * the design system.
 */
export function RouteBreadcrumbs({ current, className }: RouteBreadcrumbsProps) {
  const crumbs = useRouteBreadcrumbs(current);
  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-xs">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
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
  );
}
