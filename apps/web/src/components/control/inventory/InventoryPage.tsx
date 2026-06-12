/**
 * Inventory — canonical stock ledger at /control/inventory.
 *
 * ONE page, cross-linked from Plan (?kind=raw), Make (?kind=wip) and
 * Ship (?kind=finished) sidebars; Control owns it. Tabs: Ledger /
 * Movements / Sheet Stock / Locations. Mutating actions (Scrap /
 * Adjustment / Transfer / Stocktake / Import) live in the header and
 * are deep-linkable via ?action=.
 *
 * The Storage Locations setting gates the location dimension across
 * the whole page — see docs/dev/shared/workflow.md and the Inventory
 * settings page at /control/inventory-settings.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  AlertTriangle, ArrowLeftRight, ClipboardCheck, DollarSign, Download,
  FileUp, Package, Pencil, Plus, Settings, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { controlService, inventoryService, planService } from '@/services';
import type { LedgerRow, MovementView, ValuationSummary } from '@/services/inventoryService';
import type {
  InventorySettings, Product, SheetStock, StockLocation,
} from '@/types/entities';
import { DataRoundTrip } from '@/components/shared/round-trip/DataRoundTrip';
import { inventoryRoundTripAdapter } from './inventoryRoundTripAdapter';
import { LedgerTab } from './LedgerTab';
import { MovementsTab } from './MovementsTab';
import { SheetStockTab } from './SheetStockTab';
import { LocationsTab } from './LocationsTab';
import { ScrapDialog } from './dialogs/ScrapDialog';
import { AdjustmentDialog } from './dialogs/AdjustmentDialog';
import { TransferDialog } from './dialogs/TransferDialog';
import { StocktakeWizard } from './dialogs/StocktakeWizard';
import { ImportStockDialog } from './dialogs/ImportStockDialog';

type TabKey = 'ledger' | 'movements' | 'sheets' | 'locations';
type ActionKey = 'scrap' | 'adjust' | 'transfer' | 'stocktake' | 'import';

const VALID_TABS: TabKey[] = ['ledger', 'movements', 'sheets', 'locations'];
const VALID_KINDS = ['raw', 'wip', 'finished', 'subcontract'];
const VALID_ACTIONS: ActionKey[] = ['scrap', 'adjust', 'transfer', 'stocktake', 'import'];

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function KpiCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-card border border-[var(--neutral-200)] dark:border-[var(--border)] rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[var(--neutral-500)]">{label}</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
          {subtext && <p className="text-xs text-[var(--neutral-500)]">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export function InventoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Data ──
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [movements, setMovements] = useState<MovementView[]>([]);
  const [sheets, setSheets] = useState<SheetStock[]>([]);
  const [valuation, setValuation] = useState<ValuationSummary | null>(null);

  // ── URL-synced state ──
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = VALID_TABS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'ledger';
  const kindParam = searchParams.get('kind') ?? '';
  const [kind, setKind] = useState(VALID_KINDS.includes(kindParam) ? kindParam : 'all');
  const [locationId, setLocationId] = useState(searchParams.get('location') ?? '');
  const [productId, setProductId] = useState(searchParams.get('product') ?? '');
  const [reason, setReason] = useState(searchParams.get('reason') ?? '');
  const [search, setSearch] = useState('');
  const [movementSearch, setMovementSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [datePreset, setDatePreset] = useState('all');

  // ── Dialogs ──
  const [openDialog, setOpenDialog] = useState<ActionKey | null>(null);

  const refresh = useCallback(async () => {
    const [nextSettings, nextLocations, nextValuation] = await Promise.all([
      inventoryService.getSettings(),
      inventoryService.listLocations({ includeVirtual: true }),
      inventoryService.getValuationSummary(),
    ]);
    setSettings(nextSettings);
    setLocations(nextLocations);
    setValuation(nextValuation);
    setLedger(await inventoryService.listLedger());
    setMovements(await inventoryService.listMovements());
  }, []);

  useEffect(() => {
    refresh();
    controlService.getProducts().then(setProducts);
    planService.getSheetStocks().then(setSheets);
  }, [refresh]);

  // ?action= deep link — open the matching dialog once on load.
  useEffect(() => {
    const action = searchParams.get('action') as ActionKey | null;
    if (action && VALID_ACTIONS.includes(action)) {
      setOpenDialog(action);
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const updateParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleTabChange = (value: string) => updateParam('tab', value === 'ledger' ? '' : value);
  const handleKindChange = (value: string) => { setKind(value); updateParam('kind', value); };
  const handleLocationChange = (value: string) => { setLocationId(value); updateParam('location', value); };
  const handleProductChange = (value: string) => { setProductId(value); updateParam('product', value); };
  const handleReasonChange = (value: string) => { setReason(value); updateParam('reason', value); };

  // ── Derived rows ──
  const filteredLedger = useMemo(() => {
    let rows = ledger;
    if (kind !== 'all') {
      rows = settings?.storageLocationsEnabled
        ? rows.filter((r) => r.location?.kind === kind)
        : rows.filter((r) =>
            kind === 'finished' ? r.product.isManufactured : kind === 'raw' ? !r.product.isManufactured : false,
          );
    }
    if (locationId) rows = rows.filter((r) => r.location?.id === locationId);
    if (lowOnly) rows = rows.filter((r) => r.reorderState !== 'ok');
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.product.description.toLowerCase().includes(q) ||
          (r.product.sku ?? r.product.partNumber).toLowerCase().includes(q),
      );
    }
    return rows;
  }, [ledger, kind, locationId, lowOnly, search, settings?.storageLocationsEnabled]);

  const filteredMovements = useMemo(() => {
    let rows = movements;
    if (reason) rows = rows.filter((m) => m.reason === reason);
    if (productId) rows = rows.filter((m) => m.productId === productId);
    if (locationId) {
      rows = rows.filter((m) => m.fromLocationId === locationId || m.toLocationId === locationId);
    }
    if (datePreset !== 'all') {
      const cutoff = new Date(Date.now() - Number(datePreset) * 24 * 60 * 60 * 1000).toISOString();
      rows = rows.filter((m) => m.at >= cutoff);
    }
    return rows;
  }, [movements, reason, productId, locationId, datePreset]);

  const handleExport = async () => {
    const csv = await inventoryService.exportLedgerCsv(
      kind !== 'all' ? { kind: kind as StockLocation['kind'] } : {},
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'inventory-ledger.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Ledger exported');
  };

  if (!settings) {
    return <PageShell className="p-6">{null}</PageShell>;
  }

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Inventory"
        subtitle={
          valuation
            ? `${valuation.skuCount} SKUs` +
              (valuation.lowCount > 0 ? ` · ${valuation.lowCount} low stock` : '') +
              (valuation.outCount > 0 ? ` · ${valuation.outCount} out of stock` : '')
            : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 min-h-[48px] border-[var(--border)]"
              title="Inventory settings"
              onClick={() => navigate('/control/inventory-settings')}
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 min-h-[48px] border-[var(--border)] gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 shrink-0" strokeWidth={1.5} /> Export
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 min-h-[48px] border-[var(--border)] gap-2"
              onClick={() => setOpenDialog('import')}
            >
              <FileUp className="w-4 h-4 shrink-0" strokeWidth={1.5} /> Import stock
            </Button>
            <DataRoundTrip adapter={inventoryRoundTripAdapter} onApplied={refresh} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" /> New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpenDialog('adjust')}>
                  <Pencil className="w-4 h-4" /> Adjustment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDialog('scrap')}>
                  <Trash2 className="w-4 h-4" /> Scrap
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpenDialog('transfer')}
                  disabled={!settings.storageLocationsEnabled}
                  title={settings.storageLocationsEnabled ? undefined : 'Enable Storage Locations in Inventory settings'}
                >
                  <ArrowLeftRight className="w-4 h-4" /> Transfer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDialog('stocktake')}>
                  <ClipboardCheck className="w-4 h-4" /> Stocktake
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* KPI row */}
      {valuation && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiCard
            icon={DollarSign}
            label="Total stock value"
            value={formatCurrency(valuation.totalValue)}
            subtext={`${valuation.skuCount} SKUs`}
            color="var(--mw-yellow-400)"
          />
          <KpiCard
            icon={Package}
            label="Raw materials"
            value={formatCurrency(valuation.byKind.raw)}
            subtext={`WIP ${formatCurrency(valuation.byKind.wip)}`}
            color="var(--mw-info)"
          />
          <KpiCard
            icon={Package}
            label="Finished goods"
            value={formatCurrency(valuation.byKind.finished)}
            subtext={`Subcontract ${formatCurrency(valuation.byKind.subcontract)}`}
            color="var(--mw-success)"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Needs attention"
            value={String(valuation.lowCount + valuation.outCount)}
            subtext={`${valuation.lowCount} low · ${valuation.outCount} out`}
            color="var(--mw-error)"
          />
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="sheets">Sheet Stock</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <LedgerTab
            rows={filteredLedger}
            locations={locations}
            settings={settings}
            search={search}
            onSearchChange={setSearch}
            kind={kind}
            onKindChange={handleKindChange}
            locationId={locationId}
            onLocationChange={handleLocationChange}
            lowOnly={lowOnly}
            onLowOnlyChange={setLowOnly}
          />
        </TabsContent>

        <TabsContent value="movements">
          <MovementsTab
            movements={filteredMovements}
            products={products}
            locations={locations}
            settings={settings}
            search={movementSearch}
            onSearchChange={setMovementSearch}
            reason={reason}
            onReasonChange={handleReasonChange}
            productId={productId}
            onProductChange={handleProductChange}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
          />
        </TabsContent>

        <TabsContent value="sheets">
          <SheetStockTab sheets={sheets} />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsTab
            locations={locations}
            ledger={ledger}
            settings={settings}
            onDone={refresh}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ScrapDialog
        open={openDialog === 'scrap'}
        onOpenChange={(o) => setOpenDialog(o ? 'scrap' : null)}
        products={products}
        locations={locations}
        settings={settings}
        onDone={refresh}
      />
      <AdjustmentDialog
        open={openDialog === 'adjust'}
        onOpenChange={(o) => setOpenDialog(o ? 'adjust' : null)}
        products={products}
        locations={locations}
        settings={settings}
        onDone={refresh}
      />
      <TransferDialog
        open={openDialog === 'transfer'}
        onOpenChange={(o) => setOpenDialog(o ? 'transfer' : null)}
        products={products}
        locations={locations}
        onDone={refresh}
      />
      <StocktakeWizard
        open={openDialog === 'stocktake'}
        onOpenChange={(o) => setOpenDialog(o ? 'stocktake' : null)}
        locations={locations}
        settings={settings}
        onDone={refresh}
      />
      <ImportStockDialog
        open={openDialog === 'import'}
        onOpenChange={(o) => setOpenDialog(o ? 'import' : null)}
        products={products}
        locations={locations}
        settings={settings}
        onDone={refresh}
      />
    </PageShell>
  );
}
