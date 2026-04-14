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

### Multi-source selection (UX prototype)

- On **Source**, users may select **multiple channels** (e.g. spreadsheets for master data **and** pen & paper / whiteboard for scheduling). Checkboxes; **Continue** and **Skip for now** both require **at least one** selection before advancing.
- **Routing** is derived from the combined set:
  - **Scope** (“Your shop” volume questions) runs **whenever `pen_paper` is selected**, including alongside file/API sources (e.g. Xero + pen & paper). **Order:** scope **immediately after** source, then upload (if any non–pen_paper source), then mapping vs manual entry depending on uploaded files, then review → results → team setup when applicable.
  - **Upload** appears if **any** source other than `pen_paper` is selected (spreadsheets, ERPs, Xero, etc.).
- Persisted client state uses the storage key `mirrorworks-bridge-v2` (`sourceSystems: SourceSystem[]`). Pre-launch migration from older keys is optional.

### Manual entry — machines and networking

- Under **Enter data → Machines & work centres**, **Connectivity (optional)** is a collapsible block for shop-floor / network context (integration or protocol, network identifier, notes, and a checkbox for planned live data). Align final field labels and requiredness with internal machine-networking product docs (e.g. Confluence). Users may complete this during Bridge or later in **Control → Machines**.

## Design system

Follow [`DesignSystem.md`](./DesignSystem.md): page padding `p-6 space-y-6`, cards `rounded-[var(--shape-lg)]`, primary actions on MW yellow, sentence case, Australian/UK English.

## Related

- [`AccessRightsAndPermissions.md`](./AccessRightsAndPermissions.md) — ARCH 00 permissions (separate from import).
