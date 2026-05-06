# Plan

## Purpose
Production planning and engineering module for jobs, schedules, product logic, and planning calculators.

## Primary Users
Production planners, estimators, engineers, and operations managers.

## Key Workflows
- Enter Plan from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Plan Dashboard](./dashboard.md) — `/plan`
- [Jobs](./jobs.md) — `/plan/jobs`
- [Job Detail](./job-detail.md) — `/plan/jobs/:id`
- [Schedule Engine](./schedule-engine.md) — `/plan/schedule-engine` (replaces the old `/plan/schedule` and `/plan/activities`, both now redirect)
- [Machine I/O](./machine-io.md) — `/plan/machine-io`
- [Purchase Planning](./purchase.md) — `/plan/purchase`
- [QC Planning](./qc-planning.md) — `/plan/qc-planning`
- [Product Studio v2](./product-studio.md) — `/plan/product-studio`
- [Product Studio v2 (Product)](./product-studio-product.md) — `/plan/product-studio/:productId`
- [Product Studio Legacy](./product-studio-legacy.md) — `/plan/product-studio/legacy`
- [Product Studio Legacy (Product)](./product-studio-legacy-product.md) — `/plan/product-studio/legacy/:productId`
- [Libraries](./libraries.md) — `/plan/libraries`
- [What-if](./what-if.md) — `/plan/what-if`
- [Nesting Studio](./nesting-studio.md) — `/plan/nesting-studio` (replaces the old `/plan/nesting` and `/plan/sheet-calculator`, both now redirect)
- [Ready to Nest](./nesting-queue.md) — `/plan/nesting-queue`
- [Nests](./nests.md) — `/plan/nests`
- [Nest Detail](./nest-detail.md) — `/plan/nests/:id`
- [MRP](./mrp.md) — `/plan/mrp`
- [Sheet Calculator (legacy)](./sheet-calculator.md) — `/plan/sheet-calculator-legacy` (kept for the rare single-part lookup)
- [Products](./products.md) — `/plan/products`
- [Product Detail](./product-detail.md) — `/plan/products/:id`
- [Plan Settings](./settings.md) — `/plan/settings`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/plan/PlanDashboard.tsx`
- `apps/web/src/components/plan/PlanJobs.tsx`
- `apps/web/src/components/plan/PlanJobDetail.tsx`
- `apps/web/src/components/plan/PlanScheduleEngine.tsx`
- `apps/web/src/components/plan/PlanMachineIO.tsx`
- `apps/web/src/components/plan/PlanPurchase.tsx`
- `apps/web/src/components/plan/PlanQCPlanning.tsx`
- `apps/web/src/components/plan/product-studio/blockly-v2/ProductStudioV2.tsx`
- `apps/web/src/components/plan/product-studio/ProductStudio.tsx`
- `apps/web/src/components/plan/PlanLibraries.tsx`
- `apps/web/src/components/plan/PlanWhatIf.tsx`
- `apps/web/src/components/plan/PlanNesting.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /plan/jobs: placeholder/legacy language present.
- /plan/jobs: mock/seed data usage visible in component.
- /plan/jobs: action feedback often toast-driven.
- /plan/purchase: placeholder/legacy language present.
- /plan/purchase: mock/seed data usage visible in component.
- /plan/purchase: action feedback often toast-driven.
- /plan/qc-planning: placeholder/legacy language present.
- /plan/qc-planning: action feedback often toast-driven.
- /plan/product-studio: mock/seed data usage visible in component.
- /plan/product-studio/:productId: mock/seed data usage visible in component.
- /plan/what-if: placeholder/legacy language present.

## Related Modules
- Buy
- Make
- Sell
- Control
