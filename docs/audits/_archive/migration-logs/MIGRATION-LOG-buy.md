# Buy migration log

All 20 files originally in `docs/modules/buy/` have been migrated. One file is classified as **User** (the module landing page), nineteen are **Mixed** — every screen doc combines user-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown) with developer-facing sections (Components Used, Logic / Behaviour, Dependencies, Related Files). For every Mixed file the original has been moved to `docs/user/modules/buy/` and a stub has been created at `docs/dev/modules/buy/{same-filename}.md` containing a TODO and the headings a human editor needs to migrate across. No content has been copied or transformed — that is deliberate, because (see `docs/audits/dev/AUDIT-buy.md`) the user-doc text contains factual errors about service wiring that should not be copy-pasted into dev docs.

| Old path | New path | Classification | Reasoning |
|----------|----------|----------------|-----------|
| docs/modules/buy/README.md | docs/user/modules/buy/README.md | User | Module landing page — purpose, primary users, workflow summary, links to screen docs. No developer-only content. |
| docs/modules/buy/dashboard.md | docs/user/modules/buy/dashboard.md | Mixed | User sections (Summary, User Intent, Data Shown) plus dev sections (Components Used, Logic / Behaviour, Related Files). |
| docs/modules/buy/orders.md | docs/user/modules/buy/orders.md | Mixed | Same hybrid template — user intent and UI sections alongside component imports and state notes. |
| docs/modules/buy/order-detail.md | docs/user/modules/buy/order-detail.md | Mixed | Dynamic route — user guidance plus dev caveats on mock data loading. |
| docs/modules/buy/requisitions.md | docs/user/modules/buy/requisitions.md | Mixed | As above. |
| docs/modules/buy/requisition-detail.md | docs/user/modules/buy/requisition-detail.md | Mixed | As above. |
| docs/modules/buy/receipts.md | docs/user/modules/buy/receipts.md | Mixed | As above. |
| docs/modules/buy/suppliers.md | docs/user/modules/buy/suppliers.md | Mixed | As above. |
| docs/modules/buy/supplier-detail.md | docs/user/modules/buy/supplier-detail.md | Mixed | As above. |
| docs/modules/buy/rfqs.md | docs/user/modules/buy/rfqs.md | Mixed | As above. |
| docs/modules/buy/bills.md | docs/user/modules/buy/bills.md | Mixed | As above. |
| docs/modules/buy/products.md | docs/user/modules/buy/products.md | Mixed | As above. |
| docs/modules/buy/product-detail.md | docs/user/modules/buy/product-detail.md | Mixed | As above — component is a 9-line wrapper around a shared product page. |
| docs/modules/buy/agreements.md | docs/user/modules/buy/agreements.md | Mixed | As above. |
| docs/modules/buy/mrp-suggestions.md | docs/user/modules/buy/mrp-suggestions.md | Mixed | As above — note potential overlap with `/plan/mrp` (see AUDIT-buy.md Consistency). |
| docs/modules/buy/planning-grid.md | docs/user/modules/buy/planning-grid.md | Mixed | As above. |
| docs/modules/buy/vendor-comparison.md | docs/user/modules/buy/vendor-comparison.md | Mixed | As above. |
| docs/modules/buy/reorder-rules.md | docs/user/modules/buy/reorder-rules.md | Mixed | As above. |
| docs/modules/buy/reports.md | docs/user/modules/buy/reports.md | Mixed | As above. |
| docs/modules/buy/settings.md | docs/user/modules/buy/settings.md | Mixed | Configuration page — user intent plus component/state references and the permission-key declaration ARCH 00 §4.8 lives in the component itself. |

## Dev stubs created

For each Mixed file a companion stub has been created at `docs/dev/modules/buy/{filename}.md` holding a TODO comment and the section headings that need to be moved across when a human editor does the actual split. The stubs also add headings that were missing from the original template: `Service layer`, `Types`, `Mock shape`, `Stores / React Query keys`, `Event flows`, `Permission gate (ARCH 00 §4.8)`, `Tier gate (Pilot / Produce / Expand / Excel)`, `Migration status`, and `Testing`. The first four of those are new structural requirements flagged by the Sell audit and carried forward here.

- docs/dev/modules/buy/agreements.md
- docs/dev/modules/buy/bills.md
- docs/dev/modules/buy/dashboard.md
- docs/dev/modules/buy/mrp-suggestions.md
- docs/dev/modules/buy/order-detail.md
- docs/dev/modules/buy/orders.md
- docs/dev/modules/buy/planning-grid.md
- docs/dev/modules/buy/product-detail.md
- docs/dev/modules/buy/products.md
- docs/dev/modules/buy/receipts.md
- docs/dev/modules/buy/reorder-rules.md
- docs/dev/modules/buy/reports.md
- docs/dev/modules/buy/requisition-detail.md
- docs/dev/modules/buy/requisitions.md
- docs/dev/modules/buy/rfqs.md
- docs/dev/modules/buy/settings.md
- docs/dev/modules/buy/supplier-detail.md
- docs/dev/modules/buy/suppliers.md
- docs/dev/modules/buy/vendor-comparison.md

## Not migrated

None. Every file in `docs/modules/buy/` is accounted for above. `docs/modules/buy/` is now empty and the directory can be removed in a follow-up commit.
