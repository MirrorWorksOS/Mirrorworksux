# Platform

## Purpose
Cross-module shell experiences: home dashboard, notifications, Bridge ingestion, and kiosk floor mode entry.

## Primary Users
All office users, admins configuring initial data import, and shop-floor operators using kiosk routes.

## Key Workflows
- Enter Platform from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Welcome Dashboard](./welcome-dashboard.md) — `/`
- [Welcome Dashboard (Alias)](./dashboard-alias.md) — `/dashboard`
- [Notifications](./notifications.md) — `/notifications`
- [Bridge Wizard](./bridge-wizard.md) — `/bridge`
- [Floor Home](./floor-home.md) — `/floor`
- [Floor Run](./floor-run.md) — `/floor/run/:workOrderId`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/WelcomeDashboard.tsx`
- `apps/web/src/components/Notifications.tsx`
- `apps/web/src/components/bridge/BridgeWizard.tsx`
- `apps/web/src/components/floor/FloorHome.tsx`
- `apps/web/src/components/floor/FloorRun.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /: mock/seed data usage visible in component.
- /dashboard: mock/seed data usage visible in component.
- /notifications: placeholder/legacy language present.
- /notifications: mock/seed data usage visible in component.

## Related Modules
- Sell
- Buy
- Plan
- Make
- Ship
- Book
- Control
