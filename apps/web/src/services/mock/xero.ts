/**
 * Mock Xero data for the Configure Mapping screen.
 *
 * Modelled on a real Australian sheet-metal SME's Xero org so it slots
 * cleanly behind a real backend later. Codes follow the conventional
 * Australian numbering: 200s revenue, 300s COGS, 400s overheads,
 * 500s admin, 600s banks/current assets, 800s receivables/payables,
 * 820 GST, 960 retained earnings, 990 historical adjustments.
 */
import type {
  XeroAccount,
  XeroBrandingTheme,
  XeroMappingConfig,
  XeroOrganisation,
  XeroSyncEntity,
  XeroTaxRate,
  XeroTrackingCategory,
} from '@/types/xero';

// ── Organisation ──────────────────────────────────────────────────────

export const mockXeroOrganisation: XeroOrganisation = {
  OrganisationID: 'org-alliance-001',
  Name: 'Alliance Metal Pty Ltd',
  LegalName: 'Alliance Metal Pty Ltd',
  BaseCurrency: 'AUD',
  CountryCode: 'AU',
  TaxNumber: '12 345 678 901',
  Timezone: 'Australia/Sydney',
};

// ── Chart of Accounts ─────────────────────────────────────────────────

export const mockXeroAccounts: XeroAccount[] = [
  // ── Revenue (200s) ────────────────────────────────────────────────
  { AccountID: 'acc-200', Code: '200', Name: 'Sales',                Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE', Description: 'Default sales income' },
  { AccountID: 'acc-201', Code: '201', Name: 'Steel fabrication',    Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-202', Code: '202', Name: 'Aluminium sales',      Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-203', Code: '203', Name: 'Stainless sales',      Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-204', Code: '204', Name: 'Services & labour',    Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-205', Code: '205', Name: 'Freight recovered',    Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-260', Code: '260', Name: 'Discounts given',      Type: 'REVENUE',     TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-270', Code: '270', Name: 'Other income',         Type: 'OTHERINCOME', TaxType: 'OUTPUT', Class: 'REVENUE',  Status: 'ACTIVE' },
  { AccountID: 'acc-275', Code: '275', Name: 'Foreign exchange gain',Type: 'OTHERINCOME', TaxType: 'BASEXCLUDED', Class: 'REVENUE', Status: 'ACTIVE', SystemAccount: 'BANKCURRENCYGAIN' },

  // ── COGS / Direct Costs (300s) ────────────────────────────────────
  { AccountID: 'acc-310', Code: '310', Name: 'Raw materials',        Type: 'DIRECTCOSTS', TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-320', Code: '320', Name: 'Direct labour',        Type: 'DIRECTCOSTS', TaxType: 'BASEXCLUDED', Class: 'EXPENSE', Status: 'ACTIVE' },
  { AccountID: 'acc-330', Code: '330', Name: 'Subcontractors',       Type: 'DIRECTCOSTS', TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-340', Code: '340', Name: 'Consumables',          Type: 'DIRECTCOSTS', TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-350', Code: '350', Name: 'Tooling',              Type: 'DIRECTCOSTS', TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-360', Code: '360', Name: 'Freight inwards',      Type: 'DIRECTCOSTS', TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-370', Code: '370', Name: 'Equipment hire',       Type: 'DIRECTCOSTS', TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },

  // ── Overheads (400s) ──────────────────────────────────────────────
  { AccountID: 'acc-400', Code: '400', Name: 'Advertising',          Type: 'OVERHEADS',   TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-404', Code: '404', Name: 'Bank fees',            Type: 'OVERHEADS',   TaxType: 'EXEMPTEXPENSES', Class: 'EXPENSE', Status: 'ACTIVE' },
  { AccountID: 'acc-405', Code: '405', Name: 'Merchant fees',        Type: 'OVERHEADS',   TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-408', Code: '408', Name: 'Cleaning',             Type: 'OVERHEADS',   TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-412', Code: '412', Name: 'Rent',                 Type: 'OVERHEADS',   TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-420', Code: '420', Name: 'Electricity',          Type: 'OVERHEADS',   TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-449', Code: '449', Name: 'Motor vehicle expense',Type: 'OVERHEADS',   TaxType: 'INPUT',  Class: 'EXPENSE',  Status: 'ACTIVE' },
  { AccountID: 'acc-477', Code: '477', Name: 'Wages & salaries',     Type: 'WAGESEXPENSE',TaxType: 'BASEXCLUDED', Class: 'EXPENSE', Status: 'ACTIVE' },

  // ── Current Assets / Banks (600s, 610s) ───────────────────────────
  { AccountID: 'acc-610', Code: '610', Name: 'Business bank account',  Type: 'BANK',     TaxType: 'BASEXCLUDED', Class: 'ASSET', Status: 'ACTIVE', EnablePaymentsToAccount: true, CurrencyCode: 'AUD' },
  { AccountID: 'acc-611', Code: '611', Name: 'Business savings',       Type: 'BANK',     TaxType: 'BASEXCLUDED', Class: 'ASSET', Status: 'ACTIVE', EnablePaymentsToAccount: true, CurrencyCode: 'AUD' },
  { AccountID: 'acc-612', Code: '612', Name: 'Business credit card',   Type: 'BANK',     TaxType: 'BASEXCLUDED', Class: 'LIABILITY', Status: 'ACTIVE', EnablePaymentsToAccount: true, CurrencyCode: 'AUD' },
  { AccountID: 'acc-630', Code: '630', Name: 'Inventory on hand',      Type: 'INVENTORY',TaxType: 'BASEXCLUDED', Class: 'ASSET', Status: 'ACTIVE' },
  { AccountID: 'acc-680', Code: '680', Name: 'Prepayments',            Type: 'PREPAYMENT',TaxType: 'BASEXCLUDED', Class: 'ASSET', Status: 'ACTIVE' },

  // ── Fixed assets ──────────────────────────────────────────────────
  { AccountID: 'acc-710', Code: '710', Name: 'Plant & equipment',      Type: 'FIXED',    TaxType: 'INPUT',  Class: 'ASSET',  Status: 'ACTIVE' },
  { AccountID: 'acc-711', Code: '711', Name: 'Less accumulated depreciation', Type: 'DEPRECIATN', TaxType: 'BASEXCLUDED', Class: 'ASSET', Status: 'ACTIVE' },

  // ── System / locked accounts ──────────────────────────────────────
  { AccountID: 'acc-610-debtors',   Code: '610-AR', Name: 'Accounts Receivable', Type: 'CURRENT',  TaxType: 'BASEXCLUDED', Class: 'ASSET',     Status: 'ACTIVE', SystemAccount: 'DEBTORS' },
  { AccountID: 'acc-800-creditors', Code: '800',    Name: 'Accounts Payable',    Type: 'CURRLIAB', TaxType: 'BASEXCLUDED', Class: 'LIABILITY', Status: 'ACTIVE', SystemAccount: 'CREDITORS' },
  { AccountID: 'acc-820-gst',       Code: '820',    Name: 'GST',                 Type: 'CURRLIAB', TaxType: 'BASEXCLUDED', Class: 'LIABILITY', Status: 'ACTIVE', SystemAccount: 'GST' },
  { AccountID: 'acc-960',           Code: '960',    Name: 'Retained Earnings',   Type: 'EQUITY',   TaxType: 'BASEXCLUDED', Class: 'EQUITY',    Status: 'ACTIVE', SystemAccount: 'RETAINEDEARNINGS' },
  { AccountID: 'acc-961',           Code: '961',    Name: 'Rounding',            Type: 'OVERHEADS',TaxType: 'BASEXCLUDED', Class: 'EXPENSE',   Status: 'ACTIVE', SystemAccount: 'ROUNDING' },
  { AccountID: 'acc-990',           Code: '990',    Name: 'Historical adjustment',Type: 'EQUITY',  TaxType: 'BASEXCLUDED', Class: 'EQUITY',    Status: 'ACTIVE', SystemAccount: 'HISTORICAL' },
];

// ── Tax Rates (AU defaults) ───────────────────────────────────────────

export const mockXeroTaxRates: XeroTaxRate[] = [
  { Name: 'GST on Income',      TaxType: 'OUTPUT',          Status: 'ACTIVE', EffectiveRate: 10, CanApplyToRevenue: true },
  { Name: 'GST on Expenses',    TaxType: 'INPUT',           Status: 'ACTIVE', EffectiveRate: 10, CanApplyToExpenses: true, CanApplyToAssets: true, CanApplyToLiabilities: true },
  { Name: 'GST Free Income',    TaxType: 'EXEMPTOUTPUT',    Status: 'ACTIVE', EffectiveRate: 0,  CanApplyToRevenue: true },
  { Name: 'GST Free Expenses',  TaxType: 'EXEMPTEXPENSES',  Status: 'ACTIVE', EffectiveRate: 0,  CanApplyToExpenses: true },
  { Name: 'GST on Imports',     TaxType: 'GSTONIMPORTS',    Status: 'ACTIVE', EffectiveRate: 10, CanApplyToExpenses: true },
  { Name: 'GST on Capital',     TaxType: 'CAPITALEXINPUT',  Status: 'ACTIVE', EffectiveRate: 10, CanApplyToExpenses: true, CanApplyToAssets: true },
  { Name: 'BAS Excluded',       TaxType: 'BASEXCLUDED',     Status: 'ACTIVE', EffectiveRate: 0,  CanApplyToExpenses: true, CanApplyToRevenue: true, CanApplyToAssets: true, CanApplyToLiabilities: true, CanApplyToEquity: true },
  { Name: 'No GST',             TaxType: 'NONE',            Status: 'ACTIVE', EffectiveRate: 0,  CanApplyToExpenses: true, CanApplyToRevenue: true },
];

// ── Tracking Categories ──────────────────────────────────────────────

export const mockXeroTrackingCategories: XeroTrackingCategory[] = [
  {
    TrackingCategoryID: 'tc-jobs',
    Name: 'Job',
    Status: 'ACTIVE',
    Options: [
      { TrackingOptionID: 'to-job-1041', Name: 'JOB-1041 — Reidvale tower', Status: 'ACTIVE' },
      { TrackingOptionID: 'to-job-1042', Name: 'JOB-1042 — Eastpark Stage 2', Status: 'ACTIVE' },
      { TrackingOptionID: 'to-job-1043', Name: 'JOB-1043 — Bayside refurb',  Status: 'ACTIVE' },
      { TrackingOptionID: 'to-job-1044', Name: 'JOB-1044 — Skyline canopies', Status: 'ACTIVE' },
    ],
  },
  {
    TrackingCategoryID: 'tc-dept',
    Name: 'Department',
    Status: 'ACTIVE',
    Options: [
      { TrackingOptionID: 'to-dept-fab',  Name: 'Fabrication', Status: 'ACTIVE' },
      { TrackingOptionID: 'to-dept-laser',Name: 'Laser cutting', Status: 'ACTIVE' },
      { TrackingOptionID: 'to-dept-press',Name: 'Press brake',  Status: 'ACTIVE' },
      { TrackingOptionID: 'to-dept-paint',Name: 'Paint & finish', Status: 'ACTIVE' },
      { TrackingOptionID: 'to-dept-admin',Name: 'Admin & sales', Status: 'ACTIVE' },
    ],
  },
];

// ── Branding Themes ──────────────────────────────────────────────────

export const mockXeroBrandingThemes: XeroBrandingTheme[] = [
  { BrandingThemeID: 'bt-standard', Name: 'Standard',         SortOrder: 0 },
  { BrandingThemeID: 'bt-credit',   Name: 'Credit Note',      SortOrder: 1 },
  { BrandingThemeID: 'bt-modern',   Name: 'Alliance Modern',  SortOrder: 2 },
];

// ── Sync entities (used by parent BookSettings panel) ────────────────

export const mockXeroSyncEntities: XeroSyncEntity[] = [
  { name: 'Invoices',             push: true,  pull: true,  lastSync: '2 min ago',         ok: true  },
  { name: 'Expenses (as Bills)',  push: true,  pull: false, lastSync: '5 min ago',         ok: true  },
  { name: 'Purchase Orders',      push: true,  pull: false, lastSync: '1 hr ago',          ok: true  },
  { name: 'Manual Journals (WIP)',push: true,  pull: false, lastSync: 'Yesterday',         ok: false },
  { name: 'Chart of Accounts',    push: false, pull: true,  lastSync: 'Today 9:00 AM',     ok: true  },
  { name: 'Reports (P&L, BS)',    push: false, pull: true,  lastSync: 'Today 9:00 AM',     ok: true  },
];

// ── Initial mapping config (saved state) ──────────────────────────────

export const mockXeroMappingConfig: XeroMappingConfig = {
  organisationId: mockXeroOrganisation.OrganisationID,
  updatedAt: '2026-04-22T03:14:00.000Z',
  entries: [
    // ── Sales ───────────────────────────────────────────────────────
    { sourceKey: 'sales.default',   sourceLabel: 'Default sales account',   sourceDescription: 'Used when an invoice line has no MW category override', required: true,  xeroAccountCode: '200', xeroTaxType: 'OUTPUT',     accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },
    { sourceKey: 'sales.steel',     sourceLabel: 'Steel fabrication revenue', sourceDescription: 'Sheet, plate, RHS, structural', required: false, xeroAccountCode: '201', xeroTaxType: 'OUTPUT', accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },
    { sourceKey: 'sales.aluminium', sourceLabel: 'Aluminium revenue',       sourceDescription: 'Aluminium plate, sheet, extrusions', required: false, xeroAccountCode: '202', xeroTaxType: 'OUTPUT', accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },
    { sourceKey: 'sales.stainless', sourceLabel: 'Stainless revenue',       sourceDescription: '304 / 316 stainless products', required: false, xeroAccountCode: '203', xeroTaxType: 'OUTPUT', accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },
    { sourceKey: 'sales.services',  sourceLabel: 'Service & labour revenue', sourceDescription: 'On-site install, design, consulting', required: false, xeroAccountCode: '204', xeroTaxType: 'OUTPUT', accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },
    { sourceKey: 'sales.freight',   sourceLabel: 'Freight on-charge',       sourceDescription: 'Carriage recovered from customers', required: false, xeroAccountCode: '205', xeroTaxType: 'OUTPUT', accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },
    { sourceKey: 'sales.discounts', sourceLabel: 'Discounts given',         sourceDescription: 'Negative-line discounts on invoices', required: false, xeroAccountCode: '260', xeroTaxType: 'OUTPUT', accountFilter: { classes: ['REVENUE'] }, taxDirection: 'sales' },

    // ── Purchases & Costs ──────────────────────────────────────────
    { sourceKey: 'purchases.default',     sourceLabel: 'Default purchases account', sourceDescription: 'Used when a bill line has no MW category override', required: true, xeroAccountCode: '310', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','EXPENSE','OVERHEADS','INVENTORY'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.materials',   sourceLabel: 'Raw materials',             sourceDescription: 'Steel/aluminium/stainless stock', required: true,  xeroAccountCode: '310', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','INVENTORY'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.labour',      sourceLabel: 'Direct labour',             sourceDescription: 'Production labour costed to jobs', required: false, xeroAccountCode: '320', xeroTaxType: 'BASEXCLUDED', accountFilter: { types: ['DIRECTCOSTS','WAGESEXPENSE'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.subcontract', sourceLabel: 'Subcontractors',            sourceDescription: 'Outsourced cutting, finishing, install', required: false, xeroAccountCode: '330', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','EXPENSE'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.consumables', sourceLabel: 'Consumables',               sourceDescription: 'Welding wire, gas, abrasives', required: false, xeroAccountCode: '340', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','EXPENSE'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.tooling',     sourceLabel: 'Tooling',                   sourceDescription: 'Inserts, taps, dies (expensed)', required: false, xeroAccountCode: '350', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','EXPENSE'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.freight-in',  sourceLabel: 'Freight inwards',           sourceDescription: 'Carriage paid on materials in', required: false, xeroAccountCode: '360', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','OVERHEADS'] }, taxDirection: 'purchases' },
    { sourceKey: 'purchases.equipment',   sourceLabel: 'Equipment hire',            sourceDescription: 'Forklifts, cranes, scaffold', required: false, xeroAccountCode: '370', xeroTaxType: 'INPUT', accountFilter: { types: ['DIRECTCOSTS','OVERHEADS'] }, taxDirection: 'purchases' },

    // ── Bank & System (some are locked) ────────────────────────────
    { sourceKey: 'bank.receipts',  sourceLabel: 'Default bank for receipts',  sourceDescription: 'Where customer payments land', required: true,  xeroAccountCode: '610', accountFilter: { types: ['BANK'], paymentsEnabled: true } },
    { sourceKey: 'bank.payments',  sourceLabel: 'Default bank for payments out', sourceDescription: 'Used when MW pays a bill', required: true, xeroAccountCode: '610', accountFilter: { types: ['BANK'], paymentsEnabled: true } },
    { sourceKey: 'bank.fees',      sourceLabel: 'Bank fees',                  sourceDescription: 'Account / transaction fees', required: false, xeroAccountCode: '404', xeroTaxType: 'EXEMPTEXPENSES', accountFilter: { types: ['OVERHEADS','EXPENSE'] } },
    { sourceKey: 'bank.merchant',  sourceLabel: 'Merchant fees',              sourceDescription: 'Card processor / Stripe / Square fees', required: false, xeroAccountCode: '405', xeroTaxType: 'INPUT', accountFilter: { types: ['OVERHEADS','EXPENSE'] } },
    { sourceKey: 'system.ar',      sourceLabel: 'Accounts Receivable',        sourceDescription: 'Managed by Xero (DEBTORS)', required: true, system: true, xeroAccountCode: '610-AR' },
    { sourceKey: 'system.ap',      sourceLabel: 'Accounts Payable',           sourceDescription: 'Managed by Xero (CREDITORS)', required: true, system: true, xeroAccountCode: '800' },
    { sourceKey: 'system.gst',     sourceLabel: 'GST payable',                sourceDescription: 'Managed by Xero', required: true, system: true, xeroAccountCode: '820' },
    { sourceKey: 'system.rounding',sourceLabel: 'Rounding',                   sourceDescription: 'Managed by Xero', required: false, system: true, xeroAccountCode: '961' },
    { sourceKey: 'system.retained',sourceLabel: 'Retained earnings',          sourceDescription: 'Managed by Xero', required: false, system: true, xeroAccountCode: '960' },

    // ── Tax codes ──────────────────────────────────────────────────
    { sourceKey: 'tax.gst10.sales',    sourceLabel: 'GST 10% (sales)',       sourceDescription: 'Standard taxable sales',     required: true,  xeroAccountCode: '',  xeroTaxType: 'OUTPUT',         taxDirection: 'sales' },
    { sourceKey: 'tax.gst10.purch',    sourceLabel: 'GST 10% (purchases)',   sourceDescription: 'Standard input-taxed bills', required: true,  xeroAccountCode: '',  xeroTaxType: 'INPUT',          taxDirection: 'purchases' },
    { sourceKey: 'tax.free.sales',     sourceLabel: 'GST Free (sales)',      sourceDescription: 'Exports, GST-free supplies', required: false, xeroAccountCode: '',  xeroTaxType: 'EXEMPTOUTPUT',   taxDirection: 'sales' },
    { sourceKey: 'tax.free.purch',     sourceLabel: 'GST Free (purchases)',  sourceDescription: 'GST-free inputs',            required: false, xeroAccountCode: '',  xeroTaxType: 'EXEMPTEXPENSES', taxDirection: 'purchases' },
    { sourceKey: 'tax.imports',        sourceLabel: 'Import GST',            sourceDescription: 'Customs / DAP imports',      required: false, xeroAccountCode: '',  xeroTaxType: 'GSTONIMPORTS',   taxDirection: 'purchases' },
    { sourceKey: 'tax.capital',        sourceLabel: 'Capital acquisition GST', sourceDescription: 'GST on plant & equipment', required: false, xeroAccountCode: '',  xeroTaxType: 'CAPITALEXINPUT', taxDirection: 'purchases' },
    { sourceKey: 'tax.excluded',       sourceLabel: 'BAS Excluded',          sourceDescription: 'Wages, super, drawings',     required: false, xeroAccountCode: '',  xeroTaxType: 'BASEXCLUDED' },
  ],
  tracking: [
    { sourceKey: 'mw.job',        sourceLabel: 'MW Job / Project',  sourceDescription: 'MirrorWorks job code (e.g. JOB-1041)', xeroTrackingCategoryId: 'tc-jobs', autoCreateMissingOptions: true },
    { sourceKey: 'mw.department', sourceLabel: 'MW Department',     sourceDescription: 'Functional cost centre',               xeroTrackingCategoryId: 'tc-dept', autoCreateMissingOptions: false },
  ],
  branding: {
    invoiceBrandingThemeId: 'bt-modern',
    creditNoteBrandingThemeId: 'bt-credit',
    defaultInvoiceStatus: 'AUTHORISED',
    defaultDueDateOffsetDays: 30,
    referenceTemplate: 'MW-{invoiceNumber}',
  },
};
