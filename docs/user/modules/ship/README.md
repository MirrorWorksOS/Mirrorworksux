# Ship

## Purpose
Fulfilment and logistics workflows for shipment preparation, dispatch, tracking, and returns.

## Primary Users
Warehouse teams, dispatch coordinators, and customer fulfillment staff.

## Key Workflows
- Enter Ship from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Ship Dashboard](./dashboard.md) — `/ship`
- [Orders](./orders.md) — `/ship/orders`
- [Packaging](./packaging.md) — `/ship/packaging`
- [Shipping](./shipping.md) — `/ship/shipping`
- [Tracking](./tracking.md) — `/ship/tracking`
- [Carrier Rates](./carrier-rates.md) — `/ship/carrier-rates`
- [Scan to Ship](./scan-to-ship.md) — `/ship/scan-to-ship`
- [Returns](./returns.md) — `/ship/returns`
- [Warehouse](./warehouse.md) — `/ship/warehouse`
- [Reports](./reports.md) — `/ship/reports`
- [Ship Settings](./settings.md) — `/ship/settings`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/ship/ShipDashboard.tsx`
- `apps/web/src/components/ship/ShipOrders.tsx`
- `apps/web/src/components/ship/ShipPackaging.tsx`
- `apps/web/src/components/ship/ShipShipping.tsx`
- `apps/web/src/components/ship/ShipTracking.tsx`
- `apps/web/src/components/ship/ShipCarrierRates.tsx`
- `apps/web/src/components/ship/ShipScanToShip.tsx`
- `apps/web/src/components/ship/ShipReturns.tsx`
- `apps/web/src/components/ship/ShipWarehouse.tsx`
- `apps/web/src/components/ship/ShipReports.tsx`
- `apps/web/src/components/ship/ShipSettings.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /ship/orders: placeholder/legacy language present.
- /ship/orders: action feedback often toast-driven.
- /ship/packaging: placeholder/legacy language present.
- /ship/shipping: action feedback often toast-driven.
- /ship/tracking: placeholder/legacy language present.
- /ship/scan-to-ship: placeholder/legacy language present.
- /ship/scan-to-ship: mock/seed data usage visible in component.
- /ship/returns: placeholder/legacy language present.
- /ship/warehouse: placeholder/legacy language present.
- /ship/settings: placeholder/legacy language present.
- /ship/settings: action feedback often toast-driven.

## Related Modules
- Sell
- Make
- Book
