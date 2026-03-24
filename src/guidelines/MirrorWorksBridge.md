# MirrorWorks Bridge (PLAT 01)

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](./MirrorWorksModuleSpec.pdf) — **PLAT 01 — Data Import & Onboarding Wizard Specification**.

**Product name:** **MirrorWorks Bridge** — the first operational step after onboarding for importing master data (customers, suppliers, products, machines, users, etc.).

## Prototype

| Item | Location |
| --- | --- |
| Screen | [`MirrorWorksBridge.tsx`](../components/control/MirrorWorksBridge.tsx) (uses [`DataImportWizardLayout`](../components/shared/onboarding/DataImportWizardLayout.tsx)) |
| Route | `/control/mirrorworks-bridge` |
| Legacy redirect | `/design/initial-data` → `/control/mirrorworks-bridge` |

## Wizard behaviour (summary)

Steps, validation rules, file formats, and completion criteria must match **PLAT 01** in the PDF. The current build provides a **multi-step shell** with entity cards and progress; extend with spec-accurate copy and flows as requirements are finalised.

## Design system

Follow [`DesignSystem.md`](./DesignSystem.md): page padding `p-6 space-y-6`, cards `rounded-[var(--shape-lg)]`, primary actions on MW yellow, sentence case, Australian/UK English.

## Related

- [`AccessRightsAndPermissions.md`](./AccessRightsAndPermissions.md) — ARCH 00 permissions (separate from import).
