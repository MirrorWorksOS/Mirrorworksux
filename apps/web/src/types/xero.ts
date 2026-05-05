/**
 * Type surface for the Xero Accounting API entities consumed by the
 * Configure Mapping screen, plus the MirrorWorks-side mapping config.
 *
 * Field names mirror the Xero API (PascalCase preserved for read entities,
 * camelCase for our own internal mapping config) so a backend adapter is
 * a thin pass-through. Reference:
 *   https://developer.xero.com/documentation/api/accounting/overview
 */

// ── Xero Account ──────────────────────────────────────────────────────

export type XeroAccountType =
  | 'BANK'
  | 'CURRENT'
  | 'CURRLIAB'
  | 'DEPRECIATN'
  | 'DIRECTCOSTS'
  | 'EQUITY'
  | 'EXPENSE'
  | 'FIXED'
  | 'INVENTORY'
  | 'LIABILITY'
  | 'NONCURRENT'
  | 'OTHERINCOME'
  | 'OVERHEADS'
  | 'PREPAYMENT'
  | 'REVENUE'
  | 'SALES'
  | 'TERMLIAB'
  | 'PAYG'
  | 'SUPERANNUATIONEXPENSE'
  | 'SUPERANNUATIONLIABILITY'
  | 'WAGESEXPENSE'
  | 'WAGESPAYABLELIABILITY';

export type XeroAccountClass = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type XeroAccountStatus = 'ACTIVE' | 'ARCHIVED';

export type XeroSystemAccount =
  | 'DEBTORS'
  | 'CREDITORS'
  | 'BANKCURRENCYGAIN'
  | 'GST'
  | 'GSTONIMPORTS'
  | 'HISTORICAL'
  | 'REALISEDCURRENCYGAIN'
  | 'RETAINEDEARNINGS'
  | 'ROUNDING'
  | 'TRACKINGTRANSFERS'
  | 'UNPAIDEXPCLM'
  | 'UNREALISEDCURRENCYGAIN'
  | 'WAGEPAYABLES';

export interface XeroAccount {
  AccountID: string;
  Code: string;
  Name: string;
  Type: XeroAccountType;
  TaxType: string; // matches a TaxRate.TaxType
  Class: XeroAccountClass;
  Status: XeroAccountStatus;
  Description?: string;
  EnablePaymentsToAccount?: boolean;
  ShowInExpenseClaims?: boolean;
  SystemAccount?: XeroSystemAccount;
  ReportingCode?: string;
  CurrencyCode?: string;
}

// ── Xero TaxRate ──────────────────────────────────────────────────────

export type XeroTaxRateStatus = 'ACTIVE' | 'DELETED' | 'ARCHIVED' | 'PENDING';

export interface XeroTaxRate {
  Name: string;
  TaxType: string; // e.g. OUTPUT, INPUT, GSTONIMPORTS, EXEMPTOUTPUT, BASEXCLUDED
  ReportTaxType?: string;
  Status: XeroTaxRateStatus;
  EffectiveRate: number; // percentage, e.g. 10 for 10%
  DisplayTaxRate?: number;
  CanApplyToAssets?: boolean;
  CanApplyToEquity?: boolean;
  CanApplyToExpenses?: boolean;
  CanApplyToLiabilities?: boolean;
  CanApplyToRevenue?: boolean;
}

// ── Xero TrackingCategory ─────────────────────────────────────────────

export interface XeroTrackingOption {
  TrackingOptionID: string;
  Name: string;
  Status: 'ACTIVE' | 'ARCHIVED';
}

export interface XeroTrackingCategory {
  TrackingCategoryID: string;
  Name: string;
  Status: 'ACTIVE' | 'ARCHIVED';
  Options: XeroTrackingOption[];
}

// ── Xero BrandingTheme ────────────────────────────────────────────────

export interface XeroBrandingTheme {
  BrandingThemeID: string;
  Name: string;
  SortOrder: number;
  LogoUrl?: string;
}

// ── Xero Organisation (header context only) ───────────────────────────

export interface XeroOrganisation {
  OrganisationID: string;
  Name: string;
  LegalName?: string;
  BaseCurrency: string; // e.g. "AUD"
  CountryCode: string; // e.g. "AU"
  TaxNumber?: string; // e.g. ABN
  Timezone?: string;
}

// ── MW-side mapping config ────────────────────────────────────────────

export type MappingSectionId =
  | 'sales'
  | 'purchases'
  | 'bank-system'
  | 'taxes'
  | 'tracking'
  | 'branding';

/**
 * A single row in the mapping table — links one MirrorWorks category
 * (sourceKey) to one Xero AccountCode and an optional TaxType.
 */
export interface MappingEntry {
  /** Stable key used by MW to identify this category (e.g. `sales.steel`). */
  sourceKey: string;
  /** Human-readable label shown on the left of the row. */
  sourceLabel: string;
  /** One-line description shown under the label. */
  sourceDescription?: string;
  /** Whether this row must be mapped before saving. */
  required: boolean;
  /** Read-only system row (locked, managed by Xero). */
  system?: boolean;
  /** The Xero account code currently mapped to. Empty = unmapped. */
  xeroAccountCode: string;
  /** The Xero tax type currently mapped to. Empty = no tax / inherit. */
  xeroTaxType?: string;
  /** Filter the account combobox. */
  accountFilter?: {
    classes?: XeroAccountClass[];
    types?: XeroAccountType[];
    paymentsEnabled?: boolean;
  };
  /** Direction this row's tax can apply to (filters tax-rate combobox). */
  taxDirection?: 'sales' | 'purchases';
}

/**
 * Mapping for a tracking category — links an MW dimension to a Xero
 * tracking category and (optionally) auto-create missing options.
 */
export interface TrackingMappingEntry {
  sourceKey: string;
  sourceLabel: string;
  sourceDescription?: string;
  /** Xero TrackingCategoryID (or '' if unmapped). */
  xeroTrackingCategoryId: string;
  /** Auto-create tracking options on push when an MW value is missing. */
  autoCreateMissingOptions: boolean;
}

/**
 * Defaults pushed alongside invoices/credit notes to Xero.
 */
export interface BrandingDefaults {
  invoiceBrandingThemeId: string;
  creditNoteBrandingThemeId: string;
  /** Status used when MW pushes a new invoice. */
  defaultInvoiceStatus: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED';
  /** Days from issue date used to compute due date when MW does not supply one. */
  defaultDueDateOffsetDays: number;
  /** Reference template, supports `{invoiceNumber}` `{poNumber}` `{jobCode}`. */
  referenceTemplate: string;
}

export interface XeroMappingConfig {
  organisationId: string;
  updatedAt: string; // ISO
  entries: MappingEntry[]; // sales, purchases, bank-system, taxes
  tracking: TrackingMappingEntry[];
  branding: BrandingDefaults;
}

// ── Sync entity (used in BookSettings) ────────────────────────────────

export interface XeroSyncEntity {
  name: string;
  push: boolean;
  pull: boolean;
  lastSync: string;
  ok: boolean;
}

// ── UI helper types ──────────────────────────────────────────────────

export interface MappingDiff {
  sourceKey: string;
  sourceLabel: string;
  field: 'xeroAccountCode' | 'xeroTaxType' | 'xeroTrackingCategoryId';
  before: string;
  after: string;
}

export interface SectionStatus {
  total: number;
  mapped: number;
  required: number;
  requiredUnmapped: number;
}
