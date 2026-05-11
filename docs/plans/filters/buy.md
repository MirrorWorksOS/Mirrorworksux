# Buy Module — Filter/Search/View Migration Plan

**Status:** Plan · **Date:** 2026-05-11 · **Owner:** Matt
**Audit input:** `docs/audits/dev/AUDIT-filters-buy.md`
**Pilot reference:** `apps/web/src/components/sell/SellOpportunities.tsx`, `SellInvoices.tsx`, `SellOrders.tsx` (commit `d4f0c565`)

Each section below is one Buy list/board screen. Schemas are paste-ready and use the shared types from `apps/web/src/components/shared/filters/schema.ts`. System presets follow the pilot rules — Lucide icons only, `iconTone` set, no emoji. Yellow tiles get dark icons (project memory).

Module ids follow `buy.<screen>`. Roles vocab: `admin | lead | team`.

---

## 1. Purchase Orders

**File:** `apps/web/src/components/buy/BuyOrders.tsx:131`
**Current:** status-pill row (`All / Draft / Sent / Acknowledged / Partial / Received / Cancelled`) plus the generic `ToolbarFilterButton`. List only. No supplier/buyer/date-window/value facets, no presets.

### Filter schema

```ts
import {
  AlertTriangle, Building2, Calendar, CheckCircle2, Columns3, DollarSign,
  FileText, Flag, Grid3x3, Hourglass, Link2, List as ListIcon, Truck, User,
} from 'lucide-react';

const MODULE_ID = 'buy.orders';

const ordersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Purchase Orders',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      icon: Flag,
      options: [
        { value: 'draft',     label: 'Draft',     color: 'var(--neutral-400)' },
        { value: 'sent',      label: 'Sent',      color: 'var(--mw-blue)' },
        { value: 'partial',   label: 'Partial',   color: 'var(--mw-warning)' },
        { value: 'received',  label: 'Received',  color: 'var(--mw-mirage)' },
        { value: 'cancelled', label: 'Cancelled', color: 'var(--mw-error)' },
      ],
    },
    { id: 'supplier', label: 'Supplier', kind: 'multi', icon: Building2, pinned: true, options: supplierOptions },
    { id: 'buyer',    label: 'Buyer',    kind: 'user',  icon: User,      options: buyerOptions },
    { id: 'approval', label: 'Approval', kind: 'select', icon: CheckCircle2, options: [
      { value: 'awaiting', label: 'Awaiting approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ]},
    { id: 'value',         label: 'Value',          kind: 'range',   icon: DollarSign },
    { id: 'hasShortage',   label: 'Partial receipt',kind: 'boolean', icon: AlertTriangle },
    { id: 'linkedAgreement',label:'Under BPA',      kind: 'boolean', icon: Link2 },
    { id: 'currency',      label: 'Currency',       kind: 'multi',   icon: DollarSign, options: currencyOptions },
    {
      id: 'deliveryDate',
      label: 'Delivery',
      kind: 'date',
      icon: Truck,
      placeholder: 'Any date',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter'],
    },
  ],
  viewModes: [
    { id: 'list',     label: 'List',                 icon: ListIcon },
    { id: 'kanban',   label: 'Kanban by status',     icon: Columns3,  groupBy: 'status' },
    { id: 'calendar', label: 'Calendar by delivery', icon: Calendar },
  ],
  defaultView: 'list',
  dateFacetId: 'deliveryDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Overdue receipts',
    icon: AlertTriangle,
    iconTone: 'error',
    state: {
      values: { status: ['sent', 'partial'], deliveryDate: { to: todayIso() } },
      search: '', view: 'list',
    },
  },
  {
    name: 'Due this week',
    icon: Truck,
    iconTone: 'warning',
    state: { values: { status: ['sent', 'partial'], deliveryDate: thisWeekRange() }, search: '', view: 'calendar' },
  },
  {
    name: 'Awaiting approval',
    icon: Hourglass,
    iconTone: 'info',
    state: { values: { approval: 'awaiting' }, search: '', view: 'list' },
  },
  {
    name: 'High value (>$10k)',
    icon: DollarSign,
    iconTone: 'yellow',
    state: { values: { value: { from: 10000 } }, search: '', view: 'list' },
  },
  {
    name: 'Against near-limit BPAs',
    icon: Link2,
    iconTone: 'warning',
    state: { values: { linkedAgreement: true }, search: '', view: 'list' },
  },
]);
```

### Required data work
- Add `buyerId`/`buyerName`, `approvalState`, `currency`, `linkedAgreementId` to `PurchaseOrder` (`BuyOrders.tsx:26`). Today only `supplier/date/deliveryDate/status/total/received` exist.
- Derive `hasShortage` from `received < total quantity` — needs line-level qty plumbed up, or pre-computed flag on the row.
- Surface `deliveryDate` as ISO (already ISO in central service — confirm it stays ISO when string-formatted in mocks).

### Smart-filter ideas
- "POs likely to be late given supplier history" — joins `deliveryDate` against `supplier.onTimePercent` and lead-time variance.
- "POs sitting in Sent >7 days with no acknowledgement" — uses `status` age, signals stale follow-up.
- "POs against near-limit BPAs" — cross-checks `linkedAgreementId` against `BuyAgreement.used + committed / value` >85%.
- "Consolidatable POs" — same supplier, same delivery window, both <$1k — surface "merge into one PO".
- "Repeat lateness from this supplier" — supplier-level rollup, ranks rows by historical late count.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope (this pass)
- `Acknowledged` status pill collapse (audit §2) — keep underlying status, just drop it from the default-visible options. Cleanup later when status taxonomy is reviewed module-wide.
- Multi-site dock/site facet — wait for Receipts work below to land first.

---

## 2. Suppliers

**File:** `apps/web/src/components/buy/BuySuppliers.tsx:147`
**Current:** decorative `Filter` button only, card/list toggle. No actual filtering.

### Filter schema

```ts
import {
  AlertOctagon, Building2, Calendar, CreditCard, DollarSign, Gauge, Grid3x3,
  List as ListIcon, Map as MapIcon, ShieldAlert, Tag, Timer, User,
} from 'lucide-react';

const MODULE_ID = 'buy.suppliers';

const suppliersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Suppliers',
  facets: [
    {
      id: 'otdBand',
      label: 'OTD band',
      kind: 'multi',
      pinned: true,
      icon: Gauge,
      options: [
        { value: 'excellent', label: 'Excellent (≥95)', color: 'var(--mw-yellow-400)' },
        { value: 'good',      label: 'Good (85–94)',    color: 'var(--mw-mirage)' },
        { value: 'fair',      label: 'Fair (75–84)',    color: 'var(--mw-amber)' },
        { value: 'poor',      label: 'Poor (<75)',      color: 'var(--mw-error)' },
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      kind: 'select',
      pinned: true,
      icon: Timer,
      options: [
        { value: 'hasOpen', label: 'Has open POs' },
        { value: 'noOpen', label: 'No open POs' },
      ],
    },
    { id: 'category',     label: 'Category',     kind: 'multi', icon: Tag,        options: categoryOptions },
    { id: 'paymentTerms', label: 'Payment terms',kind: 'multi', icon: CreditCard, options: [
      { value: 'net7',  label: 'Net 7' },
      { value: 'net14', label: 'Net 14' },
      { value: 'net30', label: 'Net 30' },
      { value: 'net60', label: 'Net 60' },
    ]},
    { id: 'leadTimeBand', label: 'Lead time',  kind: 'multi', icon: Timer, options: [
      { value: 'short',  label: '< 7 days' },
      { value: 'medium', label: '7–14 days' },
      { value: 'long',   label: '> 14 days' },
    ]},
    { id: 'spendTier', label: 'Spend tier', kind: 'select', icon: DollarSign, options: [
      { value: 'top10', label: 'Top 10 by spend' },
      { value: 'top25', label: 'Top 25 by spend' },
      { value: 'other', label: 'Other' },
    ]},
    { id: 'riskFlags', label: 'Risk flags', kind: 'multi', icon: ShieldAlert, options: [
      { value: 'singleSource', label: 'Single source' },
      { value: 'noContract',   label: 'No active contract' },
      { value: 'certExpired',  label: 'Certifications expired' },
    ]},
  ],
  viewModes: [
    { id: 'card', label: 'Cards', icon: Grid3x3 },
    { id: 'list', label: 'List',  icon: ListIcon },
    { id: 'map',  label: 'Map',   icon: MapIcon },
  ],
  defaultView: 'card',
  // No dateFacetId — supplier directory is not date-driven.
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Top 20 by spend YTD',
    icon: DollarSign,
    iconTone: 'yellow',
    state: { values: { spendTier: 'top25' }, search: '', view: 'list' },
  },
  {
    name: 'OTD slipping (<85)',
    icon: Gauge,
    iconTone: 'warning',
    state: { values: { otdBand: ['fair', 'poor'] }, search: '', view: 'list' },
  },
  {
    name: 'Single-source critical',
    icon: ShieldAlert,
    iconTone: 'error',
    state: { values: { riskFlags: ['singleSource'] }, search: '', view: 'list' },
  },
  {
    name: 'Active suppliers',
    icon: Building2,
    iconTone: 'info',
    state: { values: { activity: 'hasOpen' }, search: '', view: 'card' },
  },
]);
```

### Required data work
- `Supplier` (`BuySuppliers.tsx:26`) has `categories`, `activePOs`, `onTimeRate`, `totalSpend` — derive `otdBand`, `spendTier` server-side or via memo. Add `paymentTerms`, `leadTimeDays`, `riskFlags: string[]`, `location: {lat,lng}` (for map).
- ABC analysis (`spendTier`) needs a precomputed rank — cheap to derive from `totalSpend` at load.

### Smart-filter ideas
- "Suppliers with deteriorating OTD over 90 days" — needs OTD trend series; today only the current snapshot exists.
- "Suppliers we paid >$50k with no active contract" — joins `totalSpend` vs `BuyAgreement` existence per supplier.
- "Suppliers concentrated in one category" — flags single-source risk where >70% of category spend lands on one vendor.
- "New suppliers without OTD baseline" — `activePOs > 0` but lifetime delivery count <3.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- The map view is shape-only here — actual map widget can land in a follow-up. Schema declares it so view-mode UI is consistent across screens.

---

## 3. RFQs

**File:** `apps/web/src/components/buy/BuyRFQs.tsx:242`
**Current:** summary tiles (Open/Awarded/Closed/Draft), list only, no real filter.

### Filter schema

```ts
import {
  AlertTriangle, Award, Calendar, CheckCircle2, Columns3, DollarSign,
  FileText, Hourglass, Link2, List as ListIcon, Send, User,
} from 'lucide-react';

const MODULE_ID = 'buy.rfqs';

const rfqsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'RFQs',
  facets: [
    {
      id: 'stage',
      label: 'Stage',
      kind: 'multi',
      pinned: true,
      icon: Send,
      options: [
        { value: 'draft',    label: 'Draft',         color: 'var(--neutral-400)' },
        { value: 'sent',     label: 'Sent',          color: 'var(--mw-blue)' },
        { value: 'open',     label: 'Open',          color: 'var(--mw-mirage)' },
        { value: 'closing',  label: 'Closing soon',  color: 'var(--mw-warning)' },
        { value: 'closed',   label: 'Closed',        color: 'var(--neutral-500)' },
        { value: 'awarded',  label: 'Awarded',       color: 'var(--mw-yellow-400)' },
      ],
    },
    {
      id: 'coverage',
      label: 'Response coverage',
      kind: 'select',
      pinned: true,
      icon: CheckCircle2,
      options: [
        { value: 'none',    label: 'No responses' },
        { value: 'partial', label: 'Partial' },
        { value: 'full',    label: 'All responded' },
      ],
    },
    { id: 'owner',         label: 'Buyer',           kind: 'user',  icon: User,        options: buyerOptions },
    { id: 'linkedReq',     label: 'Linked req',      kind: 'boolean', icon: Link2 },
    { id: 'linkedJob',     label: 'Linked job',      kind: 'boolean', icon: Link2 },
    { id: 'estimatedValue',label: 'Est. value',      kind: 'range', icon: DollarSign },
    {
      id: 'dueDate',
      label: 'Response due',
      kind: 'date',
      icon: Calendar,
      placeholder: 'Any date',
      quickRanges: ['today', 'next7days', 'thisWeek', 'thisMonth'],
    },
  ],
  viewModes: [
    { id: 'list',     label: 'List',              icon: ListIcon },
    { id: 'kanban',   label: 'Kanban by stage',   icon: Columns3, groupBy: 'stage' },
    { id: 'calendar', label: 'Calendar by due',   icon: Calendar },
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Closing in 3 days',
    icon: Hourglass,
    iconTone: 'warning',
    state: { values: { stage: ['open', 'closing'], dueDate: next3DaysRange() }, search: '', view: 'list' },
  },
  {
    name: 'Zero responses',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { stage: ['sent', 'open'], coverage: 'none' }, search: '', view: 'list' },
  },
  {
    name: 'Awarded — no PO yet',
    icon: Award,
    iconTone: 'info',
    state: { values: { stage: ['awarded'] }, search: '', view: 'list' },
  },
  {
    name: 'High value (>$25k)',
    icon: DollarSign,
    iconTone: 'yellow',
    state: { values: { estimatedValue: { from: 25000 } }, search: '', view: 'list' },
  },
]);
```

### Required data work
- `RFQ` (`BuyRFQs.tsx:25`) has only `dueDate: string` ('Mar 25') — convert to ISO so date facet works. Currently formatted for display.
- Add `ownerId`, `linkedReqId`, `linkedJobId`, `estimatedValue` to `RFQ`. None exist today.
- Derive `coverage` from `responses / suppliers`. Derive `stage='closing'` when `dueDate − today < 3d`.
- Add `awardedButNoPo` flag — needs `awardedPoId` field, today implicit.

### Smart-filter ideas
- "RFQs where the cheapest quote also has the worst OTD" — joins `quotes[].supplier` to `Supplier.onTimePercent`; already partly surfaced via the `aiPick` heuristic.
- "RFQs trending toward zero responses" — sent >5d, 0 responses, supplier set <3.
- "Closed but not awarded after 7 days" — stuck state, often forgotten.
- "Repeated RFQs for same SKU" — same `sku` issued >2× in 90 days, hint to convert to BPA.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- The `Vendor Comparison` screen (`BuyVendorComparison.tsx:91`) is a tool not a list — leave its `Select` + checkbox UX as-is until we decide if it folds into the RFQ detail.

---

## 4. Requisitions

**File:** `apps/web/src/components/buy/BuyRequisitions.tsx:163`
**Current:** pills (`Draft / Submitted / Approved / Rejected / Converted`) + generic `ToolbarFilterButton`. List only.

### Filter schema

```ts
import {
  CheckCircle2, Columns3, DollarSign, FileQuestion, Flag, Hourglass,
  List as ListIcon, ShoppingCart, User, Users,
} from 'lucide-react';

const MODULE_ID = 'buy.requisitions';

const requisitionsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Requisitions',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      icon: Flag,
      options: [
        { value: 'draft',     label: 'Draft',     color: 'var(--neutral-400)' },
        { value: 'submitted', label: 'Submitted', color: 'var(--mw-blue)' },
        { value: 'approved',  label: 'Approved',  color: 'var(--mw-mirage)' },
        { value: 'rejected',  label: 'Rejected',  color: 'var(--mw-error)' },
        // 'converted' intentionally not in default options — shown via "Include converted" boolean below.
      ],
    },
    { id: 'requestor',  label: 'Requestor',  kind: 'user',  icon: User,  options: requestorOptions },
    { id: 'department', label: 'Department', kind: 'multi', icon: Users, options: departmentOptions, pinned: true },
    {
      id: 'awaitingMe',
      label: 'Awaiting my approval',
      kind: 'boolean',
      icon: CheckCircle2,
    },
    {
      id: 'ageInStatus',
      label: 'Age in status',
      kind: 'select',
      icon: Hourglass,
      options: [
        { value: 'fresh',   label: '< 1 day' },
        { value: 'aging',   label: '1–3 days' },
        { value: 'stuck',   label: '> 3 days' },
      ],
    },
    { id: 'value',         label: 'Value',         kind: 'range',   icon: DollarSign },
    { id: 'hasPo',         label: 'Converted to PO',kind: 'boolean', icon: ShoppingCart },
    { id: 'includeConverted', label: 'Include converted', kind: 'boolean', icon: FileQuestion, persistent: true },
  ],
  viewModes: [
    { id: 'list',   label: 'List',                   icon: ListIcon },
    { id: 'kanban', label: 'Kanban by approval',     icon: Columns3, groupBy: 'status' },
  ],
  defaultView: 'list',
  // No dateFacetId by default — submission date is useful but not the primary axis.
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Awaiting my approval',
    icon: CheckCircle2,
    iconTone: 'warning',
    state: { values: { awaitingMe: true, status: ['submitted'] }, search: '', view: 'list' },
  },
  {
    name: 'Stuck > 3 days',
    icon: Hourglass,
    iconTone: 'error',
    state: { values: { status: ['submitted'], ageInStatus: 'stuck' }, search: '', view: 'list' },
  },
  {
    name: 'High value (>$10k)',
    icon: DollarSign,
    iconTone: 'yellow',
    state: { values: { value: { from: 10000 }, status: ['submitted', 'approved'] }, search: '', view: 'list' },
  },
  {
    name: 'Approved — no PO yet',
    icon: ShoppingCart,
    iconTone: 'info',
    state: { values: { status: ['approved'], hasPo: false }, search: '', view: 'list' },
  },
]);
```

### Required data work
- Add `currentApproverId`, `statusChangedAt`, `linkedPoId` to `Requisition` (`BuyRequisitions.tsx:25`). Today only `requestor/department/date/status/total/items`.
- Derive `awaitingMe` from `currentApproverId === session.userId` (requires auth context).
- Derive `ageInStatus` from `now - statusChangedAt`.
- `converted` stays on the model but hidden unless `includeConverted=true` — implement at apply-filter layer (default false).

### Smart-filter ideas
- "Reqs likely to be auto-approvable" — under threshold, requestor's typical category, BPA covers it.
- "Reqs from departments overspending vs budget" — needs department budget series.
- "Repeat reqs for same SKU last 30d" — consolidation opportunity into single PO.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- Approver-routing rules — out of scope for filter work; surface only the boolean `awaitingMe` for now.

---

## 5. Receipts

**File:** `apps/web/src/components/buy/BuyReceipts.tsx:79`
**Current:** card grid of POs awaiting receipt, no list, no filters, no search.

### Filter schema

```ts
import {
  AlertTriangle, Building2, Calendar, Grid3x3, List as ListIcon,
  MapPin, Truck,
} from 'lucide-react';

const MODULE_ID = 'buy.receipts';

const receiptsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Goods Receipt',
  facets: [
    { id: 'supplier', label: 'Supplier', kind: 'multi', icon: Building2, pinned: true, options: supplierOptions },
    { id: 'site',     label: 'Site',     kind: 'multi', icon: MapPin,    options: siteOptions },
    { id: 'partial',  label: 'Partial only',         kind: 'boolean', icon: AlertTriangle },
    { id: 'discrepancy', label: 'Has discrepancy',   kind: 'boolean', icon: AlertTriangle },
    {
      id: 'expectedDate',
      label: 'Expected',
      kind: 'date',
      icon: Truck,
      placeholder: 'Any date',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth'],
    },
  ],
  viewModes: [
    { id: 'card',     label: 'Cards',           icon: Grid3x3 },
    { id: 'list',     label: 'List',            icon: ListIcon },
    { id: 'calendar', label: 'Calendar',        icon: Calendar },
  ],
  defaultView: 'card',
  dateFacetId: 'expectedDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Receiving today',
    icon: Truck,
    iconTone: 'yellow',
    state: { values: { expectedDate: todayRange() }, search: '', view: 'card' },
  },
  {
    name: 'Overdue receipts',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { expectedDate: { to: todayIso() } }, search: '', view: 'list' },
  },
  {
    name: 'Partial > 7 days',
    icon: AlertTriangle,
    iconTone: 'warning',
    state: { values: { partial: true }, search: '', view: 'list' },
  },
]);
```

### Required data work
- `POForReceipt` (`BuyReceipts.tsx:21`) has `expectedDate: string` (already ISO via central service). Add `siteId/dockId`, `discrepancyCount`, derived `isPartial` (any line `received < ordered`).
- Currently only 2 mocked POs (`BuyReceipts.tsx:33`) — open the source filter to `status in [sent, partial, acknowledged]` so the list is populous enough to filter.

### Smart-filter ideas
- "Receipts likely to arrive late vs ETA" — supplier OTD trend × current `expectedDate`.
- "Partial receipts likely to never complete" — partial >14d with no movement, recommend close-short.
- "Receiving load this week vs dock capacity" — surfaces overloaded days for planners.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- Multi-site dock scheduling — schema includes `site` facet but the underlying dock-capacity work belongs in a separate plan.

---

## 6. Bills

**File:** `apps/web/src/components/buy/BuyBills.tsx:149`
**Current:** 4 KPI tiles (`Matched / Pending GRN / Mismatch / Overdue`), list only, no filtering at all.

### Filter schema

```ts
import {
  AlertCircle, AlertTriangle, Building2, Calendar, CheckCircle2, Clock,
  Columns3, DollarSign, FileWarning, List as ListIcon, MessageSquareWarning,
  Table as TableIcon, User,
} from 'lucide-react';

const MODULE_ID = 'buy.bills';

const AGING_OPTIONS = [
  { value: 'current', label: 'Current',  color: 'var(--neutral-300)' },
  { value: '1-30',    label: '1–30 days',color: 'var(--mw-mirage)' },
  { value: '31-60',   label: '31–60 days',color: 'var(--mw-warning)' },
  { value: '61-90',   label: '61–90 days',color: 'var(--mw-amber)' },
  { value: '90+',     label: '90+ days', color: 'var(--mw-error)' },
];

const billsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Bills',
  facets: [
    {
      id: 'matchStatus',
      label: 'Match status',
      kind: 'multi',
      pinned: true,
      icon: CheckCircle2,
      options: [
        { value: 'matched',   label: 'Matched',          color: 'var(--mw-mirage)' },
        { value: 'pending',   label: 'Pending GRN',      color: 'var(--mw-warning)' },
        { value: 'mismatch',  label: 'Amount mismatch',  color: 'var(--mw-error)' },
        { value: 'overdue',   label: 'Overdue',          color: 'var(--mw-error)' },
      ],
    },
    { id: 'aging',     label: 'Aging',     kind: 'multi', pinned: true, icon: Clock, options: AGING_OPTIONS },
    { id: 'supplier',  label: 'Supplier',  kind: 'multi', icon: Building2, options: supplierOptions },
    { id: 'currency',  label: 'Currency',  kind: 'multi', icon: DollarSign, options: currencyOptions },
    { id: 'approver',  label: 'Approver',  kind: 'user',  icon: User, options: approverOptions },
    { id: 'hasDispute',label: 'Disputed',  kind: 'boolean', icon: MessageSquareWarning },
    { id: 'amount',    label: 'Amount',    kind: 'range', icon: DollarSign },
    {
      id: 'dueDate',
      label: 'Due',
      kind: 'date',
      icon: Calendar,
      placeholder: 'Any date',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'lastMonth'],
    },
  ],
  viewModes: [
    { id: 'list',   label: 'List',                 icon: ListIcon },
    { id: 'board',  label: 'Aging buckets',        icon: TableIcon, groupBy: 'aging' },
    { id: 'kanban', label: 'Kanban by match',      icon: Columns3,  groupBy: 'matchStatus' },
  ],
  defaultView: 'list',
  dateFacetId: 'dueDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Overdue 60+ days',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { aging: ['61-90', '90+'] }, search: '', view: 'board' },
  },
  {
    name: 'Three-way match exceptions',
    icon: AlertCircle,
    iconTone: 'warning',
    state: { values: { matchStatus: ['mismatch', 'pending'] }, search: '', view: 'kanban' },
  },
  {
    name: 'Due this week',
    icon: Calendar,
    iconTone: 'yellow',
    state: { values: { matchStatus: ['matched'], dueDate: thisWeekRange() }, search: '', view: 'list' },
  },
  {
    name: 'Disputed',
    icon: MessageSquareWarning,
    iconTone: 'error',
    state: { values: { hasDispute: true }, search: '', view: 'list' },
  },
  {
    name: 'Drafts > 7 days',
    icon: FileWarning,
    iconTone: 'neutral',
    state: { values: { matchStatus: ['pending'] }, search: '', view: 'list' },
  },
]);
```

### Required data work
- `Bill` (`BuyBills.tsx:19`) has `invoiceDate`/`dueDate` as display strings ('Mar 18'). Convert to ISO before this lands.
- Derive `aging` bucket from `dueDate` vs today (helper already implied by `SellInvoices.tsx:95` `bucket()` pattern — copy that approach).
- Add `currency`, `approverId`, `hasDispute`, and (for smart filter) historical amounts series per supplier.

### Smart-filter ideas
- "Bills with amounts trending up vs prior 6 from same supplier" — price-creep detection; uses supplier+sku invoice history.
- "Bills likely to be paid late based on internal approval lag" — uses average time-to-approve per approver.
- "Bills matching a PO already closed-short" — recovery candidate, frequent SME leak.
- "Recurring bills missing this period" — subscription/utility bills that didn't arrive on cadence.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- Currency conversion math — schema declares the facet but the AP plan should own FX rate handling.

---

## 7. Agreements (BPAs)

**File:** `apps/web/src/components/buy/BuyAgreements.tsx:120`
**Current:** card list only, no filters or status pills despite `status` already on the model.

### Filter schema

```ts
import {
  AlertTriangle, Building2, Calendar, DollarSign, FileSignature, Flag,
  Grid3x3, List as ListIcon, PercentCircle, Tag, TrendingUp,
} from 'lucide-react';

const MODULE_ID = 'buy.agreements';

const agreementsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Agreements',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      icon: Flag,
      options: [
        { value: 'active',     label: 'Active',     color: 'var(--mw-yellow-400)' },
        { value: 'near-limit', label: 'Near limit', color: 'var(--mw-amber)' },
        { value: 'exhausted',  label: 'Exhausted',  color: 'var(--mw-error)' },
        { value: 'expired',    label: 'Expired',    color: 'var(--neutral-400)' },
      ],
    },
    {
      id: 'utilisation',
      label: 'Utilisation',
      kind: 'multi',
      pinned: true,
      icon: PercentCircle,
      options: [
        { value: 'low',   label: '< 25%' },
        { value: 'mid',   label: '25–75%' },
        { value: 'high',  label: '75–100%' },
        { value: 'over',  label: '> 100%' },
      ],
    },
    { id: 'supplier', label: 'Supplier', kind: 'multi', icon: Building2, options: supplierOptions },
    { id: 'category', label: 'Category', kind: 'multi', icon: Tag,       options: categoryOptions },
    { id: 'value',    label: 'Contract value', kind: 'range', icon: DollarSign },
    {
      id: 'endDate',
      label: 'End date',
      kind: 'date',
      icon: Calendar,
      placeholder: 'Any date',
      quickRanges: ['thisMonth', 'thisQuarter', 'thisYear', 'next7days'],
    },
  ],
  viewModes: [
    { id: 'card',  label: 'Cards',         icon: Grid3x3 },
    { id: 'list',  label: 'List',          icon: ListIcon },
    { id: 'gantt', label: 'Timeline',      icon: TrendingUp },
  ],
  defaultView: 'card',
  dateFacetId: 'endDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Expiring in 90 days',
    icon: Calendar,
    iconTone: 'warning',
    state: { values: { endDate: next90DaysRange() }, search: '', view: 'list' },
  },
  {
    name: 'Near limit (>90% used)',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { status: ['near-limit'], utilisation: ['high', 'over'] }, search: '', view: 'card' },
  },
  {
    name: 'Renewal candidates',
    icon: FileSignature,
    iconTone: 'info',
    state: { values: { status: ['active', 'near-limit'], endDate: next90DaysRange() }, search: '', view: 'list' },
  },
  {
    name: 'Under-utilised (<25%)',
    icon: PercentCircle,
    iconTone: 'neutral',
    state: { values: { status: ['active'], utilisation: ['low'] }, search: '', view: 'list' },
  },
]);
```

### Required data work
- `BuyAgreement` (`BuyAgreements.tsx:19`) has `startDate`/`endDate` as display strings ('Jan 2026'). Convert to ISO day for the date facet to work.
- Derive `utilisation` from `(used + committed) / value`.
- Timeline (Gantt) view needs `startDate` and `endDate` as real dates — same prereq.

### Smart-filter ideas
- "BPAs likely to exhaust before end-date at current burn" — `(used / daysElapsed) * daysRemaining + used > value`.
- "BPAs underused — consider switching supplier" — `<30%` utilisation past midpoint of term.
- "Auto-renewal cliff in next 60 days" — needs an `autoRenew` flag on the model.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- BPA renewal workflow — only surfacing "renewal candidates" preset here. The renewal flow itself is its own track.

---

## 8. MRP Suggestions

**File:** `apps/web/src/components/buy/BuyMrpSuggestions.tsx:103`
**Current:** flat list, no filters.

### Filter schema

```ts
import {
  AlertTriangle, Boxes, Building2, DollarSign, Layers, List as ListIcon,
  PackageCheck, Tag, ToggleRight, Tree,
} from 'lucide-react';

const MODULE_ID = 'buy.mrp';

const mrpFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'MRP Suggestions',
  facets: [
    {
      id: 'stockState',
      label: 'Stock state',
      kind: 'multi',
      pinned: true,
      icon: PackageCheck,
      options: [
        { value: 'ok',         label: 'OK',             color: 'var(--mw-mirage)' },
        { value: 'belowMin',   label: 'Below reorder',  color: 'var(--mw-warning)' },
        { value: 'outOfStock', label: 'Out of stock',   color: 'var(--mw-error)' },
        { value: 'excess',     label: 'Excess',         color: 'var(--neutral-400)' },
      ],
    },
    { id: 'materialFamily', label: 'Material family', kind: 'multi', icon: Layers, pinned: true, options: familyOptions },
    { id: 'preferredSupplier', label: 'Preferred supplier', kind: 'multi', icon: Building2, options: supplierOptions },
    { id: 'autoPo',         label: 'Auto-PO',         kind: 'boolean', icon: ToggleRight },
    { id: 'hasOpenPo',      label: 'Already on order',kind: 'boolean', icon: AlertTriangle },
    { id: 'estimatedValue', label: 'Est. PO value',   kind: 'range',   icon: DollarSign },
    { id: 'grade',          label: 'Grade',           kind: 'multi',   icon: Tag, options: gradeOptions },
  ],
  viewModes: [
    { id: 'list',  label: 'List',                  icon: ListIcon },
    { id: 'board', label: 'Group by supplier',     icon: Boxes, groupBy: 'preferredSupplier' },
  ],
  defaultView: 'list',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  {
    name: 'Items needing action this week',
    icon: AlertTriangle,
    iconTone: 'error',
    state: { values: { stockState: ['belowMin', 'outOfStock'], hasOpenPo: false }, search: '', view: 'list' },
  },
  {
    name: 'Consolidatable by supplier',
    icon: Boxes,
    iconTone: 'yellow',
    state: { values: { stockState: ['belowMin'] }, search: '', view: 'board' },
  },
  {
    name: 'Above $5k single-shot',
    icon: DollarSign,
    iconTone: 'warning',
    state: { values: { estimatedValue: { from: 5000 } }, search: '', view: 'list' },
  },
]);
```

### Required data work
- MRP suggestion model needs `materialFamily`, `grade`, `preferredSupplierId`, `autoPo: boolean`, `hasOpenPoCovering: boolean`, `estimatedValue` surfaced as row-level fields.
- "Already on order" requires cross-check against open POs covering the SKU — pre-compute at the service layer to avoid per-row joins in the filter pipeline.

### Smart-filter ideas
- "Items consolidatable into a single weekly PO to hit volume break" — already prototyped on Planning Grid agent card; this surfaces it as a filter chip.
- "Items where MRP says reorder but no open PO covers it" — basic version is the `Items needing action` preset above; smart version adds confidence score from demand forecast.
- "Items frequently triggering MRP — switch to BPA" — recurring weekly trigger → renewal candidate for Agreements.

**Endpoint:** `POST /api/smart-filters/buy` — dedicated per-module endpoint; not shared with other AI surfaces.

### Out of scope
- Products / Reorder Rules screens (`BuyProducts.tsx:86`, `BuyReorderRules.tsx:107`) — recommend deferring; the MRP screen exposes the same domain via the actionable surface and most users live here, not there.

---

## Cross-screen items deferred to follow-up plans

These were flagged in the audit but are out of scope for this migration pass:

- **Planning Grid** (`BuyPlanningGrid.tsx:97`) — fixed 6-week heatmap, no list to migrate. Horizon selector + by-supplier swap are view-mode work, not filter work; track separately.
- **Vendor Comparison** (`BuyVendorComparison.tsx:91`) — analytical tool, not a list. Leave as-is until RFQ detail integration is decided.
- **Products** and **Reorder Rules** — covered by MRP-screen prereqs; revisit only if users ask for direct list filtering there.
- **Saved-view sharing UX** (Lead → team scope) — Saved views are stored in the `saved_views` Postgres table. RLS enforces visibility: `scope: "personal"` → owner only; `scope: "group"` → ControlGroups members (Lead/Admin write, `group_id` references `control_groups.id`); `scope: "org"` → all authenticated. The per-screen schemas are agnostic to scope so the share-with-group control lands once in `ModuleFilterBar` and applies to all eight screens above.
- **Multi-currency rendering** — facets declared on POs/Bills, but FX display layer is its own track in Book.

---

## Implementation order (suggested)

1. **Purchase Orders** — highest-traffic Buy screen, exercises every facet kind (multi/user/range/boolean/date) and unlocks `kanban` + `calendar` view modes. Mirrors the Sell Orders pilot most closely.
2. **Bills** — second-biggest user value (AP queue); pattern follows `SellInvoices.tsx` aging-bucket view almost exactly. Date-string → ISO conversion is the gating prereq.
3. **RFQs** — kanban-by-stage is the natural workflow; also forces the `dueDate` ISO conversion the audit calls out.
4. **Requisitions** — adds `awaitingMe` boolean which is the first time we need session-user context inside a facet. Validate that pattern here before reusing in Make/Plan.
5. **Receipts**, **Suppliers**, **Agreements**, **MRP** — lower-volume; can land in parallel once 1–4 are merged.
