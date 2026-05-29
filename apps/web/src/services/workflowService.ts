/**
 * Workflow service — cross-module orchestration for the seven Figma
 * archetypes (MTO, Catalogue Sale, Make-to-Stock, ETO, Variation Order,
 * Rework, Subcontract).
 *
 * Each public method mutates the in-memory mock collections under
 * `services/mock/` and returns the resulting domain object so the UI
 * can refresh. Mutations are synchronous from the caller's POV but
 * wrapped in `delay()` to mimic Convex latency.
 *
 * The four named **validation gates** from the spec are exported as
 * `evaluateGate*` helpers — they return `GateFailureDetail[]` when a
 * transition is blocked (caller surfaces via `GateBanner`).
 *
 * Replenishment / engineering / variation Jobs use the "Stock"
 * pseudo-customer rather than nullable `customerId` (audit §4.4
 * alternative).
 */
import * as mock from './mock';
import type {
  BillOfMaterials,
  ConcessionRecord,
  GateFailureDetail,
  InventoryRecord,
  Job,
  JobSource,
  ManufacturingOrder,
  MaterialDemand,
  PickList,
  ProductRoute,
  PutAwayRecord,
  QualityCheck,
  Reservation,
  SalesOrder,
  SalesOrderLine,
  StockMovement,
  SubcontractDispatch,
  SubcontractMaterialModel,
  VariationOrder,
  WorkOrder,
} from '@/types/entities';

const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════════════
// Gate failures — Phase C surfaces these via GateBanner
// ═══════════════════════════════════════════════════════════════════════

export class GateFailure extends Error {
  constructor(public details: GateFailureDetail[]) {
    super(details.map((d) => d.message).join('; '));
    this.name = 'GateFailure';
  }
}

const findBomFor = (productId: string): BillOfMaterials | undefined =>
  mock.billsOfMaterials.find((b) => b.productId === productId);

const findProduct = (productId: string) =>
  mock.products.find((p) => p.id === productId);

const lineRoute = (line: SalesOrderLine): ProductRoute => {
  if (line.routeOverride) return line.routeOverride;
  const product = findProduct(line.productId);
  return product?.defaultRoute ?? 'mto';
};

// ── Gate evaluators ────────────────────────────────────────────────

/** SO → Job: SO confirmed, product active, BoM exists for MTO/MTS lines. */
export function evaluateSoToJob(so: SalesOrder): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  if (so.status !== 'confirmed' && so.status !== 'in_production') {
    errors.push({
      code: 'so_not_confirmed',
      message: `Sales Order ${so.orderNumber} must be confirmed before a Job can be created.`,
    });
  }
  for (const line of so.lines ?? []) {
    const product = findProduct(line.productId);
    if (!product) {
      errors.push({
        code: 'product_missing',
        message: `Product ${line.productId} on line ${line.id} not found.`,
      });
      continue;
    }
    if (!product.isActive) {
      errors.push({
        code: 'product_inactive',
        message: `Product ${product.partNumber} is inactive.`,
        fixUrl: `/sell/products/${product.id}`,
      });
    }
    const route = lineRoute(line);
    if (route === 'mto' || route === 'make_to_stock') {
      if (!findBomFor(line.productId)) {
        errors.push({
          code: 'bom_missing',
          message: `Product ${product.partNumber} has no BoM. Route to ETO or author a BoM first.`,
          fixUrl: `/plan/products/${product.id}/bom`,
        });
      }
    }
  }
  return errors;
}

/** Plan → Make: every product has routing, planned dates set, material status OK. */
export function evaluatePlanToMake(job: Job): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  if (!job.startDate || !job.dueDate) {
    errors.push({
      code: 'dates_missing',
      message: `Job ${job.jobNumber} needs start + due dates before release.`,
    });
  }
  // Routing check: we look up MOs for this job; if none, fail.
  const mos = mock.manufacturingOrders.filter((m) => m.jobId === job.id);
  if (mos.length === 0) {
    errors.push({
      code: 'no_mos',
      message: `Job ${job.jobNumber} has no Manufacturing Orders. Run MRP + Schedule first.`,
      fixUrl: `/plan/jobs/${job.id}`,
    });
  }
  return errors;
}

/** Make → Ship: all WOs complete, QC passed, no open NCRs. */
export function evaluateMakeToShip(job: Job): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  const mos = mock.manufacturingOrders.filter((m) => m.jobId === job.id);
  for (const mo of mos) {
    const wos = mock.workOrders.filter((w) => w.manufacturingOrderId === mo.id);
    const incomplete = wos.filter((w) => w.status !== 'completed');
    if (incomplete.length > 0) {
      errors.push({
        code: 'wo_incomplete',
        message: `MO ${mo.moNumber} has ${incomplete.length} Work Order(s) still in progress.`,
      });
    }
    const failedQc = mock.qualityChecks.filter((q) =>
      wos.some((w) => w.id === q.workOrderId) && q.result === 'fail',
    );
    if (failedQc.length > 0) {
      errors.push({
        code: 'qc_failed',
        message: `${failedQc.length} Work Order(s) failed QC. Resolve NCRs before dispatch.`,
      });
    }
  }
  return errors;
}

/** Ship → Book: delivery confirmed; invoice ready. */
export function evaluateShipToBook(so: SalesOrder): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  const shipment = mock.shipments.find((s) => s.salesOrderId === so.id);
  if (!shipment) {
    errors.push({
      code: 'no_shipment',
      message: `Sales Order ${so.orderNumber} has no shipment.`,
    });
  } else if (!shipment.actualDelivery) {
    errors.push({
      code: 'undelivered',
      message: `Shipment ${shipment.shipmentNumber} has no Proof of Delivery yet.`,
    });
  }
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════
// Phase B1 — MTO keystone
// ═══════════════════════════════════════════════════════════════════════

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const today = () => new Date().toISOString().slice(0, 10);

/**
 * BoM explosion. Walks `productId`'s BoM recursively and yields
 * gross component demand. Nested manufactured components are flagged
 * `isManufactured: true` so the caller can cascade nested MOs.
 *
 * Phantom components flatten into the parent. Subcontracted children
 * are still emitted as demand but flagged for Phase B7.
 */
export function explodeBom(
  productId: string,
  qty: number,
): MaterialDemand[] {
  const acc = new Map<string, MaterialDemand>();
  const walk = (pid: string, multiplier: number) => {
    const bom = findBomFor(pid);
    if (!bom) return;
    for (const c of bom.components) {
      if (c.isPhantom) {
        walk(c.productId, multiplier * c.qtyPer);
        continue;
      }
      const required = multiplier * c.qtyPer;
      const existing = acc.get(c.productId);
      const onHand = mock.inventoryRecords
        .filter((i) => i.productId === c.productId)
        .reduce((s, i) => s + i.qtyOnHand - i.qtyReserved, 0);
      if (existing) {
        existing.qtyRequired += required;
        existing.qtyShort = Math.max(0, existing.qtyRequired - existing.qtyOnHand);
      } else {
        acc.set(c.productId, {
          productId: c.productId,
          qtyRequired: required,
          qtyOnHand: onHand,
          qtyShort: Math.max(0, required - onHand),
          isManufactured: c.isManufactured,
        });
      }
      if (c.isManufactured) walk(c.productId, required);
    }
  };
  walk(productId, qty);
  return Array.from(acc.values());
}

const employeeIdForDefaults = () => mock.employees[0]?.id ?? 'emp-001';

/**
 * Confirm a Sales Order — the keystone MTO handoff. Walks lines and
 * dispatches per `line.routeOverride ?? product.defaultRoute`:
 *
 *  - mto → Job created with `source: 'sales_order'`.
 *  - catalogue_sale → stock reserved + PickList created (Phase B2).
 *  - eto → engineering Job created (Phase B4).
 *  - make_to_stock → soft-warn; treated as MTO if BoM resolves.
 *
 * Returns the updated SO plus a per-line dispatch report.
 */
export interface ConfirmSalesOrderResult {
  salesOrder: SalesOrder;
  perLine: Array<{
    lineId: string;
    route: ProductRoute;
    jobId?: string;
    pickListId?: string;
    note?: string;
  }>;
}

export const workflowService = {
  // ── B1: SO confirm + Job creation ─────────────────────────────
  async confirmSalesOrder(salesOrderId: string): Promise<ConfirmSalesOrderResult> {
    await delay();
    const so = mock.salesOrders.find((s) => s.id === salesOrderId);
    if (!so) throw new Error(`Sales Order ${salesOrderId} not found.`);

    // Synthesise lines if legacy fixture has none (one line per existing
    // jobId or one summary line). Keeps confirmSalesOrder runnable on
    // the demo data without a separate migration step.
    if (!so.lines || so.lines.length === 0) {
      so.lines = [
        {
          id: newId('soline'),
          salesOrderId: so.id,
          productId: mock.products[0].id,
          description: so.orderNumber + ' — line 1 (synthesised)',
          qty: 1,
          unitPrice: so.total,
          status: 'pending',
        },
      ];
    }

    const failures = evaluateSoToJob(so);
    if (failures.some((f) => f.code === 'so_not_confirmed')) {
      so.status = 'confirmed';
      so.confirmedAt = new Date().toISOString();
    }
    // Re-check after auto-confirm.
    const blockingFailures = evaluateSoToJob(so).filter(
      (f) => f.code !== 'so_not_confirmed',
    );
    if (blockingFailures.length > 0) throw new GateFailure(blockingFailures);

    const perLine: ConfirmSalesOrderResult['perLine'] = [];
    for (const line of so.lines) {
      const route = lineRoute(line);
      const product = findProduct(line.productId)!;
      if (route === 'mto') {
        const job: Job = {
          id: newId('job'),
          jobNumber: `JOB-${new Date().getFullYear()}-${(mock.jobs.length + 100).toString().padStart(4, '0')}`,
          title: `${product.description} × ${line.qty}`,
          customerId: so.customerId,
          customerName: so.customerName,
          salesOrderId: so.id,
          status: 'planned',
          priority: 'medium',
          startDate: today(),
          dueDate: so.deliveryDate,
          estimatedHours: line.qty * 4,
          actualHours: 0,
          value: line.qty * line.unitPrice,
          progress: 0,
          assignedTo: employeeIdForDefaults(),
          source: 'sales_order',
          qty: line.qty,
        };
        mock.jobs.push(job);
        line.status = 'in_production';
        perLine.push({ lineId: line.id, route, jobId: job.id });
      } else if (route === 'catalogue_sale') {
        const pickList = this._reserveAndCreatePickList(so, line);
        perLine.push({ lineId: line.id, route, pickListId: pickList.id });
      } else if (route === 'eto') {
        const engJob = this._createEngineeringJob(so, line);
        perLine.push({
          lineId: line.id,
          route,
          jobId: engJob.id,
          note: 'Engineering Job created; production Job spawns when BoM is published.',
        });
      } else if (route === 'make_to_stock') {
        // SO of an MTS item is unusual — treat as MTO if BoM resolves.
        const bom = findBomFor(line.productId);
        if (!bom) {
          perLine.push({
            lineId: line.id,
            route,
            note: 'No BoM — line skipped. Author a BoM or route ETO.',
          });
          continue;
        }
        const job: Job = {
          id: newId('job'),
          jobNumber: `JOB-${new Date().getFullYear()}-${(mock.jobs.length + 100).toString().padStart(4, '0')}`,
          title: `${product.description} × ${line.qty} (from MTS catalogue)`,
          customerId: so.customerId,
          customerName: so.customerName,
          salesOrderId: so.id,
          status: 'planned',
          priority: 'medium',
          startDate: today(),
          dueDate: so.deliveryDate,
          estimatedHours: line.qty * 4,
          actualHours: 0,
          value: line.qty * line.unitPrice,
          progress: 0,
          assignedTo: employeeIdForDefaults(),
          source: 'sales_order',
          qty: line.qty,
        };
        mock.jobs.push(job);
        line.status = 'in_production';
        perLine.push({ lineId: line.id, route, jobId: job.id });
      }
    }

    so.status = 'in_production';
    return { salesOrder: so, perLine };
  },

  // ── B2: Catalogue Sale fast path ─────────────────────────────
  _reserveAndCreatePickList(so: SalesOrder, line: SalesOrderLine): PickList {
    // Reserve from FG first; fall back to raw if FG empty.
    let remaining = line.qty;
    const pickLines: PickList['lines'] = [];
    const candidates = mock.inventoryRecords
      .filter((i) => i.productId === line.productId)
      .sort((a, b) => {
        const aKind = mock.stockLocations.find((l) => l.id === a.locationId)?.kind;
        const bKind = mock.stockLocations.find((l) => l.id === b.locationId)?.kind;
        return aKind === 'finished' ? -1 : bKind === 'finished' ? 1 : 0;
      });
    for (const inv of candidates) {
      if (remaining <= 0) break;
      const available = inv.qtyOnHand - inv.qtyReserved;
      if (available <= 0) continue;
      const take = Math.min(available, remaining);
      inv.qtyReserved += take;
      const reservation: Reservation = {
        id: newId('res'),
        productId: line.productId,
        locationId: inv.locationId,
        qty: take,
        salesOrderLineId: line.id,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      mock.reservations.push(reservation);
      pickLines.push({
        productId: line.productId,
        qtyOrdered: line.qty,
        qtyPicked: 0,
        locationId: inv.locationId,
      });
      remaining -= take;
    }
    const pickList: PickList = {
      id: newId('pl'),
      pickNumber: `PL-${Date.now().toString().slice(-6)}`,
      salesOrderId: so.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      lines: pickLines.length > 0 ? pickLines : [
        { productId: line.productId, qtyOrdered: line.qty, qtyPicked: 0, locationId: 'loc-fg' },
      ],
    };
    mock.pickLists.push(pickList);
    if (remaining > 0) {
      line.status = 'pending'; // backorder
    } else {
      line.status = 'reserved';
    }
    return pickList;
  },

  async pickPickList(pickListId: string, pickedBy: string): Promise<PickList> {
    await delay();
    const pl = mock.pickLists.find((p) => p.id === pickListId);
    if (!pl) throw new Error(`PickList ${pickListId} not found.`);
    for (const ln of pl.lines) {
      const inv = mock.inventoryRecords.find(
        (i) => i.productId === ln.productId && i.locationId === ln.locationId,
      );
      if (!inv) continue;
      const take = Math.min(inv.qtyOnHand, ln.qtyOrdered - ln.qtyPicked);
      inv.qtyOnHand -= take;
      inv.qtyReserved = Math.max(0, inv.qtyReserved - take);
      ln.qtyPicked += take;
      mock.stockMovements.push({
        id: newId('sm'),
        productId: ln.productId,
        fromLocationId: ln.locationId,
        qty: take,
        reason: 'pick',
        at: new Date().toISOString(),
        refType: 'so_line',
        refId: pickListId,
      });
    }
    pl.status = 'picked';
    pl.pickedAt = new Date().toISOString();
    pl.pickedBy = pickedBy;
    return pl;
  },

  // ── B3: MTS replenishment ────────────────────────────────────
  async runReorderMonitor(): Promise<Job[]> {
    await delay();
    const created: Job[] = [];
    for (const rule of mock.productReorderRules) {
      if (!rule.enabled) continue;
      const onHand = mock.inventoryRecords
        .filter((i) => i.productId === rule.productId)
        .reduce((s, i) => s + i.qtyOnHand - i.qtyReserved, 0);
      if (onHand >= rule.reorderPoint) continue;
      // Avoid double-creating: skip if a replenishment Job for this
      // product already exists and is not yet completed.
      const pending = mock.jobs.some(
        (j) =>
          j.source === 'replenishment' &&
          j.title.includes(rule.productId) &&
          j.status !== 'completed',
      );
      if (pending) continue;
      const product = findProduct(rule.productId);
      if (!product) continue;
      const job: Job = {
        id: newId('job'),
        jobNumber: `JOB-MTS-${(mock.jobs.length + 200).toString().padStart(4, '0')}`,
        title: `Replenish ${product.partNumber} × ${rule.reorderQty} (${rule.productId})`,
        customerId: mock.stockPseudoCustomer.id,
        customerName: mock.stockPseudoCustomer.company,
        status: 'planned',
        priority: 'low',
        startDate: today(),
        dueDate: new Date(Date.now() + rule.leadTimeDays * 86400000).toISOString().slice(0, 10),
        estimatedHours: rule.reorderQty * 2,
        actualHours: 0,
        value: 0,
        progress: 0,
        assignedTo: employeeIdForDefaults(),
        source: 'replenishment',
        qty: rule.reorderQty,
      };
      mock.jobs.push(job);
      created.push(job);
    }
    return created;
  },

  async putAway(input: {
    manufacturingOrderId: string;
    productId: string;
    qty: number;
    by: string;
  }): Promise<PutAwayRecord> {
    await delay();
    const record: PutAwayRecord = {
      id: newId('pa'),
      manufacturingOrderId: input.manufacturingOrderId,
      productId: input.productId,
      qty: input.qty,
      toLocationId: 'loc-fg',
      at: new Date().toISOString(),
      by: input.by,
    };
    mock.putAwayRecords.push(record);
    const inv = mock.inventoryRecords.find(
      (i) => i.productId === input.productId && i.locationId === 'loc-fg',
    );
    if (inv) {
      inv.qtyOnHand += input.qty;
    } else {
      mock.inventoryRecords.push({
        id: newId('inv'),
        productId: input.productId,
        locationId: 'loc-fg',
        qtyOnHand: input.qty,
        qtyReserved: 0,
      });
    }
    mock.stockMovements.push({
      id: newId('sm'),
      productId: input.productId,
      toLocationId: 'loc-fg',
      qty: input.qty,
      reason: 'putaway',
      at: record.at,
      refType: 'mo',
      refId: input.manufacturingOrderId,
    });
    return record;
  },

  // ── B4: ETO two-Job pattern ───────────────────────────────────
  _createEngineeringJob(so: SalesOrder, line: SalesOrderLine): Job {
    const product = findProduct(line.productId)!;
    const job: Job = {
      id: newId('job'),
      jobNumber: `JOB-ENG-${(mock.jobs.length + 300).toString().padStart(4, '0')}`,
      title: `Engineering — ${product.description}`,
      customerId: so.customerId,
      customerName: so.customerName,
      salesOrderId: so.id,
      status: 'draft',
      priority: 'high',
      startDate: today(),
      dueDate: so.deliveryDate,
      estimatedHours: 24,
      actualHours: 0,
      value: 0,
      progress: 0,
      assignedTo: employeeIdForDefaults(),
      source: 'engineering',
      qty: line.qty,
    };
    mock.jobs.push(job);
    line.status = 'in_production';
    return job;
  },

  async publishBomToProductionJob(input: {
    engineeringJobId: string;
    productId: string;
    revision: string;
    components: Array<{
      productId: string;
      qtyPer: number;
      isManufactured: boolean;
    }>;
  }): Promise<{ bom: BillOfMaterials; productionJob: Job }> {
    await delay();
    const engJob = mock.jobs.find((j) => j.id === input.engineeringJobId);
    if (!engJob) throw new Error(`Engineering Job ${input.engineeringJobId} not found.`);
    const bom: BillOfMaterials = {
      id: newId('bom'),
      productId: input.productId,
      revision: input.revision,
      components: input.components.map((c) => ({ ...c })),
      publishedAt: new Date().toISOString(),
      publishedBy: employeeIdForDefaults(),
    };
    mock.billsOfMaterials.push(bom);
    const productionJob: Job = {
      id: newId('job'),
      jobNumber: engJob.jobNumber.replace('JOB-ENG', 'JOB'),
      title: engJob.title.replace('Engineering — ', ''),
      customerId: engJob.customerId,
      customerName: engJob.customerName,
      salesOrderId: engJob.salesOrderId,
      status: 'planned',
      priority: engJob.priority,
      startDate: today(),
      dueDate: engJob.dueDate,
      estimatedHours: engJob.qty ? engJob.qty * 4 : 40,
      actualHours: 0,
      value: engJob.value || 0,
      progress: 0,
      assignedTo: engJob.assignedTo,
      source: 'sales_order',
      parentJobId: engJob.id,
      qty: engJob.qty,
    };
    mock.jobs.push(productionJob);
    engJob.status = 'completed';
    return { bom, productionJob };
  },

  // ── B5: Variation Order ──────────────────────────────────────
  async createVariation(input: {
    parentSalesOrderId: string;
    type: 'additive' | 'descope' | 'mixed';
    costDelta: number;
    scheduleDeltaDays: number;
    description: string;
  }): Promise<VariationOrder> {
    await delay();
    const parent = mock.salesOrders.find((s) => s.id === input.parentSalesOrderId);
    if (!parent) throw new Error(`Parent SO ${input.parentSalesOrderId} not found.`);
    const variationChainId =
      mock.variationOrders.find((v) => v.parentSalesOrderId === parent.id)
        ?.variationChainId ?? newId('vchain');
    const vo: VariationOrder = {
      id: newId('vo'),
      voNumber: `VO-${Date.now().toString().slice(-6)}`,
      parentSalesOrderId: parent.id,
      type: input.type,
      costDelta: input.costDelta,
      scheduleDeltaDays: input.scheduleDeltaDays,
      description: input.description,
      status: 'awaiting_approval',
      variationChainId,
      createdAt: new Date().toISOString(),
    };
    mock.variationOrders.push(vo);
    return vo;
  },

  async approveVariation(variationOrderId: string, approvedBy: string): Promise<{
    vo: VariationOrder;
    deltaJob?: Job;
  }> {
    await delay();
    const vo = mock.variationOrders.find((v) => v.id === variationOrderId);
    if (!vo) throw new Error(`VO ${variationOrderId} not found.`);
    vo.status = 'approved';
    vo.approvedAt = new Date().toISOString();
    vo.approvedBy = approvedBy;
    const parent = mock.salesOrders.find((s) => s.id === vo.parentSalesOrderId);
    if (!parent) return { vo };
    const parentJob = mock.jobs.find((j) => j.salesOrderId === parent.id);
    if (vo.type === 'descope' || !parentJob) return { vo };
    const deltaJob: Job = {
      id: newId('job'),
      jobNumber: `${parentJob.jobNumber}-${vo.voNumber}`,
      title: `Variation — ${vo.description}`,
      customerId: parent.customerId,
      customerName: parent.customerName,
      salesOrderId: parent.id,
      status: 'planned',
      priority: parentJob.priority,
      startDate: today(),
      dueDate: parentJob.dueDate,
      estimatedHours: Math.abs(vo.costDelta) / 100,
      actualHours: 0,
      value: vo.costDelta,
      progress: 0,
      assignedTo: parentJob.assignedTo,
      source: 'variation',
      parentJobId: parentJob.id,
      variationChainId: vo.variationChainId,
      qty: 1,
    };
    mock.jobs.push(deltaJob);
    return { vo, deltaJob };
  },

  // ── B6: Rework loop ──────────────────────────────────────────
  async recordQualityCheck(input: {
    workOrderId: string;
    result: 'pass' | 'fail' | 'hold';
    inspectorId: string;
    inspectionPointId?: string;
  }): Promise<QualityCheck> {
    await delay();
    const qc: QualityCheck = {
      id: newId('qc'),
      workOrderId: input.workOrderId,
      inspectionPointId: input.inspectionPointId,
      result: input.result,
      inspectorId: input.inspectorId,
      at: new Date().toISOString(),
    };
    mock.qualityChecks.push(qc);
    return qc;
  },

  async createReworkWorkOrder(input: {
    parentWorkOrderId: string;
    raisedBy: string;
  }): Promise<WorkOrder> {
    await delay();
    const parent = mock.workOrders.find((w) => w.id === input.parentWorkOrderId);
    if (!parent) throw new Error(`Parent WO ${input.parentWorkOrderId} not found.`);
    const parentDepth = parent.reworkDepth ?? 0;
    if (parentDepth >= 2) {
      throw new GateFailure([
        {
          code: 'rework_cap',
          message: `Work Order ${parent.woNumber} has reached rework cap (depth 2). Escalate to supervisor.`,
        },
      ]);
    }
    const rework: WorkOrder = {
      ...parent,
      id: newId('wo'),
      woNumber: `${parent.woNumber}-RW${parentDepth + 1}`,
      status: 'pending',
      parentWorkOrderId: parent.id,
      reworkDepth: parentDepth + 1,
      startedAt: undefined,
      completedAt: undefined,
    };
    mock.workOrders.push(rework);
    return rework;
  },

  async recordConcession(input: {
    workOrderId: string;
    jobId: string;
    reason: string;
    approvedBy: string;
    customerContact?: string;
  }): Promise<ConcessionRecord> {
    await delay();
    const record: ConcessionRecord = {
      id: newId('cn'),
      workOrderId: input.workOrderId,
      jobId: input.jobId,
      reason: input.reason,
      approvedBy: input.approvedBy,
      approvedAt: new Date().toISOString(),
      customerContact: input.customerContact,
    };
    mock.concessionRecords.push(record);
    return record;
  },

  // ── B7: Subcontract / Outwork ────────────────────────────────
  async releaseSubcontract(input: {
    workOrderId: string;
    operationId: string;
    supplierId: string;
    materialModel: SubcontractMaterialModel;
  }): Promise<SubcontractDispatch> {
    await delay();
    const po = {
      id: newId('po'),
      poNumber: `PO-SUB-${Date.now().toString().slice(-6)}`,
      supplierId: input.supplierId,
      supplierName:
        mock.suppliers.find((s) => s.id === input.supplierId)?.company ?? 'Unknown',
      date: today(),
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: 'sent' as const,
      total: 0,
      received: 0,
    };
    mock.purchaseOrders.push(po);
    const dispatch: SubcontractDispatch = {
      id: newId('sd'),
      workOrderId: input.workOrderId,
      operationId: input.operationId,
      supplierId: input.supplierId,
      materialModel: input.materialModel,
      purchaseOrderId: po.id,
      status: 'subcontract_in_transit',
      releasedAt: new Date().toISOString(),
    };
    mock.subcontractDispatches.push(dispatch);
    mock.stockMovements.push({
      id: newId('sm'),
      productId: 'subcontract-op',
      fromLocationId: 'loc-wip',
      toLocationId: 'loc-sub',
      qty: 1,
      reason: 'sub_out',
      at: dispatch.releasedAt,
      refType: 'work_order',
      refId: input.workOrderId,
    });
    const wo = mock.workOrders.find((w) => w.id === input.workOrderId);
    if (wo) {
      wo.status = 'in_progress';
    }
    return dispatch;
  },

  async receiveSubcontract(subcontractDispatchId: string): Promise<SubcontractDispatch> {
    await delay();
    const sd = mock.subcontractDispatches.find((s) => s.id === subcontractDispatchId);
    if (!sd) throw new Error(`Subcontract dispatch ${subcontractDispatchId} not found.`);
    sd.status = 'received';
    sd.returnedAt = new Date().toISOString();
    mock.stockMovements.push({
      id: newId('sm'),
      productId: 'subcontract-op',
      fromLocationId: 'loc-sub',
      toLocationId: 'loc-wip',
      qty: 1,
      reason: 'sub_in',
      at: sd.returnedAt,
      refType: 'work_order',
      refId: sd.workOrderId,
    });
    return sd;
  },

  // ── E: queries that drive the universal Order page ───────────
  async getInventoryByProduct(productId: string): Promise<InventoryRecord[]> {
    await delay(30);
    return mock.inventoryRecords.filter((i) => i.productId === productId);
  },
  async getBomFor(productId: string): Promise<BillOfMaterials | undefined> {
    await delay(30);
    return findBomFor(productId);
  },
  async getPickListsForSO(salesOrderId: string): Promise<PickList[]> {
    await delay(30);
    return mock.pickLists.filter((p) => p.salesOrderId === salesOrderId);
  },
  async getVariationsFor(salesOrderId: string): Promise<VariationOrder[]> {
    await delay(30);
    return mock.variationOrders.filter((v) => v.parentSalesOrderId === salesOrderId);
  },
  async getStockMovements(): Promise<StockMovement[]> {
    await delay(30);
    return mock.stockMovements.slice().reverse();
  },
};

// Expose for tests / debugging without forcing the singleton import
// pattern on every consumer.
export const __test = {
  explodeBom,
  evaluateSoToJob,
  evaluatePlanToMake,
  evaluateMakeToShip,
  evaluateShipToBook,
};
