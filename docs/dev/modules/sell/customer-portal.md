# Customer Portal (Sell)

Route: `/sell/portal`
Source: `apps/web/src/components/sell/SellCustomerPortal.tsx`
Prefs:  `apps/web/src/components/sell/portalPreferences.ts`

## What it is

The Customer Portal is the **semi-interactive dashboard** the customer
sees after signing in to Alliance Metal's branded portal URL. In-app,
the `/sell/portal` route renders a **preview** of that dashboard for
internal Sell users so they can see what their customer sees.

Most surfaces are read-only so there is no risk of unintentional edits
to orders, invoices, or shipments. A small set of actions ARE available
to the customer by design (mirroring Odoo 19 and Fulcrum Pro):

- Accept / decline / request revisions on a quote
- View + download invoice / quote / signed-quote / delivery-note PDFs
- Pay an open invoice online (hosted session handoff)
- Edit their own shipping address + contact profile
- Manage their service-plan subscription (tier, cycle, payment method, cancel)
- Create and reply to threaded 3D markups on quote models

Patterned after:
- Odoo 19 Portal — <https://www.odoo.com/documentation/19.0/applications/general/users/user_portals.html>
- Fulcrum Pro Customer Portal — <https://fulcrumpro.com/article/manufacturing-customer-portal>

## Sections (top-to-bottom)

| # | Section                   | Toggle                              | Writes?         | Notes |
|---|---------------------------|-------------------------------------|-----------------|-------|
| 1 | Portal preview banner     | always (internal only)              | switch customer | Renders a customer-picker `<Select>` so internal users can impersonate. |
| 2 | Hero + KPI tiles          | always                              | —               | Customer name, 4 tiles: active orders, in-transit, open quotes, due invoices. |
| 3 | Shipping status           | `prefs.showShipping`                | PDF download    | Mini bar chart (stage counts) + up-to-4 active shipments; optional delivery-note download per shipment. |
| 4 | Quotes                    | `prefs.showQuotes`                  | Yes             | Accept / Decline / Request revision. Drill-in renders `PortalQuoteDetail`. |
| 5 | Sales orders              | always                              | —               | Read-only table. |
| 6 | Invoices                  | always                              | PDF + Pay       | View + download + (optional) Pay online button. |
| 7 | Subscription              | `portal.subscriptions.view` perm    | Yes             | Active plan card, usage meters, billing history, upgrade / cycle / cancel. |
| 8 | Activity feed             | `prefs.showActivities` (default **off**) | —          | Recent calls/emails/meetings for this customer. |
| 9 | Profile & address drawer  | `prefs.allowProfileEdit`            | Yes             | Header button opens a `<Sheet>` with address + contact profile forms. |

## Identity + scope

`AuthContext` (`apps/web/src/contexts/AuthContext.tsx`) is the single
source of truth for "who is looking at this screen." It exposes:

```ts
interface AuthValue {
  identity: Identity;            // internal employee OR customer contact
  viewingCustomerId: string;     // which customer the portal is scoped to
  setViewingCustomerId(id): void;// internal-only customer switcher
  hasPermission(key): boolean;   // matrix-based flat permission check
  isImpersonating: boolean;
}
```

Customer scoping flows through `viewingCustomerId` everywhere — the
portal, settings admin, profile drawer, markup viewer. The
`PreviewBanner` renders a `<Select>` seeded from `customers[]` so an
internal user can switch customers without leaving the page.

When real auth (Supabase / Clerk) lands, swap `defaultInternalIdentity()`
for a provider-backed identity; the shape of `AuthValue` stays stable.

## Permission matrix

`PERMISSION_MATRIX` in `AuthContext.tsx` flattens the ARCH 00 three-role
model (admin / lead / team) across two identity sides (internal +
customer) and the new portal keys:

| Key                              | internal_admin | internal_lead | internal_team | customer_admin | customer_lead | customer_team |
|----------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|
| `portal.access`                  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `portal.configure`               | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `portal.invitations.send`        | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `portal.invitations.revoke`      | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `portal.customers.impersonate`   | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `portal.subscriptions.view`      | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `portal.subscriptions.modify`    | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `portal.subscriptions.cancel`    | ✅ | ❌ | ❌ | ✅ * | ❌ | ❌ |
| `portal.markup.view`             | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `portal.markup.create`           | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `portal.markup.reply`            | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `portal.markup.resolve`          | ✅ | ✅ | ❌ | ❌ * | ❌ | ❌ |

\* additional runtime gates: cancel requires `subscription.closable` and
no open orders / outstanding invoices; resolve can only be done
internally in MVP to avoid customers auto-closing their own threads.

All keys are declared in `sellPermissionKeys` (`SellSettings.tsx`) and
default-assigned in `sellDefaultGroups`.

## Preferences — per-customer layering

`portalPreferences.ts` stores a **v2 schema**:

```ts
interface StoreShape {
  tenant: PortalPreferences;                        // tenant-wide default
  perCustomer: Record<string, Partial<PortalPreferences>>; // overrides
}
```

An existing v1 blob is migrated on first read. The resolve rule is
`{ ...tenant, ...perCustomer[customerId] }` — missing override keys
inherit the tenant default.

Hooks:
- `usePortalPreferences(customerId)` — read/write the effective prefs
  for a customer. Pass `null` to read/write tenant defaults.
- `usePortalPreferencesAdmin()` — tenant-level view with `updateTenant`
  and `resetCustomer(id)`. Consumed by Sell → Settings → Portal.

Prefs now include:

```ts
interface PortalPreferences {
  showActivities: boolean;            // default: false
  showShipping: boolean;              // default: true
  showQuotes: boolean;                // default: true
  allowInvoiceDownload: boolean;      // default: true
  showMarkup: boolean;                // default: true  (3D markup on quotes)
  showSubscriptionUsage: boolean;     // default: true  (usage meters)
  allowProfileEdit: boolean;          // default: true  (address/contact drawer)
  allowDeliveryNoteDownload: boolean; // default: true  (shipment PDFs)
  allowOnlinePayment: boolean;        // default: true  (invoice "Pay" button)
}
```

A `mw:portal-prefs-changed` DOM event fires on write so multiple open
tabs stay in sync via `window.addEventListener`.

Storage key: `mw.sell.portal.prefs.v2` (`localStorage`). Real impl is
a Supabase table `customer_portal_preferences` with one row per
customer + a tenant row for `customer_id IS NULL`.

## Service layer

The portal reads/writes through four new service façades (all
mock-backed today, all 1:1 onto Supabase tables when wired):

| Service                  | Table(s)                                   | Responsibility |
|--------------------------|--------------------------------------------|----------------|
| `portalAccessService`    | `customer_contacts`, `portal_invitations`  | List / invite / revoke / resend contacts. |
| `attachmentService`      | `attachments` (signed URLs)                | Generate quote / signed-quote / invoice / delivery-note PDFs. |
| `subscriptionService`    | `subscriptions`, `subscription_events`     | Read + mutate a customer's plan, cycle, payment method. |
| `markupService`          | `model_markups`, `markup_comments`         | 3D model threaded markups; bridges to `auditService` on resolve. |

`auditService` remains the tenant-wide event log; invitation revoke and
markup resolve both write to it so the customer record and the
quote/order timeline stay coherent.

### Attachment pipeline

`attachmentService.getOrCreate()` is idempotent — repeated calls for
the same `(entityType, entityId, kind)` return the same `Attachment`.
Mock PDFs are valid PDF-1.4 so the browser renders them correctly when
`openInNewTab()` hits the data URL.

Helper builders:

- `getQuotePdf({ quoteId, quoteRef, customerCompany, lines, total, expiryDate })`
- `getSignedQuotePdf({ quoteId, quoteRef, acceptedBy, acceptedAt })`
- `getInvoicePdf({ invoiceId, invoiceNumber, customerCompany, amount, dueDate, status })`
- `getDeliveryNotePdf({ shipmentId, shipmentNumber, orderNumber, ... })`

### Subscription model

**Two subscription concepts coexist** and must not be confused:

- `lib/subscription.ts` — tenant (Alliance Metal) → MirrorWorks. Drives
  in-app feature gates. `TierName = 'Pilot' | 'Produce' | 'Expand' | 'Excel'`
  (capitalised).
- `services/subscriptionService.ts` — tenant's customer (TechCorp) →
  tenant's service plan. Drives this portal card.
  `SubscriptionTier = 'pilot' | 'produce' | 'expand' | 'excel'`
  (lowercase, distinct type).

Customer-side plan mutations:
- Upgrades apply instantly + pro-rated.
- Downgrades create a `downgrade_requested` event; finance processes.
- Cancel: if `plan.closable && no open orders && no unpaid invoices`,
  flips to `status='grace'` for 30 days. Otherwise routed to finance.
- Cycle flip and payment-method updates are instant and self-service.

### Markup service

Markups hang off quotes (and later orders/jobs). Each has:
- `anchor` — `{ partId, pointLocal, normalLocal, cameraPose? }` in the
  GLB's local space. Part resolution uses mesh-name convention.
  The anchor survives assembly repose because coords are local.
- `thread` — denormalised `MarkupComment[]`. First comment duplicates
  the markup's opening body.
- `status` — `open | resolved | wont_fix`.

`markupService.resolve()` bridges to `auditService.record({ action:
'status_changed', entityType: 'quote' | 'sales_order' })` so the
parent quote's timeline reflects design-review progress without
drowning in thread chatter.

**MVP spatial UX**: `PortalMarkupViewer` renders a GlbViewer + a
thread panel; new markups are created with a placeholder anchor and a
typed `partId`. Phase 2 adds raycasting for click-to-place pins
(anchor shape is ready for that upgrade).

## Quote drill-down

Clicking **View** on any quote card renders `PortalQuoteDetail`. That
page now also hosts:

- The 3D markup viewer (`PortalMarkupViewer`) when
  `prefs.showMarkup && quote has a .glb upload`.
- A permission-gated "Download signed quote PDF" button when the quote
  has been accepted (via `getSignedQuotePdf`).

## Related files

- `apps/web/src/contexts/AuthContext.tsx` — identity + permissions
- `apps/web/src/components/sell/SellCustomerPortal.tsx` — main portal page
- `apps/web/src/components/sell/PortalQuoteDetail.tsx` — quote drill-in
- `apps/web/src/components/sell/PortalQuoteChat.tsx` — quote-level chat
- `apps/web/src/components/sell/PortalRevisionTracker.tsx` — quote revisions
- `apps/web/src/components/sell/PortalContactsPanel.tsx` — invite / revoke UI
- `apps/web/src/components/sell/PortalProfileDrawer.tsx` — self-service edit
- `apps/web/src/components/sell/PortalSubscriptionSection.tsx` — plan card
- `apps/web/src/components/sell/PortalMarkupViewer.tsx` — 3D markup MVP
- `apps/web/src/components/sell/portalPreferences.ts` — v2 prefs store
- `apps/web/src/components/sell/SellSettings.tsx` — `PortalPanel` + permission keys
- `apps/web/src/services/portalAccessService.ts`
- `apps/web/src/services/attachmentService.ts`
- `apps/web/src/services/subscriptionService.ts`
- `apps/web/src/services/markupService.ts`

## Known gaps

- Address edits in `PortalProfileDrawer` mutate the mock `Customer`
  directly. Production will route through `sellService.updateCustomer`.
- `PortalMarkupViewer` places pins with a placeholder 3D anchor. Real
  raycasting against the loaded GLB is phase 2 — the anchor shape is
  already stored so the upgrade is additive, not breaking.
- Online payment ("Pay" button) opens a mock `about:blank#pay/...`. Real
  impl is a Stripe Checkout session or PayID handoff.
- Email notifications (invite, payment receipt, markup mention) are
  not wired — pending an email service integration.
