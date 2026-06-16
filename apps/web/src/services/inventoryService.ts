/**
 * Inventory service — canonical stock ledger for /control/inventory.
 *
 * Operates on the SAME mutable mock arrays as `workflowService`
 * (`mock.inventoryRecords`, `mock.stockLocations`, `mock.stockMovements`)
 * so floor / workflow movements surface in the Movements ledger and
 * vice-versa. Each mutation upserts an InventoryRecord and pushes a
 * StockMovement, wrapped in `delay()` to mimic Convex latency.
 *
 * Settings persist to localStorage (`mw.inventory.settings`) because the
 * Storage Locations toggle reshapes the whole UI and must survive reload;
 * stock state itself is in-memory mock and resets like everything else.
 */
import * as mock from './mock';
import type {
  InventoryRecord,
  InventorySettings,
  Product,
  StockLocation,
  StockMovement,
} from '@/types/entities';

const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const SETTINGS_STORAGE_KEY = 'mw.inventory.settings';

export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
  storageLocationsEnabled: true,
  defaultReceivingLocationId: 'loc-recv',
  defaultFinishedLocationId: 'loc-fg',
  scrapLocationId: 'loc-scrap',
  allowNegativeStock: false,
  scrapReasonCodes: ['Damaged', 'QC reject', 'Offcut', 'Obsolete'],
  adjustmentReasonCodes: ['Count error', 'Found stock', 'Data entry fix'],
  stocktakeDay: { day: 30, month: 6 },
  countCadence: 'quarterly',
  costingMethod: 'standard',
  lotsSerialsEnabled: false,
  packagesEnabled: false,
  putawayRulesEnabled: false,
  multiStepRoutesEnabled: false,
  barcodeEnabled: false,
  landedCostsEnabled: false,
};

function readSettings(): InventorySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INVENTORY_SETTINGS };
    return { ...DEFAULT_INVENTORY_SETTINGS, ...(JSON.parse(raw) as Partial<InventorySettings>) };
  } catch {
    return { ...DEFAULT_INVENTORY_SETTINGS };
  }
}

function writeSettings(settings: InventorySettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private-mode storage failures are non-fatal — settings revert on reload.
  }
}

// ── Lookups ─────────────────────────────────────────────────────────

const findProduct = (productId: string): Product | undefined =>
  mock.products.find((p) => p.id === productId);

const findLocation = (locationId: string): StockLocation | undefined =>
  mock.stockLocations.find((l) => l.id === locationId);

/** Display-only standard cost; falls back to 60% of sell price. */
export const unitCostOf = (product: Product | undefined): number =>
  product ? (product.standardCost ?? Math.round(product.unitPrice * 0.6 * 100) / 100) : 0;

const skuOf = (product: Product | undefined): string =>
  product?.sku ?? product?.partNumber ?? '';

function findOrCreateRecord(productId: string, locationId: string): InventoryRecord {
  let rec = mock.inventoryRecords.find(
    (r) => r.productId === productId && r.locationId === locationId,
  );
  if (!rec) {
    rec = { id: newId('inv'), productId, locationId, qtyOnHand: 0, qtyReserved: 0 };
    mock.inventoryRecords.push(rec);
  }
  return rec;
}

function pushMovement(movement: Omit<StockMovement, 'id' | 'at'>): StockMovement {
  const full: StockMovement = { ...movement, id: newId('sm'), at: new Date().toISOString() };
  mock.stockMovements.push(full);
  return full;
}

function assertStockAvailable(
  settings: InventorySettings,
  rec: InventoryRecord,
  qty: number,
  action: string,
): void {
  if (!settings.allowNegativeStock && rec.qtyOnHand - qty < 0) {
    const product = findProduct(rec.productId);
    const location = findLocation(rec.locationId);
    throw new Error(
      `Insufficient stock to ${action} ${qty} × ${skuOf(product)} at ${location?.code ?? rec.locationId} ` +
        `(${rec.qtyOnHand} on hand). Enable negative stock in Inventory settings to override.`,
    );
  }
}

/** Resolve the implicit location when storage locations are disabled. */
function resolveLocationId(settings: InventorySettings, locationId?: string): string {
  if (locationId) return locationId;
  return settings.storageLocationsEnabled
    ? settings.defaultReceivingLocationId
    : settings.defaultFinishedLocationId;
}

// ── View types ──────────────────────────────────────────────────────

export interface LedgerRow {
  inventoryRecordId: string;
  product: Product;
  /** Undefined when storage locations are disabled (rows aggregate per product). */
  location?: StockLocation;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  unitCost: number;
  value: number;
  reorderState: 'ok' | 'low' | 'out';
}

export interface MovementView extends StockMovement {
  product?: Product;
  fromLocation?: StockLocation;
  toLocation?: StockLocation;
}

export interface ValuationSummary {
  totalValue: number;
  byKind: Record<'raw' | 'wip' | 'finished' | 'subcontract', number>;
  skuCount: number;
  lowCount: number;
  outCount: number;
}

export interface ListLedgerOptions {
  kind?: StockLocation['kind'];
  locationId?: string;
  productId?: string;
  search?: string;
  lowOnly?: boolean;
}

export interface ListMovementsFilter {
  reason?: StockMovement['reason'];
  productId?: string;
  locationId?: string;
  /** ISO date (inclusive lower bound). */
  from?: string;
  /** ISO date (inclusive upper bound). */
  to?: string;
}

function reorderStateFor(productId: string, totalOnHand: number): 'ok' | 'low' | 'out' {
  if (totalOnHand <= 0) return 'out';
  const rule = mock.productReorderRules.find((r) => r.productId === productId && r.enabled);
  if (rule && totalOnHand < rule.reorderPoint) return 'low';
  return 'ok';
}

function buildLedgerRows(settings: InventorySettings): LedgerRow[] {
  // Total on-hand per product drives reorder state regardless of location.
  const totals = new Map<string, number>();
  for (const rec of mock.inventoryRecords) {
    const loc = findLocation(rec.locationId);
    if (loc?.kind === 'scrap') continue; // scrap balances never count toward availability
    totals.set(rec.productId, (totals.get(rec.productId) ?? 0) + rec.qtyOnHand);
  }

  if (!settings.storageLocationsEnabled) {
    // Aggregate per product into a single implicit row.
    const byProduct = new Map<string, { onHand: number; reserved: number; firstId: string }>();
    for (const rec of mock.inventoryRecords) {
      const loc = findLocation(rec.locationId);
      if (loc?.kind === 'scrap') continue;
      const agg = byProduct.get(rec.productId) ?? { onHand: 0, reserved: 0, firstId: rec.id };
      agg.onHand += rec.qtyOnHand;
      agg.reserved += rec.qtyReserved;
      byProduct.set(rec.productId, agg);
    }
    return [...byProduct.entries()].flatMap(([productId, agg]) => {
      const product = findProduct(productId);
      if (!product) return [];
      const unitCost = unitCostOf(product);
      return [{
        inventoryRecordId: agg.firstId,
        product,
        location: undefined,
        qtyOnHand: agg.onHand,
        qtyReserved: agg.reserved,
        qtyAvailable: agg.onHand - agg.reserved,
        unitCost,
        value: agg.onHand * unitCost,
        reorderState: reorderStateFor(productId, totals.get(productId) ?? 0),
      }];
    });
  }

  return mock.inventoryRecords.flatMap((rec) => {
    const product = findProduct(rec.productId);
    const location = findLocation(rec.locationId);
    if (!product || !location || location.kind === 'scrap') return [];
    const unitCost = unitCostOf(product);
    return [{
      inventoryRecordId: rec.id,
      product,
      location,
      qtyOnHand: rec.qtyOnHand,
      qtyReserved: rec.qtyReserved,
      qtyAvailable: rec.qtyOnHand - rec.qtyReserved,
      unitCost,
      value: rec.qtyOnHand * unitCost,
      reorderState: reorderStateFor(rec.productId, totals.get(rec.productId) ?? 0),
    }];
  });
}

// ── Service ─────────────────────────────────────────────────────────

export const inventoryService = {
  // ── Queries ──

  async listLedger(opts: ListLedgerOptions = {}): Promise<LedgerRow[]> {
    await delay();
    const settings = readSettings();
    let rows = buildLedgerRows(settings);
    if (opts.kind) rows = rows.filter((r) => r.location?.kind === opts.kind || (!r.location && opts.kind !== 'wip'));
    if (opts.locationId) rows = rows.filter((r) => r.location?.id === opts.locationId);
    if (opts.productId) rows = rows.filter((r) => r.product.id === opts.productId);
    if (opts.lowOnly) rows = rows.filter((r) => r.reorderState !== 'ok');
    if (opts.search) {
      const q = opts.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.product.description.toLowerCase().includes(q) ||
          skuOf(r.product).toLowerCase().includes(q) ||
          r.product.partNumber.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => skuOf(a.product).localeCompare(skuOf(b.product)));
  },

  async listMovements(filter: ListMovementsFilter = {}): Promise<MovementView[]> {
    await delay();
    let movements = [...mock.stockMovements];
    if (filter.reason) movements = movements.filter((m) => m.reason === filter.reason);
    if (filter.productId) movements = movements.filter((m) => m.productId === filter.productId);
    if (filter.locationId) {
      movements = movements.filter(
        (m) => m.fromLocationId === filter.locationId || m.toLocationId === filter.locationId,
      );
    }
    if (filter.from) movements = movements.filter((m) => m.at >= filter.from!);
    if (filter.to) movements = movements.filter((m) => m.at <= `${filter.to}T23:59:59Z`);
    return movements
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((m) => ({
        ...m,
        product: findProduct(m.productId),
        fromLocation: m.fromLocationId ? findLocation(m.fromLocationId) : undefined,
        toLocation: m.toLocationId ? findLocation(m.toLocationId) : undefined,
      }));
  },

  async listLocations(opts: { includeVirtual?: boolean } = {}): Promise<StockLocation[]> {
    await delay();
    return mock.stockLocations.filter((l) => opts.includeVirtual || l.kind !== 'scrap');
  },

  async getValuationSummary(): Promise<ValuationSummary> {
    await delay();
    const byKind: ValuationSummary['byKind'] = { raw: 0, wip: 0, finished: 0, subcontract: 0 };
    let totalValue = 0;
    for (const rec of mock.inventoryRecords) {
      const location = findLocation(rec.locationId);
      if (!location || location.kind === 'scrap') continue;
      const value = rec.qtyOnHand * unitCostOf(findProduct(rec.productId));
      totalValue += value;
      byKind[location.kind] += value;
    }
    const settings = readSettings();
    const rows = buildLedgerRows(settings);
    const productIds = new Set(rows.map((r) => r.product.id));
    return {
      totalValue,
      byKind,
      skuCount: productIds.size,
      lowCount: rows.filter((r) => r.reorderState === 'low').length,
      outCount: rows.filter((r) => r.reorderState === 'out').length,
    };
  },

  // ── Location CRUD (bins — distinct from facility sites) ──

  async createLocation(input: Omit<StockLocation, 'id'>): Promise<StockLocation> {
    await delay();
    const location: StockLocation = { ...input, id: newId('loc') };
    mock.stockLocations.push(location);
    return location;
  },

  async updateLocation(
    id: string,
    patch: Partial<Omit<StockLocation, 'id'>>,
  ): Promise<StockLocation> {
    await delay();
    const location = findLocation(id);
    if (!location) throw new Error(`Stock location ${id} not found`);
    Object.assign(location, patch);
    return location;
  },

  async deleteLocation(id: string): Promise<void> {
    await delay();
    const index = mock.stockLocations.findIndex((l) => l.id === id);
    if (index === -1) throw new Error(`Stock location ${id} not found`);
    const onHand = mock.inventoryRecords
      .filter((r) => r.locationId === id)
      .reduce((sum, r) => sum + r.qtyOnHand, 0);
    if (onHand > 0) {
      throw new Error(
        `Cannot delete ${mock.stockLocations[index].code} — ${onHand} units on hand. Transfer stock out first.`,
      );
    }
    mock.stockLocations.splice(index, 1);
  },

  // ── Mutations ──

  /** Count correction: set on-hand to `countedQty`; movement records the delta. */
  async adjust(input: {
    productId: string;
    locationId?: string;
    countedQty: number;
    reasonCode: string;
    note?: string;
  }): Promise<MovementView> {
    await delay();
    const settings = readSettings();
    const locationId = resolveLocationId(settings, input.locationId);
    const rec = findOrCreateRecord(input.productId, locationId);
    if (input.countedQty < 0) throw new Error('Counted quantity cannot be negative.');
    const deltaQty = input.countedQty - rec.qtyOnHand;
    rec.qtyOnHand = input.countedQty;
    const movement = pushMovement({
      productId: input.productId,
      ...(deltaQty < 0 ? { fromLocationId: locationId } : { toLocationId: locationId }),
      qty: Math.abs(deltaQty),
      reason: 'adjust',
      reasonCode: input.reasonCode,
      note: input.note,
    });
    return { ...movement, product: findProduct(input.productId), fromLocation: movement.fromLocationId ? findLocation(movement.fromLocationId) : undefined, toLocation: movement.toLocationId ? findLocation(movement.toLocationId) : undefined };
  },

  /** First-class write-off: stock moves to the virtual scrap location. */
  async scrap(input: {
    productId: string;
    locationId?: string;
    qty: number;
    reasonCode: string;
    note?: string;
    refType?: StockMovement['refType'];
    refId?: string;
  }): Promise<MovementView> {
    await delay();
    if (input.qty <= 0) throw new Error('Scrap quantity must be positive.');
    const settings = readSettings();
    const locationId = resolveLocationId(settings, input.locationId);
    const rec = findOrCreateRecord(input.productId, locationId);
    assertStockAvailable(settings, rec, input.qty, 'scrap');
    rec.qtyOnHand -= input.qty;
    const scrapRec = findOrCreateRecord(input.productId, settings.scrapLocationId);
    scrapRec.qtyOnHand += input.qty;
    const movement = pushMovement({
      productId: input.productId,
      fromLocationId: locationId,
      toLocationId: settings.scrapLocationId,
      qty: input.qty,
      reason: 'scrap',
      reasonCode: input.reasonCode,
      note: input.note,
      refType: input.refType,
      refId: input.refId,
    });
    return { ...movement, product: findProduct(input.productId), fromLocation: findLocation(locationId), toLocation: findLocation(settings.scrapLocationId) };
  },

  async transfer(input: {
    productId: string;
    fromLocationId: string;
    toLocationId: string;
    qty: number;
    note?: string;
  }): Promise<MovementView> {
    await delay();
    if (input.qty <= 0) throw new Error('Transfer quantity must be positive.');
    if (input.fromLocationId === input.toLocationId) {
      throw new Error('Source and destination locations must differ.');
    }
    const settings = readSettings();
    const fromRec = findOrCreateRecord(input.productId, input.fromLocationId);
    assertStockAvailable(settings, fromRec, input.qty, 'transfer');
    fromRec.qtyOnHand -= input.qty;
    const toRec = findOrCreateRecord(input.productId, input.toLocationId);
    toRec.qtyOnHand += input.qty;
    const movement = pushMovement({
      productId: input.productId,
      fromLocationId: input.fromLocationId,
      toLocationId: input.toLocationId,
      qty: input.qty,
      reason: 'putaway',
      note: input.note,
    });
    return { ...movement, product: findProduct(input.productId), fromLocation: findLocation(input.fromLocationId), toLocation: findLocation(input.toLocationId) };
  },

  /** Apply a full stocktake — one adjust movement per discrepancy. */
  async applyStocktake(input: {
    locationId?: string;
    counts: { productId: string; countedQty: number }[];
  }): Promise<{ movements: MovementView[]; varianceValue: number }> {
    await delay();
    const settings = readSettings();
    const locationId = resolveLocationId(settings, input.locationId);
    const movements: MovementView[] = [];
    let varianceValue = 0;
    for (const count of input.counts) {
      const rec = findOrCreateRecord(count.productId, locationId);
      const deltaQty = count.countedQty - rec.qtyOnHand;
      if (deltaQty === 0) continue;
      varianceValue += deltaQty * unitCostOf(findProduct(count.productId));
      rec.qtyOnHand = count.countedQty;
      const movement = pushMovement({
        productId: count.productId,
        ...(deltaQty < 0 ? { fromLocationId: locationId } : { toLocationId: locationId }),
        qty: Math.abs(deltaQty),
        reason: 'adjust',
        reasonCode: 'Count error',
        note: 'Stocktake variance',
      });
      movements.push({ ...movement, product: findProduct(count.productId) });
    }
    return { movements, varianceValue };
  },

  /**
   * Opening-balance import — used by the in-page Import dialog and the
   * Bridge `inventory` entity. Sets on-hand per sku/location and records
   * an `adjust` movement noted as an opening balance.
   */
  async importOpeningBalances(
    rows: { sku: string; location_code?: string; qty: number; unit_cost?: number }[],
  ): Promise<{ applied: number; skipped: { row: number; error: string }[]; movements: MovementView[] }> {
    await delay();
    const settings = readSettings();
    const skipped: { row: number; error: string }[] = [];
    const movements: MovementView[] = [];
    let applied = 0;
    rows.forEach((row, index) => {
      const product = mock.products.find(
        (p) => (p.sku ?? p.partNumber).toLowerCase() === row.sku.trim().toLowerCase(),
      );
      if (!product) {
        skipped.push({ row: index + 1, error: `Unknown SKU "${row.sku}"` });
        return;
      }
      let locationId: string;
      if (settings.storageLocationsEnabled && row.location_code) {
        const location = mock.stockLocations.find(
          (l) => l.code.toLowerCase() === row.location_code!.trim().toLowerCase(),
        );
        if (!location) {
          skipped.push({ row: index + 1, error: `Unknown location code "${row.location_code}"` });
          return;
        }
        locationId = location.id;
      } else {
        locationId = settings.defaultFinishedLocationId;
      }
      if (!Number.isFinite(row.qty) || row.qty < 0) {
        skipped.push({ row: index + 1, error: `Invalid quantity "${row.qty}"` });
        return;
      }
      if (row.unit_cost !== undefined && Number.isFinite(row.unit_cost) && row.unit_cost >= 0) {
        product.standardCost = row.unit_cost;
      }
      const rec = findOrCreateRecord(product.id, locationId);
      const deltaQty = row.qty - rec.qtyOnHand;
      rec.qtyOnHand = row.qty;
      if (deltaQty !== 0) {
        const movement = pushMovement({
          productId: product.id,
          ...(deltaQty < 0 ? { fromLocationId: locationId } : { toLocationId: locationId }),
          qty: Math.abs(deltaQty),
          reason: 'adjust',
          note: 'Opening balance import',
        });
        movements.push({ ...movement, product });
      }
      applied += 1;
    });
    return { applied, skipped, movements };
  },

  async exportLedgerCsv(opts: ListLedgerOptions = {}): Promise<string> {
    const rows = await this.listLedger(opts);
    const settings = readSettings();
    const header = settings.storageLocationsEnabled
      ? 'sku,description,location_code,qty,unit_cost'
      : 'sku,description,qty,unit_cost';
    const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const lines = rows.map((r) => {
      const cells = [
        escape(skuOf(r.product)),
        escape(r.product.description),
        ...(settings.storageLocationsEnabled ? [r.location?.code ?? ''] : []),
        String(r.qtyOnHand),
        r.unitCost.toFixed(2),
      ];
      return cells.join(',');
    });
    return [header, ...lines].join('\n');
  },

  // ── Settings ──

  async getSettings(): Promise<InventorySettings> {
    await delay(20);
    return readSettings();
  },

  async updateSettings(patch: Partial<InventorySettings>): Promise<InventorySettings> {
    await delay(20);
    const next = { ...readSettings(), ...patch };
    writeSettings(next);
    return next;
  },
};
