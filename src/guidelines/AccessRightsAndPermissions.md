# Access rights and permissions (ARCH 00)

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](./MirrorWorksModuleSpec.pdf) — **ARCH 00 — Access Rights & Permissions Model**. This document summarises how the UX prototype implements that architecture; the PDF remains authoritative for full definitions.

## Principles

- **Organisation:** Users belong to an organisation; permissions are evaluated in that context.
- **Module groups:** Each operational module (Sell, Plan, Make, Ship, Book, Buy) defines **permission groups** with granular toggles. Users are assigned to one or more groups per module.
- **Control:** Master data, people, workflows, and factory design tools live under Control; **global role templates** (Role designer) complement module groups.
- **Scopes:** Some permissions use **own vs all** record scope (`documents.scope`, requisition/expense scopes, etc.).

## Prototype mapping

| Concept | Implementation |
| --- | --- |
| Module settings — Access & Permissions | [`ModuleSettingsLayout`](../components/shared/settings/ModuleSettingsLayout.tsx) + per-module `*Settings.tsx` |
| People — users & groups | [`ControlPeople`](../components/control/ControlPeople.tsx), [`ModuleAccessCard`](../components/control/people/ModuleAccessCard.tsx), [`PermissionGrid`](../components/control/people/PermissionGrid.tsx) |
| Role templates | [`ControlRoleDesigner`](../components/control/ControlRoleDesigner.tsx) at `/control/role-designer` |

## Permission matrix (by module, ARCH 00 §4.3–§4.9)

Keys and labels are defined in code to match the spec sections below. Use these as the audit checklist against the PDF.

| Module | ARCH section | Source file |
| --- | --- | --- |
| Sell | §4.3 | [`SellSettings.tsx`](../components/sell/SellSettings.tsx) — `sellPermissionKeys` |
| Plan | §4.4 | [`PlanSettings.tsx`](../components/plan/PlanSettings.tsx) — `planPermissionKeys` |
| Make | §4.5 | [`MakeSettings.tsx`](../components/make/MakeSettings.tsx) — `makePermissionKeys` |
| Ship | §4.6 | [`ShipSettings.tsx`](../components/ship/ShipSettings.tsx) — `shipPermissionKeys` |
| Book | §4.7 | [`BookSettings.tsx`](../components/book/BookSettings.tsx) — `bookPermissionKeys` |
| Buy | §4.8 | [`BuySettings.tsx`](../components/buy/BuySettings.tsx) — `buyPermissionKeys` |
| Control | §4.9 | [`mock-data.ts`](../components/control/people/mock-data.ts) — `modulePermissionLabels.control` and Control groups |

### Permission types (summary)

| Module | Typical scope-style keys | Typical boolean keys |
| --- | --- | --- |
| Sell | `documents.scope`, `pipeline.visibility` | `crm.access`, `quotes.create`, `invoices.create`, `pricing.edit`, `settings.access`, `reports.access` |
| Plan | `documents.scope` | `schedule.edit`, `budget.visibility`, `bom.edit`, `intelligence_hub.access`, `jobs.assign`, `settings.access`, `reports.access` |
| Make | `documents.scope`, `workorders.scope`, `timers.scope` | `qc.record`, `scrap.report`, `andon.manage`, `jobs.assign`, `quality.approve`, `maintenance.schedule`, `settings.access`, `reports.access` |
| Ship | `documents.scope`, `orders.scope` | `manifests.create`, `carrier.config`, `returns.approve`, `orders.create`, `settings.access`, `reports.access` |
| Book | `documents.scope`, `expenses.scope` | `invoices.create`, `po.approve`, `xero.access`, `settings.access`, `reports.access` |
| Buy | `documents.scope`, `requisitions.scope` | `po.create`, `vendors.manage`, `goods_receipts.access`, `po.approve`, `settings.access`, `reports.access` |
| Control | `documents.scope` | `products.manage`, `boms.manage`, `locations.manage`, `machines.manage`, `people.view`, `people.manage`, `workflow.manage`, `settings.access`, `reports.access` |

Exact key strings and labels must match the PDF and the `permissionKeys` arrays in each `*Settings.tsx` (or Control `modulePermissionLabels`).

## Design tokens

UI for permission tables follows [`DesignSystem.md`](./DesignSystem.md) (Roboto, `tabular-nums` for codes, MW status semantics for badges where applicable).

## Related

- [`MirrorWorksBridge.md`](./MirrorWorksBridge.md) — PLAT 01 data import (post-onboarding), not part of ARCH 00 but adjacent to org onboarding.
