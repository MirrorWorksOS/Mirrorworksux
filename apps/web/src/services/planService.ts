/**
 * Plan Service — async facade over mock data.
 * Replace the mock implementation with a remote adapter when Convex is ready.
 */
import * as mock from './mock';
import type {
  Job,
  PlanTask,
  WeeklyCapacity,
  KpiMetric,
  CapableToPromiseResult,
  Operation,
  ScheduleBlock,
  WorkCentre,
  MrpNode,
  ShiftAssignment,
  NestingSheet,
  BomGeneratorLine,
  ScheduleSnapshot,
  AutoScheduleRequest,
  AutoScheduleResult,
  Nest,
  NestingQueueItem,
  SheetStock,
  Machine,
  MachineNestingConfig,
  Product,
  DxfAsset,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

// In-memory swap: applying the proposed snapshot promotes it to current.
let _currentSnapshot: ScheduleSnapshot = mock.currentScheduleSnapshot;
let _proposedTemplate: ScheduleSnapshot = mock.proposedScheduleSnapshot;

// Nesting v2 — mutable session state. Cloned from mocks on module init so
// the original mock arrays stay pristine across hot-reloads.
const _nests: Nest[] = mock.nests.map((n) => ({ ...n }));
const _queue: NestingQueueItem[] = mock.nestingQueueItems.map((q) => ({ ...q }));
const _sheetStocks: SheetStock[] = mock.sheetStocks.map((s) => ({ ...s }));

export const planService = {
  // ── Jobs ────────────────────────────────────────────────────────
  async getJobs(): Promise<Job[]> {
    await delay();
    return mock.jobs;
  },

  async getJobById(id: string): Promise<Job | undefined> {
    await delay();
    return mock.jobs.find((j) => j.id === id);
  },

  async getJobByNumber(jobNumber: string): Promise<Job | undefined> {
    await delay();
    return mock.jobs.find((j) => j.jobNumber === jobNumber);
  },

  async getPriorityJobs(): Promise<Job[]> {
    await delay();
    return mock.jobs
      .filter((j) => j.status === 'in_progress' || j.status === 'planned')
      .sort((a, b) => {
        const p = { urgent: 0, high: 1, medium: 2, low: 3 };
        return p[a.priority] - p[b.priority];
      })
      .slice(0, 3);
  },

  // ── Tasks ───────────────────────────────────────────────────────
  async getTodayTasks(): Promise<PlanTask[]> {
    await delay();
    return mock.planTasks;
  },

  // ── Capacity ────────────────────────────────────────────────────
  async getWeeklyCapacity(): Promise<WeeklyCapacity[]> {
    await delay();
    return mock.weeklyCapacity;
  },

  // ── Dashboard ───────────────────────────────────────────────────
  async getKpis(): Promise<Record<string, KpiMetric>> {
    await delay();
    return mock.planKpis;
  },

  // ── Schedule Engine ────────────────────────────────────────────
  async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    await delay();
    return mock.scheduleBlocks;
  },

  async getWorkCentres(): Promise<WorkCentre[]> {
    await delay();
    return mock.workCentres;
  },

  // TODO: CONVEX — fetch the live schedule snapshot from the engine query.
  async getScheduleSnapshot(): Promise<ScheduleSnapshot> {
    await delay();
    return _currentSnapshot;
  },

  // TODO: CONVEX — kick off the AI auto-schedule action.
  // The 4-second loading sequence is driven client-side by useAutoScheduleRunner;
  // this only models the network call returning the proposed snapshot.
  async runAutoSchedule(_req: AutoScheduleRequest): Promise<AutoScheduleResult> {
    await delay(3500);
    return {
      proposed: _proposedTemplate,
      summary:
        'Moved 3 jobs, balanced load across 5 work centres, eliminated 2 late risks. Welding now 78% (was 92%). Forming now 65% (was 42%).',
      movedJobIds: _proposedTemplate.source.kind === 'ai' ? _proposedTemplate.source.movedJobIds : [],
    };
  },

  // TODO: CONVEX — promote the proposed snapshot to current.
  async applySchedule(_snapshotId: string): Promise<void> {
    await delay();
    _currentSnapshot = {
      ..._proposedTemplate,
      id: 'snap-current',
      generatedAt: new Date().toISOString(),
    };
  },

  // TODO: CONVEX — discard the proposed snapshot (no-op for the mock).
  async discardProposal(): Promise<void> {
    await delay();
  },

  // ── Operations / Routing ───────────────────────────────────────
  async getOperations(): Promise<Operation[]> {
    await delay();
    return mock.operations;
  },

  // ── MRP Tree ───────────────────────────────────────────────────
  async getMrpTree(): Promise<MrpNode[]> {
    await delay();
    return mock.mrpTree;
  },

  // ── Shifts ─────────────────────────────────────────────────────
  async getShiftAssignments(): Promise<ShiftAssignment[]> {
    await delay();
    return mock.shiftAssignments;
  },

  // ── Nesting ────────────────────────────────────────────────────
  async getNestingSheets(): Promise<NestingSheet[]> {
    await delay();
    return mock.nestingSheets;
  },

  // ── Nesting v2 ─────────────────────────────────────────────────
  // In-memory mutable copies so the Studio + queue + schedule round-trip
  // can mutate state across navigations without a backend. Replace with
  // Convex queries/mutations when the backend lands.

  async getNests(): Promise<Nest[]> {
    await delay();
    return _nests;
  },

  async getNestById(id: string): Promise<Nest | undefined> {
    await delay();
    return _nests.find((n) => n.id === id);
  },

  async saveNest(nest: Nest): Promise<Nest> {
    await delay();
    const idx = _nests.findIndex((n) => n.id === nest.id);
    if (idx >= 0) _nests[idx] = nest;
    else _nests.unshift(nest);
    // Hydrate WorkOrder.nestId so MOs can show "this WO is on nest X".
    for (const wo of mock.workOrders) {
      if (nest.sourceWorkOrderIds.includes(wo.id)) {
        wo.nestId = nest.id;
      }
    }
    return nest;
  },

  /** All Nests that supply at least one WO under the given MO. */
  async getNestsForManufacturingOrder(moId: string): Promise<Nest[]> {
    await delay();
    return _nests.filter((n) => n.sourceManufacturingOrderIds.includes(moId));
  },

  /**
   * Aggregate cost contribution from nests onto a given MO. Sums material +
   * machine + labour from sheets that supply this MO, weighted by qty.
   */
  async getNestCostContributionForMo(moId: string): Promise<{
    materialCostAud: number;
    machineCostAud: number;
    labourCostAud: number;
    totalCostAud: number;
    nestCount: number;
  }> {
    await delay();
    const linked = _nests.filter((n) => n.sourceManufacturingOrderIds.includes(moId));
    let material = 0;
    let machine = 0;
    let labour = 0;
    for (const n of linked) {
      const totalPlacements = n.sheets.reduce(
        (s, sh) => s + sh.placements.reduce((p, pl) => p + pl.qtyOnSheet, 0),
        0,
      );
      const moPlacements = n.sheets.reduce(
        (s, sh) =>
          s +
          sh.placements.reduce((p, pl) => {
            const qty = pl.sources
              .filter((src) => mock.workOrders.find((wo) => wo.id === src.workOrderId)?.manufacturingOrderId === moId)
              .reduce((acc, src) => acc + src.qty, 0);
            return p + qty;
          }, 0),
        0,
      );
      const ratio = totalPlacements > 0 ? moPlacements / totalPlacements : 0;
      material += n.cost.materialCostAud * ratio;
      machine += n.cost.machineCostAud * ratio;
      labour += n.cost.labourCostAud * ratio;
    }
    return {
      materialCostAud: Math.round(material * 100) / 100,
      machineCostAud: Math.round(machine * 100) / 100,
      labourCostAud: Math.round(labour * 100) / 100,
      totalCostAud: Math.round((material + machine + labour) * 100) / 100,
      nestCount: linked.length,
    };
  },

  async getNestingQueue(): Promise<NestingQueueItem[]> {
    await delay();
    return _queue;
  },

  /** Mark queue items as placed onto a nest (called when a nest is saved). */
  async markQueueItemsPlaced(itemIds: string[], nestId: string): Promise<void> {
    await delay();
    for (const item of _queue) {
      if (itemIds.includes(item.id)) {
        item.status = 'placed';
        item.placedOnNestId = nestId;
      }
    }
  },

  async releaseQueueItems(itemIds: string[]): Promise<void> {
    await delay();
    for (const item of _queue) {
      if (itemIds.includes(item.id)) {
        item.status = 'pending';
        item.placedOnNestId = undefined;
      }
    }
  },

  async getSheetStocks(): Promise<SheetStock[]> {
    await delay();
    return _sheetStocks;
  },

  async reserveSheetStock(sheetStockId: string, qty: number): Promise<SheetStock | undefined> {
    await delay();
    const stock = _sheetStocks.find((s) => s.id === sheetStockId);
    if (!stock) return undefined;
    stock.qtyOnHand = Math.max(0, stock.qtyOnHand - qty);
    stock.qtyReserved += qty;
    return stock;
  },

  async releaseSheetStock(sheetStockId: string, qty: number): Promise<SheetStock | undefined> {
    await delay();
    const stock = _sheetStocks.find((s) => s.id === sheetStockId);
    if (!stock) return undefined;
    stock.qtyReserved = Math.max(0, stock.qtyReserved - qty);
    stock.qtyOnHand += qty;
    return stock;
  },

  async getMachines(): Promise<Machine[]> {
    await delay();
    return mock.machines;
  },

  async getMachineNestingConfigs(): Promise<MachineNestingConfig[]> {
    await delay();
    return mock.machineNestingConfigs;
  },

  async getProductsWithGeometry(): Promise<Product[]> {
    await delay();
    return mock.products.filter((p) => p.geometry !== undefined);
  },

  async getDxfAssets(): Promise<DxfAsset[]> {
    await delay();
    return mock.dxfAssets;
  },

  /**
   * Persist a parsed DXF asset. In production this is the service that wraps
   * the DXF parser; for now we accept user-confirmed dims and stash the
   * record so the placement can carry a stable reference downstream to CAM.
   */
  async createDxfAsset(input: {
    fileName: string;
    bboxMm: { widthMm: number; heightMm: number };
    /** Approximate perimeter — defaults to bbox perimeter if not provided. */
    perimeterMm?: number;
    /** Internal cut length (holes / inner contours). */
    innerCutMm?: number;
    holeCount?: number;
  }): Promise<DxfAsset> {
    await delay();
    const id = `dxf-${Math.random().toString(36).slice(2, 9)}`;
    const perim =
      input.perimeterMm ?? (input.bboxMm.widthMm + input.bboxMm.heightMm) * 2;
    const asset: DxfAsset = {
      id,
      fileName: input.fileName,
      fileUrl: `/dxf/${input.fileName}`,
      parsedAt: new Date().toISOString(),
      bboxMm: input.bboxMm,
      perimeterMm: perim,
      innerCutMm: input.innerCutMm ?? 0,
      holeCount: input.holeCount ?? 0,
      areaMm2: input.bboxMm.widthMm * input.bboxMm.heightMm,
      layers: ['CUT'],
      source: 'nest_upload',
    };
    mock.dxfAssets.unshift(asset);
    return asset;
  },

  /**
   * Promote a confirmed nest onto the schedule engine. Reserves the sheet
   * stock, sets the nest's status to `scheduled`, and stamps a placeholder
   * scheduleBlockId. Returns the updated nest.
   *
   * In production this would be one Convex transaction:
   *   reserve(stock) → upsert(scheduleBlock) → setStatus(nest, scheduled).
   */
  async scheduleNest(nestId: string, opts?: { startTime?: string }): Promise<Nest | undefined> {
    await delay();
    const nest = _nests.find((n) => n.id === nestId);
    if (!nest) return undefined;
    if (nest.status !== 'ready_to_schedule' && nest.status !== 'draft') return nest;

    // Reserve one sheet of stock per NestSheet on the nest.
    const sheetCounts = new Map<string, number>();
    for (const ns of nest.sheets) {
      sheetCounts.set(ns.sheetStockId, (sheetCounts.get(ns.sheetStockId) ?? 0) + 1);
    }
    for (const [stockId, qty] of sheetCounts) {
      const stock = _sheetStocks.find((s) => s.id === stockId);
      if (stock) {
        const actualQty = Math.min(qty, stock.qtyOnHand);
        stock.qtyOnHand = Math.max(0, stock.qtyOnHand - actualQty);
        stock.qtyReserved += actualQty;
      }
    }

    nest.status = 'scheduled';
    nest.scheduledAt = new Date().toISOString();
    nest.scheduleBlockId = `sb-${nest.id}`;
    nest.notes = opts?.startTime
      ? `${nest.notes ?? ''}\nScheduled to start ${opts.startTime}`.trim()
      : nest.notes;
    return nest;
  },

  /** Rollback a schedule. Returns reserved stock and clears the block id. */
  async unscheduleNest(nestId: string): Promise<Nest | undefined> {
    await delay();
    const nest = _nests.find((n) => n.id === nestId);
    if (!nest || nest.status !== 'scheduled') return nest;

    const sheetCounts = new Map<string, number>();
    for (const ns of nest.sheets) {
      sheetCounts.set(ns.sheetStockId, (sheetCounts.get(ns.sheetStockId) ?? 0) + 1);
    }
    for (const [stockId, qty] of sheetCounts) {
      const stock = _sheetStocks.find((s) => s.id === stockId);
      if (stock) {
        const released = Math.min(qty, stock.qtyReserved);
        stock.qtyReserved = Math.max(0, stock.qtyReserved - released);
        stock.qtyOnHand += released;
      }
    }
    nest.status = 'ready_to_schedule';
    nest.scheduledAt = undefined;
    nest.scheduleBlockId = undefined;
    return nest;
  },

  /** Mark a scheduled nest as cutting / done. */
  async setNestStatus(
    nestId: string,
    status: 'cutting' | 'done' | 'cancelled',
  ): Promise<Nest | undefined> {
    await delay();
    const nest = _nests.find((n) => n.id === nestId);
    if (!nest) return undefined;
    nest.status = status;
    if (status === 'cutting') nest.startedAt = new Date().toISOString();
    if (status === 'done') {
      nest.completedAt = new Date().toISOString();
      // Consume the reserved stock for real.
      const sheetCounts = new Map<string, number>();
      for (const ns of nest.sheets) {
        sheetCounts.set(ns.sheetStockId, (sheetCounts.get(ns.sheetStockId) ?? 0) + 1);
      }
      for (const [stockId, qty] of sheetCounts) {
        const stock = _sheetStocks.find((s) => s.id === stockId);
        if (stock) {
          stock.qtyReserved = Math.max(0, stock.qtyReserved - qty);
        }
      }
    }
    return nest;
  },

  // ── BOM Generator ──────────────────────────────────────────────
  async getBomGeneratorLines(): Promise<BomGeneratorLine[]> {
    await delay();
    return mock.bomGeneratorLines;
  },

  // ── Capable-to-Promise (Plan context) ──────────────────────────
  async getCapableToPromise(): Promise<CapableToPromiseResult> {
    await delay();
    const weeksOut = 2 + Math.random() * 2;
    const date = new Date();
    date.setDate(date.getDate() + Math.round(weeksOut * 7));
    return {
      earliestDate: date.toISOString().slice(0, 10),
      confidencePercent: 78 + Math.round(Math.random() * 15),
      capacityUtilization: 72 + Math.round(Math.random() * 20),
      bottleneckWorkCenter: 'Welding',
    };
  },
};
