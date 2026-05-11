# Book module — Filter / Search / View migration plan

**Status:** Plan · **Date:** 2026-05-11 · **Owner:** Matt
**Audit input:** [`docs/audits/dev/AUDIT-filters-book.md`](../../audits/dev/AUDIT-filters-book.md)
**Cross-module design:** [`docs/plans/FILTERS-REDESIGN.md`](../FILTERS-REDESIGN.md)
**Reference pilot:** Sell — commit `d4f0c565` (see especially `apps/web/src/components/sell/SellInvoices.tsx` for the aging-bucket + board pattern Book reuses everywhere)

Book is the finance / accounting / costing module. Compared to Sell it leans harder on **fiscal period scope** (MTD / QTD / YTD / FY), **aging buckets** (AR, AP, WIP), **"as-at" snapshot dates** (Stock, WIP), and **hierarchical roll-ups** (chart of accounts, P&L). The Sell pilot's `aging` facet + `board` view (`apps/web/src/components/sell/SellInvoices.tsx:81-134`) is the canonical pattern — repeat it on Book AR, AP, and WIP.

---

## Design rules carried from the pilot

1. **Schema-driven** — one `FilterSchema` per list/board screen, fed to `ModuleFilterBar`.
2. **Lucide icons only** — `iconTone`: `yellow | info | success | warning | error | neutral`. Yellow tile = dark icon.
3. **Heights C** — 40 px chips, 48 px bar — built into `ModuleFilterBar`.
4. **Book quick-range default** — finance work rarely needs `today` / `next7days`. The Book default chip set on every date facet is:
   ```ts
   const BOOK_QUICK_RANGES = ['thisMonth', 'lastMonth', 'thisQuarter', 'ytd', 'lastYear'];
   ```
   Per-facet overrides are noted inline where the screen needs something different (e.g. expense date wants `thisWeek` too; "as at" wants a single `today` shortcut).
5. **Three roles only** — `admin / lead / team`. Lead-shared presets land in the `Team` section.
6. **No emoji** in system presets — Lucide icon + tone.

---

## Out of scope (deferred follow-ups)

- **Comparison mode** (this-month vs last-month, this-FY vs prior FY side-by-side) — large enough to warrant its own design pass. Surfaces affected: every Book screen. Tracked separately.
- **Multi-currency filter** — depends on multi-currency data model landing (`XeroMappingPage.tsx:422` only surfaces base currency today).
- **Saved-view server backend** — uses localStorage from the pilot for now.

---

## Screen-by-screen migration

### 1. BookInvoices (AR list)

**File:** `apps/web/src/components/book/BookInvoices.tsx`
**Current state:** Status pills `All / Draft / Sent / Viewed / Paid / Overdue` at `BookInvoices.tsx:333`; search wired to invoice # + customer at `BookInvoices.tsx:113`; `Filter` button is a toast stub at `BookInvoices.tsx:300`; list view only; summary bar at `BookInvoices.tsx:358`.

```ts
import { AlertTriangle, CalendarDays, Clock, DollarSign, FileWarning,
  List as ListIcon, Table as TableIcon, User as UserIcon, Zap } from 'lucide-react';

const MODULE_ID = 'book.invoices';

const AR_AGING_OPTIONS = [
  { value: 'current', label: 'Current (not due)' },
  { value: '0-30',  label: '1–30 days overdue'  },
  { value: '31-60', label: '31–60 days overdue' },
  { value: '61-90', label: '61–90 days overdue' },
  { value: '90+',   label: '90+ days overdue'   },
];

export const bookInvoicesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Invoices (AR)',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', pinned: true, options: [
      { value: 'draft',   label: 'Draft',   color: 'var(--neutral-300)' },
      { value: 'sent',    label: 'Sent',    color: 'var(--mw-mirage)' },
      { value: 'viewed',  label: 'Viewed',  color: 'var(--mw-info)' },
      { value: 'paid',    label: 'Paid',    color: 'var(--mw-yellow-400)' },
      { value: 'overdue', label: 'Overdue', color: 'var(--mw-error)' },
    ]},
    { id: 'aging', label: 'Aging', kind: 'multi', pinned: true,
      icon: Clock, options: AR_AGING_OPTIONS },
    { id: 'customer', label: 'Customer', kind: 'select', icon: UserIcon, options: customerOptions },
    { id: 'balanceDue', label: 'Balance due', kind: 'range', icon: DollarSign },
    { id: 'reminderCadence', label: 'Reminders', kind: 'multi', options: [
      { value: 'never', label: 'Never reminded' },
      { value: '1',     label: '1 reminder' },
      { value: '2',     label: '2 reminders' },
      { value: '3+',    label: '3+ reminders' },
    ]},
    { id: 'xeroSync', label: 'Xero sync', kind: 'select', options: [
      { value: 'synced',  label: 'Synced' },
      { value: 'pending', label: 'Pending' },
      { value: 'error',   label: 'Error' },
    ]},
    { id: 'jobRef', label: 'Job / SO', kind: 'tag' },
    { id: 'hasDispute', label: 'Has dispute', kind: 'boolean' },
    { id: 'dueDate', label: 'Due', kind: 'date', icon: CalendarDays,
      placeholder: 'Any due date',
      quickRanges: ['thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'ytd'] },
  ],
  viewModes: [
    { id: 'list',     label: 'List',          icon: ListIcon },
    { id: 'board',    label: 'Aging buckets', icon: TableIcon, groupBy: 'aging' },
    { id: 'kanban',   label: 'Collections',   icon: TableIcon, groupBy: 'status' },
    { id: 'calendar', label: 'Due calendar',  icon: CalendarDays, groupBy: 'dueDate' },
  ],
  defaultView: 'list',
  dateFacetId: 'dueDate',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| Aged debtors > 60 days | `AlertTriangle` | `error`   | `aging: ['61-90','90+']`, `view: 'board'` |
| Month-end close — unposted | `FileWarning` | `warning` | `status: ['draft']`, `dueDate: thisMonth` |
| Top 20 by balance due | `DollarSign`  | `warning` | `balanceDue: { from: 5000 }`, sort by balance desc |
| Disputed invoices | `AlertTriangle` | `error`   | `hasDispute: true` |
| Xero sync errors | `Zap` | `error`   | `xeroSync: 'error'` |

**Required data work**
- Compute `agingBucket(invoice)` helper (port from `SellInvoices.tsx:89-97`).
- Surface `reminderCount`, `hasDispute`, `xeroSyncState`, `jobRef` on the invoice mock (`sellInvoices` service currently only exposes status/amount/dates).

**Smart-filter ideas**
- "Invoices likely to be paid late" — customer DSO × current aging.
- "Customers I haven't chased in 14 days" — for collections triage.
- "Anomalously large invoice for this customer" — z-score vs prior 6 months.
- "Disputed > 30 days" — dispute aging.
- "Likely-write-off candidates" — aging × customer payment history.

---

### 2. PurchaseOrders (AP / commitments)

**File:** `apps/web/src/components/book/PurchaseOrders.tsx`
**Current state:** Search box unwired at `PurchaseOrders.tsx:137`; filter is a toast stub at `PurchaseOrders.tsx:148`; status pills at `PurchaseOrders.tsx:41`; 3-way match column at `PurchaseOrders.tsx:46` is computed but not filterable.

```ts
import { CalendarDays, ClipboardCheck, DollarSign, Truck,
  List as ListIcon, KanbanSquare, Calendar } from 'lucide-react';

const MODULE_ID = 'book.purchase-orders';

export const purchaseOrdersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Purchase Orders',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', pinned: true, options: [
      { value: 'draft',     label: 'Draft' },
      { value: 'sent',      label: 'Sent' },
      { value: 'partial',   label: 'Partial' },
      { value: 'received',  label: 'Received' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
    { id: 'match', label: '3-way match', kind: 'multi', pinned: true,
      icon: ClipboardCheck, options: [
        { value: 'matched',     label: 'Matched',         color: 'var(--mw-success)' },
        { value: 'price-var',   label: 'Price variance',  color: 'var(--mw-warning)' },
        { value: 'qty-var',     label: 'Qty variance',    color: 'var(--mw-warning)' },
        { value: 'unmatched',   label: 'Unmatched',       color: 'var(--neutral-400)' },
      ]},
    { id: 'approval', label: 'Approval', kind: 'multi', options: [
      { value: 'pending',  label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'auto',     label: 'Auto-approved' },
    ]},
    { id: 'receipt', label: 'Receipt', kind: 'select', icon: Truck, options: [
      { value: 'none',    label: 'Not received' },
      { value: 'partial', label: 'Partial' },
      { value: 'full',    label: 'Fully received' },
    ]},
    { id: 'supplier', label: 'Supplier', kind: 'select', options: supplierOptions },
    { id: 'jobRef',   label: 'Job / cost-centre', kind: 'tag' },
    { id: 'billMatched', label: 'Bill matched', kind: 'boolean' },
    { id: 'amount', label: 'Amount', kind: 'range', icon: DollarSign },
    { id: 'expectedDelivery', label: 'Expected delivery', kind: 'date',
      icon: CalendarDays,
      quickRanges: ['thisWeek', 'next7days', 'thisMonth', 'thisQuarter'] },
  ],
  viewModes: [
    { id: 'list',     label: 'List',     icon: ListIcon },
    { id: 'kanban',   label: 'Approval', icon: KanbanSquare, groupBy: 'approval' },
    { id: 'calendar', label: 'Delivery', icon: Calendar,     groupBy: 'expectedDelivery' },
    { id: 'board',    label: 'Supplier × Month', icon: TableIcon, groupBy: 'supplier' },
  ],
  defaultView: 'list',
  dateFacetId: 'expectedDelivery',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| 3-way mismatches | `AlertTriangle` | `error` | `match: ['price-var','qty-var','unmatched']` |
| Overdue receipts | `Truck` | `warning` | `receipt: 'none'`, `expectedDelivery: { to: today }` |
| Pending approval > $10k | `DollarSign` | `warning` | `approval: 'pending'`, `amount: { from: 10000 }` |
| Bills not yet matched | `ClipboardCheck` | `info` | `billMatched: false`, `status: 'received'` |

**Required data work**
- Expose computed `match` (`PurchaseOrders.tsx:46`) as a filterable facet value on the row.
- Add `approvalState`, `receiptState`, `billMatched` to the PO mock.
- Persist `expectedDelivery` as ISO date (Ship audit flags this pattern repo-wide).

**Smart-filter ideas**
- "POs likely to ship late given supplier OTD".
- "Items where MRP says reorder but no PO exists" (cross-module to Plan).
- "Suspicious 3-way mismatches" — variance × supplier history.
- "POs above approver threshold" — surfaces auto-flagged risk.

---

### 3. BookCostVariance

**File:** `apps/web/src/components/book/BookCostVariance.tsx`
**Current state:** No filter / search / period / view toggle at `BookCostVariance.tsx:96-298`. KPI row + grouped bar + expandable per-job table.

```ts
import { Activity, Briefcase, Calendar, Layers,
  List as ListIcon, Grid3x3, BarChart3, LineChart } from 'lucide-react';

const MODULE_ID = 'book.cost-variance';

export const costVarianceFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Cost variance',
  facets: [
    { id: 'period', label: 'Period', kind: 'date', pinned: true,
      icon: Calendar,
      quickRanges: ['lastMonth', 'thisMonth', 'thisQuarter', 'ytd', 'lastYear'] },
    { id: 'jobStatus', label: 'Job status', kind: 'multi', pinned: true, options: [
      { value: 'active',   label: 'Active' },
      { value: 'complete', label: 'Complete' },
      { value: 'on-hold',  label: 'On hold' },
    ]},
    { id: 'category', label: 'Cost category', kind: 'multi', icon: Layers, options: [
      { value: 'materials',   label: 'Materials' },
      { value: 'labour',      label: 'Labour' },
      { value: 'overhead',    label: 'Overhead' },
      { value: 'subcontract', label: 'Subcontract' },
    ]},
    { id: 'customer',   label: 'Customer',     kind: 'select' },
    { id: 'department', label: 'Department',   kind: 'select' },
    { id: 'varianceThreshold', label: 'Variance band', kind: 'select', options: [
      { value: 'gt5',   label: '> 5%'  },
      { value: 'gt10',  label: '> 10%' },
      { value: 'gt20',  label: '> 20%' },
    ]},
    { id: 'direction', label: 'Direction', kind: 'select', options: [
      { value: 'over',  label: 'Over budget'  },
      { value: 'under', label: 'Under budget' },
    ]},
    { id: 'varianceType', label: 'Value type', kind: 'select', options: [
      { value: 'dollar',  label: '$ variance' },
      { value: 'percent', label: '% variance' },
    ]},
  ],
  viewModes: [
    { id: 'list',  label: 'List',     icon: ListIcon },
    { id: 'board', label: 'Pivot',    icon: Grid3x3,    groupBy: 'category' },
    { id: 'board', label: 'Heatmap',  icon: BarChart3,  groupBy: 'category' },
    { id: 'list',  label: 'Trend',    icon: LineChart,  groupBy: 'period' },
  ],
  defaultView: 'list',
  dateFacetId: 'period',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| Jobs over budget > 10% | `AlertTriangle` | `error`   | `varianceThreshold: 'gt10'`, `direction: 'over'` |
| Material variance only | `Layers`        | `warning` | `category: ['materials']` |
| This-quarter close     | `Calendar`      | `info`    | `period: thisQuarter` |
| Loss-makers (>20% over) | `Activity`     | `error`   | `varianceThreshold: 'gt20'`, `direction: 'over'` |
| My department          | `Briefcase`    | `neutral` | `department: <currentUserDept>` |

**Required data work**
- Variance threshold + direction are computed but not exposed — add `varianceDollar` and `variancePercent` to row.
- Wire fiscal period selector — currently no date control at all on the screen.

**Smart-filter ideas**
- "Jobs trending over budget" — burn-rate × remaining work.
- "Categories with rising variance vs prior quarter".
- "Jobs whose variance moved >10% week-on-week".

---

### 4. BookWipValuation

**File:** `apps/web/src/components/book/BookWipValuation.tsx`
**Current state:** Flat KPI + table at `BookWipValuation.tsx:106-138`. No filter / search / period / view toggle.

```ts
import { CalendarClock, DollarSign, Layers, Percent,
  List as ListIcon, Grid3x3, LineChart } from 'lucide-react';

const MODULE_ID = 'book.wip-valuation';

export const wipValuationFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'WIP valuation',
  facets: [
    { id: 'asAt', label: 'As at', kind: 'date', pinned: true,
      icon: CalendarClock,
      quickRanges: ['today', 'lastMonth', 'thisQuarter', 'ytd'] },
    { id: 'jobStatus', label: 'Job status', kind: 'multi', pinned: true, options: [
      { value: 'active',  label: 'Active'  },
      { value: 'on-hold', label: 'On hold' },
      { value: 'closed',  label: 'Closed (audit risk)' },
    ]},
    { id: 'wipAging', label: 'WIP age', kind: 'multi', options: [
      { value: '0-30',  label: '0–30 days'  },
      { value: '31-60', label: '31–60 days' },
      { value: '61-90', label: '61–90 days' },
      { value: '90+',   label: 'Over 90 days' },
    ]},
    { id: 'pctComplete', label: '% complete', kind: 'multi', icon: Percent, options: [
      { value: '0-25',   label: '0–25%'   },
      { value: '25-50',  label: '25–50%'  },
      { value: '50-75',  label: '50–75%'  },
      { value: '75-100', label: '75–100%' },
    ]},
    { id: 'customer',   label: 'Customer',   kind: 'select' },
    { id: 'department', label: 'Department', kind: 'select' },
    { id: 'pm',         label: 'Project manager', kind: 'user' },
    { id: 'wipBalance', label: 'WIP balance', kind: 'range', icon: DollarSign },
  ],
  viewModes: [
    { id: 'list',  label: 'List',      icon: ListIcon },
    { id: 'board', label: 'Aging',     icon: Grid3x3,   groupBy: 'wipAging' },
    { id: 'board', label: 'By customer', icon: Layers,  groupBy: 'customer' },
    { id: 'list',  label: 'Trend',     icon: LineChart, groupBy: 'asAt' },
  ],
  defaultView: 'board',
  dateFacetId: 'asAt',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| Over-aged WIP > 90 days | `AlertTriangle` | `error`   | `wipAging: ['90+']`, `view: 'board'` |
| Top 10 WIP balances     | `DollarSign`    | `warning` | sort by `wipBalance` desc, `limit: 10` |
| WIP on closed jobs (audit) | `FileWarning` | `error`   | `jobStatus: ['closed']` |
| As at month-end         | `CalendarClock` | `info`    | `asAt: lastDayOfLastMonth` |

**Required data work**
- "As at" date is mandatory for a balance-sheet item — currently not present at all.
- Compute `wipAgingDays` (days since first cost posted) per job.
- Add `pctComplete` band binning.

**Smart-filter ideas**
- "WIP at risk of write-down" — aging × inactivity.
- "Jobs likely to close this period (clear WIP)".
- "Over-aged WIP by department" suggested chip.

---

### 5. StockValuation

**File:** `apps/web/src/components/book/StockValuation.tsx`
**Current state:** Costing-method `Select` at `StockValuation.tsx:77`; **"As at" button is a non-functional stub at `StockValuation.tsx:88`**; tabs at `StockValuation.tsx:66`; no search/filter on the table; `age` column classifies Fresh/Active/Slow/Stale but isn't filterable.

```ts
import { CalendarClock, MapPin, Package, DollarSign, Timer,
  List as ListIcon, Grid3x3, AlertTriangle } from 'lucide-react';

const MODULE_ID = 'book.stock-valuation';

export const stockValuationFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Stock valuation',
  facets: [
    { id: 'asAt', label: 'As at', kind: 'date', pinned: true,
      icon: CalendarClock,
      quickRanges: ['today', 'lastMonth', 'thisQuarter', 'ytd'] },
    { id: 'tab', label: 'Class', kind: 'select', pinned: true, persistent: true,
      icon: Package, options: [
        { value: 'raw',   label: 'Raw materials' },
        { value: 'wip',   label: 'WIP' },
        { value: 'fg',    label: 'Finished goods' },
        { value: 'adj',   label: 'Adjustments' },
      ]},
    { id: 'costing', label: 'Costing method', kind: 'select', pinned: true, options: [
      { value: 'fifo',   label: 'FIFO'   },
      { value: 'lifo',   label: 'LIFO'   },
      { value: 'avco',   label: 'AVCO'   },
      { value: 'actual', label: 'Actual' },
    ]},
    { id: 'age', label: 'Age', kind: 'multi', icon: Timer, options: [
      { value: 'fresh',  label: 'Fresh'  },
      { value: 'active', label: 'Active' },
      { value: 'slow',   label: 'Slow'   },
      { value: 'stale',  label: 'Stale'  },
    ]},
    { id: 'location',    label: 'Location',    kind: 'select', icon: MapPin },
    { id: 'materialClass', label: 'Material', kind: 'multi', options: [
      { value: 'MS', label: 'Mild steel' },
      { value: 'SS', label: 'Stainless'  },
      { value: 'AL', label: 'Aluminium'  },
      { value: 'CO', label: 'Consumables' },
    ]},
    { id: 'reorderStatus', label: 'Reorder', kind: 'multi', options: [
      { value: 'below', label: 'Below min' },
      { value: 'at',    label: 'At min'    },
      { value: 'above', label: 'Above max' },
    ]},
    { id: 'totalValue',   label: 'Total value',  kind: 'range', icon: DollarSign },
    { id: 'lastMovement', label: 'Last moved',   kind: 'date',
      quickRanges: ['lastMonth', 'thisQuarter', 'thisYear', 'lastYear'] },
  ],
  viewModes: [
    { id: 'list',  label: 'List',                 icon: ListIcon },
    { id: 'board', label: 'Location × Material',  icon: Grid3x3,       groupBy: 'location' },
    { id: 'list',  label: 'Dead stock',           icon: AlertTriangle, groupBy: 'age' },
  ],
  defaultView: 'list',
  dateFacetId: 'asAt',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| Dead stock (>180 days) | `AlertTriangle` | `error`   | `age: ['stale']`, sort by `lastMovement` asc |
| Below reorder point    | `Package`       | `warning` | `reorderStatus: ['below']` |
| High-value top 20      | `DollarSign`    | `warning` | sort by `totalValue` desc, `limit: 20` |
| Slow-movers — FG       | `Timer`         | `info`    | `tab: 'fg'`, `age: ['slow','stale']` |

**Required data work — biggest prerequisite in the module**
- **Wire the "As at" picker.** Currently a non-functional `Button` at `StockValuation.tsx:88`. Snapshot recomputation of unit cost / total value at the chosen date is the gating piece — without it the rest of this screen's filters are cosmetic.
- Persist `age` classification per row (already shown as text, but not stored).
- Compute `lastMovementDate` per SKU.
- Add `reorderStatus` derived from min/max thresholds.

**Smart-filter ideas**
- "Stock at risk of write-down" — slow movers × age × forecasted demand.
- "Stock-outs imminent" — below-min × usage trend.
- "Unmoved this year" — proactive cleanup chip.

---

### 6. JobProfitability

**File:** `apps/web/src/components/book/JobProfitability.tsx`
**Current state:** Three button stubs at `JobProfitability.tsx:101-114`; KPIs + two charts + flat table; `marginToScalePercent` already classifies margin band (see `chart-theme.ts`).

```ts
import { Calendar, DollarSign, Percent, UserCircle,
  List as ListIcon, Grid3x3, BarChart3 } from 'lucide-react';

const MODULE_ID = 'book.job-profitability';

export const jobProfitabilityFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Job profitability',
  facets: [
    { id: 'period', label: 'Period', kind: 'date', pinned: true,
      icon: Calendar,
      quickRanges: ['lastMonth', 'thisQuarter', 'ytd', 'thisYear', 'lastYear'] },
    { id: 'marginBand', label: 'Margin', kind: 'multi', pinned: true,
      icon: Percent, options: [
        { value: 'loss',   label: '< 0%',     color: 'var(--mw-error)' },
        { value: '0-10',   label: '0–10%',    color: 'var(--mw-warning)' },
        { value: '10-20',  label: '10–20%' },
        { value: '20-30',  label: '20–30%' },
        { value: '30+',    label: '> 30%',    color: 'var(--mw-success)' },
      ]},
    { id: 'jobStatus', label: 'Status', kind: 'multi', options: [
      { value: 'complete',     label: 'Complete' },
      { value: 'in-production', label: 'In production' },
      { value: 'on-hold',      label: 'On hold' },
    ]},
    { id: 'customer',      label: 'Customer',        kind: 'select' },
    { id: 'productLine',   label: 'Product line',    kind: 'multi' },
    { id: 'accountManager', label: 'Account manager', kind: 'user', icon: UserCircle },
    { id: 'revenueBand', label: 'Job size', kind: 'select', icon: DollarSign, options: [
      { value: 'sm', label: '< $5k'    },
      { value: 'md', label: '$5–20k'   },
      { value: 'lg', label: '$20–100k' },
      { value: 'xl', label: '> $100k'  },
    ]},
    { id: 'overrun', label: 'Cost overrun', kind: 'range', icon: DollarSign },
  ],
  viewModes: [
    { id: 'list',  label: 'List',         icon: ListIcon },
    { id: 'board', label: 'By customer',  icon: Grid3x3,   groupBy: 'customer' },
    { id: 'board', label: 'Product × Period', icon: BarChart3, groupBy: 'productLine' },
  ],
  defaultView: 'list',
  dateFacetId: 'period',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| Loss-makers this quarter | `AlertTriangle` | `error`   | `marginBand: ['loss']`, `period: thisQuarter` |
| Top 10 margin            | `Percent`       | `success` | sort by margin desc, `limit: 10` |
| Jobs > $20k revenue      | `DollarSign`   | `warning` | `revenueBand: ['lg','xl']` |
| My customers             | `UserCircle`   | `neutral` | `accountManager: <currentUser>` |
| FY close review          | `Calendar`     | `info`    | `period: lastYear`, `jobStatus: ['complete']` |

**Required data work**
- Wire the period selector (button is currently a stub at `JobProfitability.tsx:101`).
- Add `accountManagerId`, `productLine`, `revenueBand` to the row mock.

**Smart-filter ideas**
- "Jobs trending over budget" — burn-rate model.
- "Top margin gains vs same period last year" — comparison-mode adjacent (deferred).
- "Customers with deteriorating margin trend".

---

### 7. JobCostDetail (per-line tabs)

**File:** `apps/web/src/components/book/JobCostDetail.tsx`
**Current state:** Tabs `Materials / Labour / Overhead / Subcontract` at `JobCostDetail.tsx:171`; transaction table at `JobCostDetail.tsx:277-308`; no search or filter.

```ts
import { Calendar, ClipboardCheck, DollarSign, UserCircle,
  List as ListIcon, BarChart3 } from 'lucide-react';

const MODULE_ID = 'book.job-cost-detail';

export const jobCostDetailFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Job cost detail',
  facets: [
    { id: 'tab', label: 'Line type', kind: 'select', pinned: true, persistent: true, options: [
      { value: 'materials',   label: 'Materials'   },
      { value: 'labour',      label: 'Labour'      },
      { value: 'overhead',    label: 'Overhead'    },
      { value: 'subcontract', label: 'Subcontract' },
    ]},
    { id: 'lineDate', label: 'Date', kind: 'date', pinned: true,
      icon: Calendar,
      quickRanges: ['thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'ytd'] },
    { id: 'supplier', label: 'Supplier', kind: 'select' },
    { id: 'operator', label: 'Operator', kind: 'user', icon: UserCircle },
    { id: 'operation', label: 'Operation', kind: 'multi' },
    { id: 'poRef',    label: 'PO ref',  kind: 'tag' },
    { id: 'capture', label: 'Capture', kind: 'multi', icon: ClipboardCheck, options: [
      { value: 'auto',     label: 'Auto-captured' },
      { value: 'manual',   label: 'Manual'        },
      { value: 'approved', label: 'Approved'      },
    ]},
    { id: 'amount',  label: 'Amount',  kind: 'range', icon: DollarSign },
    { id: 'varianceVsBudget', label: 'Variance vs budget', kind: 'range' },
  ],
  viewModes: [
    { id: 'list',  label: 'List',     icon: ListIcon },
    { id: 'list',  label: 'Timeline', icon: BarChart3, groupBy: 'lineDate' },
    { id: 'board', label: 'By PO',    icon: BarChart3, groupBy: 'poRef' },
  ],
  defaultView: 'list',
  dateFacetId: 'lineDate',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| Auto-captured this week  | `Zap`             | `info`    | `capture: ['auto']`, `lineDate: thisWeek` |
| Anomalous price (>10%)   | `AlertTriangle`   | `warning` | `varianceVsBudget: { from: 10 }` |
| Subcontract not billed   | `ClipboardCheck`  | `warning` | `tab: 'subcontract'`, `capture: ['manual']` |

**Required data work**
- Tag each line with `captureSource`, `varianceVsBudget`, `operatorId`.
- Constrain `lineDate` quick-ranges to the job's runtime window when known.

**Smart-filter ideas**
- "Anomalous price vs last PO for this material".
- "Subcontract lines awaiting invoice".

---

### 8. ExpenseKanban

**File:** `apps/web/src/components/book/ExpenseKanban.tsx`
**Current state:** Search unwired; generic filter popover (wrong vocab); view toggle stub at `ExpenseKanban.tsx:170-189` — list `onChange` is a no-op at `ExpenseKanban.tsx:180`; kanban columns `Draft / Submitted / Approved / Paid`.

```ts
import { Calendar, CreditCard, DollarSign, FileWarning, Receipt, UserCircle,
  List as ListIcon, KanbanSquare, Grid3x3 } from 'lucide-react';

const MODULE_ID = 'book.expenses';

export const expensesFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Expenses',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', pinned: true, options: [
      { value: 'draft',     label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'approved',  label: 'Approved' },
      { value: 'paid',      label: 'Paid' },
    ]},
    { id: 'expenseDate', label: 'Date', kind: 'date', pinned: true,
      icon: Calendar,
      quickRanges: ['thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'ytd'] },
    { id: 'category', label: 'Category', kind: 'multi', options: [
      { value: 'materials',     label: 'Materials'     },
      { value: 'utilities',     label: 'Utilities'     },
      { value: 'maintenance',   label: 'Maintenance'   },
      { value: 'consumables',   label: 'Consumables'   },
      { value: 'subcontractor', label: 'Subcontractor' },
      { value: 'travel',        label: 'Travel'        },
      { value: 'reimbursement', label: 'Reimbursement' },
    ]},
    { id: 'submitter', label: 'Submitter', kind: 'user', icon: UserCircle },
    { id: 'jobRef',    label: 'Job / cost-centre', kind: 'tag' },
    { id: 'paymentMethod', label: 'Payment method', kind: 'multi', icon: CreditCard, options: [
      { value: 'cash',  label: 'Cash'        },
      { value: 'card',  label: 'Card'        },
      { value: 'bank',  label: 'Bank'        },
      { value: 'petty', label: 'Petty cash'  },
    ]},
    { id: 'reimbursable', label: 'Reimbursable', kind: 'boolean' },
    { id: 'billable',     label: 'Billable to customer', kind: 'boolean' },
    { id: 'gstClaimable', label: 'GST claimable', kind: 'boolean' },
    { id: 'hasReceipt',   label: 'Has receipt',   kind: 'boolean', icon: Receipt },
    { id: 'ocrConfidence', label: 'OCR confidence', kind: 'multi', options: [
      { value: 'green',  label: 'High'   },
      { value: 'yellow', label: 'Medium' },
      { value: 'red',    label: 'Low'    },
    ]},
    { id: 'duplicate', label: 'Possible duplicate', kind: 'boolean', icon: FileWarning },
    { id: 'amount', label: 'Amount', kind: 'range', icon: DollarSign },
  ],
  viewModes: [
    { id: 'kanban',   label: 'Kanban',  icon: KanbanSquare, groupBy: 'status' },
    { id: 'list',     label: 'List',    icon: ListIcon },
    { id: 'calendar', label: 'Calendar', icon: Calendar,    groupBy: 'expenseDate' },
    { id: 'board',    label: 'Category × Month', icon: Grid3x3, groupBy: 'category' },
  ],
  defaultView: 'kanban',
  dateFacetId: 'expenseDate',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| My approvals queue       | `UserCircle` | `info`    | `status: ['submitted']`, `submitter: <currentUser>` (personal) |
| Awaiting receipts        | `Receipt`    | `warning` | `hasReceipt: false`, `status: ['submitted','approved']` |
| Duplicates flagged       | `FileWarning`| `error`   | `duplicate: true` |
| Reimbursables pending    | `CreditCard` | `warning` | `reimbursable: true`, `status: ['submitted','approved']` |
| Month-end accruals       | `Calendar`   | `info`    | `expenseDate: lastMonth`, `status: ['draft','submitted']` |

**Required data work**
- **Implement the list view** — `onChange` for the list toggle is a no-op stub at `ExpenseKanban.tsx:180`.
- Surface `ocrConfidence`, `duplicateFlag` (`NewExpense.tsx:218`), `paymentMethod` (`NewExpense.tsx:103`), `reimbursable`, `billable`, `gstClaimable` on the list row.

**Smart-filter ideas**
- "Anomalous expenses vs prior period" — vendor × category z-score.
- "Likely duplicates" — fuzzy match on amount + date + vendor.
- "Reimbursables overdue for payment".

---

### 9. BudgetOverview

**File:** `apps/web/src/components/book/BudgetOverview.tsx`
**Current state:** Pills `active / draft / closed` at `BudgetOverview.tsx:414`; **"Type: All" button is a stub at `BudgetOverview.tsx:400`** (Type values exist in data); health classifier at `BudgetOverview.tsx:163`; no search / date control.

```ts
import { Activity, Calendar, ChartLine, Layers, Percent, UserCircle,
  List as ListIcon, Grid3x3, GitBranch } from 'lucide-react';

const MODULE_ID = 'book.budgets';

export const budgetOverviewFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Budgets',
  facets: [
    { id: 'period', label: 'Period', kind: 'date', pinned: true,
      icon: Calendar,
      quickRanges: ['thisQuarter', 'lastMonth', 'ytd', 'thisYear', 'lastYear'] },
    { id: 'status', label: 'Status', kind: 'multi', pinned: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'draft',  label: 'Draft'  },
      { value: 'closed', label: 'Closed' },
    ]},
    { id: 'type', label: 'Type', kind: 'multi', pinned: true, icon: Layers, options: [
      { value: 'job',        label: 'Job'        },
      { value: 'department', label: 'Department' },
      { value: 'annual',     label: 'Annual'     },
    ]},
    { id: 'health', label: 'Health', kind: 'multi', options: [
      { value: 'on-track',  label: 'On-track',     color: 'var(--mw-success)' },
      { value: 'monitor',   label: 'Monitor',      color: 'var(--mw-warning)' },
      { value: 'over',      label: 'Over budget',  color: 'var(--mw-error)' },
      { value: 'draft',     label: 'Draft'         },
    ]},
    { id: 'utilisation', label: 'Utilisation', kind: 'multi', icon: Percent, options: [
      { value: '0-50',   label: '< 50%'  },
      { value: '50-80',  label: '50–80%' },
      { value: '80-100', label: '80–100%' },
      { value: '100+',   label: 'Over 100%' },
    ]},
    { id: 'owner',      label: 'Owner',      kind: 'user', icon: UserCircle },
    { id: 'department', label: 'Department', kind: 'select' },
    { id: 'variance',   label: 'Variance',   kind: 'range' },
  ],
  viewModes: [
    { id: 'list',  label: 'List',     icon: ListIcon },
    { id: 'board', label: 'Dept × Period', icon: Grid3x3, groupBy: 'department' },
    { id: 'tree',  label: 'Tree',     icon: GitBranch,    groupBy: 'type' },
    { id: 'list',  label: 'Burn-down', icon: ChartLine,   groupBy: 'period' },
  ],
  defaultView: 'list',
  dateFacetId: 'period',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| At-risk (>80% utilised)  | `AlertTriangle` | `warning` | `utilisation: ['80-100','100+']` |
| Over budget              | `AlertTriangle` | `error`   | `health: ['over']` |
| My department            | `UserCircle`    | `neutral` | `department: <currentUserDept>` (personal) |
| Q1 close review          | `Calendar`      | `info`    | `period: q1ThisFy`, `status: ['active','closed']` |
| Annual roll-up           | `Layers`        | `info`    | `type: ['annual']`, `view: 'tree'` |

**Required data work**
- Wire the existing `type` data into the stubbed `Type: All` button.
- Surface the computed `health` (`BudgetOverview.tsx:163`) and a `utilisation` band on the row.
- Tree view needs an `Annual → Department → Job` hierarchy field.

**Smart-filter ideas**
- "Budgets trending to over-run by quarter end" — burn-rate projection.
- "Departments with utilisation accelerating WoW".

---

### 10. ReportsGallery

**File:** `apps/web/src/components/book/ReportsGallery.tsx`
**Current state:** Two static grids + scheduled table at `ReportsGallery.tsx:79-141`. No filter or search.

```ts
import { Calendar, FileText, Search, Tag,
  List as ListIcon, Grid3x3 } from 'lucide-react';

const MODULE_ID = 'book.reports';

export const reportsGalleryFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Reports',
  facets: [
    { id: 'source', label: 'Source', kind: 'multi', pinned: true, options: [
      { value: 'xero', label: 'Xero' },
      { value: 'mw',   label: 'MirrorWorks' },
    ]},
    { id: 'tag', label: 'Tag', kind: 'multi', icon: Tag, options: [
      { value: 'finance',        label: 'Finance'        },
      { value: 'ops',            label: 'Ops'            },
      { value: 'tax',            label: 'Tax'            },
      { value: 'sustainability', label: 'Sustainability' },
    ]},
    { id: 'cadence', label: 'Schedule', kind: 'select', options: [
      { value: 'daily',   label: 'Daily'   },
      { value: 'weekly',  label: 'Weekly'  },
      { value: 'monthly', label: 'Monthly' },
      { value: 'adhoc',   label: 'Ad-hoc'  },
    ]},
    { id: 'owner',  label: 'Owner', kind: 'user' },
    { id: 'active', label: 'Active', kind: 'boolean' },
    { id: 'lastRun', label: 'Last run', kind: 'date',
      quickRanges: ['thisWeek', 'thisMonth', 'lastMonth'] },
    { id: 'failed', label: 'Failed last run', kind: 'boolean' },
  ],
  viewModes: [
    { id: 'card', label: 'Gallery', icon: Grid3x3 },
    { id: 'list', label: 'List',    icon: ListIcon },
  ],
  defaultView: 'card',
};
```

**System presets**

| Name | Icon | Tone | State |
|---|---|---|---|
| My scheduled reports  | `Calendar`  | `info`    | `owner: <currentUser>`, `cadence: ['daily','weekly','monthly']` |
| Failed last run       | `AlertTriangle` | `error` | `failed: true` |
| Month-end pack        | `FileText`  | `info`    | `tag: ['finance']`, `cadence: ['monthly']` |

**Required data work**
- Tag every report with `source`, `tag[]`, `cadence`, `owner`, `lastRunAt`, `lastRunOk`.

---

### 11. xero-mapping/MappingPage

**File:** `apps/web/src/components/book/xero-mapping/XeroMappingPage.tsx`
**Current state:** Already domain-specific (sections, status, required-unmapped badge, auto-map at `XeroMappingPage.tsx:445-518`). Filters not needed at the list level.

```ts
import { Search, AlertTriangle, GitCompareArrows,
  List as ListIcon } from 'lucide-react';

const MODULE_ID = 'book.xero-mapping';

export const xeroMappingFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Xero mapping',
  facets: [
    { id: 'requiredOnly',  label: 'Required only', kind: 'boolean', pinned: true,
      icon: AlertTriangle },
    { id: 'unmappedOnly',  label: 'Unmapped only', kind: 'boolean', pinned: true },
    { id: 'hasVariance',   label: 'Variance from default', kind: 'boolean',
      icon: GitCompareArrows },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
  ],
  defaultView: 'list',
};
```

No system presets needed — section + required badge already handle the canonical "what's left to map" task.

---

## Chart-of-accounts / P&L tree (cross-screen)

Two hierarchical surfaces in Book benefit from a dedicated `tree` view but aren't single screens today:

- **Chart of accounts** — surfaces under BudgetOverview, BookCostVariance and JobProfitability roll-ups. Schema needs an `accountTree` facet (`kind: 'tag'` over the CoA path) and the `tree` view mode wired wherever it's relevant.
- **P&L tree** — Revenue → COGS → Gross margin → Opex → Net. A standalone screen worth scoping in the same effort but out-of-scope for this filter migration; flag a follow-up to add `book.profit-loss` schema once the data model lands.

---

## Smart-filter ideas (module-wide consolidation)

1. **"Invoices likely to be paid late"** — customer payment history × current aging vs DSO. Lives on `book.invoices`.
2. **"Jobs trending over budget"** — burn-rate × remaining work vs remaining budget. Surfaces on `book.cost-variance`, `book.budgets`, `book.job-profitability`.
3. **"Anomalous expenses vs prior period"** — vendor × category × month z-score. Lives on `book.expenses`.
4. **"POs at risk of late delivery"** — supplier OTD × current lag. Lives on `book.purchase-orders`.
5. **"Stock at risk of write-down"** — slow movers × inventory age × forecast demand. Lives on `book.stock-valuation`.
6. **"Suspicious 3-way mismatches"** — clusters PO/receipt/bill discrepancies above a threshold. Lives on `book.purchase-orders`.

---

## Rollout order

1. **AR list (`BookInvoices`)** — direct port of the Sell.Invoices pattern; lowest risk, highest visibility. Validates the Book quick-range default.
2. **AP list (`PurchaseOrders`)** — second aging-bucket use; introduces approval-kanban view.
3. **ExpenseKanban** — wires the list view stub at `ExpenseKanban.tsx:180`.
4. **BudgetOverview** — wires the type stub at `BudgetOverview.tsx:400`, surfaces the health classifier.
5. **JobProfitability** — wires the period selector stub at `JobProfitability.tsx:101`.
6. **BookCostVariance + JobCostDetail** — period selector + variance facets together.
7. **BookWipValuation + StockValuation** — paired because both need an "As at" snapshot field. **StockValuation depends on actually computing the snapshot** (`StockValuation.tsx:88`) — this is the biggest data prerequisite in the module.
8. **ReportsGallery + XeroMapping** — small cleanup PRs.

Each PR mirrors the Sell pilot's shape: schema + `useModuleFilters` + `applyFilters` + `ModuleFilterBar` + `registerSystemPresets`. No new shared infrastructure.
