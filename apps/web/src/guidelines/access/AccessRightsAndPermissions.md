# Access rights and permissions (ARCH 00)

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](./MirrorWorksModuleSpec.pdf) — **ARCH 00 — Access Rights & Permissions Model**. This document summarises how the UX prototype implements that architecture; the PDF remains authoritative for full definitions.

## Principles

- **Organisation:** Users belong to an organisation; permissions are evaluated in that context.
- **Module groups:** Each operational module (Sell, Plan, Make, Ship, Book, Buy) defines **permission groups** with granular toggles. Users are assigned to one or more groups per module.
- **Control:** Master data, people, workflows, and factory design tools live under Control. User access is managed through Control → People (users and groups) and each module’s Settings → Access & Permissions. Role tiers are fixed — only `admin`, `lead`, `team` (see below).
- **Scopes:** Some permissions use **own vs all** record scope (`documents.scope`, requisition/expense scopes, etc.).

## Prototype mapping

| Concept | Implementation |
| --- | --- |
| Module settings — Access & Permissions | [`ModuleSettingsLayout`](../components/shared/settings/ModuleSettingsLayout.tsx) + per-module `*Settings.tsx` |
| People — users & groups | [`ControlPeople`](../components/control/ControlPeople.tsx), [`ModuleAccessCard`](../components/control/people/ModuleAccessCard.tsx), [`PermissionGrid`](../components/control/people/PermissionGrid.tsx) |
| Role tiers | Three only — `admin` (org-wide bypass), `lead` (module bypass, set on user's module access card), `team` (default). No Role Designer page. |

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
| Plan | `documents.scope` | `schedule.edit`, `budget.visibility`, `bom.edit`, `intelligence_hub.access`, `settings.access`, `reports.access` |
| Make | `documents.scope`, `workorders.scope`, `timers.scope` | `qc.record`, `scrap.report`, `andon.manage`, `maintenance.manage`, `settings.access`, `reports.access` |
| Ship | `documents.scope`, `orders.scope` | `manifests.create`, `carrier.config`, `returns.approve`, `settings.access`, `reports.access` |
| Book | `documents.scope`, `expenses.scope` | `invoices.create`, `po.approve`, `xero.access`, `settings.access`, `reports.access` |
| Buy | `documents.scope`, `requisitions.scope` | `po.create`, `vendors.manage`, `goods_receipts.access`, `po.approve`, `settings.access`, `reports.access` |
| Control | `documents.scope` | `products.manage`, `boms.manage`, `locations.manage`, `machines.manage`, `people.view`, `people.manage`, `workflow.manage`, `settings.access`, `reports.access` |

Exact key strings and labels must match the PDF and the `permissionKeys` arrays in each `*Settings.tsx` (or Control `modulePermissionLabels`).

## Conflict resolution (union semantics)

When a user belongs to multiple groups in the same module, the effective permission set is a **union** of each group's grants — not a merge or a per-key priority list. This is enforced by [`mergePermissionSets`](../lib/contracts/mappers/permissions.ts).

| Permission kind | Rule | Example |
| --- | --- | --- |
| Boolean (e.g. `quotes.create`) | **Allow wins.** If any group grants `true`, the user has it. | `Sales Ops` grants `quotes.create = true`, `Estimators` grants `false` → effective `true`. |
| Scope (e.g. `pipeline.visibility`) | **Broader scope wins.** `all` > `own`. | `Sales Ops` grants `own`, `Estimators` grants `all` → effective `all`. |
| Module lead | **Bypass.** Full access to every permission in the module; group grants are ignored. | A user marked lead of Plan gets all Plan permissions regardless of which groups they're in. |
| Platform super-admin | **Bypass everywhere.** Full access to every module. | Evaluated via `membership.orgRole === 'super_admin'`. |
| Deactivated users | **Zero grants.** Even super-admin and lead flags are ignored. | Enforced at the resolver ([`control-people.ts`](../lib/contracts/mappers/control-people.ts#L141)) so no UI re-check is needed. |

**No explicit deny.** Revoking a permission means removing the user from the group that grants it (or reducing that group's grants in module Settings). There is no per-user override that can undercut a group grant — this is deliberate to keep resolution deterministic and auditable.

### UI surfaces that explain "why"

| Surface | What it shows |
| --- | --- |
| [`EffectivePermissionsPanel`](../components/control/people/EffectivePermissionsPanel.tsx) | Per-permission because-trail: each contributing group, which value won, conflicts highlighted. Shown on `UserDetailSheet`. |
| Lead / super-admin banner on [`UserDetailSheet`](../components/control/people/UserDetailSheet.tsx) | One-line reminder that group grants are bypassed for this user. |
| [`AccessResolutionPopover`](../components/control/people/AccessResolutionPopover.tsx) | Shared "how access is resolved" hint — reused on `ControlGroups` and module Settings. |
| Overlap hint on [`ControlGroups`](../components/control/ControlGroups.tsx) | Flags same-module groups sharing ≥50% active members — usually a merge-or-differentiate signal. |

### Group lifecycle safeguards

[`canDeleteGroup`](../components/control/people/group-helpers.ts) blocks deletion when any of the following hold:

- Group is an **ARCH 00 default** (seed identity is not removable — disable or create a custom group instead).
- Group is the **only group in its module** (deletion would strand members with no permission source).
- Group still has **members assigned** (remove or move them first, so intent is explicit).

## Design tokens

UI for permission tables follows [`DesignSystem.md`](./DesignSystem.md) (Roboto, `tabular-nums` for codes, MW status semantics for badges where applicable).

## Related

- [`MirrorWorksBridge.md`](./MirrorWorksBridge.md) — PLAT 01 data import (post-onboarding), not part of ARCH 00 but adjacent to org onboarding.
