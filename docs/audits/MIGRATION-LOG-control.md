# Control migration log

All 20 files originally in `docs/modules/control/` have been migrated. Nineteen files are classified **Mixed** (user-intent sections live alongside component/import/dependency sections in the same doc); one file (`role-designer.md`) is classified **Deprecated** — it documents a feature that has been removed from the prototype (`ControlRoleDesigner.tsx` and the `/control/role-designer` route no longer exist), but is still migrated so the deprecation remains discoverable. One file (`README.md`) is a module landing page and is still treated as Mixed (it lists both user workflows and a developer "Important Components" list).

For every Mixed and Deprecated file the original has been moved to `docs/user/modules/control/` and a stub has been created at `docs/dev/modules/control/{same-filename}.md` containing a TODO and the headings a human editor needs to migrate across.

| Old path | New path | Classification | Reasoning |
|----------|----------|----------------|-----------|
| docs/modules/control/README.md | docs/user/modules/control/README.md | Mixed | Module landing page. Purpose / Primary Users / Key Workflows are user-facing; Important Components / Data Dependencies list is developer-facing. |
| docs/modules/control/dashboard.md | docs/user/modules/control/dashboard.md | Mixed | User sections (Summary, User Intent, Data Shown) plus dev sections (Components Used, Dependencies, Related Files). |
| docs/modules/control/locations.md | docs/user/modules/control/locations.md | Mixed | Same hybrid template — user intent and UI sections alongside component imports and dependency notes. |
| docs/modules/control/machines.md | docs/user/modules/control/machines.md | Mixed | As above. |
| docs/modules/control/inventory.md | docs/user/modules/control/inventory.md | Mixed | As above. |
| docs/modules/control/purchase.md | docs/user/modules/control/purchase.md | Mixed | As above. |
| docs/modules/control/people.md | docs/user/modules/control/people.md | Mixed | As above — touches access control surfaces (groups, users) that warrant both audiences. |
| docs/modules/control/products.md | docs/user/modules/control/products.md | Mixed | As above. |
| docs/modules/control/boms.md | docs/user/modules/control/boms.md | Mixed | As above. |
| docs/modules/control/workflow-designer.md | docs/user/modules/control/workflow-designer.md | Mixed | As above. |
| docs/modules/control/factory-layout.md | docs/user/modules/control/factory-layout.md | Mixed | As above — current implementation is a 2D SVG canvas (see `ControlFactoryDesigner.tsx:1-6`). |
| docs/modules/control/process-builder.md | docs/user/modules/control/process-builder.md | Mixed | As above. |
| docs/modules/control/gamification.md | docs/user/modules/control/gamification.md | Mixed | As above. |
| docs/modules/control/shifts.md | docs/user/modules/control/shifts.md | Mixed | As above. Screen label is "Shift Manager" (a UI title, not a role). |
| docs/modules/control/maintenance.md | docs/user/modules/control/maintenance.md | Mixed | As above. |
| docs/modules/control/tooling.md | docs/user/modules/control/tooling.md | Mixed | As above. |
| docs/modules/control/documents.md | docs/user/modules/control/documents.md | Mixed | As above. |
| docs/modules/control/mirrorworks-bridge.md | docs/user/modules/control/mirrorworks-bridge.md | Mixed | As above — the route also accessed from legacy `/design/initial-data` redirect. |
| docs/modules/control/empty-states.md | docs/user/modules/control/empty-states.md | Mixed | As above — showcase page, still documented with mixed content. |
| docs/modules/control/role-designer.md | docs/user/modules/control/role-designer.md | **Deprecated** | Documents a **removed** feature. `ControlRoleDesigner.tsx` has been deleted (`find apps/web/src -name 'ControlRoleDesigner*'` returns nothing). The `/control/role-designer` route is not registered in `apps/web/src/routes.tsx` or `apps/web/src/components/Sidebar.tsx`. Migration preserves the deprecation note; the audit flags this and recommends retirement once no backlink points here. |

## Dev stubs created

For each of the 20 files a companion stub has been created at `docs/dev/modules/control/{filename}.md` holding a TODO and the section headings that need to be moved across when a human editor does the actual split. No content has been copied or transformed.

- docs/dev/modules/control/README.md
- docs/dev/modules/control/boms.md
- docs/dev/modules/control/dashboard.md
- docs/dev/modules/control/documents.md
- docs/dev/modules/control/empty-states.md
- docs/dev/modules/control/factory-layout.md
- docs/dev/modules/control/gamification.md
- docs/dev/modules/control/inventory.md
- docs/dev/modules/control/locations.md
- docs/dev/modules/control/machines.md
- docs/dev/modules/control/maintenance.md
- docs/dev/modules/control/mirrorworks-bridge.md
- docs/dev/modules/control/people.md
- docs/dev/modules/control/process-builder.md
- docs/dev/modules/control/products.md
- docs/dev/modules/control/purchase.md
- docs/dev/modules/control/role-designer.md
- docs/dev/modules/control/shifts.md
- docs/dev/modules/control/tooling.md
- docs/dev/modules/control/workflow-designer.md

## Note on `role-designer.md`

The dev stub at `docs/dev/modules/control/role-designer.md` must not acquire new developer content. The underlying feature is gone. If any backlink still points here, the right action is to remove the link, then retire both the user doc and the stub in a follow-up PR.
