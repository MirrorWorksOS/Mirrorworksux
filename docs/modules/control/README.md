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
- [Inventory](./inventory.md) — `/control/inventory`
- [Purchase Control](./purchase.md) — `/control/purchase`
- [People](./people.md) — `/control/people`
- [Products](./products.md) — `/control/products`
- [BOMs](./boms.md) — `/control/boms`
- [Role Designer](./role-designer.md) — `/control/role-designer`
- [Workflow Designer](./workflow-designer.md) — `/control/workflow-designer`
- [Shift Manager](./shifts.md) — `/control/shifts`
- [Maintenance](./maintenance.md) — `/control/maintenance`
- [Tooling](./tooling.md) — `/control/tooling`
- [Documents](./documents.md) — `/control/documents`
- [Gamification](./gamification.md) — `/control/gamification`
- [Empty States Showcase](./empty-states.md) — `/control/empty-states`

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
- `apps/web/src/components/control/ControlInventory.tsx`
- `apps/web/src/components/control/ControlPurchase.tsx`
- `apps/web/src/components/control/ControlPeople.tsx`
- `apps/web/src/components/control/ControlProducts.tsx`
- `apps/web/src/components/control/ControlBOMs.tsx`
- `apps/web/src/components/control/ControlRoleDesigner.tsx`

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
