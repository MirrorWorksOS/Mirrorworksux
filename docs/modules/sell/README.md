# Sell

## Purpose
Commercial pipeline and order-to-cash UI, from CRM and quoting through sales orders and invoicing.

## Primary Users
Sales reps, account managers, estimating staff, and customer service.

## Key Workflows
- Enter Sell from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Sell Dashboard](./dashboard.md) — `/sell`
- [CRM](./crm.md) — `/sell/crm`
- [Customer Detail](./customer-detail.md) — `/sell/crm/:id`
- [Opportunities](./opportunities.md) — `/sell/opportunities`
- [Opportunity Detail](./opportunity-detail.md) — `/sell/opportunities/:id`
- [Sales Orders](./orders.md) — `/sell/orders`
- [Sales Order Detail](./order-detail.md) — `/sell/orders/:id`
- [Activities](./activities.md) — `/sell/activities`
- [Invoices](./invoices.md) — `/sell/invoices`
- [New Invoice](./new-invoice.md) — `/sell/invoices/new`
- [Invoice Detail](./invoice-detail.md) — `/sell/invoices/:id`
- [Products](./products.md) — `/sell/products`
- [Product Detail](./product-detail.md) — `/sell/products/:id`
- [Quotes](./quotes.md) — `/sell/quotes`
- [New Quote](./new-quote.md) — `/sell/quotes/new`
- [Quote Detail](./quote-detail.md) — `/sell/quotes/:id`
- [Customer Portal](./customer-portal.md) — `/sell/portal`
- [Sell Settings](./settings.md) — `/sell/settings`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/sell/SellDashboard.tsx`
- `apps/web/src/components/sell/SellCRM.tsx`
- `apps/web/src/components/sell/SellCustomerDetail.tsx`
- `apps/web/src/components/sell/SellOpportunities.tsx`
- `apps/web/src/components/sell/SellOpportunityPage.tsx`
- `apps/web/src/components/sell/SellOrders.tsx`
- `apps/web/src/components/sell/SellOrderDetail.tsx`
- `apps/web/src/components/sell/SellActivities.tsx`
- `apps/web/src/components/sell/SellInvoices.tsx`
- `apps/web/src/components/sell/SellNewInvoice.tsx`
- `apps/web/src/components/sell/SellInvoiceDetail.tsx`
- `apps/web/src/components/sell/SellProducts.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /sell: action feedback often toast-driven.
- /sell/crm: placeholder/legacy language present.
- /sell/crm: mock/seed data usage visible in component.
- /sell/crm: action feedback often toast-driven.
- /sell/crm/:id: placeholder/legacy language present.
- /sell/crm/:id: mock/seed data usage visible in component.
- /sell/opportunities: placeholder/legacy language present.
- /sell/opportunities: mock/seed data usage visible in component.
- /sell/opportunities: action feedback often toast-driven.
- /sell/opportunities/:id: placeholder/legacy language present.
- /sell/opportunities/:id: mock/seed data usage visible in component.
- /sell/orders: placeholder/legacy language present.

## Related Modules
- Plan
- Make
- Book
- Ship
