# Make — Documentation migration log

- **Date:** 2026-04-18
- **Worker:** Make module audit (batch)
- **Source tree:** `docs/modules/make/`
- **Classification rule:** every file in the source set is dev-facing (component lists, dependencies, state names, logic notes, "Known Gaps / Questions"). None is written as a user-task article, so all 13 files are classified **Developer** and moved to `docs/dev/modules/make/`. User-facing articles will be authored fresh in `docs/user/modules/make/` (see `docs/audits/user/AUDIT-make.md`).

| Old path | New path | Class | Reason |
|---|---|---|---|
| `docs/modules/make/README.md` | `docs/dev/modules/make/README.md` | Developer | Module index with component paths, "Data Dependencies", "Open Issues / UX Debt". Dev-only shape. |
| `docs/modules/make/dashboard.md` | `docs/dev/modules/make/dashboard.md` | Developer | Lists Components Used, imports from `@/components/...`, "mock/seed data paths". |
| `docs/modules/make/manufacturing-orders.md` | `docs/dev/modules/make/manufacturing-orders.md` | Developer | Dev skeleton (States, Components Used, Logic / Behaviour). |
| `docs/modules/make/manufacturing-order-detail.md` | `docs/dev/modules/make/manufacturing-order-detail.md` | Developer | Dev skeleton; dynamic route; component imports. |
| `docs/modules/make/job-traveler.md` | `docs/dev/modules/make/job-traveler.md` | Developer | Dev skeleton; component imports; mock references. |
| `docs/modules/make/quality.md` | `docs/dev/modules/make/quality.md` | Developer | Dev skeleton; wrapper over `QualityTab`. |
| `docs/modules/make/scrap-analysis.md` | `docs/dev/modules/make/scrap-analysis.md` | Developer | Dev skeleton; chart-theme + KPI component citations. |
| `docs/modules/make/capa.md` | `docs/dev/modules/make/capa.md` | Developer | Dev skeleton; kanban + mock references. |
| `docs/modules/make/schedule.md` | `docs/dev/modules/make/schedule.md` | Developer | Dev skeleton; GanttChart + ScheduleCalendar citations. |
| `docs/modules/make/products.md` | `docs/dev/modules/make/products.md` | Developer | Dev skeleton; toolbar + dialog imports. |
| `docs/modules/make/product-detail.md` | `docs/dev/modules/make/product-detail.md` | Developer | Dev skeleton; thin wrapper. |
| `docs/modules/make/shop-floor.md` | `docs/dev/modules/make/shop-floor.md` | Developer | Dev skeleton; machine-first grid + released-traveller queue; Zustand store mentions. |
| `docs/modules/make/settings.md` | `docs/dev/modules/make/settings.md` | Developer | Dev skeleton; ModuleSettingsLayout + permission keys. |

## Notes

- No file was classified "Mixed"; dev stubs at `docs/dev/modules/make/*` are the migrated originals.
- User articles were **not** migrated — source docs contain no user-task prose. User audit (`docs/audits/user/AUDIT-make.md`) enumerates the task articles that should exist and flags them as P0/P1 gaps.
- No files were deleted.
