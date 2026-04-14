import type { RouteDescriptor } from '@mirrorworks/contracts';
import type { NavigateFunction } from 'react-router';

export const appRoutes = {
  dashboard: (): RouteDescriptor => ({ path: '/' }),
  bookInvoices: (): RouteDescriptor => ({ path: '/book/invoices', label: 'Invoices' }),
  bookJobCosts: (): RouteDescriptor => ({ path: '/book/job-costs', label: 'Job costs' }),
  planJob: (id: string): RouteDescriptor => ({ path: `/plan/jobs/${id}`, label: 'Job detail' }),
} as const;

export function navigateBackOrTo(
  navigate: NavigateFunction,
  fallbackPath: string,
): void {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
    return;
  }

  navigate(fallbackPath);
}
