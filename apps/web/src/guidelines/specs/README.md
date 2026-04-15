# Screen-by-screen specifications (§4)

Structured extracts from the combined module specification PDF live alongside this folder. **Source of truth in-repo:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) (`src/guidelines/MirrorWorksModuleSpec.pdf`) — Section 4 (screen-by-screen) per module. Each `*-04-Screen-by-Screen.md` file opens with a **Canonical source** block pointing at this PDF.

| File | Module | Notes |
| --- | --- | --- |
| [Sell-04-Screen-by-Screen.md](./Sell-04-Screen-by-Screen.md) | Sell | Dashboard, CRM, opportunities, orders, quotes, products, invoices, settings |
| [Plan-04-Screen-by-Screen.md](./Plan-04-Screen-by-Screen.md) | Plan | Dashboard, jobs, activities, purchase, QC planning, products, settings |
| [Book-04-Screen-by-Screen.md](./Book-04-Screen-by-Screen.md) | Book | Finance bento, budget, invoices, expenses, purchases, job costs, stock, reports, settings |
| [Ship-04-Screen-by-Screen.md](./Ship-04-Screen-by-Screen.md) | Ship | Dashboard, orders, packaging, shipping, tracking, returns, warehouse, reports, settings |
| [Control-04-Screen-by-Screen.md](./Control-04-Screen-by-Screen.md) | Control | Dashboard, master data, MirrorWorks Bridge, factory/process designers, workflow, people, and access management |
| [Buy-04-Screen-by-Screen.md](./Buy-04-Screen-by-Screen.md) | Buy | Procurement: orders, requisitions, receipts, suppliers, RFQs, bills, products, agreements, reports, settings |
| [Make-04-Screen-by-Screen.md](./Make-04-Screen-by-Screen.md) | Make | Andon/dashboard, schedule, shop floor, work, issues, settings |

## Prototype mapping

**Canonical list:** [`PrototypeRouteMap.md`](./PrototypeRouteMap.md) — route ↔ component for **all modules** (including Control), app shell, and `/design` redirects.

Routes are defined in [`src/routes.tsx`](../../routes.tsx). When §4 references paths that differ from the prototype (e.g. `/plan` vs `/plan/dashboard`), add a **Prototype mapping** subsection in each file or a note in `PrototypeRouteMap.md`.

**Sell — “pipeline”:** The prototype does **not** expose `/sell/pipeline`. Use **Opportunities** (`/sell/opportunities`) and **CRM** (`/sell/crm`) for pipeline-style flows unless a new route is added.

## §4 content (PDF extract)

Section 4 text is lifted from [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) into each `*-04-*.md` file, normalised to:

```markdown
## Screen name
### Purpose
### Data
### Actions
### States
```

Verbatim PDF text (per screen) appears in collapsible `<details>` blocks where extraction was automated. To regenerate from the PDF, run `python3 scripts/extract-module-s4.py` from the repo root (requires `pypdf`).

Cross-link to routes and to [`DesignSystem.md`](../DesignSystem.md) where tokens supersede older PDF hex or monospace guidance.

## Related guidelines

- [`AccessRightsAndPermissions.md`](../AccessRightsAndPermissions.md) — ARCH 00 (permissions, groups, Control People).
- [`MirrorWorksBridge.md`](../MirrorWorksBridge.md) — PLAT 01 (data import after onboarding).
