/**
 * Xero Configure Mapping page.
 *
 * Lets the user wire MirrorWorks categories to Xero accounts, tax rates,
 * tracking categories, and branding themes. Implementations of the data
 * fetches live in `xeroService` and are mock-backed today.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Download,
  MoreHorizontal,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/layout/PageHeader';

import {
  getAccounts,
  getBrandingThemes,
  getMappingConfig,
  getOrganisation,
  getTaxRates,
  getTrackingCategories,
  pullLatest,
  saveMappingConfig,
  suggestAccountMappings,
  type AutoMapSuggestion,
} from '@/services/xeroService';
import { mockXeroMappingConfig } from '@/services/mock/xero';
import type {
  BrandingDefaults,
  MappingEntry,
  MappingSectionId,
  SectionStatus,
  TrackingMappingEntry,
  XeroAccount,
  XeroBrandingTheme,
  XeroMappingConfig,
  XeroOrganisation,
  XeroTaxRate,
  XeroTrackingCategory,
} from '@/types/xero';

import { MappingSidebar, type MappingSidebarItem } from './MappingSidebar';
import { MappingFooter } from './MappingFooter';
import { AutoMapDialog } from './AutoMapDialog';
import { SalesSection } from './sections/SalesSection';
import { PurchasesSection } from './sections/PurchasesSection';
import { BankSystemSection } from './sections/BankSystemSection';
import { TaxesSection } from './sections/TaxesSection';
import { TrackingSection } from './sections/TrackingSection';
import { BrandingSection } from './sections/BrandingSection';

const SIDEBAR_ITEMS: MappingSidebarItem[] = [
  { id: 'sales',       label: 'Sales' },
  { id: 'purchases',   label: 'Purchases & costs' },
  { id: 'bank-system', label: 'Bank & system' },
  { id: 'taxes',       label: 'Tax codes' },
  { id: 'tracking',    label: 'Tracking' },
  { id: 'branding',    label: 'Branding & defaults' },
];

function entrySectionId(e: MappingEntry): MappingSectionId {
  if (e.sourceKey.startsWith('sales.')) return 'sales';
  if (e.sourceKey.startsWith('purchases.')) return 'purchases';
  if (e.sourceKey.startsWith('bank.') || e.sourceKey.startsWith('system.'))
    return 'bank-system';
  if (e.sourceKey.startsWith('tax.')) return 'taxes';
  return 'sales';
}

function entryIsMapped(e: MappingEntry): boolean {
  // Tax-only rows are "mapped" when they have a tax type.
  if (e.sourceKey.startsWith('tax.')) return (e.xeroTaxType ?? '') !== '';
  return e.xeroAccountCode !== '';
}

function entryIsRequired(e: MappingEntry): boolean {
  if (e.system) return false; // system rows are managed by Xero
  return e.required;
}

function diffEntry(a: MappingEntry, b: MappingEntry): string[] {
  const fields: string[] = [];
  if (a.xeroAccountCode !== b.xeroAccountCode) fields.push('xeroAccountCode');
  if ((a.xeroTaxType ?? '') !== (b.xeroTaxType ?? '')) fields.push('xeroTaxType');
  return fields;
}

function diffTracking(
  a: TrackingMappingEntry,
  b: TrackingMappingEntry,
): string[] {
  const f: string[] = [];
  if (a.xeroTrackingCategoryId !== b.xeroTrackingCategoryId)
    f.push('xeroTrackingCategoryId');
  if (a.autoCreateMissingOptions !== b.autoCreateMissingOptions)
    f.push('autoCreateMissingOptions');
  return f;
}

function diffBranding(a: BrandingDefaults, b: BrandingDefaults): string[] {
  return (Object.keys(a) as (keyof BrandingDefaults)[]).filter(
    (k) => a[k] !== b[k],
  );
}

export function XeroMappingPage() {
  const navigate = useNavigate();

  const [organisation, setOrganisation] = useState<XeroOrganisation | null>(null);
  const [accounts, setAccounts] = useState<XeroAccount[]>([]);
  const [taxRates, setTaxRates] = useState<XeroTaxRate[]>([]);
  const [tracking, setTracking] = useState<XeroTrackingCategory[]>([]);
  const [brandingThemes, setBrandingThemes] = useState<XeroBrandingTheme[]>([]);
  const [savedConfig, setSavedConfig] = useState<XeroMappingConfig | null>(null);
  const [draftConfig, setDraftConfig] = useState<XeroMappingConfig | null>(null);
  const [activeSection, setActiveSection] = useState<MappingSectionId>('sales');
  const [autoMapOpen, setAutoMapOpen] = useState(false);
  const [autoMapSuggestions, setAutoMapSuggestions] = useState<AutoMapSuggestion[]>([]);
  const [resetOpen, setResetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Initial load ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getOrganisation(),
      getAccounts(),
      getTaxRates(),
      getTrackingCategories(),
      getBrandingThemes(),
      getMappingConfig(),
    ])
      .then(([org, accs, taxes, trk, brand, cfg]) => {
        if (cancelled) return;
        setOrganisation(org);
        setAccounts(accs);
        setTaxRates(taxes);
        setTracking(trk);
        setBrandingThemes(brand);
        setSavedConfig(cfg);
        setDraftConfig(cfg);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('Could not load Xero data');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Diff (drives the sticky footer) ────────────────────────────────
  const diffCount = useMemo(() => {
    if (!savedConfig || !draftConfig) return 0;
    let count = 0;
    for (const draft of draftConfig.entries) {
      const saved = savedConfig.entries.find((e) => e.sourceKey === draft.sourceKey);
      if (!saved) continue;
      count += diffEntry(saved, draft).length;
    }
    for (const draft of draftConfig.tracking) {
      const saved = savedConfig.tracking.find((e) => e.sourceKey === draft.sourceKey);
      if (!saved) continue;
      count += diffTracking(saved, draft).length;
    }
    count += diffBranding(savedConfig.branding, draftConfig.branding).length;
    return count;
  }, [savedConfig, draftConfig]);

  // ── Section status (drives sidebar dots + header banner) ──────────
  const sectionStatus = useMemo<Record<MappingSectionId, SectionStatus>>(() => {
    const empty: SectionStatus = { total: 0, mapped: 0, required: 0, requiredUnmapped: 0 };
    const acc: Record<MappingSectionId, SectionStatus> = {
      sales: { ...empty },
      purchases: { ...empty },
      'bank-system': { ...empty },
      taxes: { ...empty },
      tracking: { ...empty },
      branding: { ...empty },
    };
    if (!draftConfig) return acc;
    for (const e of draftConfig.entries) {
      const id = entrySectionId(e);
      acc[id].total += 1;
      if (entryIsMapped(e)) acc[id].mapped += 1;
      if (entryIsRequired(e)) {
        acc[id].required += 1;
        if (!entryIsMapped(e)) acc[id].requiredUnmapped += 1;
      }
    }
    for (const t of draftConfig.tracking) {
      acc.tracking.total += 1;
      if (t.xeroTrackingCategoryId !== '') acc.tracking.mapped += 1;
    }
    // Branding defaults always have a value, so the section is "complete"
    // once a branding theme is chosen. Track at coarse granularity.
    acc.branding.total = 5;
    acc.branding.mapped =
      (draftConfig.branding.invoiceBrandingThemeId ? 1 : 0) +
      (draftConfig.branding.creditNoteBrandingThemeId ? 1 : 0) +
      (draftConfig.branding.defaultInvoiceStatus ? 1 : 0) +
      (draftConfig.branding.defaultDueDateOffsetDays >= 0 ? 1 : 0) +
      (draftConfig.branding.referenceTemplate ? 1 : 0);
    return acc;
  }, [draftConfig]);

  const totals = useMemo(() => {
    return Object.values(sectionStatus).reduce(
      (acc, s) => ({
        total: acc.total + s.total,
        mapped: acc.mapped + s.mapped,
        requiredUnmapped: acc.requiredUnmapped + s.requiredUnmapped,
      }),
      { total: 0, mapped: 0, requiredUnmapped: 0 },
    );
  }, [sectionStatus]);

  const progressPct = totals.total === 0 ? 0 : Math.round((totals.mapped / totals.total) * 100);

  // ── Mutators ───────────────────────────────────────────────────────
  const onChangeEntry = useCallback((next: MappingEntry) => {
    setDraftConfig((cfg) =>
      cfg
        ? {
            ...cfg,
            entries: cfg.entries.map((e) =>
              e.sourceKey === next.sourceKey ? next : e,
            ),
          }
        : cfg,
    );
  }, []);

  const onChangeTracking = useCallback((next: TrackingMappingEntry) => {
    setDraftConfig((cfg) =>
      cfg
        ? {
            ...cfg,
            tracking: cfg.tracking.map((t) =>
              t.sourceKey === next.sourceKey ? next : t,
            ),
          }
        : cfg,
    );
  }, []);

  const onChangeBranding = useCallback((next: BrandingDefaults) => {
    setDraftConfig((cfg) => (cfg ? { ...cfg, branding: next } : cfg));
  }, []);

  const onDiscard = useCallback(() => {
    if (savedConfig) setDraftConfig(savedConfig);
  }, [savedConfig]);

  const onSave = useCallback(async () => {
    if (!draftConfig) return;
    setSaving(true);
    try {
      const fresh = await saveMappingConfig(draftConfig);
      setSavedConfig(fresh);
      setDraftConfig(fresh);
      toast.success('Mapping saved');
    } catch {
      toast.error('Could not save mapping');
    } finally {
      setSaving(false);
    }
  }, [draftConfig]);

  const onPullLatest = useCallback(async () => {
    setPulling(true);
    try {
      const result = await pullLatest();
      // Refresh dropdowns from the (mock) source.
      const [accs, taxes, trk, brand] = await Promise.all([
        getAccounts(),
        getTaxRates(),
        getTrackingCategories(),
        getBrandingThemes(),
      ]);
      setAccounts(accs);
      setTaxRates(taxes);
      setTracking(trk);
      setBrandingThemes(brand);
      toast.success(
        `Pulled ${result.accounts} accounts, ${result.taxRates} tax rates, ${result.trackingCategories} tracking, ${result.brandingThemes} themes`,
      );
    } catch {
      toast.error('Could not pull from Xero');
    } finally {
      setPulling(false);
    }
  }, []);

  const onAutoMap = useCallback(() => {
    if (!draftConfig) return;
    const unmapped = draftConfig.entries
      .filter(
        (e) =>
          !e.system &&
          e.xeroAccountCode === '' &&
          !e.sourceKey.startsWith('tax.'),
      )
      .map(({ sourceKey, sourceLabel }) => ({ sourceKey, sourceLabel }));
    setAutoMapSuggestions(suggestAccountMappings(unmapped, accounts));
    setAutoMapOpen(true);
  }, [draftConfig, accounts]);

  const onApplyAutoMap = useCallback((selected: AutoMapSuggestion[]) => {
    if (selected.length === 0) return;
    const map = new Map(selected.map((s) => [s.sourceKey, s.suggestedCode]));
    setDraftConfig((cfg) =>
      cfg
        ? {
            ...cfg,
            entries: cfg.entries.map((e) =>
              map.has(e.sourceKey)
                ? { ...e, xeroAccountCode: map.get(e.sourceKey)! }
                : e,
            ),
          }
        : cfg,
    );
    toast.success(`Applied ${selected.length} suggestion${selected.length === 1 ? '' : 's'}`);
  }, []);

  const onResetAll = useCallback(() => {
    setDraftConfig(JSON.parse(JSON.stringify(mockXeroMappingConfig)));
    toast.success('Reset to factory defaults');
  }, []);

  const onExport = useCallback(() => {
    if (!draftConfig) return;
    toast.success('Mapping exported (CSV)');
  }, [draftConfig]);

  // ── Render ─────────────────────────────────────────────────────────
  if (loading || !draftConfig) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Loading Xero mapping…
        </Card>
      </div>
    );
  }

  // Disconnected fallback. The XeroIntegration tab in BookSettings is the
  // source of truth; in this mock build we treat absence of an org as
  // disconnected. A real backend would surface a `connected` flag here.
  if (!organisation) {
    return (
      <div className="p-6 max-w-[800px] mx-auto">
        <Card className="p-12 text-center">
          <AlertTriangle className="mx-auto mb-3 size-8 text-[var(--mw-warning)]" />
          <h2 className="text-base font-medium text-foreground">Xero is not connected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your Xero organisation before configuring mapping.
          </p>
          <Button
            className="mt-4 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={() => navigate('/book/settings')}
          >
            Back to Xero Integration
          </Button>
        </Card>
      </div>
    );
  }

  // Filter entries by section
  const salesEntries = draftConfig.entries.filter((e) => entrySectionId(e) === 'sales');
  const purchaseEntries = draftConfig.entries.filter((e) => entrySectionId(e) === 'purchases');
  const bankSystemEntries = draftConfig.entries.filter((e) => entrySectionId(e) === 'bank-system');
  const taxEntries = draftConfig.entries.filter((e) => entrySectionId(e) === 'taxes');
  const defaults = mockXeroMappingConfig.entries;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 pb-24">
      <PageHeader
        title="Configure account mapping"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>Map MirrorWorks categories to Xero account codes</span>
            <Badge variant="secondary" className="rounded-full text-[11px]">
              {organisation.Name}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[11px]">
              {organisation.CountryCode} · {organisation.BaseCurrency}
            </Badge>
            <span className="text-xs text-muted-foreground">
              · Last edited {new Date(draftConfig.updatedAt).toLocaleString()}
            </span>
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
              onClick={onPullLatest}
              disabled={pulling}
            >
              <RefreshCcw className={pulling ? 'size-4 animate-spin' : 'size-4'} />
              {pulling ? 'Pulling…' : 'Pull latest from Xero'}
            </Button>
          </>
        }
      />

      {/* Status banner */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Progress value={progressPct} className="h-2 max-w-[260px] flex-1" />
          <span className="text-sm tabular-nums">
            <span className="font-semibold">{totals.mapped}</span>
            <span className="text-muted-foreground">{` of ${totals.total} mapped`}</span>
          </span>
          {totals.requiredUnmapped > 0 && (
            <Badge className="gap-1 rounded-full bg-[var(--mw-error)]/10 text-[var(--mw-error)] border border-[var(--mw-error)]/30">
              <AlertTriangle className="size-3" />
              {totals.requiredUnmapped} required unmapped
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            onClick={onAutoMap}
          >
            <Sparkles className="size-4" />
            Auto-map by name
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-full p-0"
                aria-label="More actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onExport}>
                <Download className="mr-2 size-4" /> Export mapping (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Upload className="mr-2 size-4" /> Import mapping
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setResetOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <RotateCcw className="mr-2 size-4" /> Reset all to defaults
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
            <AlertDialogContent className="rounded-[var(--shape-lg)]">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all mappings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This replaces every mapping with the MirrorWorks factory
                  defaults. Your unsaved changes will also be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onResetAll}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Reset all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      <div className="flex flex-col gap-6 lg:flex-row">
        <MappingSidebar
          items={SIDEBAR_ITEMS}
          activeId={activeSection}
          onSelect={setActiveSection}
          status={sectionStatus}
        />
        <div className="min-w-0 flex-1 space-y-6">
          {activeSection === 'sales' && (
            <SalesSection
              entries={salesEntries}
              defaults={defaults}
              accounts={accounts}
              taxRates={taxRates}
              onChangeEntry={onChangeEntry}
              allMapped={sectionStatus.sales.requiredUnmapped === 0 && sectionStatus.sales.mapped === sectionStatus.sales.total}
            />
          )}
          {activeSection === 'purchases' && (
            <PurchasesSection
              entries={purchaseEntries}
              defaults={defaults}
              accounts={accounts}
              taxRates={taxRates}
              onChangeEntry={onChangeEntry}
              allMapped={sectionStatus.purchases.requiredUnmapped === 0 && sectionStatus.purchases.mapped === sectionStatus.purchases.total}
            />
          )}
          {activeSection === 'bank-system' && (
            <BankSystemSection
              entries={bankSystemEntries}
              defaults={defaults}
              accounts={accounts}
              taxRates={taxRates}
              onChangeEntry={onChangeEntry}
              allMapped={sectionStatus['bank-system'].requiredUnmapped === 0}
            />
          )}
          {activeSection === 'taxes' && (
            <TaxesSection
              entries={taxEntries}
              defaults={defaults}
              accounts={accounts}
              taxRates={taxRates}
              onChangeEntry={onChangeEntry}
              allMapped={sectionStatus.taxes.requiredUnmapped === 0 && sectionStatus.taxes.mapped === sectionStatus.taxes.total}
            />
          )}
          {activeSection === 'tracking' && (
            <TrackingSection
              entries={draftConfig.tracking}
              trackingCategories={tracking}
              onChange={onChangeTracking}
            />
          )}
          {activeSection === 'branding' && (
            <BrandingSection
              defaults={draftConfig.branding}
              brandingThemes={brandingThemes}
              onChange={onChangeBranding}
            />
          )}
        </div>
      </div>

      <MappingFooter
        diffCount={diffCount}
        saving={saving}
        blockedReason={
          totals.requiredUnmapped > 0
            ? `${totals.requiredUnmapped} required mapping${totals.requiredUnmapped === 1 ? '' : 's'} missing`
            : undefined
        }
        onDiscard={onDiscard}
        onSave={onSave}
      />

      <AutoMapDialog
        open={autoMapOpen}
        onOpenChange={setAutoMapOpen}
        suggestions={autoMapSuggestions}
        onApply={onApplyAutoMap}
      />
    </div>
  );
}
