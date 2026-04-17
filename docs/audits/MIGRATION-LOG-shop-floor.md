# Shop-Floor — migration log

- **Date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Branch:** `docs/audit-shop-floor`

## Note on provenance

Shop-Floor docs were pulled from `docs/modules/platform/` — Shop-Floor does not have its own `docs/modules/shop-floor/` folder; only two docs exist (`floor-home.md`, `floor-run.md`). They were co-located with platform docs even though `/floor/*` is a first-class, kiosk-mode module with its own layout (`FloorModeLayout`, sibling to the tenant `Layout`, no sidebar / no AgentFAB / no command palette).

## Moves

| Source | Destination | Classification | Reason |
|---|---|---|---|
| `docs/modules/platform/floor-home.md` | `docs/user/modules/shop-floor/floor-home.md` | Mixed → user | Describes user intent, primary actions, UI sections, and states alongside component paths/stores. Mixed per brief → git mv to user, stub at dev. |
| `docs/modules/platform/floor-run.md` | `docs/user/modules/shop-floor/floor-run.md` | Mixed → user | Same shape as floor-home; describes execution surface UX with some component references. |

Stubs created:

- `docs/dev/modules/shop-floor/floor-home.md` — one-line pointer with dev quick-references.
- `docs/dev/modules/shop-floor/floor-run.md` — one-line pointer with dev quick-references.

## Not moved

- Nothing else under `docs/modules/platform/` was touched. The platform folder still contains `bridge-wizard.md`, `dashboard-alias.md`, `notifications.md`, `welcome-dashboard.md`, and the section `README.md` — explicitly out of scope for this audit.
- `apps/web/src/` is unchanged. `package.json` is unchanged.

## Related audit artefacts

- `docs/audits/dev/AUDIT-shop-floor.md`
- `docs/audits/user/AUDIT-shop-floor.md`
- `docs/audits/screenshots/shop-floor/` — per-route PNG captures at 1024×768 (tablet) and 1440×900 (desktop).
