# Make

## Purpose
Production execution module for schedules, work orders, shop-floor states, and quality/capa tracking.

## Primary Users
Production supervisors, team leaders, and operators in office-mode views.

## Key Workflows
- Enter Make from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Make Dashboard](./dashboard.md) — `/make`
- [Schedule](./schedule.md) — `/make/schedule`
- [Shop Floor](./shop-floor.md) — `/make/shop-floor`
- [Manufacturing Orders](./manufacturing-orders.md) — `/make/manufacturing-orders`
- [Manufacturing Order Detail](./manufacturing-order-detail.md) — `/make/manufacturing-orders/:id`
- [Quality](./quality.md) — `/make/quality`
- [Scrap Analysis](./scrap-analysis.md) — `/make/scrap-analysis`
- [Job Traveler](./job-traveler.md) — `/make/job-traveler/:id`
- [CAPA](./capa.md) — `/make/capa`
- [Products](./products.md) — `/make/products`
- [Product Detail](./product-detail.md) — `/make/products/:id`
- [Make Settings](./settings.md) — `/make/settings`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/make/MakeDashboard.tsx`
- `apps/web/src/components/make/MakeSchedule.tsx`
- `apps/web/src/components/make/MakeShopFloor.tsx`
- `apps/web/src/components/make/MakeManufacturingOrders.tsx`
- `apps/web/src/components/make/MakeManufacturingOrderDetail.tsx`
- `apps/web/src/components/make/MakeQuality.tsx`
- `apps/web/src/components/make/MakeScrapAnalysis.tsx`
- `apps/web/src/components/make/MakeJobTraveler.tsx`
- `apps/web/src/components/make/MakeCapa.tsx`
- `apps/web/src/components/make/MakeProducts.tsx`
- `apps/web/src/components/make/MakeProductDetail.tsx`
- `apps/web/src/components/make/MakeSettings.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /make: placeholder/legacy language present.
- /make: mock/seed data usage visible in component.
- /make: action feedback often toast-driven.
- /make/schedule: mock/seed data usage visible in component.
- /make/manufacturing-orders: placeholder/legacy language present.
- /make/manufacturing-orders: action feedback often toast-driven.
- /make/manufacturing-orders/:id: placeholder/legacy language present.
- /make/manufacturing-orders/:id: mock/seed data usage visible in component.
- /make/job-traveler/:id: placeholder/legacy language present.
- /make/job-traveler/:id: mock/seed data usage visible in component.
- /make/capa: mock/seed data usage visible in component.
- /make/products: placeholder/legacy language present.

## Related Modules
- Plan
- Ship
- Control
- Floor
