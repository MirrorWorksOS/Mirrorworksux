# Ship migration log

All 12 files originally in `docs/modules/ship/` have been migrated. One file is classified as **User** (the module landing page). Eleven are **Mixed** — every screen doc combines user-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown) with developer-facing sections (Components Used, Logic / Behaviour, Dependencies, Related Files). For every Mixed file the original has been moved to `docs/user/modules/ship/` and a stub has been created at `docs/dev/modules/ship/{same-filename}.md` containing a TODO comment and the headings a human editor needs to migrate across. No content has been transformed.

| Old path | New path | Classification | Reasoning |
|----------|----------|----------------|-----------|
| docs/modules/ship/README.md | docs/user/modules/ship/README.md | User | Module landing page — purpose, primary users, workflow summary, links to screen docs. No developer-only content. |
| docs/modules/ship/dashboard.md | docs/user/modules/ship/dashboard.md | Mixed | User sections (Summary, User Intent, Data Shown) plus dev sections (Components Used, Logic / Behaviour, Related Files). |
| docs/modules/ship/orders.md | docs/user/modules/ship/orders.md | Mixed | As above — adds Kanban/list view intent alongside component/dependency references. |
| docs/modules/ship/packaging.md | docs/user/modules/ship/packaging.md | Mixed | As above — touch pack-station flow plus ScanInput / Checklist dev notes. |
| docs/modules/ship/shipping.md | docs/user/modules/ship/shipping.md | Mixed | Carrier/rate/manifest workflow plus component list. |
| docs/modules/ship/tracking.md | docs/user/modules/ship/tracking.md | Mixed | Shipment status UX plus TimelineView and status-config dev notes. |
| docs/modules/ship/returns.md | docs/user/modules/ship/returns.md | Mixed | RMA workflow plus chart/table component references. |
| docs/modules/ship/warehouse.md | docs/user/modules/ship/warehouse.md | Mixed | Map/inventory/cycle-count user flow plus component/state notes. |
| docs/modules/ship/scan-to-ship.md | docs/user/modules/ship/scan-to-ship.md | Mixed | Barcode scan workflow plus ScanInput dev references; mock/seed data flagged. |
| docs/modules/ship/carrier-rates.md | docs/user/modules/ship/carrier-rates.md | Mixed | Rate comparison user flow plus sort-state and service-call dev notes. |
| docs/modules/ship/reports.md | docs/user/modules/ship/reports.md | Mixed | Analytics page intent plus chart-component dev refs. |
| docs/modules/ship/settings.md | docs/user/modules/ship/settings.md | Mixed | Configuration intent plus ModuleSettingsLayout / permission-keys dev refs. |

## Dev stubs created

For each Mixed file a companion stub has been created at `docs/dev/modules/ship/{filename}.md` holding a TODO comment and the section headings that need to be moved across when a human editor does the actual split. No content has been copied or transformed.

- docs/dev/modules/ship/dashboard.md
- docs/dev/modules/ship/orders.md
- docs/dev/modules/ship/packaging.md
- docs/dev/modules/ship/shipping.md
- docs/dev/modules/ship/tracking.md
- docs/dev/modules/ship/returns.md
- docs/dev/modules/ship/warehouse.md
- docs/dev/modules/ship/scan-to-ship.md
- docs/dev/modules/ship/carrier-rates.md
- docs/dev/modules/ship/reports.md
- docs/dev/modules/ship/settings.md
