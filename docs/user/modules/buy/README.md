# Buy

## Purpose
Procure-to-pay and sourcing workflows, including supplier management, purchasing transactions, and planning tools.

## Primary Users
Purchasing officers, planners, and procurement managers.

## Key Workflows
- Enter Buy from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Buy Dashboard](./dashboard.md) — `/buy`
- [Purchase Orders](./orders.md) — `/buy/orders`
- [Purchase Order Detail](./order-detail.md) — `/buy/orders/:id`
- [Requisitions](./requisitions.md) — `/buy/requisitions`
- [Requisition Detail](./requisition-detail.md) — `/buy/requisitions/:id`
- [Receipts](./receipts.md) — `/buy/receipts`
- [Suppliers](./suppliers.md) — `/buy/suppliers`
- [Supplier Detail](./supplier-detail.md) — `/buy/suppliers/:id`
- [RFQs](./rfqs.md) — `/buy/rfqs`
- [Bills](./bills.md) — `/buy/bills`
- [Products](./products.md) — `/buy/products`
- [Product Detail](./product-detail.md) — `/buy/products/:id`
- [Agreements](./agreements.md) — `/buy/agreements`
- [MRP Suggestions](./mrp-suggestions.md) — `/buy/mrp-suggestions`
- [Planning Grid](./planning-grid.md) — `/buy/planning-grid`
- [Vendor Comparison](./vendor-comparison.md) — `/buy/vendor-comparison`
- [Reorder Rules](./reorder-rules.md) — `/buy/reorder-rules`
- [Reports](./reports.md) — `/buy/reports`
- [Buy Settings](./settings.md) — `/buy/settings`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/buy/BuyDashboard.tsx`
- `apps/web/src/components/buy/BuyOrders.tsx`
- `apps/web/src/components/buy/BuyOrderDetail.tsx`
- `apps/web/src/components/buy/BuyRequisitions.tsx`
- `apps/web/src/components/buy/BuyRequisitionDetail.tsx`
- `apps/web/src/components/buy/BuyReceipts.tsx`
- `apps/web/src/components/buy/BuySuppliers.tsx`
- `apps/web/src/components/buy/BuySupplierDetail.tsx`
- `apps/web/src/components/buy/BuyRFQs.tsx`
- `apps/web/src/components/buy/BuyBills.tsx`
- `apps/web/src/components/buy/BuyProducts.tsx`
- `apps/web/src/components/buy/BuyProductDetail.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /buy/orders: placeholder/legacy language present.
- /buy/orders: mock/seed data usage visible in component.
- /buy/orders: action feedback often toast-driven.
- /buy/orders/:id: placeholder/legacy language present.
- /buy/orders/:id: mock/seed data usage visible in component.
- /buy/orders/:id: action feedback often toast-driven.
- /buy/requisitions: placeholder/legacy language present.
- /buy/requisitions: mock/seed data usage visible in component.
- /buy/requisitions: action feedback often toast-driven.
- /buy/requisitions/:id: action feedback often toast-driven.
- /buy/receipts: placeholder/legacy language present.
- /buy/receipts: mock/seed data usage visible in component.

## Related Modules
- Plan
- Book
- Control
- Make
