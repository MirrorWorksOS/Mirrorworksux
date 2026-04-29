/**
 * Static path → label map used by the `useRouteBreadcrumbs` hook and
 * `<RouteBreadcrumbs>` component to derive breadcrumb crumbs from the
 * current URL.
 *
 * Add a new entry whenever a new top-level/nav-level route is added.
 * Detail pages (`/sell/quotes/:id`) don't go here — they pass the
 * entity title via `current` to the hook/component.
 */
export const ROUTE_LABELS: Record<string, string> = {
  // Root
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/notifications': 'Notifications',
  '/bridge': 'MirrorWorks Bridge',

  // Sell
  '/sell': 'Sell',
  '/sell/crm': 'CRM',
  '/sell/opportunities': 'Opportunities',
  '/sell/quotes': 'Quotes',
  '/sell/orders': 'Orders',
  '/sell/invoices': 'Invoices',
  '/sell/products': 'Products',
  '/sell/activities': 'Activities',
  '/sell/portal': 'Customer Portal',
  '/sell/settings': 'Settings',

  // Buy
  '/buy': 'Buy',
  '/buy/orders': 'Orders',
  '/buy/requisitions': 'Requisitions',
  '/buy/receipts': 'Receipts',
  '/buy/suppliers': 'Suppliers',
  '/buy/rfqs': 'RFQs',
  '/buy/bills': 'Bills',
  '/buy/products': 'Products',
  '/buy/agreements': 'Agreements',
  '/buy/mrp-suggestions': 'MRP Suggestions',
  '/buy/planning-grid': 'Planning Grid',
  '/buy/vendor-comparison': 'Vendor Comparison',
  '/buy/reorder-rules': 'Reorder Rules',
  '/buy/reports': 'Reports',
  '/buy/settings': 'Settings',

  // Plan
  '/plan': 'Plan',
  '/plan/jobs': 'Jobs',
  '/plan/schedule': 'Schedule',
  '/plan/machine-io': 'Machine I/O',
  '/plan/product-studio': 'Product Studio',
  '/plan/libraries': 'Libraries',
  '/plan/what-if': 'What-If',
  '/plan/nesting': 'Nesting',
  '/plan/mrp': 'MRP',
  '/plan/sheet-calculator': 'Sheet Calculator',
  '/plan/purchase': 'Purchase',
  '/plan/qc-planning': 'QC Planning',
  '/plan/products': 'Products',
  '/plan/settings': 'Settings',

  // Make
  '/make': 'Make',
  '/make/schedule': 'Schedule',
  '/make/shop-floor': 'Shop Floor',
  '/make/manufacturing-orders': 'Manufacturing Orders',
  '/make/work-orders': 'Work Orders',
  '/make/quality': 'Quality',
  '/make/scrap-analysis': 'Scrap Analysis',
  '/make/capa': 'CAPA',
  '/make/job-traveler': 'Job Traveler',
  '/make/products': 'Products',
  '/make/settings': 'Settings',

  // Ship
  '/ship': 'Ship',
  '/ship/orders': 'Orders',
  '/ship/packaging': 'Packaging',
  '/ship/shipping': 'Shipping',
  '/ship/tracking': 'Tracking',
  '/ship/carrier-rates': 'Carrier Rates',
  '/ship/scan-to-ship': 'Scan to Ship',
  '/ship/returns': 'Returns',
  '/ship/warehouse': 'Warehouse',
  '/ship/reports': 'Reports',
  '/ship/settings': 'Settings',

  // Book
  '/book': 'Book',
  '/book/budget': 'Budget',
  '/book/invoices': 'Invoices',
  '/book/expenses': 'Expenses',
  '/book/purchases': 'Purchase Orders',
  '/book/job-costs': 'Job Costs',
  '/book/wip': 'WIP Valuation',
  '/book/cost-variance': 'Cost Variance',
  '/book/stock-valuation': 'Stock Valuation',
  '/book/reports': 'Reports',
  '/book/settings': 'Settings',

  // Control
  '/control': 'Control',
  '/control/factory-layout': 'Factory Designer',
  '/control/process-builder': 'Process Builder',
  '/control/operations': 'Operations',
  '/control/routes': 'Routes',
  '/control/locations': 'Locations',
  '/control/machines': 'Machines',
  '/control/inventory': 'Inventory',
  '/control/products': 'Products',
  '/control/boms': 'BOMs',
  '/control/purchase': 'Purchase',
  '/control/people': 'People',
  '/control/groups': 'Groups',
  '/control/shifts': 'Shifts',
  '/control/maintenance': 'Maintenance',
  '/control/tooling': 'Tooling',
  '/control/documents': 'Documents',
  '/control/gamification': 'Gamification',
  '/control/billing': 'Billing',
  '/control/audit': 'Access Audit',
  '/control/workflow-designer': 'Workflow Designer',
  '/control/mirrorworks-bridge': 'MirrorWorks Bridge',
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Build a breadcrumb trail by walking the path segments of `pathname`
 * left-to-right and looking each cumulative path up in `ROUTE_LABELS`.
 *
 * Unknown segments (e.g. an entity id like `cust-001`) are skipped. The
 * last known crumb is rendered without an `href` (treated as the current
 * page). Pass `current` to override the last crumb's label with an
 * entity title — useful on detail pages.
 */
export function buildBreadcrumbs(
  pathname: string,
  current?: string,
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];

  for (let i = 0; i < segments.length; i++) {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[path];
    if (label !== undefined) {
      crumbs.push({ label, href: path });
    }
  }

  // The last labelled crumb is always the "current page" — strip its href.
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
  }

  if (current !== undefined && current !== '') {
    if (crumbs.length > 0) {
      // Promote the previous crumb to a link, append the entity title.
      const last = crumbs[crumbs.length - 1];
      crumbs[crumbs.length - 1] = { label: last.label, href: pathname.replace(/\/[^/]*$/, '') || '/' };
      crumbs.push({ label: current });
    } else {
      crumbs.push({ label: current });
    }
  }

  return crumbs;
}
