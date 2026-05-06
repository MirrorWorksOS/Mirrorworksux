# Xero Configure Mapping — Dev

The mapping workspace under Book → Settings → Xero Integration → Configure mapping. Lets a finance lead wire MirrorWorks source keys to Xero accounts, tax rates, tracking categories, and branding themes. Landed in commit `6d0b485c` (2026-05-05).

User doc: [`docs/user/modules/book/xero-mapping.md`](../../../user/modules/book/xero-mapping.md)

## Route

`/book/settings/xero/mapping` → `XeroMappingPage`. Reached via the **Configure mapping** button on the Xero Integration panel of `/book/settings` (the button used to fire a placeholder toast — now `navigate('/book/settings/xero/mapping')`).

Wired in [`apps/web/src/routes.tsx:174`](../../../../apps/web/src/routes.tsx) and `:513`.

## Component tree

```
XeroMappingPage                         ← apps/web/src/components/book/xero-mapping/XeroMappingPage.tsx
├── PageHeader                          (organisation name + currency + "Pull latest from Xero")
├── Status banner Card                  (Progress bar + mapped/total + "Auto-map by name" + "Reset all" + … menu)
├── Two-column layout (256 px sidebar)
│   ├── MappingSidebar                  (six section nav items, status dot per section)
│   └── Section content (one of)
│       ├── SalesSection                (sales.* entries)
│       ├── PurchasesSection            (purchases.* entries)
│       ├── BankSystemSection           (bank.* + system.* entries)
│       ├── TaxesSection                (tax.* entries — TaxRateCombobox only)
│       ├── TrackingSection             (TrackingMappingEntry rows)
│       └── BrandingSection             (5 default fields)
├── AutoMapDialog                       (review and accept name-matched suggestions)
└── MappingFooter                       (sticky — diff count + Discard / Save)
```

The four leaf widgets that appear inside every Section card:

- `MappingRow` — one row per `MappingEntry`; pairs an `AccountCombobox` with an inline `TaxRateCombobox` and a "system" badge for Xero-managed accounts.
- `AccountCombobox` — searchable combobox grouped by Xero account `Class` (ASSET / LIABILITY / EQUITY / REVENUE / EXPENSE).
- `TaxRateCombobox` — searchable combobox of `XeroTaxRate` keyed by `TaxType`.
- `SectionShell` — common card wrapper used by every section.

## Type surface — [`apps/web/src/types/xero.ts`](../../../../apps/web/src/types/xero.ts)

Mirrors the Xero Accounting API directly so a backend adapter is a thin pass-through. Field casing matches Xero (PascalCase for read entities, camelCase for our own mapping config).

### Read entities (Xero-side)

```ts
XeroAccount {
  AccountID: string; Code: string; Name: string;
  Type: XeroAccountType;             // 23-member union (BANK, EXPENSE, REVENUE, …)
  TaxType: string;                    // matches a TaxRate.TaxType
  Class: XeroAccountClass;            // ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
  Status: XeroAccountStatus;          // ACTIVE | ARCHIVED
  Description?, EnablePaymentsToAccount?, ShowInExpenseClaims?,
  SystemAccount?: XeroSystemAccount,  // 13-member union (DEBTORS, GST, …)
  ReportingCode?, CurrencyCode?
}

XeroTaxRate {
  Name; TaxType; ReportTaxType?; Status;
  EffectiveRate: number;              // percentage, e.g. 10 for 10%
  DisplayTaxRate?, CanApplyTo*: boolean
}

XeroTrackingCategory {
  TrackingCategoryID; Name; Status;
  Options: XeroTrackingOption[]
}

XeroBrandingTheme { BrandingThemeID; Name; SortOrder; LogoUrl? }

XeroOrganisation { OrganisationID; Name; LegalName?; BaseCurrency; CountryCode; … }
```

### MirrorWorks-side mapping doc

```ts
MappingEntry {
  sourceKey: string;                  // e.g. 'sales.accounts_receivable'
  sourceLabel: string;
  xeroAccountCode: string;            // empty string when unmapped
  xeroTaxType?: string;
  system?: boolean;                   // Xero-managed (read-only in UI)
  required: boolean;
}

TrackingMappingEntry {
  sourceKey: string;
  sourceLabel: string;
  xeroTrackingCategoryId: string;
  autoCreateMissingOptions: boolean;
}

BrandingDefaults {
  invoiceBrandingThemeId: string;
  creditNoteBrandingThemeId: string;
  defaultInvoiceStatus: 'DRAFT' | 'AUTHORISED';
  defaultDueDateOffsetDays: number;
  referenceTemplate: string;          // e.g. "INV-{{job}}-{{seq}}"
}

XeroMappingConfig {
  entries: MappingEntry[];
  tracking: TrackingMappingEntry[];
  branding: BrandingDefaults;
  updatedAt: string;
}

MappingSectionId = 'sales' | 'purchases' | 'bank-system' | 'taxes' | 'tracking' | 'branding'

SectionStatus { total: number; mapped: number; required: number; requiredUnmapped: number }
```

`MappingEntry.sourceKey` follows a `<section>.<slug>` convention. `entrySectionId(entry)` derives the section from the key prefix:

| Prefix | Section |
|---|---|
| `sales.` | sales |
| `purchases.` | purchases |
| `bank.`, `system.` | bank-system |
| `tax.` | taxes |
| (other) | falls back to sales |

## Service surface — [`apps/web/src/services/xeroService.ts`](../../../../apps/web/src/services/xeroService.ts)

All exports are mock-backed. A real backend would replace these with calls to the Xero Accounting API.

| Function | Purpose |
|---|---|
| `getOrganisation()` | Header context |
| `getAccounts()` | Combobox option source for `AccountCombobox` |
| `getTaxRates()` | Combobox option source for `TaxRateCombobox` |
| `getTrackingCategories()` | Source for `TrackingSection` |
| `getBrandingThemes()` | Source for `BrandingSection` |
| `getSyncEntities()` | Status banner on Settings → Xero panel |
| `getMappingConfig()` | Initial load of the saved mapping doc |
| `saveMappingConfig(cfg)` | Persists the doc; returns the saved version with a refreshed `updatedAt` |
| `pullLatest()` | Refreshes accounts / tax rates / tracking / themes from the (mock) Xero source. Returns `{ accounts, taxRates, trackingCategories, brandingThemes }` counts. |
| `suggestAccountMappings(unmapped, accounts)` → `AutoMapSuggestion[]` | Name-matching auto-map; consumer is `AutoMapDialog`. |

Mock seed lives in [`apps/web/src/services/mock/xero.ts`](../../../../apps/web/src/services/mock/xero.ts):

- `mockXeroOrganisation` — one AU org.
- `mockXeroAccounts` — full plausible chart of accounts.
- `mockXeroTaxRates` — 8 rates (`OUTPUT`, `INPUT`, `GSTONIMPORTS`, `EXEMPTOUTPUT`, `EXEMPTINPUT`, `BASEXCLUDED`, `OUTPUTW`, `INPUTW`).
- `mockXeroTrackingCategories` — 2 categories (`Cost Centre`, `Project`).
- `mockXeroBrandingThemes` — 2 themes.
- `mockXeroSyncEntities` — what the Settings → Xero panel reads.
- `mockXeroMappingConfig` — partially-mapped so the page has realistic state on first paint.

## Local state machine

`XeroMappingPage` keeps two copies of the mapping doc:

```ts
savedConfig:  XeroMappingConfig | null   // last successful save
draftConfig:  XeroMappingConfig | null   // editable working copy
```

Every section edit flows through one of three setters (`onChangeEntry` / `onChangeTracking` / `onChangeBranding`) that mutate `draftConfig` immutably. The diff is recomputed on every render via `diffEntry` / `diffTracking` / `diffBranding` helpers and surfaces in the sticky `MappingFooter` as "X changes". **Discard** snaps `draftConfig` back to `savedConfig`. **Save** awaits `saveMappingConfig` and then promotes the result into `savedConfig` and `draftConfig`.

`sectionStatus` re-derives `{total, mapped, required, requiredUnmapped}` per section every render — drives the `MappingSidebar` dots and the status banner numbers. Branding is handled separately because it has fixed-shape fields, not entries; its "5 defaults" total is hand-counted in the `useMemo`.

`onAutoMap` builds the unmapped list (filters out `system` rows and `tax.*` keys) and delegates to `suggestAccountMappings` for name-matching. Selected suggestions get applied via `onApplyAutoMap`, which patches `draftConfig.entries[*].xeroAccountCode` from a `Map<sourceKey, suggestedCode>`.

`onResetAll` deep-clones `mockXeroMappingConfig` into the draft. Today this hard-codes the mock factory defaults; a real backend would use a separate "factory config" endpoint.

## Disconnected fallback

The page checks for an `organisation` value after load — if missing, renders a centred **"Xero is not connected"** card with a yellow "Back to Xero Integration" CTA pointing at `/book/settings`. In this mock build, presence of `mockXeroOrganisation` makes that fallback unreachable; a real backend would surface a `connected: boolean` flag here.

## Things still mock / TODO

- **Persistence** — `saveMappingConfig` is in-memory only.
- **Pull latest** — refreshes the mock data; doesn't actually call Xero.
- **Auto-map heuristic** — name-similarity only; no learned matches.
- **Branding "default" detection** — branding section is "complete" once a theme is chosen, regardless of whether the rest of the defaults make sense.
- **Permissions** — page is reachable to anyone with Book access. ARCH 00 `xero.access` permission gating is not yet wired (declared in `BookSettings.bookPermissionKeys`).
- **OAuth flow** — there's no real Xero OAuth handshake yet; the mock org is always present.

## Related files

- `apps/web/src/components/book/BookSettings.tsx` — Xero Integration panel; the entry-point button now navigates here.
- `apps/web/src/components/book/xero-mapping/sections/SectionShell.tsx` — common card wrapper.
- `apps/web/src/components/book/xero-mapping/AutoMapDialog.tsx` — review-and-apply suggestions.
- `apps/web/src/components/book/xero-mapping/MappingFooter.tsx` — sticky save/discard footer.
- `apps/web/src/services/mock/xero.ts` — seed data.

## Permissions context

ARCH 00 §4.7 defines `xero.access` as a Book permission key. Once gating is wired:

- The Configure mapping link in the Xero panel disappears for users without `xero.access`.
- `XeroMappingPage` itself gates on the same key with a "You don't have access to this page" surface.

For now, the page is reachable to any user with Book access.
