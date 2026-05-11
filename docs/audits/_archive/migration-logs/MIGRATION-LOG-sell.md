# Sell migration log

All 19 files originally in `docs/modules/sell/` have been migrated. One file is classified as **User** (the module landing page), eighteen are **Mixed** — every screen doc combines user-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown) with developer-facing sections (Components Used, Logic / Behaviour, Dependencies, Related Files). For every Mixed file the original has been moved to `docs/user/modules/sell/` and a stub has been created at `docs/dev/modules/sell/{same-filename}.md` containing a TODO and the headings a human editor needs to migrate across.

| Old path | New path | Classification | Reasoning |
|----------|----------|----------------|-----------|
| docs/modules/sell/README.md | docs/user/modules/sell/README.md | User | Module landing page — purpose, primary users, workflow summary, links to screen docs. No developer-only content. |
| docs/modules/sell/dashboard.md | docs/user/modules/sell/dashboard.md | Mixed | User sections (Summary, User Intent, Data Shown) plus dev sections (Components Used, Logic / Behaviour, Related Files). |
| docs/modules/sell/crm.md | docs/user/modules/sell/crm.md | Mixed | Same hybrid template — user intent and UI sections alongside component imports and state notes. |
| docs/modules/sell/activities.md | docs/user/modules/sell/activities.md | Mixed | Task-oriented summary with dev-oriented component/dependency references. |
| docs/modules/sell/opportunities.md | docs/user/modules/sell/opportunities.md | Mixed | As above. |
| docs/modules/sell/opportunity-detail.md | docs/user/modules/sell/opportunity-detail.md | Mixed | As above — adds embedded AI panel notes. |
| docs/modules/sell/orders.md | docs/user/modules/sell/orders.md | Mixed | As above. |
| docs/modules/sell/order-detail.md | docs/user/modules/sell/order-detail.md | Mixed | As above — includes dynamic route + dev caveats on data loading. |
| docs/modules/sell/invoices.md | docs/user/modules/sell/invoices.md | Mixed | As above. |
| docs/modules/sell/invoice-detail.md | docs/user/modules/sell/invoice-detail.md | Mixed | As above. |
| docs/modules/sell/new-invoice.md | docs/user/modules/sell/new-invoice.md | Mixed | As above. |
| docs/modules/sell/quotes.md | docs/user/modules/sell/quotes.md | Mixed | As above. |
| docs/modules/sell/quote-detail.md | docs/user/modules/sell/quote-detail.md | Mixed | As above. |
| docs/modules/sell/new-quote.md | docs/user/modules/sell/new-quote.md | Mixed | As above. |
| docs/modules/sell/products.md | docs/user/modules/sell/products.md | Mixed | As above. |
| docs/modules/sell/product-detail.md | docs/user/modules/sell/product-detail.md | Mixed | As above. |
| docs/modules/sell/customer-detail.md | docs/user/modules/sell/customer-detail.md | Mixed | As above. |
| docs/modules/sell/customer-portal.md | docs/user/modules/sell/customer-portal.md | Mixed | As above. |
| docs/modules/sell/settings.md | docs/user/modules/sell/settings.md | Mixed | Configuration page — user intent plus component/state references. |

## Dev stubs created

For each Mixed file a companion stub has been created at `docs/dev/modules/sell/{filename}.md` holding a TODO comment and the section headings that need to be moved across when a human editor does the actual split. No content has been copied or transformed.

- docs/dev/modules/sell/activities.md
- docs/dev/modules/sell/crm.md
- docs/dev/modules/sell/customer-detail.md
- docs/dev/modules/sell/customer-portal.md
- docs/dev/modules/sell/dashboard.md
- docs/dev/modules/sell/invoice-detail.md
- docs/dev/modules/sell/invoices.md
- docs/dev/modules/sell/new-invoice.md
- docs/dev/modules/sell/new-quote.md
- docs/dev/modules/sell/opportunities.md
- docs/dev/modules/sell/opportunity-detail.md
- docs/dev/modules/sell/order-detail.md
- docs/dev/modules/sell/orders.md
- docs/dev/modules/sell/product-detail.md
- docs/dev/modules/sell/products.md
- docs/dev/modules/sell/quote-detail.md
- docs/dev/modules/sell/quotes.md
- docs/dev/modules/sell/settings.md
