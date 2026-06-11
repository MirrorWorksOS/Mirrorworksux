/**
 * Workflow service — cross-module orchestration for the workflow
 * archetypes: the three order routes (MTO, Stock Sale, ETO — decision
 * D3), the MTS replenishment trigger, and the in-flight deviations
 * (Variation Order, Rework, Subcontract).
 *
 * Each public method mutates the in-memory mock collections under
 * `services/mock/` and returns the resulting domain object so the UI
 * can refresh. Mutations are synchronous from the caller's POV but
 * wrapped in `delay()` to mimic Convex latency.
 *
 * The five named **validation gates** from the spec (G1 SO→Job, G2
 * Plan→Make, G3 Make→Ship, G4 Ship→Book, G5 Receiving) are exported as
 * `evaluate*` helpers — they return `GateFailureDetail[]` when a
 * transition is blocked (caller surfaces via `GateBanner`).
 *
 * Replenishment Jobs use the "Stock" pseudo-customer rather than
 * nullable `customerId` (audit §4.4 alternative); engineering and
 * variation Jobs keep the real customer.
 */
import * as mock from './mock';
import type {
  BillOfMaterials,
  ConcessionRecord,
  CreditNote,
  GateFailureDetail,
  GoodsReceipt,
  InventoryRecord,
  Job,
  JobSource,
  ManufacturingOrder,
  MaterialDemand,
  PaymentMilestone,
  PaymentMilestoneEvent,
  PaymentTerm,
  PickList,
  ProductRoute,
  PutAwayRecord,
  QcDisposition,
  QualityCheck,
  Reservation,
  SalesOrder,
  SalesOrderLine,
  SellInvoice,
  Shipment,
  StockMovement,
  SubcontractDispatch,
  SubcontractMaterialModel,
  SupplierReturn,
  VariationBaseline,
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

/**
 * Gate G5 receiving tolerance: received qty may exceed the PO line qty
 * by at most this fraction before `qty_out_of_tolerance` blocks accept.
 *
 * TODO(decisions): open question — should the tolerance live as a
 * global setting, per-product, or per-PO-line? The 5% module constant
 * is a placeholder until that is decided (workflow-figjam-content-pack
 * Open Questions panel, item 5).
 */
export const RECEIVING_QTY_TOLERANCE = 0.05;

/**
 * PO statuses that count as "open" — i.e. inbound supply that can cover
 * a G2 material shortage and that G5 will accept receipts against.
 *
 * TODO(decisions): open question — does a covering PO need to be
 * sent/acknowledged, or does a draft count? We currently exclude
 * `draft` (workflow-figjam-content-pack Open Questions panel, item 6).
 */
const OPEN_PO_STATUSES = ['sent', 'acknowledged', 'partial'] as const;

const isOpenPo = (po: { status: string }) =>
  (OPEN_PO_STATUSES as readonly string[]).includes(po.status);

/** Outstanding (not yet received) qty on open PO lines for a product. */
const openPoQtyFor = (productId: string): number =>
  mock.purchaseOrders
    .filter(isOpenPo)
    .flatMap((po) => po.lines ?? [])
    .filter((l) => l.productId === productId)
    .reduce((s, l) => s + Math.max(0, l.qty - (l.receivedQty ?? 0)), 0);

// ── Gate evaluators ────────────────────────────────────────────────

/** SO → Job: SO confirmed, product active, BoM exists for MTO lines. */
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
    if (route === 'mto') {
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

/**
 * Gate G2 · Plan → Make — fires on MO release (decision D4).
 * Checks: start/due dates set (`dates_missing`), ≥1 MO (`no_mos`),
 * every MO has a routing / operation sequence (`routing_missing`), and
 * material status OK — every BoM-explosion shortage is covered by free
 * stock or an open PO; a shortage with no covering PO blocks release
 * (`material_short`).
 */
export function evaluatePlanToMake(job: Job): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  if (!job.startDate || !job.dueDate) {
    errors.push({
      code: 'dates_missing',
      message: `Job ${job.jobNumber} needs start + due dates before release.`,
    });
  }
  const mos = mock.manufacturingOrders.filter((m) => m.jobId === job.id);
  if (mos.length === 0) {
    errors.push({
      code: 'no_mos',
      message: `Job ${job.jobNumber} has no Manufacturing Orders. Run MRP + Schedule first.`,
      fixUrl: `/plan/jobs/${job.id}`,
    });
  }
  for (const mo of mos) {
    // Routing = the MO's operation sequence. In the mock model that is
    // its Work Order rows (or, for legacy fixtures, the `workOrders`
    // count seeded on the MO).
    const hasRouting =
      mo.workOrders > 0 ||
      mock.workOrders.some((w) => w.manufacturingOrderId === mo.id);
    if (!hasRouting) {
      errors.push({
        code: 'routing_missing',
        message: `MO ${mo.moNumber} has no routing — add the Work Order operation sequence before release.`,
        fixUrl: `/make/manufacturing-orders/${mo.id}`,
      });
    }
    // Material status: explode the MO product's BoM; any shortage not
    // covered by outstanding qty on an open PO blocks release. (Free
    // stock is already netted off inside `explodeBom`'s qtyShort.)
    // Mock simplification: open-PO qty is not apportioned across MOs
    // competing for the same component.
    for (const demand of explodeBom(mo.productId, mo.qty ?? 1)) {
      if (demand.qtyShort <= 0) continue;
      const coveringQty = openPoQtyFor(demand.productId);
      if (coveringQty < demand.qtyShort) {
        const component = findProduct(demand.productId);
        errors.push({
          code: 'material_short',
          message: `MO ${mo.moNumber}: ${component?.partNumber ?? demand.productId} short ${demand.qtyShort} with no covering open PO (free stock ${demand.qtyOnHand}, on order ${coveringQty}).`,
          fixUrl: '/buy/orders/new',
        });
      }
    }
  }
  return errors;
}

/**
 * Publish-time check for an ETO engineering Job's BoM (decision D7) —
 * NOT a spine gate. The customer drawing approval gates BoM publish
 * (and therefore MO creation): publish requires
 * `approvalStatus === 'approved'` OR a recorded internal waiver
 * (who/why on {@link Job.waiver}). Failure code: `bom_unapproved`.
 */
export function evaluateBomPublish(engineeringJob: Job): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  if (engineeringJob.source !== 'engineering') {
    errors.push({
      code: 'not_engineering_job',
      message: `Job ${engineeringJob.jobNumber} is not an engineering Job — only engineering Jobs publish BoMs.`,
    });
    return errors;
  }
  if (engineeringJob.approvalStatus !== 'approved' && !engineeringJob.waiver) {
    errors.push({
      code: 'bom_unapproved',
      message: `Job ${engineeringJob.jobNumber}: customer drawing approval is ${
        engineeringJob.approvalStatus === 'submitted_for_approval'
          ? 'still pending on the customer portal'
          : engineeringJob.approvalStatus === 'revision_requested'
            ? 'in revision — the customer requested changes'
            : 'not requested yet'
      }. Publish needs approval or a recorded waiver (who/why).`,
      fixUrl: '/plan/engineering-jobs',
    });
  }
  return errors;
}

/** Make → Ship: all WOs complete, QC decisions final. */
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
        message: `${failedQc.length} Work Order(s) failed QC. Record dispositions before dispatch.`,
      });
    }
  }
  return errors;
}

// ── Gate G4 · Ship → Book (milestone-aware, decision D5) ──────────

/** Display labels for the four payment-milestone events. */
export const MILESTONE_EVENT_LABELS: Record<PaymentMilestoneEvent, string> = {
  order_confirmed: 'Order confirmed',
  dispatch: 'Dispatch',
  delivery: 'Delivery',
  completion: 'Completion',
};

/**
 * Effective milestone schedule for a PaymentTerm (decision D5).
 * Precedence: explicit `milestones` → legacy `depositPct` migrated to
 * `[{order_confirmed, depositPct}, {completion, remainder}]` → the
 * default `[{dispatch, 100}]`.
 */
export function milestonesForTerm(term?: PaymentTerm): PaymentMilestone[] {
  if (term?.milestones && term.milestones.length > 0) return term.milestones;
  if (term?.depositPct != null && term.depositPct > 0) {
    if (term.depositPct >= 100) return [{ event: 'order_confirmed', pct: 100 }];
    return [
      { event: 'order_confirmed', pct: term.depositPct },
      { event: 'completion', pct: 100 - term.depositPct },
    ];
  }
  return [{ event: 'dispatch', pct: 100 }];
}

/** The customer's PaymentTerm for an SO, falling back to the global default. */
export function paymentTermForSalesOrder(so: SalesOrder): PaymentTerm | undefined {
  const customer = mock.customers.find((c) => c.id === so.customerId);
  return (
    mock.paymentTerms.find((t) => t.id === customer?.paymentTermsId) ??
    mock.paymentTerms.find((t) => t.isDefault)
  );
}

/**
 * Dedup check for `milestone_already_invoiced`. Key is (SO, event) for
 * order_confirmed/completion — they fire once per SO — but
 * (SO, event, shipmentId) for dispatch/delivery, which fire once PER
 * SHIPMENT (one pro-rated invoice each; a second partial shipment is a
 * NEW invoice, not a duplicate).
 */
export function milestoneInvoiceExists(
  salesOrderId: string,
  event: PaymentMilestoneEvent,
  shipmentId?: string,
): boolean {
  const perShipment = event === 'dispatch' || event === 'delivery';
  return mock.sellInvoices.some(
    (inv) =>
      inv.salesOrderId === salesOrderId &&
      inv.milestoneEvent === event &&
      (!perShipment || inv.shipmentId === shipmentId),
  );
}

/**
 * Resolve which shipment a dispatch/delivery milestone invoice covers.
 * Explicit `shipmentId` wins; otherwise the next eligible shipment —
 * the first not yet invoiced for this event (for delivery, preferring
 * ones with a PoD recorded). Falls back to the first shipment so the
 * dedup failure can surface. Returns undefined for order-level events.
 */
function resolveMilestoneShipment(
  so: SalesOrder,
  event: PaymentMilestoneEvent,
  shipmentId?: string,
): Shipment | undefined {
  if (event !== 'dispatch' && event !== 'delivery') return undefined;
  const ships = mock.shipments.filter((s) => s.salesOrderId === so.id);
  if (shipmentId) return ships.find((s) => s.id === shipmentId);
  const uninvoiced = ships.filter((s) => !milestoneInvoiceExists(so.id, event, s.id));
  if (event === 'delivery') {
    const delivered = uninvoiced.find((s) => Boolean(s.actualDelivery));
    if (delivered) return delivered;
  }
  return uninvoiced[0] ?? ships[0];
}

/**
 * Invoice amount for a milestone: `pct` × order total, pro-rated to
 * the shipment's lines for dispatch/delivery events. A shipment
 * without `lineIds` covers the whole order. Rounded to cents.
 */
export function milestoneInvoiceAmount(
  so: SalesOrder,
  milestone: PaymentMilestone,
  shipment?: Shipment,
): number {
  let base = so.total;
  const perShipment = milestone.event === 'dispatch' || milestone.event === 'delivery';
  if (perShipment && shipment?.lineIds?.length && so.lines?.length) {
    const value = (l: SalesOrderLine) => l.qty * l.unitPrice;
    const orderValue = so.lines.reduce((s, l) => s + value(l), 0);
    const shippedValue = so.lines
      .filter((l) => shipment.lineIds!.includes(l.id))
      .reduce((s, l) => s + value(l), 0);
    if (orderValue > 0) base = so.total * (shippedValue / orderValue);
  }
  return Math.round(base * milestone.pct) / 100;
}

/**
 * Gate G4 · Ship → Book — fires on invoice raise (decision D5).
 * REPLACES the old hard-coded "PoD recorded" check (evaluateShipToBook).
 *
 * Asks "has THIS milestone's event actually happened?":
 * - `order_confirmed`: SO confirmed (no shipment needed)
 * - `dispatch`: a shipment exists for the lines being invoiced
 * - `delivery`: shipment exists AND PoD (`actualDelivery`) recorded
 * - `completion`: every line has shipped
 *
 * …then dedups via {@link milestoneInvoiceExists} — (SO, event) for
 * order_confirmed/completion, (SO, event, shipmentId) for
 * dispatch/delivery.
 *
 * Failure codes: `milestone_not_reached`, `milestone_already_invoiced`,
 * `no_shipment`, `undelivered` (delivery milestones only).
 */
export function evaluateInvoiceMilestone(
  so: SalesOrder,
  milestone: PaymentMilestone,
  shipmentId?: string,
): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  const event = milestone.event;
  const label = MILESTONE_EVENT_LABELS[event].toLowerCase();
  const shipment = resolveMilestoneShipment(so, event, shipmentId);

  switch (event) {
    case 'order_confirmed': {
      const confirmed =
        so.status === 'confirmed' ||
        so.status === 'in_production' ||
        so.status === 'shipped' ||
        so.status === 'invoiced';
      if (!confirmed) {
        errors.push({
          code: 'milestone_not_reached',
          message: `Sales Order ${so.orderNumber} is not confirmed yet — the ${label} milestone (${milestone.pct}%) cannot be invoiced.`,
          fixUrl: `/sell/orders/${so.id}`,
        });
      }
      break;
    }
    case 'dispatch': {
      if (!shipment) {
        errors.push({
          code: 'no_shipment',
          message: `Sales Order ${so.orderNumber} has no shipment — the ${label} milestone (${milestone.pct}%) invoices per shipment.`,
          fixUrl: '/ship/orders',
        });
      }
      break;
    }
    case 'delivery': {
      if (!shipment) {
        errors.push({
          code: 'no_shipment',
          message: `Sales Order ${so.orderNumber} has no shipment — the ${label} milestone (${milestone.pct}%) invoices per delivered shipment.`,
          fixUrl: '/ship/orders',
        });
      } else if (!shipment.actualDelivery) {
        errors.push({
          code: 'undelivered',
          message: `Shipment ${shipment.shipmentNumber} has no Proof of Delivery yet — the ${label} milestone (${milestone.pct}%) needs the PoD recorded.`,
          fixUrl: '/ship/orders',
        });
      }
      break;
    }
    case 'completion': {
      const lines = (so.lines ?? []).filter((l) => l.status !== 'cancelled');
      const allShipped =
        lines.length > 0
          ? lines.every((l) => l.status === 'shipped')
          : so.status === 'shipped' || so.status === 'invoiced';
      if (!allShipped) {
        errors.push({
          code: 'milestone_not_reached',
          message: `Sales Order ${so.orderNumber} still has unshipped lines — the ${label} milestone (${milestone.pct}%) fires once every line has shipped.`,
          fixUrl: `/sell/orders/${so.id}`,
        });
      }
      break;
    }
  }

  if (errors.length === 0 && milestoneInvoiceExists(so.id, event, shipment?.id)) {
    const scope =
      event === 'dispatch' || event === 'delivery'
        ? ` for shipment ${shipment?.shipmentNumber ?? shipment?.id}`
        : '';
    errors.push({
      code: 'milestone_already_invoiced',
      message: `The ${label} milestone (${milestone.pct}%) is already invoiced${scope} on ${so.orderNumber}.`,
      fixUrl: '/sell/invoices',
    });
  }
  return errors;
}

/**
 * Gate G5 · Receiving — fires on Goods Receipt accept (decision D4).
 * Checks every GR line matches an open PO line — right product, PO not
 * cancelled/closed (`po_mismatch`) — and that the received qty is
 * within tolerance of the PO line qty (`qty_out_of_tolerance`, see
 * {@link RECEIVING_QTY_TOLERANCE}).
 *
 * Under-receipt is NOT blocked: a short delivery is a normal partial
 * receipt (PO status → `partial`); only over-receipt beyond tolerance
 * blocks accept. Subcontract returns come back through this same gate
 * against the subcontractor's PO.
 */
export function evaluateGateReceiving(gr: GoodsReceipt): GateFailureDetail[] {
  const errors: GateFailureDetail[] = [];
  const po = mock.purchaseOrders.find((p) => p.id === gr.poId);
  if (!po) {
    errors.push({
      code: 'po_mismatch',
      message: `Goods Receipt ${gr.receiptNumber} references PO ${gr.poNumber || gr.poId}, which does not exist.`,
    });
    return errors;
  }
  if (po.status === 'cancelled' || po.status === 'received') {
    errors.push({
      code: 'po_mismatch',
      message: `PO ${po.poNumber} is ${po.status === 'received' ? 'closed (fully received)' : 'cancelled'} — it is not open for receiving.`,
      fixUrl: `/buy/orders/${po.id}`,
    });
    return errors;
  }
  for (const item of gr.items) {
    const line = po.lines?.find((l) => l.productId === item.productId);
    if (!line) {
      const product = findProduct(item.productId);
      errors.push({
        code: 'po_mismatch',
        message: `${product?.partNumber ?? item.description ?? item.productId} is not a line on PO ${po.poNumber}.`,
        fixUrl: `/buy/orders/${po.id}`,
      });
      continue;
    }
    const maxAccept = line.qty * (1 + RECEIVING_QTY_TOLERANCE);
    if (item.receivedQty > maxAccept) {
      errors.push({
        code: 'qty_out_of_tolerance',
        message: `${line.description}: received ${item.receivedQty} exceeds PO line qty ${line.qty} by more than ${RECEIVING_QTY_TOLERANCE * 100}% tolerance.`,
        fixUrl: `/buy/orders/${po.id}`,
      });
    }
  }
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════
// Phase B1 — MTO keystone
// ═══════════════════════════════════════════════════════════════════════

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const today = () => new Date().toISOString().slice(0, 10);

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Shift an ISO `yyyy-mm-dd` date by `days` (negative shifts earlier). */
function shiftIsoDate(iso: string, days: number): string {
  if (!days || !iso) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── VO money helpers (decision D8) ─────────────────────────────────

/** Total already invoiced against an SO (any non-void invoice linked to it). */
function invoicedTotalForSo(salesOrderId: string): number {
  return mock.sellInvoices
    .filter((i) => i.salesOrderId === salesOrderId && i.status !== 'void')
    .reduce((s, i) => s + i.amount, 0);
}

/**
 * The uninvoiced remainder of an SO — order total minus invoices
 * already raised, clamped at 0. A VO descope beyond this remainder
 * must raise a Credit Note (decision D8).
 */
export function uninvoicedRemainderForSo(so: SalesOrder): number {
  return Math.max(0, round2(so.total - invoicedTotalForSo(so.id)));
}

/** Recursively freeze a snapshot so baseline immutability is enforced. */
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) deepFreeze(value);
    Object.freeze(obj);
  }
  return obj;
}

/**
 * Capture the immutable pre-variation baseline at VO raise time
 * (decision D8): job dates/value/cost, the MO list with qtys, the
 * order total and the uninvoiced remainder. Deep-frozen — approval
 * amends the LIVE records, so this snapshot is the only "before".
 */
function captureVariationBaseline(so: SalesOrder): VariationBaseline {
  const job =
    mock.jobs.find((j) => j.id === so.jobId) ??
    mock.jobs.find((j) => j.salesOrderId === so.id && j.source === 'sales_order') ??
    mock.jobs.find((j) => j.salesOrderId === so.id);
  const mos = job
    ? mock.manufacturingOrders
        .filter((m) => m.jobId === job.id)
        .map((m) => ({
          id: m.id,
          moNumber: m.moNumber,
          productId: m.productId,
          productName: m.productName,
          status: m.status,
          qty: m.qty,
          dueDate: m.dueDate,
        }))
    : [];
  return deepFreeze({
    capturedAt: new Date().toISOString(),
    soTotal: so.total,
    uninvoicedRemainder: uninvoicedRemainderForSo(so),
    jobId: job?.id,
    jobNumber: job?.jobNumber,
    jobStartDate: job?.startDate,
    jobDueDate: job?.dueDate,
    jobValue: job?.value,
    jobEstimatedHours: job?.estimatedHours,
    mos,
  });
}

/** Shared Credit Note constructor — `raiseCreditNote` + the VO descope path. */
function buildCreditNote(input: {
  customerId: string;
  amount: number;
  reason: string;
  salesOrderId?: string;
  variationOrderId?: string;
  returnId?: string;
}): CreditNote {
  const cn: CreditNote = {
    id: newId('cn'),
    creditNoteNumber: `CN-${new Date().getFullYear()}-${(mock.creditNotes.length + 100).toString().padStart(4, '0')}`,
    customerId: input.customerId,
    salesOrderId: input.salesOrderId,
    variationOrderId: input.variationOrderId,
    returnId: input.returnId,
    amount: round2(input.amount),
    reason: input.reason,
    status: 'draft',
    xeroSyncStatus: 'pending',
  };
  mock.creditNotes.push(cn);
  return cn;
}

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
 * Confirm a Sales Order — the keystone handoff (decision D2: one Job
 * per Sales Order). Creates ONE production Job covering the order's
 * manufactured (mto + eto) lines, then walks lines and dispatches per
 * `line.routeOverride ?? product.defaultRoute`:
 *
 *  - mto → ManufacturingOrder created under the order's Job, carrying
 *    the persisted line link (`salesOrderLineId`), `qty` and `startDate`.
 *  - stock_sale → stock reserved + PickList created; no Job involvement.
 *  - eto → child engineering Job created with `parentJobId` pointing at
 *    the order's Job; its MOs land under the parent Job once the
 *    approved BoM is published.
 *
 * Pure stock-sale orders create NO Job at all.
 * Returns the updated SO, the order's Job (when one exists), and a
 * per-line dispatch report.
 */
export interface ConfirmSalesOrderResult {
  salesOrder: SalesOrder;
  /**
   * The single production Job covering the order's manufactured lines.
   * Absent for pure stock-sale orders ("no Job — pick list raised").
   */
  job?: Job;
  perLine: Array<{
    lineId: string;
    route: ProductRoute;
    /** MO created under the order's Job (mto lines). */
    manufacturingOrderId?: string;
    /** Child engineering Job (eto lines). */
    engineeringJobId?: string;
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

    // ONE Job per Sales Order (decision D2), covering manufactured
    // (mto + eto) lines only. Pure stock-sale orders create no Job.
    const manufacturedLines = so.lines.filter((l) => {
      const r = lineRoute(l);
      return r === 'mto' || r === 'eto';
    });

    let orderJob: Job | undefined;
    if (manufacturedLines.length > 0) {
      orderJob = {
        id: newId('job'),
        jobNumber: `JOB-${new Date().getFullYear()}-${(mock.jobs.length + 100).toString().padStart(4, '0')}`,
        title: `${so.orderNumber} — ${so.customerName}`,
        customerId: so.customerId,
        customerName: so.customerName,
        salesOrderId: so.id,
        status: 'planned',
        priority: 'medium',
        startDate: today(),
        dueDate: so.deliveryDate,
        estimatedHours: manufacturedLines.reduce((s, l) => s + l.qty * 4, 0),
        actualHours: 0,
        value: manufacturedLines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
        progress: 0,
        assignedTo: employeeIdForDefaults(),
        source: 'sales_order',
        qty: manufacturedLines.reduce((s, l) => s + l.qty, 0),
      };
      mock.jobs.push(orderJob);
      so.jobId = orderJob.id;
    }

    const perLine: ConfirmSalesOrderResult['perLine'] = [];
    for (const line of so.lines) {
      const route = lineRoute(line);
      const product = findProduct(line.productId)!;
      if (route === 'mto' && orderJob) {
        // Each manufactured line becomes an MO under the order's Job —
        // the persisted line → MO link is `salesOrderLineId`.
        const mo: ManufacturingOrder = {
          id: newId('mo'),
          moNumber: `MO-${new Date().getFullYear()}-${(mock.manufacturingOrders.length + 100).toString().padStart(4, '0')}`,
          productId: line.productId,
          productName: product.description,
          jobId: orderJob.id,
          jobNumber: orderJob.jobNumber,
          customerId: orderJob.customerId,
          customerName: orderJob.customerName,
          status: 'draft',
          priority: orderJob.priority,
          dueDate: orderJob.dueDate,
          progress: 0,
          workOrders: 0,
          operatorId: employeeIdForDefaults(),
          operatorName: mock.employees[0]?.name ?? 'Unassigned',
          salesOrderLineId: line.id,
          qty: line.qty,
          startDate: today(),
        };
        mock.manufacturingOrders.push(mo);
        line.status = 'in_production';
        perLine.push({ lineId: line.id, route, manufacturingOrderId: mo.id });
      } else if (route === 'stock_sale') {
        const pickList = this._reserveAndCreatePickList(so, line);
        perLine.push({
          lineId: line.id,
          route,
          pickListId: pickList.id,
          note: 'No Job for this line — pick list raised.',
        });
      } else if (route === 'eto' && orderJob) {
        const engJob = this._createEngineeringJob(so, line, orderJob.id);
        perLine.push({
          lineId: line.id,
          route,
          engineeringJobId: engJob.id,
          note: 'Engineering Job created; MOs land under the parent Job once the approved BoM is published.',
        });
      }
    }

    so.status = manufacturedLines.length > 0 ? 'in_production' : 'confirmed';
    return { salesOrder: so, job: orderJob, perLine };
  },

  // ── B2: Stock Sale fast path ─────────────────────────────────
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

  // ── G2 action: release an MO to the floor ──────────────────────
  /**
   * Release a draft/confirmed Manufacturing Order to the floor. Runs
   * gate G2 (`evaluatePlanToMake`) against the MO's Job and throws
   * {@link GateFailure} when blocked; on pass the MO moves to
   * `in_progress` (and its Job follows if still draft/planned).
   */
  async releaseManufacturingOrder(manufacturingOrderId: string): Promise<ManufacturingOrder> {
    await delay();
    const mo = mock.manufacturingOrders.find((m) => m.id === manufacturingOrderId);
    if (!mo) throw new Error(`Manufacturing Order ${manufacturingOrderId} not found.`);
    if (mo.status !== 'draft' && mo.status !== 'confirmed') {
      throw new Error(`MO ${mo.moNumber} is ${mo.status} — only draft or confirmed MOs can be released.`);
    }
    const job = mock.jobs.find((j) => j.id === mo.jobId);
    if (!job) throw new Error(`Job ${mo.jobId} for MO ${mo.moNumber} not found.`);
    const failures = evaluatePlanToMake(job);
    if (failures.length > 0) throw new GateFailure(failures);
    mo.status = 'in_progress';
    if (job.status === 'draft' || job.status === 'planned') {
      job.status = 'in_progress';
    }
    return mo;
  },

  // ── G5 action: accept a Goods Receipt ──────────────────────────
  /**
   * Accept arrived goods against a PO. Builds the GoodsReceipt, runs
   * gate G5 (`evaluateGateReceiving`) and throws {@link GateFailure}
   * when blocked; on pass it persists the receipt, books a `gr`
   * StockMovement per line into raw stock, updates inventory + PO line
   * receivedQty, and flips the PO to `partial` / `received`.
   */
  async receiveGoods(input: {
    poId: string;
    lines: Array<{ productId: string; qty: number }>;
    receivedBy?: string;
  }): Promise<{ goodsReceipt: GoodsReceipt; stockMovements: StockMovement[] }> {
    await delay();
    const po = mock.purchaseOrders.find((p) => p.id === input.poId);
    if (!po) throw new Error(`Purchase Order ${input.poId} not found.`);
    if (input.lines.length === 0 || input.lines.every((l) => l.qty <= 0)) {
      throw new Error('Nothing to receive — enter a quantity on at least one line.');
    }
    const receiptLines = input.lines.filter((l) => l.qty > 0);
    const goodsReceipt: GoodsReceipt = {
      id: newId('gr'),
      receiptNumber: `GR-${new Date().getFullYear()}-${(mock.goodsReceipts.length + 100).toString().padStart(4, '0')}`,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      date: today(),
      items: receiptLines.map((l) => {
        const poLine = po.lines?.find((pl) => pl.productId === l.productId);
        return {
          productId: l.productId,
          description: poLine?.description ?? findProduct(l.productId)?.description ?? l.productId,
          orderedQty: poLine?.qty ?? 0,
          receivedQty: l.qty,
          acceptedQty: l.qty,
        };
      }),
    };

    const failures = evaluateGateReceiving(goodsReceipt);
    if (failures.length > 0) throw new GateFailure(failures);

    mock.goodsReceipts.push(goodsReceipt);
    const movements: StockMovement[] = [];
    for (const l of receiptLines) {
      const poLine = po.lines?.find((pl) => pl.productId === l.productId)!;
      poLine.receivedQty = (poLine.receivedQty ?? 0) + l.qty;
      po.received += l.qty * (poLine.unitPrice ?? 0);
      // Book into raw stock (FG put-away is a separate flow).
      const inv = mock.inventoryRecords.find(
        (i) => i.productId === l.productId && i.locationId === 'loc-raw',
      );
      if (inv) {
        inv.qtyOnHand += l.qty;
      } else {
        mock.inventoryRecords.push({
          id: newId('inv'),
          productId: l.productId,
          locationId: 'loc-raw',
          qtyOnHand: l.qty,
          qtyReserved: 0,
        });
      }
      const movement: StockMovement = {
        id: newId('sm'),
        productId: l.productId,
        toLocationId: 'loc-raw',
        qty: l.qty,
        reason: 'gr',
        at: new Date().toISOString(),
        refType: 'po',
        refId: po.id,
      };
      mock.stockMovements.push(movement);
      movements.push(movement);
    }
    const fullyReceived = (po.lines ?? []).every(
      (pl) => (pl.receivedQty ?? 0) >= pl.qty,
    );
    po.status = fullyReceived ? 'received' : 'partial';
    return { goodsReceipt, stockMovements: movements };
  },

  // ── G4 action: raise an invoice at a payment-term milestone ─────
  /**
   * Raise the invoice for one milestone of the customer's payment-term
   * schedule (decision D5). Runs gate G4 (`evaluateInvoiceMilestone`)
   * and throws {@link GateFailure} when blocked.
   *
   * Amount = `pct` × order total — pro-rated to the shipment's lines
   * for dispatch/delivery events (one invoice per shipment). The
   * invoice is stamped with `{ milestoneEvent, milestonePct,
   * shipmentId? }` so the dedup key survives; due date = issue date +
   * `PaymentTerm.days` (net terms per invoice).
   */
  async raiseInvoiceForMilestone(input: {
    salesOrderId: string;
    event: PaymentMilestoneEvent;
    shipmentId?: string;
  }): Promise<SellInvoice> {
    await delay();
    const so = mock.salesOrders.find((s) => s.id === input.salesOrderId);
    if (!so) throw new Error(`Sales Order ${input.salesOrderId} not found.`);

    const term = paymentTermForSalesOrder(so);
    const schedule = milestonesForTerm(term);
    const milestone = schedule.find((m) => m.event === input.event);
    if (!milestone) {
      throw new Error(
        `Payment term "${term?.label ?? 'default'}" has no ${MILESTONE_EVENT_LABELS[input.event].toLowerCase()} milestone.`,
      );
    }

    const shipment = resolveMilestoneShipment(so, input.event, input.shipmentId);
    const failures = evaluateInvoiceMilestone(so, milestone, shipment?.id);
    if (failures.length > 0) throw new GateFailure(failures);

    const perShipment = input.event === 'dispatch' || input.event === 'delivery';
    const amount = milestoneInvoiceAmount(so, milestone, shipment);

    const issueDate = today();
    const due = new Date(issueDate);
    due.setDate(due.getDate() + (term?.days ?? 30));

    const invoice: SellInvoice = {
      id: newId('inv'),
      invoiceNumber: `INV-${new Date().getFullYear()}-${(mock.sellInvoices.length + 300).toString().padStart(4, '0')}`,
      customerId: so.customerId,
      customerName: so.customerName,
      salesOrderId: so.id,
      date: issueDate,
      dueDate: due.toISOString().slice(0, 10),
      amount,
      paidAmount: 0,
      status: 'sent',
      milestoneEvent: milestone.event,
      milestonePct: milestone.pct,
      shipmentId: perShipment ? shipment?.id : undefined,
    };
    mock.sellInvoices.push(invoice);

    // Once milestone invoices cover the order total, the SO is fully
    // invoiced (cent-rounding tolerance).
    const invoicedTotal = mock.sellInvoices
      .filter((i) => i.salesOrderId === so.id && i.milestoneEvent)
      .reduce((s, i) => s + i.amount, 0);
    if (invoicedTotal >= so.total - 0.01) so.status = 'invoiced';

    return invoice;
  },

  // ── B4: ETO — child engineering Job under the order's Job ──────
  _createEngineeringJob(so: SalesOrder, line: SalesOrderLine, parentJobId?: string): Job {
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
      parentJobId,
      qty: line.qty,
      approvalStatus: 'in_design',
    };
    mock.jobs.push(job);
    line.status = 'in_production';
    return job;
  },

  // ── D7: ETO customer drawing-approval state machine ─────────────
  /**
   * Submit an engineering Job's drawings/model for customer approval
   * (decision D7): `in_design | revision_requested →
   * submitted_for_approval`. In production this publishes the package
   * to the customer portal (MirrorView markups as the review surface).
   */
  async submitForApproval(engineeringJobId: string): Promise<Job> {
    await delay();
    const job = mock.jobs.find((j) => j.id === engineeringJobId);
    if (!job) throw new Error(`Engineering Job ${engineeringJobId} not found.`);
    if (job.source !== 'engineering') {
      throw new Error(`Job ${job.jobNumber} is not an engineering Job.`);
    }
    const from = job.approvalStatus ?? 'in_design';
    if (from !== 'in_design' && from !== 'revision_requested') {
      throw new Error(
        `Job ${job.jobNumber} is ${from.replace(/_/g, ' ')} — only in-design or revision-requested Jobs can be submitted.`,
      );
    }
    job.approvalStatus = 'submitted_for_approval';
    return job;
  },

  /**
   * Record the customer's decision on a submitted engineering Job
   * (decision D7): `submitted_for_approval → approved |
   * revision_requested`. In production this fires from the customer
   * portal; the UI's approve / request-revision buttons are demo
   * stand-ins for that portal action.
   */
  async approveEngineeringJob(
    engineeringJobId: string,
    input: { decision: 'approved' | 'revision_requested'; by: string },
  ): Promise<Job> {
    await delay();
    const job = mock.jobs.find((j) => j.id === engineeringJobId);
    if (!job) throw new Error(`Engineering Job ${engineeringJobId} not found.`);
    if (job.source !== 'engineering') {
      throw new Error(`Job ${job.jobNumber} is not an engineering Job.`);
    }
    if (job.approvalStatus !== 'submitted_for_approval') {
      throw new Error(
        `Job ${job.jobNumber} is not awaiting approval — submit it for approval first.`,
      );
    }
    job.approvalStatus = input.decision;
    return job;
  },

  /**
   * Record an internal waiver of the customer drawing approval
   * (decision D7): who waived it and why, stamped on the engineering
   * Job. `evaluateBomPublish` passes on a waiver without `approved`.
   */
  async waiveBomApproval(
    engineeringJobId: string,
    input: { by: string; reason: string },
  ): Promise<Job> {
    await delay();
    const job = mock.jobs.find((j) => j.id === engineeringJobId);
    if (!job) throw new Error(`Engineering Job ${engineeringJobId} not found.`);
    if (job.source !== 'engineering') {
      throw new Error(`Job ${job.jobNumber} is not an engineering Job.`);
    }
    if (!input.by.trim() || !input.reason.trim()) {
      throw new Error('A waiver must record who waived approval and why.');
    }
    job.waiver = { by: input.by.trim(), reason: input.reason.trim(), at: new Date().toISOString() };
    return job;
  },

  /**
   * Publish an engineering Job's approved BoM (decision D7). Gated on
   * {@link evaluateBomPublish} — throws {@link GateFailure} with
   * `bom_unapproved` unless the customer approved (or a waiver is
   * recorded). On pass: the BoM is published and Manufacturing Orders
   * are created under the PARENT Job (the order's Job, reachable via
   * `parentJobId`) — the old two-Job pattern's separate production Job
   * is gone. The engineering Job completes.
   */
  async publishBom(input: {
    engineeringJobId: string;
    productId: string;
    revision: string;
    components: Array<{
      productId: string;
      qtyPer: number;
      isManufactured: boolean;
    }>;
  }): Promise<{ bom: BillOfMaterials; parentJob: Job; manufacturingOrders: ManufacturingOrder[] }> {
    await delay();
    const engJob = mock.jobs.find((j) => j.id === input.engineeringJobId);
    if (!engJob) throw new Error(`Engineering Job ${input.engineeringJobId} not found.`);
    const failures = evaluateBomPublish(engJob);
    if (failures.length > 0) throw new GateFailure(failures);
    const parentJob = mock.jobs.find((j) => j.id === engJob.parentJobId);
    if (!parentJob) {
      throw new Error(
        `Engineering Job ${engJob.jobNumber} has no parent Job — MOs from a published BoM land under the order's Job.`,
      );
    }
    const bom: BillOfMaterials = {
      id: newId('bom'),
      productId: input.productId,
      revision: input.revision,
      components: input.components.map((c) => ({ ...c })),
      publishedAt: new Date().toISOString(),
      publishedBy: employeeIdForDefaults(),
    };
    mock.billsOfMaterials.push(bom);

    // MOs land under the PARENT Job (the order's Job) — one MO for the
    // engineered product, carrying the SO line link when resolvable.
    const so = mock.salesOrders.find((s) => s.id === engJob.salesOrderId);
    const soLine = so?.lines?.find((l) => l.productId === input.productId);
    const product = findProduct(input.productId);
    const mo: ManufacturingOrder = {
      id: newId('mo'),
      moNumber: `MO-${new Date().getFullYear()}-${(mock.manufacturingOrders.length + 100).toString().padStart(4, '0')}`,
      productId: input.productId,
      productName: product?.description ?? engJob.title.replace('Engineering — ', ''),
      jobId: parentJob.id,
      jobNumber: parentJob.jobNumber,
      customerId: parentJob.customerId,
      customerName: parentJob.customerName,
      status: 'draft',
      priority: parentJob.priority,
      dueDate: parentJob.dueDate,
      progress: 0,
      workOrders: 0,
      operatorId: employeeIdForDefaults(),
      operatorName: mock.employees[0]?.name ?? 'Unassigned',
      salesOrderLineId: soLine?.id,
      qty: soLine?.qty ?? engJob.qty ?? 1,
      startDate: today(),
    };
    mock.manufacturingOrders.push(mo);
    engJob.status = 'completed';
    return { bom, parentJob, manufacturingOrders: [mo] };
  },

  // ── B5: Variation Order — amend-in-place (decision D8) ────────
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
      // Immutable pre-variation snapshot (D8) — approval amends the
      // live Job in place, so this is the only record of the "before".
      baseline: captureVariationBaseline(parent),
    };
    mock.variationOrders.push(vo);
    return vo;
  },

  /**
   * Approve a Variation Order — decision D8: amend the LIVE Job and
   * its MOs in place. NO delta Job is spawned (that path is removed).
   *
   * - `so.total` moves by `costDelta`, so every un-raised milestone
   *   re-prices automatically through `raiseInvoiceForMilestone`'s
   *   pct × order total. Already-raised invoices are untouched.
   * - The Job's value moves by `costDelta`; its due date shifts by
   *   `scheduleDeltaDays`.
   * - Open MOs (not `done`) are amended in place: qty scaled to the
   *   new order value (mock-service approximation of the BoM diff),
   *   due dates shifted, and `needsReschedule` set for the Schedule
   *   Engine. Done MOs — and therefore all completed WOs — are
   *   preserved untouched.
   * - When a descope's reduction exceeds the uninvoiced remainder, a
   *   draft {@link CreditNote} is raised automatically for the
   *   difference (money already invoiced that is no longer owed).
   */
  async approveVariation(variationOrderId: string, approvedBy: string): Promise<{
    vo: VariationOrder;
    /** The LIVE order Job, amended in place (no new Job is created). */
    job?: Job;
    /** Open MOs amended + flagged `needsReschedule`. */
    amendedMos: ManufacturingOrder[];
    /** How the uninvoiced milestone remainder moved. */
    milestoneAdjustment: {
      previousTotal: number;
      newTotal: number;
      uninvoicedBefore: number;
      uninvoicedAfter: number;
    };
    /** Draft credit raised when a descope exceeds the uninvoiced remainder. */
    creditNote?: CreditNote;
  }> {
    await delay();
    const vo = mock.variationOrders.find((v) => v.id === variationOrderId);
    if (!vo) throw new Error(`VO ${variationOrderId} not found.`);
    if (vo.status === 'approved') {
      throw new Error(`${vo.voNumber} is already approved — the Job was amended at approval time.`);
    }
    const so = mock.salesOrders.find((s) => s.id === vo.parentSalesOrderId);
    if (!so) throw new Error(`Parent SO ${vo.parentSalesOrderId} not found.`);

    vo.status = 'approved';
    vo.approvedAt = new Date().toISOString();
    vo.approvedBy = approvedBy;

    // ── Money: re-price the remaining UNINVOICED milestones ──────
    const previousTotal = so.total;
    const invoiced = invoicedTotalForSo(so.id);
    const uninvoicedBefore = Math.max(0, round2(previousTotal - invoiced));
    const newTotal = Math.max(0, round2(previousTotal + vo.costDelta));
    so.total = newTotal;
    const uninvoicedAfter = Math.max(0, round2(newTotal - invoiced));

    // Descope beyond the uninvoiced remainder → the customer has been
    // invoiced for value that no longer exists. Raise a draft Credit
    // Note for the difference (D8); already-raised invoices stay put.
    let creditNote: CreditNote | undefined;
    const reduction = -vo.costDelta;
    if (reduction > 0 && reduction > uninvoicedBefore) {
      creditNote = buildCreditNote({
        customerId: so.customerId,
        salesOrderId: so.id,
        variationOrderId: vo.id,
        amount: round2(reduction - uninvoicedBefore),
        reason: `${vo.voNumber} descope exceeds the uninvoiced remainder on ${so.orderNumber} — credit for value already invoiced.`,
      });
    }
    // Milestone invoices already cover (or exceed) the amended total —
    // nothing is left to raise.
    if (invoiced >= newTotal - 0.01 && invoiced > 0) so.status = 'invoiced';

    // ── Job: amend the LIVE Job in place (no delta Job) ──────────
    const job =
      mock.jobs.find((j) => j.id === so.jobId) ??
      mock.jobs.find((j) => j.salesOrderId === so.id && j.source === 'sales_order') ??
      mock.jobs.find((j) => j.salesOrderId === so.id);
    const amendedMos: ManufacturingOrder[] = [];
    if (job) {
      job.value = round2(job.value + vo.costDelta);
      job.dueDate = shiftIsoDate(job.dueDate, vo.scheduleDeltaDays);
      if (!job.variationChainId) job.variationChainId = vo.variationChainId;

      // Open MOs are amended in place; done MOs (and their completed
      // WOs) are preserved. Qty scales with the order value — the
      // mock-service stand-in for a real BoM/MO diff.
      const ratio = previousTotal > 0 ? newTotal / previousTotal : 1;
      for (const mo of mock.manufacturingOrders.filter(
        (m) => m.jobId === job.id && m.status !== 'done',
      )) {
        if (mo.qty != null) mo.qty = Math.max(0, Math.round(mo.qty * ratio));
        mo.dueDate = shiftIsoDate(mo.dueDate, vo.scheduleDeltaDays);
        mo.needsReschedule = true;
        amendedMos.push(mo);
      }
    }

    return {
      vo,
      job,
      amendedMos,
      milestoneAdjustment: { previousTotal, newTotal, uninvoicedBefore, uninvoicedAfter },
      creditNote,
    };
  },

  // ── Credit Notes (decisions D8/D13) ───────────────────────────
  /**
   * Raise a Credit Note — money owed back to the customer (VO descope
   * beyond the uninvoiced remainder, or an RMA credit). Starts `draft`;
   * `issueCreditNote` issues it and queues the Xero push (D11).
   */
  async raiseCreditNote(input: {
    customerId: string;
    amount: number;
    reason: string;
    salesOrderId?: string;
    variationOrderId?: string;
    returnId?: string;
  }): Promise<CreditNote> {
    await delay();
    if (!(input.amount > 0)) {
      throw new Error('Credit note amount must be greater than zero.');
    }
    return buildCreditNote(input);
  },

  /** Issue a draft Credit Note — stamps `issuedAt` and syncs to Xero (mock: immediate). */
  async issueCreditNote(creditNoteId: string): Promise<CreditNote> {
    await delay();
    const cn = mock.creditNotes.find((c) => c.id === creditNoteId);
    if (!cn) throw new Error(`Credit note ${creditNoteId} not found.`);
    if (cn.status !== 'draft') {
      throw new Error(`Credit note ${cn.creditNoteNumber} is ${cn.status} — only drafts can be issued.`);
    }
    cn.status = 'issued';
    cn.issuedAt = new Date().toISOString();
    cn.xeroSyncStatus = 'synced'; // mock: the Xero push succeeds instantly
    return cn;
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

  /**
   * Record the disposition outcome on a QualityCheck (decision D9 —
   * QC owns disposition, no NCR entity): the chosen disposition, the
   * affected qty, the cost impact (scrap charges the Job — the cost
   * never leaves the job's P&L), and links to whatever the disposition
   * produced (rework WO / concession / supplier return).
   */
  async setQcDisposition(
    qualityCheckId: string,
    input: {
      disposition: QcDisposition;
      qty?: number;
      costImpact?: number;
      links?: QualityCheck['links'];
    },
  ): Promise<QualityCheck> {
    await delay();
    const qc = mock.qualityChecks.find((q) => q.id === qualityCheckId);
    if (!qc) throw new Error(`Quality check ${qualityCheckId} not found.`);
    qc.disposition = input.disposition;
    if (input.qty != null) qc.qty = input.qty;
    if (input.costImpact != null) qc.costImpact = input.costImpact;
    if (input.links) qc.links = { ...qc.links, ...input.links };
    return qc;
  },

  /**
   * Remake path after a scrap disposition (decision D9): create a
   * shortfall MO for the scrapped qty under the SAME Job, `draft` and
   * flagged `needsReschedule` so MRP + the Schedule Engine re-fire.
   */
  async createShortfallMo(input: { qualityCheckId: string }): Promise<ManufacturingOrder> {
    await delay();
    const qc = mock.qualityChecks.find((q) => q.id === input.qualityCheckId);
    if (!qc) throw new Error(`Quality check ${input.qualityCheckId} not found.`);
    if (qc.disposition !== 'scrap' || !qc.qty || qc.qty <= 0) {
      throw new Error('A shortfall MO needs a scrap disposition with the scrapped qty recorded.');
    }
    const wo = mock.workOrders.find((w) => w.id === qc.workOrderId);
    if (!wo) throw new Error(`Work Order ${qc.workOrderId} not found.`);
    const sourceMo = mock.manufacturingOrders.find((m) => m.id === wo.manufacturingOrderId);
    if (!sourceMo) {
      throw new Error(`MO ${wo.manufacturingOrderId} for Work Order ${wo.woNumber} not found.`);
    }
    const mo: ManufacturingOrder = {
      ...sourceMo,
      id: newId('mo'),
      moNumber: `${sourceMo.moNumber}-SF`,
      status: 'draft',
      progress: 0,
      workOrders: 0,
      qty: qc.qty,
      startDate: today(),
      needsReschedule: true,
    };
    mock.manufacturingOrders.push(mo);
    return mo;
  },

  /**
   * Return-to-vendor path (decision D9): raise a SupplierReturn for
   * the defective qty, linked to the originating Goods Receipt when
   * known and stamped onto the QualityCheck via
   * `links.supplierReturnId`. Debit against the Bill follows in Book.
   */
  async createSupplierReturn(input: {
    workOrderId: string;
    qty: number;
    reason: string;
    supplierId?: string;
    goodsReceiptId?: string;
    qualityCheckId?: string;
  }): Promise<SupplierReturn> {
    await delay();
    if (!(input.qty > 0)) throw new Error('Supplier return qty must be greater than zero.');
    if (!input.reason.trim()) throw new Error('A supplier return needs a reason.');
    const sr: SupplierReturn = {
      id: newId('sr'),
      workOrderId: input.workOrderId,
      supplierId: input.supplierId,
      goodsReceiptId: input.goodsReceiptId,
      qty: input.qty,
      reason: input.reason.trim(),
      status: 'raised',
    };
    mock.supplierReturns.push(sr);
    if (input.qualityCheckId) {
      const qc = mock.qualityChecks.find((q) => q.id === input.qualityCheckId);
      if (qc) {
        qc.disposition = 'return_to_vendor';
        qc.qty = input.qty;
        qc.links = { ...qc.links, supplierReturnId: sr.id };
      }
    }
    return sr;
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
          message: `Work Order ${parent.woNumber} has reached rework cap (depth 2). Escalate to a lead.`,
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
  evaluateBomPublish,
  evaluateInvoiceMilestone,
  evaluateGateReceiving,
  milestonesForTerm,
  milestoneInvoiceExists,
  paymentTermForSalesOrder,
};
