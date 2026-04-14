import { describe, expect, it, vi } from 'vitest';
import { appRoutes, navigateBackOrTo } from '@/lib/navigation/routes';

describe('routes smoke', () => {
  it('builds expected route descriptors', () => {
    expect(appRoutes.dashboard().path).toBe('/');
    expect(appRoutes.bookInvoices().path).toBe('/book/invoices');
    expect(appRoutes.bookJobCosts().path).toBe('/book/job-costs');
    expect(appRoutes.planJob('JOB-123').path).toBe('/plan/jobs/JOB-123');
  });

  it('uses fallback route when browser history cannot go back', () => {
    const navigate = vi.fn();
    navigateBackOrTo(navigate, '/book/invoices');
    expect(navigate).toHaveBeenCalledWith('/book/invoices');
  });
});
