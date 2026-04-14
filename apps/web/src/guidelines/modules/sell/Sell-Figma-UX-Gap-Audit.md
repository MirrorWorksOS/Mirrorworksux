# Sell module — Figma vs prototype UX gap audit

**Date:** 31 Mar 2026  
**Figma file:** [MW-UX](https://www.figma.com/design/mYbNU57fvXaYpgUZ5yoAnX/MW-UX) (`fileKey`: `mYbNU57fvXaYpgUZ5yoAnX`)  
**Canvas / page:** `0:1` (named “Sell”)  
**Excluded from comparison:** Group **Scraps** — node `1490:20734` and **all descendants** (per project direction). Any layout or note inside that subtree is not treated as current product spec.

**Method:** `get_metadata` on `0:1` via Figma MCP (Desktop); `get_design_context` on `204:22120` (Sell dashboard desktop breakpoint) where full structure was needed. Code reviewed: all routes under `/sell/*` and related components listed below.

---

## Appendix A — Figma Desktop MCP in Cursor

1. Open the MW-UX file in **Figma Desktop** and enable the local MCP server (default URL below).
2. In **Cursor Settings → MCP**, add an HTTP server:

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

Exact keys depend on your Cursor version; use the UI’s “Add MCP” flow if the JSON shape differs.  
3. Verify with `get_metadata`: `fileKey` = `mYbNU57fvXaYpgUZ5yoAnX`, `nodeId` = `0:1`.

Official Figma MCP documentation covers local installation and troubleshooting.

---

## Figma inventory (in scope)

Section titles on the Sell canvas (IA map) include: **CRM / Card view**, **Opportunities**, **Activities**, **Intelligence Hub**, **Products**, **Invoice**, **Orders**, **Quotes**, **Settings**.

| Figma block (representative node) | Node ID | Maps to prototype |
|-----------------------------------|---------|-------------------|
| Blocks / Dashboard-Sell-Overview | `204:22119` (desktop: `204:22120`) | `/sell` — [`SellDashboard.tsx`](../components/sell/SellDashboard.tsx) |
| Blocks / Dashboard-Sell-Analytics | `204:22632` | No dedicated route / tab content |
| Blocks / Dashboard-Sell-Reports | `204:23161`, `480:246893` | No dedicated route / tab content |
| Blocks / CRM Cards (multiple) | `204:24244`, `204:23690`, … | `/sell/crm` |
| Blocks / CRM List | `204:24765` | `/sell/crm` (list mode) |
| Blocks / CRM Invoice | `204:24606` | Partially — invoice context from CRM (see CRM) |
| Blocks / Orders List | `204:25027` | `/sell/orders` |
| Blocks / Invoice List | `215:102463`, `216:107140` | `/sell/invoices` |
| Blocks / Product Cards | `204:23967` | `/sell/products` (card view) |
| Blocks / Products List | `204:25644`, `218:107339` | `/sell/products` (list view) |
| Blocks / Opportunity Kanban | `204:25921` | `/sell/opportunities` |
| Blocks / Opportunity / Overview | `204:26446` | Opportunity detail (sheet) |
| Blocks / Opportunity / New Quote | `204:26997`, `278:166695` | `/sell/quotes/new` |
| Blocks / Opportunity / Activities | `204:27549` | Opportunity sheet — Activities tab (partial) |
| Blocks / Opportunity / Activity Calendar | `294:177483` | **Missing** as screen or tab |
| Blocks / Opportunity / Intelligence Hub | `284:170764` | **Missing** as dedicated surface |
| Blocks / Opportunity / New Activity | `204:28073` | Partial — “Log activity” only |
| Blocks / Opportunity / New Invoice | `294:171225` | **Missing** as dedicated flow (see Invoices) |
| Blocks / Product / Overview | `484:251921` | `/sell/products/:id` |
| Blocks / Product / Manufacturing | `517:253728` | Product detail tab |
| Blocks / Product / Inventory | `519:290499` | Product detail tab |
| Blocks / Product / Accounting | `519:295628` | Product detail tab |
| Blocks / Product / Documents | `519:332160` | Product detail tab |
| Blocks / Sell Settings / General | `223:132261` | `/sell/settings` |
| Blocks / Sell Settings / Teams | `224:133771` | `/sell/settings` |
| Blocks / Settings / Leads | `224:141262` | `/sell/settings` (pipeline panel) |
| Blocks / Settings / Quoting | `227:145191` | `/sell/settings` |
| Blocks / Settings / Payments | `227:152107` | `/sell/settings` |
| Blocks / Settings / Activities | `234:150116` | `/sell/settings` |
| Blocks / Settings / Analytics | `234:155818` | `/sell/settings` |
| Blocks / Settings / Integrations | `234:161494` | `/sell/settings` |
| Blocks / Settings | `222:120290` | Cross-module pattern; Sell uses [`ModuleSettingsLayout`](../components/shared/settings/ModuleSettingsLayout.tsx) |

---

## Gaps by screen

Severity: **P0** = breaks IA parity or primary workflow; **P1** = material UX missing; **P2** = polish / secondary.

### Cross-cutting — navigation & IA

| Gap | Severity | Notes |
|-----|----------|--------|
| Figma Sell canvas labels **Activities**, **Quotes**, and **Intelligence Hub** as first-class areas; [`Sidebar.tsx`](../components/Sidebar.tsx) Sell sub-items are only Dashboard, CRM, Opportunities, Orders, Invoices, Products, Settings — **no Activities**, **no Quotes** (list), **no Intelligence Hub** | **P0** | Align sidebar with designed IA or document intentional reduction. |
| **Quotes:** only `/sell/quotes/new` exists; no **quotes list / pipeline** route comparable to dedicated Quotes column in Figma | **P1** | New Quote block exists in Figma; discovery path in app is weaker. |

### `/sell` — Sell dashboard

Figma **Overview** (`204:22120`): four tabs — **Overview**, **Analysis**, **Reports**, **Forecasts**; four KPI cards (e.g. Total Revenue, New Customers, Active Accounts, Growth Rate); **Revenue** line chart with range toggles (last 3 months / 30 days / 7 days); **Recent Sales** table (rep avatars, **Target** vs **Actual**, subtitle “You made 265 sales this month”).

| Gap | Severity | Notes |
|-----|----------|--------|
| **Tabs:** prototype has a single tab **Overview** only ([`SellDashboard.tsx`](../components/sell/SellDashboard.tsx) + [`ModuleDashboard`](../components/shared/dashboard/ModuleDashboard.tsx)); **Analysis**, **Reports**, **Forecasts** have no UI | **P0** | Figma has three additional dashboard variants: `204:22632` (Analytics), `204:23161` / `480:246893` (Reports). |
| **KPI set differs:** prototype emphasises manufacturing-commercial metrics (outstanding invoices, profit margin, cash flow, overdue, expenses, Xero sync, approval queue); Figma overview emphasises **sales velocity / customer / growth** style KPIs | **P1** | Not wrong for a fab ERP, but not a match to the referenced Overview frame. |
| **Recent Sales** (rep leaderboard with Target / Actual) **missing** | **P1** | Present in Figma overview; absent in code. |
| **Revenue chart** interaction: Figma uses **line** chart + **period toggles**; prototype uses **12-month area** Revenue vs Expenses without those toggles | **P2** | Different chart story. |
| **AiCommandBar** on module dashboard may exceed what’s shown in the shadcn-style overview screenshot — acceptable prototype extension | — | Listed under “prototype-only” below. |

### `/sell/crm` and `/sell/crm/:id`

| Gap | Severity | Notes |
|-----|----------|--------|
| Figma includes **Blocks / CRM Invoice** (`204:24606`) as a distinct block; prototype CRM focuses on cards/list + **customer detail** with invoices embedded — verify parity with that frame’s layout (not fully extracted here) | **P2** | May already be covered by [`SellCustomerDetail.tsx`](../components/sell/SellCustomerDetail.tsx); visual/layout audit recommended. |
| List/table density, filters, and empty states should be checked against **CRM List** (`204:24765`) | **P2** | Structure exists; pixel/feature parity not fully diffed. |

### `/sell/opportunities` and opportunity sheet

| Gap | Severity | Notes |
|-----|----------|--------|
| Figma **Activity Calendar** full block (`294:177483`) — **no calendar view** in app | **P1** | [`SellOpportunityDetail.tsx`](../components/sell/SellOpportunityDetail.tsx) uses timeline, not calendar. |
| Figma **Intelligence Hub** block (`284:170764`) — no dedicated **Intelligence Hub** tab or page; only a compact **AIInsightCard** on overview tab | **P1** | Build Progress mentioned Intelligence Hub; Figma scale is larger. |
| Figma **New Activity** screen (`204:28073`) — prototype has **Log activity** button but no multi-field **new activity** flow matching that block | **P2** | |
| **Quotes** tab / quote pipeline inside opportunity: Figma has **Opportunity / Quotes** pattern (see inventory); sheet tabs are **overview / activities / notes** only — **no Quotes tab** on opportunity | **P1** | |
| **Intelligence Hub** appears as top-level IA in Figma; not reflected in sidebar | **P0** | Same as cross-cutting. |

### `/sell/orders`

| Gap | Severity | Notes |
|-----|----------|--------|
| **Orders List** block (`204:25027`) vs [`SellOrders.tsx`](../components/sell/SellOrders.tsx) — high-level pattern aligns (table, actions); confirm columns (e.g. job reference, filters) against Figma | **P2** | |

### `/sell/invoices`

| Gap | Severity | Notes |
|-----|----------|--------|
| Figma **New Invoice** flow (`294:171225`) — prototype has list + **New Invoice** CTA but no dedicated **full-page / step** builder matched to that block | **P1** | |
| **Invoice Overview** placeholders exist in file (`215:107561` etc., 0×0) — low confidence; treat as WIP in Figma | **P2** | |

### `/sell/products` and `/sell/products/:id`

| Gap | Severity | Notes |
|-----|----------|--------|
| Tab set **Overview · Manufacturing · Inventory · Accounting · Documents** aligns well with Figma nodes `484:251921`–`519:332160` ([`SellProductDetail.tsx`](../components/sell/SellProductDetail.tsx) cites these nodes) | — | Strong parity. |
| **Product creation** spec inside **Scraps** (`481:251920`) is **out of scope** for this audit; if productised, compare future **New Product** screen to that spec separately | — | Excluded by Scrap rule. |
| Confirm **New Product** route UI vs Figma **Product** blocks (non-Scrap) if a dedicated creation frame is added outside Scrap | **P2** | |

### `/sell/quotes/new`

| Gap | Severity | Notes |
|-----|----------|--------|
| Figma **New Quote** + **Sonner** variant (`278:166695`) — prototype has builder + [`AIInsightCard`](../components/shared/ai/AIInsightCard.tsx); confirm toast patterns and field order | **P2** | |

### `/sell/settings`

| Gap | Severity | Notes |
|-----|----------|--------|
| Figma splits **Sell Settings / General**, **Teams**, **Leads**, **Quoting**, **Payments**, **Activities**, **Analytics**, **Integrations**; prototype consolidates into [`SellSettings.tsx`](../components/sell/SellSettings.tsx) panels — **conceptual parity is good** | **P2** | Verify Payments integrations UI vs Figma cards (Stripe/PayPal switches, etc.). |
| Figma **Teams** block (`224:133771`) vs **Access & permissions** in code — align naming and layout | **P2** | |

---

## Prototype-only / design debt (not in matched Figma frames)

These are **intentional or extra** relative to the Overview dashboard frame and standard blocks:

- **Xero Sync Status** card and **Sync Now** on Sell dashboard.
- **Approval Queue** and **Overdue Actions** cards on Sell dashboard.
- **Top 10 Jobs by Profit Margin** bar chart (manufacturing-ERP slant).
- **Six KPI tiles** on dashboard vs Figma overview’s four.
- **AiCommandBar** on [`ModuleDashboard`](../components/shared/dashboard/ModuleDashboard.tsx) when `aiScope` is set.

---

## Follow-ups (suggested order)

1. **P0:** Decide IA: add sidebar entries (and routes or anchors) for **Activities**, **Quotes**, **Intelligence Hub** — or update Figma IA to match app.  
2. **P0:** Implement **Sell dashboard sub-tabs** (Analysis, Reports, Forecasts) as routes or tab panels, reusing `204:22632` / `204:23161` / `480:246893` as reference.  
3. **P1:** Add **Recent Sales** (target vs actual) or equivalent widget to Overview.  
4. **P1:** Opportunity **Quotes** tab and/or **Intelligence Hub** surface; **activity calendar** view.  
5. **P1:** **New Invoice** flow parity with `294:171225`.  
6. **P2:** Pass-level UI review per block (CRM List, Orders List, settings integrations) with `get_design_context` on each node.

---

## Files referenced (prototype)

| Route | File |
|-------|------|
| `/sell` | [`src/components/sell/SellDashboard.tsx`](../components/sell/SellDashboard.tsx) |
| `/sell/crm` | [`SellCRM.tsx`](../components/sell/SellCRM.tsx), [`SellCRMList.tsx`](../components/sell/SellCRMList.tsx) |
| `/sell/crm/:id` | [`SellCustomerDetail.tsx`](../components/sell/SellCustomerDetail.tsx) |
| `/sell/opportunities` | [`SellOpportunities.tsx`](../components/sell/SellOpportunities.tsx), [`SellOpportunityDetail.tsx`](../components/sell/SellOpportunityDetail.tsx) |
| `/sell/orders` | [`SellOrders.tsx`](../components/sell/SellOrders.tsx) |
| `/sell/invoices` | [`SellInvoices.tsx`](../components/sell/SellInvoices.tsx) |
| `/sell/products` | [`SellProducts.tsx`](../components/sell/SellProducts.tsx) |
| `/sell/products/:id` | [`SellProductDetail.tsx`](../components/sell/SellProductDetail.tsx) |
| `/sell/quotes/new` | [`SellNewQuote.tsx`](../components/sell/SellNewQuote.tsx) |
| `/sell/settings` | [`SellSettings.tsx`](../components/sell/SellSettings.tsx) |
| Shell | [`ModuleDashboard.tsx`](../components/shared/dashboard/ModuleDashboard.tsx), [`Sidebar.tsx`](../components/Sidebar.tsx) |
