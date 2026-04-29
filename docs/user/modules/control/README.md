# Control

## Purpose
Master-data and system control module covering factory design, process/workflow definition, people, and operational control records.

## Primary Users
Operations admins, implementation leads, and system owners.

## Key Workflows
- Enter Control from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Control Dashboard](./dashboard.md) — `/control`
- [MirrorWorks Bridge](./mirrorworks-bridge.md) — `/control/mirrorworks-bridge`
- [Factory Layout](./factory-layout.md) — `/control/factory-layout`
- [Process Builder](./process-builder.md) — `/control/process-builder`
- [Locations](./locations.md) — `/control/locations`
- [Machines](./machines.md) — `/control/machines`
- [Operations](./operations.md) — `/control/operations`
- [Routes](./routes.md) — `/control/routes`
- [People](./people.md) — `/control/people`
- [Groups](./people.md#groups) — `/control/groups`
- [Products](./products.md) — `/control/products` *(absorbs Inventory wizards)*
- [BOMs](./boms.md) — `/control/boms` *(multi-tier editor as of 2026-04-29)*
- [Workflow Designer](./workflow-designer.md) — `/control/workflow-designer`
- [Shift Manager](./shifts.md) — `/control/shifts`
- [Maintenance](./maintenance.md) — `/control/maintenance`
- [Tooling](./tooling.md) — `/control/tooling`
- [Documents](./documents.md) — `/control/documents`
- [Audit log](./audit.md) — `/control/audit`
- [Billing & subscription](./billing.md) — `/control/billing` *(launched 2026-04-28 with the pricing-tier rewrite)*
- [Gamification](./gamification.md) — `/control/gamification`
- [Empty States Showcase](./empty-states.md) — `/control/empty-states`

### Redirects (formerly standalone pages)
- `/control/inventory` → `/control/products` (Stocktake / Adjustment / Transfer wizards now toolbar buttons on Products) — see [Inventory](./inventory.md).
- `/control/purchase` → `/buy/settings` (panels merged into Buy → Settings) — see [Purchase Control](./purchase.md).

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/control/ControlDashboard.tsx`
- `apps/web/src/components/bridge/BridgeWizard.tsx`
- `apps/web/src/components/control/ControlFactoryDesigner.tsx`
- `apps/web/src/components/control/ControlProcessBuilder.tsx`
- `apps/web/src/components/control/ControlLocations.tsx`
- `apps/web/src/components/control/ControlMachines.tsx`
- `apps/web/src/components/control/ControlOperations.tsx`
- `apps/web/src/components/control/ControlRoutes.tsx`
- `apps/web/src/components/control/ControlPeople.tsx`
- `apps/web/src/components/control/ControlProducts.tsx`
- `apps/web/src/components/control/ControlBOMs.tsx`
- `apps/web/src/components/control/ControlBilling.tsx`
- `apps/web/src/components/control/ControlAudit.tsx`
- `apps/web/src/components/control/ControlInventory.tsx` *(retained for `StocktakeWizard` / `NewAdjustmentDialog` / `NewTransferDialog` exports — page itself redirects)*

### Create / edit dialogs (landed 2026-04-29 → 2026-04-30)
- `apps/web/src/components/shared/forms/EntityFormDialog.tsx` — generic create/edit modal substrate.
- `apps/web/src/components/control/OperationFormDialog.tsx`
- `apps/web/src/components/control/MachineFormDialog.tsx`
- `apps/web/src/components/control/LocationFormDialog.tsx`
- `apps/web/src/components/control/RouteEditorSheet.tsx` *(side sheet, not modal — drag-reorderable steps)*
- `apps/web/src/components/control/BomEditorSheet.tsx` *(side sheet — multi-tier with sub-assembly references)*
- `apps/web/src/components/control/people/GroupFormDialog.tsx`
- `apps/web/src/components/control/ShiftFormDialog.tsx`
- `apps/web/src/components/control/TargetFormDialog.tsx`
- `apps/web/src/components/control/BadgeFormDialog.tsx`
- `apps/web/src/components/control/MaintenanceFormDialog.tsx`
- `apps/web/src/components/control/ToolingFormDialog.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /control/factory-layout: placeholder/legacy language present.
- /control/factory-layout: mock/seed data usage visible in component.
- /control/process-builder: placeholder/legacy language present.
- /control/process-builder: mock/seed data usage visible in component.
- /control/process-builder: action feedback often toast-driven.
- /control/locations: placeholder/legacy language present.
- /control/locations: action feedback often toast-driven.
- /control/machines: placeholder/legacy language present.
- /control/machines: mock/seed data usage visible in component.
- /control/machines: action feedback often toast-driven.
- /control/inventory: placeholder/legacy language present.
- /control/inventory: mock/seed data usage visible in component.

## Related Modules
- Bridge
- Plan
- Buy
- Make
- Book
