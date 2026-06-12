/**
 * End-to-end happy-path tests for the seven workflow archetypes wired
 * in `workflowService`. Each test exercises a different B-phase mutation
 * against the in-memory mock collections. We accept that mutations
 * persist between tests within the same file (matches production
 * Convex semantics — the demo tenant has shared state).
 */
import { describe, expect, it, beforeAll } from 'vitest';
import {
  workflowService,
  explodeBom,
  evaluateSoToJob,
  evaluatePlanToMake,
  evaluateBomPublish,
  evaluateGateReceiving,
  evaluateInvoiceMilestone,
  milestonesForTerm,
  RECEIVING_QTY_TOLERANCE,
  GateFailure,
} from '@/services/workflowService';
import * as mock from '@/services/mock';
import type {
  Customer,
  GoodsReceipt,
  InventoryRecord,
  Job,
  ManufacturingOrder,
  MaterialConsumptionLine,
  PaymentTerm,
  PurchaseOrder,
  SalesOrder,
  Shipment,
  WorkOrder,
} from '@/types/entities';

/**
 * Seed an SO line on the first fixture so `confirmSalesOrder` has
 * something to dispatch. Idempotent.
 */
beforeAll(() => {
  const target = mock.salesOrders[0];
  if (!target.lines || target.lines.length === 0) {
    target.lines = [
      {
        id: 'soline-test-1',
        salesOrderId: target.id,
        productId: 'prod-001', // MTO
        description: 'Mounting Bracket × 10',
        qty: 10,
        unitPrice: 24.5,
        status: 'pending',
      },
      {
        id: 'soline-test-2',
        salesOrderId: target.id,
        productId: 'prod-005', // stock_sale — picked from FG stock
        description: 'Cable Tray × 4',
        qty: 4,
        unitPrice: 38,
        status: 'pending',
      },
      {
        id: 'soline-test-3',
        salesOrderId: target.id,
        productId: 'prod-004', // ETO
        description: 'Server Rack × 1',
        qty: 1,
        unitPrice: 1250,
        status: 'pending',
      },
    ];
  }
});

describe('B1 — confirmSalesOrder (one Job per SO; MTO + stock + ETO dispatch)', () => {
  it('creates ONE Job per SO with MOs for mto lines, pick lists for stock lines, and a child engineering Job for eto lines', async () => {
    const jobsBefore = mock.jobs.length;
    const result = await workflowService.confirmSalesOrder(mock.salesOrders[0].id);
    expect(result.salesOrder.status).toBe('in_production');
    expect(result.perLine).toHaveLength(3);
    expect(result.perLine.map((p) => p.route).sort()).toEqual([
      'eto',
      'mto',
      'stock_sale',
    ]);

    // ONE order Job covering manufactured lines + ONE child engineering
    // Job for the eto line — never a Job per line.
    expect(result.job).toBeDefined();
    expect(mock.jobs.length).toBe(jobsBefore + 2);
    expect(result.salesOrder.jobId).toBe(result.job!.id);
    expect(result.job!.source).toBe('sales_order');

    // mto line → MO under the order's Job, persisting the line link.
    const mtoLine = result.perLine.find((p) => p.route === 'mto')!;
    expect(mtoLine.manufacturingOrderId).toBeTruthy();
    const mo = mock.manufacturingOrders.find((m) => m.id === mtoLine.manufacturingOrderId);
    expect(mo?.jobId).toBe(result.job!.id);
    expect(mo?.salesOrderLineId).toBe('soline-test-1');
    expect(mo?.qty).toBe(10);
    expect(mo?.startDate).toBeTruthy();

    // stock_sale line → pick list, no Job involvement.
    const stockLine = result.perLine.find((p) => p.route === 'stock_sale')!;
    expect(stockLine.pickListId).toBeTruthy();
    expect(stockLine.manufacturingOrderId).toBeUndefined();

    // eto line → child engineering Job parented to the order's Job.
    const etoLine = result.perLine.find((p) => p.route === 'eto')!;
    const engJob = mock.jobs.find((j) => j.id === etoLine.engineeringJobId);
    expect(engJob?.source).toBe('engineering');
    expect(engJob?.parentJobId).toBe(result.job!.id);
  });
});

describe('B1 — BoM explosion', () => {
  it('emits component demand with on-hand + shortage', () => {
    const demand = explodeBom('prod-003', 2);
    expect(demand.length).toBeGreaterThan(0);
    const plate = demand.find((d) => d.productId === 'prod-002');
    expect(plate?.qtyRequired).toBeGreaterThan(0);
    expect(plate?.qtyShort).toBeGreaterThanOrEqual(0);
  });

  it('flags manufactured components for nested-MO cascade', () => {
    const demand = explodeBom('prod-003', 1);
    const bracket = demand.find((d) => d.productId === 'prod-001');
    expect(bracket?.isManufactured).toBe(true);
  });
});

describe('B1 — gates', () => {
  it('flags inactive products', () => {
    const so = mock.salesOrders[1];
    so.lines = [
      {
        id: 'soline-gate-1',
        salesOrderId: so.id,
        productId: 'prod-001',
        description: 'x',
        qty: 1,
        unitPrice: 10,
        status: 'pending',
      },
    ];
    so.status = 'confirmed';
    const productSnapshot = mock.products.find((p) => p.id === 'prod-001')!;
    const wasActive = productSnapshot.isActive;
    productSnapshot.isActive = false;
    const failures = evaluateSoToJob(so);
    expect(failures.some((f) => f.code === 'product_inactive')).toBe(true);
    productSnapshot.isActive = wasActive;
  });
});

describe('B2 — Stock Sale fast path', () => {
  it('reserves stock + creates a PickList, and a pure stock-sale order creates NO Job', async () => {
    const so = mock.salesOrders[2];
    so.status = 'confirmed';
    so.lines = [
      {
        id: 'soline-stock-1',
        salesOrderId: so.id,
        productId: 'prod-005',
        description: 'Cable Tray × 2',
        qty: 2,
        unitPrice: 38,
        routeOverride: 'stock_sale',
        status: 'pending',
      },
    ];
    const jobsBefore = mock.jobs.length;
    const result = await workflowService.confirmSalesOrder(so.id);
    const stockLine = result.perLine.find((p) => p.route === 'stock_sale');
    expect(stockLine?.pickListId).toBeTruthy();
    const pl = mock.pickLists.find((p) => p.id === stockLine!.pickListId);
    expect(pl?.lines.length).toBeGreaterThan(0);
    // No Job at all for a pure stock-sale order.
    expect(result.job).toBeUndefined();
    expect(mock.jobs.length).toBe(jobsBefore);
    expect(result.salesOrder.status).toBe('confirmed');
  });
});

describe('B3 — MTS reorder monitor', () => {
  it('creates replenishment Jobs when stock falls below reorderPoint', async () => {
    // Drop prod-005 below reorder point.
    const inv = mock.inventoryRecords.find(
      (i) => i.productId === 'prod-005' && i.locationId === 'loc-fg',
    )!;
    inv.qtyOnHand = 50;
    const before = mock.jobs.length;
    const created = await workflowService.runReorderMonitor();
    expect(created.length).toBeGreaterThanOrEqual(1);
    expect(mock.jobs.length).toBeGreaterThan(before);
    expect(created[0].source).toBe('replenishment');
    expect(created[0].customerId).toBe('cust-stock');
  });

  it('does not double-fire while a replenishment Job is open', async () => {
    const beforeCount = mock.jobs.length;
    await workflowService.runReorderMonitor();
    // Same monitor pass shouldn't add another job for prod-005.
    const after = await workflowService.runReorderMonitor();
    expect(after.find((j) => j.title.includes('prod-005'))).toBeUndefined();
    expect(mock.jobs.length).toBe(beforeCount);
  });
});

// ── D7 factories — engineering Job + parent (order) Job ────────────

let d7Seq = 0;
function makeD7Jobs(approvalStatus?: Job['approvalStatus']): { engJob: Job; parentJob: Job } {
  d7Seq += 1;
  const base = {
    customerId: 'cust-001',
    customerName: 'TechCorp',
    priority: 'medium' as const,
    startDate: '2026-06-01',
    dueDate: '2026-07-01',
    estimatedHours: 10,
    actualHours: 0,
    value: 5000,
    progress: 0,
    assignedTo: 'emp-001',
  };
  const parentJob: Job = {
    ...base,
    id: `job-d7-parent-${d7Seq}`,
    jobNumber: `JOB-D7-${d7Seq}`,
    title: `D7 order Job ${d7Seq}`,
    status: 'planned',
    source: 'sales_order',
  };
  const engJob: Job = {
    ...base,
    id: `job-d7-eng-${d7Seq}`,
    jobNumber: `JOB-ENG-D7-${d7Seq}`,
    title: `Engineering — D7 fixture ${d7Seq}`,
    status: 'draft',
    source: 'engineering',
    parentJobId: parentJob.id,
    qty: 3,
    approvalStatus,
  };
  mock.jobs.push(parentJob, engJob);
  return { engJob, parentJob };
}

describe('D7 — evaluateBomPublish (approval gates BoM publish)', () => {
  it('blocks with bom_unapproved while not approved and no waiver', () => {
    for (const status of ['in_design', 'submitted_for_approval', 'revision_requested'] as const) {
      const { engJob } = makeD7Jobs(status);
      const failures = evaluateBomPublish(engJob);
      expect(failures).toHaveLength(1);
      expect(failures[0].code).toBe('bom_unapproved');
    }
    // Legacy job with no approvalStatus at all is also unapproved.
    const { engJob: legacy } = makeD7Jobs(undefined);
    expect(evaluateBomPublish(legacy).map((f) => f.code)).toEqual(['bom_unapproved']);
  });

  it('passes once approved', () => {
    const { engJob } = makeD7Jobs('approved');
    expect(evaluateBomPublish(engJob)).toEqual([]);
  });

  it('passes on a recorded waiver without approval', async () => {
    const { engJob } = makeD7Jobs('in_design');
    await workflowService.waiveBomApproval(engJob.id, {
      by: 'Dana Reeve (lead)',
      reason: 'Repeat geometry — customer pre-approved rev A drawings by email.',
    });
    expect(engJob.waiver?.by).toBe('Dana Reeve (lead)');
    expect(engJob.waiver?.at).toBeTruthy();
    expect(evaluateBomPublish(engJob)).toEqual([]);
  });

  it('rejects non-engineering Jobs', () => {
    const { parentJob } = makeD7Jobs('approved');
    expect(evaluateBomPublish(parentJob).map((f) => f.code)).toEqual(['not_engineering_job']);
  });
});

describe('D7 — approval state machine transitions', () => {
  it('submitForApproval: in_design → submitted_for_approval', async () => {
    const { engJob } = makeD7Jobs('in_design');
    const j = await workflowService.submitForApproval(engJob.id);
    expect(j.approvalStatus).toBe('submitted_for_approval');
  });

  it('approveEngineeringJob: submitted → approved | revision_requested; resubmit allowed after revision', async () => {
    const { engJob } = makeD7Jobs('in_design');
    await workflowService.submitForApproval(engJob.id);
    await workflowService.approveEngineeringJob(engJob.id, {
      decision: 'revision_requested',
      by: 'Customer (portal)',
    });
    expect(engJob.approvalStatus).toBe('revision_requested');
    // Revision loops back through submit.
    await workflowService.submitForApproval(engJob.id);
    await workflowService.approveEngineeringJob(engJob.id, {
      decision: 'approved',
      by: 'Customer (portal)',
    });
    expect(engJob.approvalStatus).toBe('approved');
  });

  it('rejects invalid transitions', async () => {
    const { engJob, parentJob } = makeD7Jobs('approved');
    // Cannot resubmit an approved Job.
    await expect(workflowService.submitForApproval(engJob.id)).rejects.toThrow(/only in-design/);
    // Cannot decide a Job that was never submitted.
    const { engJob: fresh } = makeD7Jobs('in_design');
    await expect(
      workflowService.approveEngineeringJob(fresh.id, { decision: 'approved', by: 'x' }),
    ).rejects.toThrow(/not awaiting approval/);
    // Non-engineering Jobs are rejected outright.
    await expect(workflowService.submitForApproval(parentJob.id)).rejects.toThrow(/not an engineering Job/);
    // Waivers must record who and why.
    const { engJob: blank } = makeD7Jobs('in_design');
    await expect(
      workflowService.waiveBomApproval(blank.id, { by: ' ', reason: '' }),
    ).rejects.toThrow(/who waived approval and why/);
  });
});

describe('B4 / D7 — publishBom creates MOs under the PARENT Job', () => {
  const components = [
    { productId: 'prod-001', qtyPer: 4, isManufactured: true },
    { productId: 'prod-002', qtyPer: 1, isManufactured: false },
  ];

  it('throws GateFailure (bom_unapproved) when the Job is not approved', async () => {
    const { engJob } = makeD7Jobs('submitted_for_approval');
    await expect(
      workflowService.publishBom({
        engineeringJobId: engJob.id,
        productId: 'prod-004',
        revision: 'A',
        components,
      }),
    ).rejects.toBeInstanceOf(GateFailure);
    expect(engJob.status).not.toBe('completed');
  });

  it('publishes under the parent Job — MOs created there, NO production Job spawned', async () => {
    const { engJob, parentJob } = makeD7Jobs('approved');
    const jobsBefore = mock.jobs.length;
    const mosBefore = mock.manufacturingOrders.length;
    const r = await workflowService.publishBom({
      engineeringJobId: engJob.id,
      productId: 'prod-004',
      revision: 'A',
      components,
    });
    // No new Job — the old two-Job pattern is gone.
    expect(mock.jobs.length).toBe(jobsBefore);
    expect(r.parentJob.id).toBe(parentJob.id);
    // MOs land under the PARENT (order) Job, draft, qty from the eng Job.
    expect(mock.manufacturingOrders.length).toBe(mosBefore + r.manufacturingOrders.length);
    for (const mo of r.manufacturingOrders) {
      expect(mo.jobId).toBe(parentJob.id);
      expect(mo.jobNumber).toBe(parentJob.jobNumber);
      expect(mo.status).toBe('draft');
    }
    expect(r.manufacturingOrders[0].qty).toBe(3);
    expect(r.bom.productId).toBe('prod-004');
    expect(engJob.status).toBe('completed');
  });

  it('works end-to-end off a confirmed SO eto line (waiver path)', async () => {
    const engJob = mock.jobs.find(
      (j) => j.source === 'engineering' && j.status !== 'completed' && j.salesOrderId,
    );
    expect(engJob).toBeDefined();
    await workflowService.waiveBomApproval(engJob!.id, {
      by: 'emp-001',
      reason: 'Demo waiver — customer signed the drawing pack offline.',
    });
    const r = await workflowService.publishBom({
      engineeringJobId: engJob!.id,
      productId: 'prod-004',
      revision: 'A',
      components,
    });
    // The eng Job's parent is the order's Job from confirmSalesOrder.
    expect(r.parentJob.id).toBe(engJob!.parentJobId);
    expect(r.manufacturingOrders[0].jobId).toBe(engJob!.parentJobId);
    expect(engJob!.status).toBe('completed');
  });

  it('rejects an engineering Job with no parent Job', async () => {
    const { engJob } = makeD7Jobs('approved');
    engJob.parentJobId = undefined;
    await expect(
      workflowService.publishBom({
        engineeringJobId: engJob.id,
        productId: 'prod-004',
        revision: 'A',
        components,
      }),
    ).rejects.toThrow(/no parent Job/);
  });
});

describe('B5 — Variation Order', () => {
  it('raises a VO with a baseline snapshot, then approves by amending the LIVE Job — no delta Job (D8)', async () => {
    const so = mock.salesOrders[0];
    const totalBefore = so.total;
    const jobsBefore = mock.jobs.length;
    const job = mock.jobs.find((j) => j.id === so.jobId)!;
    const jobValueBefore = job.value;

    const vo = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'additive',
      costDelta: 1500,
      scheduleDeltaDays: 3,
      description: 'Add 5x bracket.',
    });
    expect(vo.status).toBe('awaiting_approval');
    expect(vo.variationChainId).toBeTruthy();
    // Immutable baseline captured at raise time.
    expect(vo.baseline?.soTotal).toBe(totalBefore);
    expect(vo.baseline?.jobId).toBe(job.id);

    const approved = await workflowService.approveVariation(vo.id, 'emp-001');
    expect(approved.vo.status).toBe('approved');
    // The deltaJob path is REMOVED — the live Job is amended in place.
    expect(mock.jobs.length).toBe(jobsBefore);
    expect(approved.job?.id).toBe(job.id);
    expect(job.value).toBeCloseTo(jobValueBefore + 1500, 2);
    expect(so.total).toBeCloseTo(totalBefore + 1500, 2);
    // Changed MOs are flagged for the Schedule Engine.
    for (const mo of approved.amendedMos) expect(mo.needsReschedule).toBe(true);
    // Approving twice is rejected — the Job was already amended.
    await expect(workflowService.approveVariation(vo.id, 'emp-001')).rejects.toThrow(/already approved/);
  });

  it('shares variationChainId across siblings of the same parent SO', async () => {
    const so = mock.salesOrders[0];
    const a = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'descope',
      costDelta: -500,
      scheduleDeltaDays: -1,
      description: 'Remove handles.',
    });
    const b = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'mixed',
      costDelta: 200,
      scheduleDeltaDays: 0,
      description: 'Mixed.',
    });
    expect(a.variationChainId).toBe(b.variationChainId);
  });
});

describe('B6 — Rework loop', () => {
  it('records QC results', async () => {
    const wo = mock.workOrders[0];
    const qc = await workflowService.recordQualityCheck({
      workOrderId: wo.id,
      result: 'fail',
      inspectorId: 'emp-002',
    });
    expect(qc.result).toBe('fail');
  });

  it('creates a rework WO with incremented depth', async () => {
    const wo = mock.workOrders[0];
    const rework = await workflowService.createReworkWorkOrder({
      parentWorkOrderId: wo.id,
      raisedBy: 'emp-002',
    });
    expect(rework.parentWorkOrderId).toBe(wo.id);
    expect(rework.reworkDepth).toBe(1);
  });

  it('throws GateFailure when rework cap is hit', async () => {
    const wo = mock.workOrders[0];
    // Force depth to cap.
    wo.reworkDepth = 2;
    await expect(
      workflowService.createReworkWorkOrder({
        parentWorkOrderId: wo.id,
        raisedBy: 'emp-002',
      }),
    ).rejects.toBeInstanceOf(GateFailure);
    wo.reworkDepth = 0;
  });
});

// ── D9 factories — Job + MO + WO chain for disposition tests ───────

let d9Seq = 0;
function makeD9Chain(): { job: Job; mo: ManufacturingOrder; wo: WorkOrder } {
  d9Seq += 1;
  const job: Job = {
    id: `job-d9-${d9Seq}`,
    jobNumber: `JOB-D9-${d9Seq}`,
    title: `D9 disposition fixture ${d9Seq}`,
    customerId: 'cust-001',
    customerName: 'TechCorp',
    status: 'in_progress',
    priority: 'medium',
    startDate: '2026-06-01',
    dueDate: '2026-07-01',
    estimatedHours: 10,
    actualHours: 2,
    value: 4000,
    progress: 25,
    assignedTo: 'emp-001',
    source: 'sales_order',
  };
  const mo: ManufacturingOrder = {
    id: `mo-d9-${d9Seq}`,
    moNumber: `MO-D9-${d9Seq}`,
    productId: 'prod-001',
    productName: 'Mounting Bracket',
    jobId: job.id,
    jobNumber: job.jobNumber,
    customerId: job.customerId,
    customerName: job.customerName,
    status: 'in_progress',
    priority: 'medium',
    dueDate: job.dueDate,
    progress: 25,
    workOrders: 1,
    operatorId: 'emp-002',
    operatorName: 'Operator Two',
    qty: 10,
  };
  const wo = {
    id: `wo-d9-${d9Seq}`,
    woNumber: `WO-D9-${d9Seq}`,
    manufacturingOrderId: mo.id,
    machineId: 'mach-001',
    machineName: 'Laser 1',
    operation: 'Cut',
    sequence: 1,
    estimatedMinutes: 60,
    actualMinutes: 30,
    status: 'in_progress' as const,
  };
  mock.jobs.push(job);
  mock.manufacturingOrders.push(mo);
  mock.workOrders.push(wo);
  return { job, mo, wo };
}

describe('D9 — QC dispositions (scrap remake / ship short / supplier return)', () => {
  it('setQcDisposition stamps disposition, qty, costImpact and merges links', async () => {
    const { wo } = makeD9Chain();
    const qc = await workflowService.recordQualityCheck({
      workOrderId: wo.id,
      result: 'fail',
      inspectorId: 'emp-002',
    });
    await workflowService.setQcDisposition(qc.id, {
      disposition: 'scrap',
      qty: 4,
      costImpact: 320,
    });
    expect(qc.disposition).toBe('scrap');
    expect(qc.qty).toBe(4);
    expect(qc.costImpact).toBe(320);
    // Links merge rather than replace.
    await workflowService.setQcDisposition(qc.id, {
      disposition: 'scrap',
      links: { concessionId: 'con-x' },
    });
    expect(qc.links?.concessionId).toBe('con-x');
    expect(qc.qty).toBe(4);
  });

  it('scrap → remake: createShortfallMo creates a draft MO for the scrap qty under the SAME Job, flagged needsReschedule', async () => {
    const { job, mo, wo } = makeD9Chain();
    const qc = await workflowService.recordQualityCheck({
      workOrderId: wo.id,
      result: 'fail',
      inspectorId: 'emp-002',
    });
    await workflowService.setQcDisposition(qc.id, {
      disposition: 'scrap',
      qty: 3,
      costImpact: 250,
    });
    const shortfall = await workflowService.createShortfallMo({ qualityCheckId: qc.id });
    expect(shortfall.id).not.toBe(mo.id);
    expect(shortfall.jobId).toBe(job.id);
    expect(shortfall.jobNumber).toBe(job.jobNumber);
    expect(shortfall.status).toBe('draft');
    expect(shortfall.qty).toBe(3);
    expect(shortfall.needsReschedule).toBe(true);
    expect(mock.manufacturingOrders.some((m) => m.id === shortfall.id)).toBe(true);
  });

  it('createShortfallMo rejects a QC without a scrap disposition + qty', async () => {
    const { wo } = makeD9Chain();
    const qc = await workflowService.recordQualityCheck({
      workOrderId: wo.id,
      result: 'fail',
      inspectorId: 'emp-002',
    });
    await expect(
      workflowService.createShortfallMo({ qualityCheckId: qc.id }),
    ).rejects.toThrow(/scrap disposition/);
  });

  it('return-to-vendor: createSupplierReturn raises a SupplierReturn linked from the QC', async () => {
    const { wo } = makeD9Chain();
    const qc = await workflowService.recordQualityCheck({
      workOrderId: wo.id,
      result: 'fail',
      inspectorId: 'emp-002',
    });
    const before = mock.supplierReturns.length;
    const sr = await workflowService.createSupplierReturn({
      workOrderId: wo.id,
      qty: 2,
      reason: 'Plate out of spec on arrival.',
      qualityCheckId: qc.id,
    });
    expect(mock.supplierReturns.length).toBe(before + 1);
    expect(sr.status).toBe('raised');
    expect(sr.workOrderId).toBe(wo.id);
    expect(sr.qty).toBe(2);
    // QC stamped: disposition + link back to the return.
    expect(qc.disposition).toBe('return_to_vendor');
    expect(qc.qty).toBe(2);
    expect(qc.links?.supplierReturnId).toBe(sr.id);
  });

  it('createSupplierReturn validates qty and reason', async () => {
    const { wo } = makeD9Chain();
    await expect(
      workflowService.createSupplierReturn({ workOrderId: wo.id, qty: 0, reason: 'x' }),
    ).rejects.toThrow(/greater than zero/);
    await expect(
      workflowService.createSupplierReturn({ workOrderId: wo.id, qty: 1, reason: '  ' }),
    ).rejects.toThrow(/needs a reason/);
  });
});

describe('B7 — Subcontract release + receive', () => {
  it('releases a subcontract dispatch and receives it back', async () => {
    const wo = mock.workOrders[0];
    const dispatch = await workflowService.releaseSubcontract({
      workOrderId: wo.id,
      operationId: 'op-1',
      supplierId: mock.suppliers[0].id,
      materialModel: 'free_issue',
    });
    // D10: lifecycle slimmed to released → at_supplier → received → closed
    expect(dispatch.status).toBe('released');
    expect(dispatch.purchaseOrderId).toBeTruthy();
    const received = await workflowService.receiveSubcontract(dispatch.id);
    expect(received.status).toBe('received');
    expect(
      mock.stockMovements.some((m) => m.reason === 'sub_in' && m.refId === wo.id),
    ).toBe(true);
  });
});

describe('Stage inference helpers', () => {
  it('explodeBom returns no demand for a product with no BoM', () => {
    const demand = explodeBom('prod-008', 1);
    expect(demand).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Gate G2 (Plan → Make) — strengthened checks + release action
// ─────────────────────────────────────────────────────────────────────

/** Push a throwaway Job + MO pair for gate G2 tests. */
const seedJobWithMo = (
  suffix: string,
  moOverrides: Partial<ManufacturingOrder> = {},
  jobOverrides: Partial<Job> = {},
): { job: Job; mo: ManufacturingOrder } => {
  const job: Job = {
    id: `g2-job-${suffix}`,
    jobNumber: `JOB-G2-${suffix}`,
    title: `G2 test job ${suffix}`,
    customerId: 'cust-001',
    customerName: 'TechCorp Industries',
    status: 'planned',
    priority: 'medium',
    startDate: '2026-06-01',
    dueDate: '2026-07-01',
    estimatedHours: 8,
    actualHours: 0,
    value: 1000,
    progress: 0,
    assignedTo: 'emp-001',
    source: 'sales_order',
    qty: 1,
    ...jobOverrides,
  };
  const mo: ManufacturingOrder = {
    id: `g2-mo-${suffix}`,
    moNumber: `MO-G2-${suffix}`,
    productId: 'prod-009', // no BoM → no material demand by default
    productName: 'Rail Platform Component',
    jobId: job.id,
    jobNumber: job.jobNumber,
    customerId: job.customerId,
    customerName: job.customerName,
    status: 'draft',
    priority: 'medium',
    dueDate: job.dueDate,
    progress: 0,
    workOrders: 0,
    operatorId: 'emp-001',
    operatorName: 'Sarah Chen',
    qty: 1,
    startDate: job.startDate,
    ...moOverrides,
  };
  mock.jobs.push(job);
  mock.manufacturingOrders.push(mo);
  return { job, mo };
};

describe('G2 — evaluatePlanToMake routing + material checks', () => {
  it('flags routing_missing when an MO has no operation sequence', () => {
    const { job } = seedJobWithMo('routing');
    const failures = evaluatePlanToMake(job);
    expect(failures.map((f) => f.code)).toContain('routing_missing');
    expect(failures.map((f) => f.code)).not.toContain('dates_missing');
    expect(failures.map((f) => f.code)).not.toContain('no_mos');
  });

  it('passes routing when the MO carries Work Order steps', () => {
    const { job, mo } = seedJobWithMo('routing-ok', { workOrders: 2 });
    const failures = evaluatePlanToMake(job);
    expect(failures).toEqual([]);
    expect(mo.workOrders).toBe(2);
  });

  it('flags material_short when a BoM shortage has no covering open PO', () => {
    // prod-001's BoM needs 1× prod-002 per unit; qty 10000 dwarfs free
    // stock + every open PO line for prod-002 in the fixtures.
    const { job } = seedJobWithMo('short', {
      productId: 'prod-001',
      workOrders: 1,
      qty: 10000,
    });
    const failures = evaluatePlanToMake(job);
    const short = failures.find((f) => f.code === 'material_short');
    expect(short).toBeDefined();
    expect(short!.message).toContain('PLT-042'); // prod-002 part number
  });

  it('does NOT flag material_short when an open PO covers the shortage', () => {
    const { job } = seedJobWithMo('covered', {
      productId: 'prod-001',
      workOrders: 1,
      qty: 10000,
    });
    // Raise a covering PO for the shortage, then withdraw it.
    const coveringPo: PurchaseOrder = {
      id: 'po-g2-cover',
      poNumber: 'PO-G2-COVER',
      supplierId: 'sup-001',
      supplierName: 'Hunter Steel Co',
      date: '2026-06-01',
      deliveryDate: '2026-06-15',
      status: 'sent',
      total: 0,
      received: 0,
      lines: [
        { id: 'pol-g2-cover', productId: 'prod-002', description: 'Base Plate', qty: 50000, receivedQty: 0 },
      ],
    };
    mock.purchaseOrders.push(coveringPo);
    const failures = evaluatePlanToMake(job);
    expect(failures.find((f) => f.code === 'material_short')).toBeUndefined();
    // A draft PO must NOT count as coverage (open question 6 — excluded).
    coveringPo.status = 'draft';
    const failuresWithDraftPo = evaluatePlanToMake(job);
    expect(failuresWithDraftPo.some((f) => f.code === 'material_short')).toBe(true);
    mock.purchaseOrders.splice(mock.purchaseOrders.indexOf(coveringPo), 1);
  });
});

describe('G2 action — releaseManufacturingOrder', () => {
  it('throws GateFailure (and leaves the MO draft) when the gate blocks', async () => {
    const { mo } = seedJobWithMo('rel-blocked'); // no routing
    await expect(
      workflowService.releaseManufacturingOrder(mo.id),
    ).rejects.toBeInstanceOf(GateFailure);
    expect(mo.status).toBe('draft');
  });

  it('releases a draft MO to in_progress (Job follows) when the gate passes', async () => {
    const { job, mo } = seedJobWithMo('rel-ok', { workOrders: 3 });
    const released = await workflowService.releaseManufacturingOrder(mo.id);
    expect(released.status).toBe('in_progress');
    expect(mo.status).toBe('in_progress');
    expect(job.status).toBe('in_progress');
  });

  it('refuses MOs that are not draft/confirmed', async () => {
    const { mo } = seedJobWithMo('rel-done', { status: 'done', workOrders: 1 });
    await expect(
      workflowService.releaseManufacturingOrder(mo.id),
    ).rejects.toThrowError(/only draft or confirmed/);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Gate G5 (Receiving) — evaluator + receiveGoods action
// ─────────────────────────────────────────────────────────────────────

const grFor = (
  poId: string,
  items: Array<{ productId: string; receivedQty: number }>,
): GoodsReceipt => {
  const po = mock.purchaseOrders.find((p) => p.id === poId);
  return {
    id: `gr-test-${poId}`,
    receiptNumber: `GR-TEST-${poId}`,
    poId,
    poNumber: po?.poNumber ?? poId,
    supplierId: po?.supplierId ?? 'sup-001',
    supplierName: po?.supplierName ?? 'Test Supplier',
    date: '2026-06-12',
    items: items.map((i) => ({
      productId: i.productId,
      description: i.productId,
      orderedQty: po?.lines?.find((l) => l.productId === i.productId)?.qty ?? 0,
      receivedQty: i.receivedQty,
      acceptedQty: i.receivedQty,
    })),
  };
};

describe('G5 — evaluateGateReceiving', () => {
  it('passes when every GR line matches an open PO line within tolerance', () => {
    // po-001 (acknowledged) carries prod-001 × 200; +5% tolerance = 210.
    expect(evaluateGateReceiving(grFor('po-001', [{ productId: 'prod-001', receivedQty: 200 }]))).toEqual([]);
    expect(evaluateGateReceiving(grFor('po-001', [{ productId: 'prod-001', receivedQty: 210 }]))).toEqual([]);
    // Under-receipt is a normal partial receipt — never blocked.
    expect(evaluateGateReceiving(grFor('po-001', [{ productId: 'prod-001', receivedQty: 5 }]))).toEqual([]);
  });

  it('flags po_mismatch for a product that is not on the PO', () => {
    const failures = evaluateGateReceiving(
      grFor('po-001', [{ productId: 'prod-010', receivedQty: 1 }]),
    );
    expect(failures.map((f) => f.code)).toEqual(['po_mismatch']);
  });

  it('flags po_mismatch when the PO is closed or cancelled', () => {
    // po-003 is fully received (closed).
    const failures = evaluateGateReceiving(
      grFor('po-003', [{ productId: 'prod-005', receivedQty: 1 }]),
    );
    expect(failures.map((f) => f.code)).toEqual(['po_mismatch']);
  });

  it('flags qty_out_of_tolerance for over-receipt beyond the tolerance', () => {
    const limit = 200 * (1 + RECEIVING_QTY_TOLERANCE); // 210
    const failures = evaluateGateReceiving(
      grFor('po-001', [{ productId: 'prod-001', receivedQty: limit + 1 }]),
    );
    expect(failures.map((f) => f.code)).toEqual(['qty_out_of_tolerance']);
  });
});

describe('G5 action — receiveGoods', () => {
  it('blocks an over-tolerance receipt with GateFailure and books nothing', async () => {
    const grsBefore = mock.goodsReceipts.length;
    const movementsBefore = mock.stockMovements.filter((m) => m.reason === 'gr').length;
    await expect(
      workflowService.receiveGoods({
        poId: 'po-001',
        lines: [{ productId: 'prod-001', qty: 500 }],
      }),
    ).rejects.toBeInstanceOf(GateFailure);
    expect(mock.goodsReceipts.length).toBe(grsBefore);
    expect(mock.stockMovements.filter((m) => m.reason === 'gr').length).toBe(movementsBefore);
  });

  it('accepts a good receipt: GR + gr StockMovement + stock in + PO partial', async () => {
    const po = mock.purchaseOrders.find((p) => p.id === 'po-001')!;
    const line = po.lines!.find((l) => l.productId === 'prod-001')!;
    const receivedBefore = line.receivedQty ?? 0;
    const invBefore = mock.inventoryRecords
      .filter((i) => i.productId === 'prod-001' && i.locationId === 'loc-raw')
      .reduce((s, i) => s + i.qtyOnHand, 0);

    const result = await workflowService.receiveGoods({
      poId: 'po-001',
      lines: [{ productId: 'prod-001', qty: 10 }],
      receivedBy: 'emp-005',
    });

    expect(mock.goodsReceipts.some((g) => g.id === result.goodsReceipt.id)).toBe(true);
    expect(result.goodsReceipt.items[0].receivedQty).toBe(10);
    expect(result.stockMovements).toHaveLength(1);
    expect(result.stockMovements[0].reason).toBe('gr');
    expect(result.stockMovements[0].refType).toBe('po');
    expect(result.stockMovements[0].refId).toBe('po-001');

    const invAfter = mock.inventoryRecords
      .filter((i) => i.productId === 'prod-001' && i.locationId === 'loc-raw')
      .reduce((s, i) => s + i.qtyOnHand, 0);
    expect(invAfter).toBe(invBefore + 10);
    expect(line.receivedQty).toBe(receivedBefore + 10);
    expect(po.status).toBe('partial');
  });

  it('flips the PO to received once every line is fully received', async () => {
    const po = mock.purchaseOrders.find((p) => p.id === 'po-001')!;
    const remaining = po.lines!.map((l) => ({
      productId: l.productId,
      qty: l.qty - (l.receivedQty ?? 0),
    })).filter((l) => l.qty > 0);
    await workflowService.receiveGoods({ poId: 'po-001', lines: remaining });
    expect(po.status).toBe('received');
    // The closed PO now rejects further receipts (po_mismatch).
    await expect(
      workflowService.receiveGoods({
        poId: 'po-001',
        lines: [{ productId: 'prod-001', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(GateFailure);
  });
});

/* ──────────────────────────────────────────────────────────────────
 * G4 — milestone-aware invoicing (decision D5)
 * ────────────────────────────────────────────────────────────────── */

let g4Seq = 0;

/** Push a synthetic SO (unique ids — shared mock state survives between tests). */
function makeG4SalesOrder(opts: {
  customerId?: string;
  status?: SalesOrder['status'];
  total?: number;
  lines?: Array<{ qty: number; unitPrice: number; status?: 'pending' | 'shipped' }>;
}): SalesOrder {
  const seq = ++g4Seq;
  const id = `so-g4-${seq}`;
  const so: SalesOrder = {
    id,
    orderNumber: `SO-G4-${String(seq).padStart(3, '0')}`,
    customerId: opts.customerId ?? `cust-g4-none-${seq}`,
    customerName: 'Gate Four Fabrication',
    date: '2026-06-01',
    deliveryDate: '2026-07-01',
    status: opts.status ?? 'confirmed',
    total: opts.total ?? 10000,
    lines: opts.lines?.map((l, i) => ({
      id: `${id}-line-${i + 1}`,
      salesOrderId: id,
      productId: 'prod-001',
      description: `Line ${i + 1}`,
      qty: l.qty,
      unitPrice: l.unitPrice,
      status: l.status ?? 'pending',
    })),
  };
  mock.salesOrders.push(so);
  return so;
}

function makeG4Shipment(
  so: SalesOrder,
  opts: { delivered?: boolean; lineIds?: string[] } = {},
): Shipment {
  const seq = ++g4Seq;
  const shipment: Shipment = {
    id: `shp-g4-${seq}`,
    shipmentNumber: `SP-G4-${String(seq).padStart(3, '0')}`,
    salesOrderId: so.id,
    orderNumber: so.orderNumber,
    customerId: so.customerId,
    customerName: so.customerName,
    carrier: 'Toll',
    stage: opts.delivered ? 'delivered' : 'transit',
    dispatchDate: '2026-06-05',
    estimatedDelivery: '2026-06-08',
    actualDelivery: opts.delivered ? '2026-06-08' : undefined,
    weight: 10,
    packages: 1,
    lineIds: opts.lineIds,
  };
  mock.shipments.push(shipment);
  return shipment;
}

/** Customer wired to a synthetic payment term so raise* resolves the schedule. */
function makeG4Customer(term: Omit<PaymentTerm, 'id'>): Customer {
  const seq = ++g4Seq;
  const paymentTerm: PaymentTerm = { id: `pt-g4-${seq}`, ...term };
  mock.paymentTerms.push(paymentTerm);
  const customer: Customer = {
    id: `cust-g4-${seq}`,
    company: 'Gate Four Fabrication',
    contact: 'Gigi Fourier',
    email: 'accounts@gatefour.example',
    phone: '+61 2 0000 0000',
    address: '4 Milestone Way',
    city: 'Oberon',
    state: 'NSW',
    postcode: '2787',
    totalRevenue: 0,
    activeOpportunities: 0,
    status: 'active',
    notes: '',
    createdAt: '2026-06-01',
    paymentTermsId: paymentTerm.id,
  };
  mock.customers.push(customer);
  return customer;
}

describe('milestonesForTerm — schedule resolution + depositPct migration', () => {
  it('returns the explicit schedule untouched', () => {
    const schedule = milestonesForTerm({
      id: 'pt-x',
      label: 'x',
      days: 30,
      milestones: [
        { event: 'order_confirmed', pct: 40 },
        { event: 'completion', pct: 60 },
      ],
    });
    expect(schedule).toEqual([
      { event: 'order_confirmed', pct: 40 },
      { event: 'completion', pct: 60 },
    ]);
  });

  it('migrates a legacy depositPct into deposit-on-confirm + remainder-on-completion', () => {
    const schedule = milestonesForTerm({ id: 'pt-x', label: 'x', days: 0, depositPct: 30 });
    expect(schedule).toEqual([
      { event: 'order_confirmed', pct: 30 },
      { event: 'completion', pct: 70 },
    ]);
  });

  it('defaults to 100% on dispatch when neither milestones nor deposit exist', () => {
    expect(milestonesForTerm({ id: 'pt-x', label: 'x', days: 30 })).toEqual([
      { event: 'dispatch', pct: 100 },
    ]);
    expect(milestonesForTerm(undefined)).toEqual([{ event: 'dispatch', pct: 100 }]);
  });
});

describe('G4 — evaluateInvoiceMilestone (each event type)', () => {
  it('order_confirmed: blocked on a draft SO, passes once confirmed', () => {
    const draft = makeG4SalesOrder({ status: 'draft' });
    expect(
      evaluateInvoiceMilestone(draft, { event: 'order_confirmed', pct: 50 }).map((f) => f.code),
    ).toEqual(['milestone_not_reached']);

    const confirmed = makeG4SalesOrder({ status: 'confirmed' });
    expect(evaluateInvoiceMilestone(confirmed, { event: 'order_confirmed', pct: 50 })).toEqual([]);
  });

  it('dispatch: no_shipment until a shipment exists', () => {
    const so = makeG4SalesOrder({});
    expect(
      evaluateInvoiceMilestone(so, { event: 'dispatch', pct: 100 }).map((f) => f.code),
    ).toEqual(['no_shipment']);

    makeG4Shipment(so);
    expect(evaluateInvoiceMilestone(so, { event: 'dispatch', pct: 100 })).toEqual([]);
  });

  it('delivery: undelivered until the PoD is recorded (scoped to delivery only)', () => {
    const so = makeG4SalesOrder({});
    const shipment = makeG4Shipment(so, { delivered: false });
    expect(
      evaluateInvoiceMilestone(so, { event: 'delivery', pct: 100 }, shipment.id).map((f) => f.code),
    ).toEqual(['undelivered']);
    // The same undelivered shipment does NOT block a dispatch milestone.
    expect(evaluateInvoiceMilestone(so, { event: 'dispatch', pct: 100 }, shipment.id)).toEqual([]);

    shipment.actualDelivery = '2026-06-09';
    expect(evaluateInvoiceMilestone(so, { event: 'delivery', pct: 100 }, shipment.id)).toEqual([]);
  });

  it('completion: blocked while any line is unshipped, passes when every line shipped', () => {
    const so = makeG4SalesOrder({
      lines: [
        { qty: 1, unitPrice: 500, status: 'shipped' },
        { qty: 1, unitPrice: 500, status: 'pending' },
      ],
    });
    expect(
      evaluateInvoiceMilestone(so, { event: 'completion', pct: 50 }).map((f) => f.code),
    ).toEqual(['milestone_not_reached']);

    so.lines![1].status = 'shipped';
    expect(evaluateInvoiceMilestone(so, { event: 'completion', pct: 50 })).toEqual([]);
  });

  it('dedup is per-SO for order_confirmed but per-shipment for dispatch', () => {
    const so = makeG4SalesOrder({});
    const shipmentA = makeG4Shipment(so);
    mock.sellInvoices.push({
      id: `inv-g4-${++g4Seq}`,
      invoiceNumber: `INV-G4-${g4Seq}`,
      customerId: so.customerId,
      customerName: so.customerName,
      salesOrderId: so.id,
      date: '2026-06-10',
      dueDate: '2026-07-10',
      amount: 5000,
      paidAmount: 0,
      status: 'sent',
      milestoneEvent: 'order_confirmed',
      milestonePct: 50,
    });
    mock.sellInvoices.push({
      id: `inv-g4-${++g4Seq}`,
      invoiceNumber: `INV-G4-${g4Seq}`,
      customerId: so.customerId,
      customerName: so.customerName,
      salesOrderId: so.id,
      date: '2026-06-10',
      dueDate: '2026-07-10',
      amount: 5000,
      paidAmount: 0,
      status: 'sent',
      milestoneEvent: 'dispatch',
      milestonePct: 100,
      shipmentId: shipmentA.id,
    });

    // (SO, event) key — a second order_confirmed invoice is a duplicate.
    expect(
      evaluateInvoiceMilestone(so, { event: 'order_confirmed', pct: 50 }).map((f) => f.code),
    ).toEqual(['milestone_already_invoiced']);

    // (SO, event, shipmentId) key — shipment A is invoiced, but a NEW
    // shipment B is a new invoice, not a duplicate.
    expect(
      evaluateInvoiceMilestone(so, { event: 'dispatch', pct: 100 }, shipmentA.id).map((f) => f.code),
    ).toEqual(['milestone_already_invoiced']);
    const shipmentB = makeG4Shipment(so);
    expect(evaluateInvoiceMilestone(so, { event: 'dispatch', pct: 100 }, shipmentB.id)).toEqual([]);
  });
});

describe('G4 action — raiseInvoiceForMilestone', () => {
  it('pro-rates a dispatch invoice to the shipment lines and stamps the milestone link', async () => {
    const customer = makeG4Customer({
      label: 'Net 30 on dispatch (test)',
      days: 30,
      milestones: [{ event: 'dispatch', pct: 100 }],
    });
    const so = makeG4SalesOrder({
      customerId: customer.id,
      total: 2000,
      lines: [
        { qty: 10, unitPrice: 100 }, // $1,000 — shipped first
        { qty: 1, unitPrice: 1000 }, // $1,000 — ships later
      ],
    });
    const shipment = makeG4Shipment(so, { lineIds: [so.lines![0].id] });

    const invoice = await workflowService.raiseInvoiceForMilestone({
      salesOrderId: so.id,
      event: 'dispatch',
      shipmentId: shipment.id,
    });

    // 100% of the shipped half of a $2,000 order.
    expect(invoice.amount).toBe(1000);
    expect(invoice.milestoneEvent).toBe('dispatch');
    expect(invoice.milestonePct).toBe(100);
    expect(invoice.shipmentId).toBe(shipment.id);
    expect(invoice.salesOrderId).toBe(so.id);

    // Net 30: due = issue + 30 days.
    const expectedDue = new Date(invoice.date);
    expectedDue.setDate(expectedDue.getDate() + 30);
    expect(invoice.dueDate).toBe(expectedDue.toISOString().slice(0, 10));

    // Same shipment again → milestone_already_invoiced; the second
    // shipment auto-resolves as the next eligible one.
    await expect(
      workflowService.raiseInvoiceForMilestone({
        salesOrderId: so.id,
        event: 'dispatch',
        shipmentId: shipment.id,
      }),
    ).rejects.toBeInstanceOf(GateFailure);

    const shipmentB = makeG4Shipment(so, { lineIds: [so.lines![1].id] });
    const second = await workflowService.raiseInvoiceForMilestone({
      salesOrderId: so.id,
      event: 'dispatch',
    });
    expect(second.shipmentId).toBe(shipmentB.id);
    expect(second.amount).toBe(1000);
    // The whole order is now invoiced.
    expect(so.status).toBe('invoiced');
  });

  it('runs the 50/50 deposit-then-completion schedule once per SO', async () => {
    const customer = makeG4Customer({
      label: '50% deposit / 50% on completion (test)',
      days: 14,
      milestones: [
        { event: 'order_confirmed', pct: 50 },
        { event: 'completion', pct: 50 },
      ],
    });
    const so = makeG4SalesOrder({
      customerId: customer.id,
      total: 8000,
      lines: [{ qty: 4, unitPrice: 2000 }],
    });

    const deposit = await workflowService.raiseInvoiceForMilestone({
      salesOrderId: so.id,
      event: 'order_confirmed',
    });
    expect(deposit.amount).toBe(4000);
    expect(deposit.milestonePct).toBe(50);
    expect(deposit.shipmentId).toBeUndefined();

    // Deposit fires once per SO.
    await expect(
      workflowService.raiseInvoiceForMilestone({ salesOrderId: so.id, event: 'order_confirmed' }),
    ).rejects.toBeInstanceOf(GateFailure);

    // Completion blocked until every line has shipped…
    await expect(
      workflowService.raiseInvoiceForMilestone({ salesOrderId: so.id, event: 'completion' }),
    ).rejects.toBeInstanceOf(GateFailure);

    // …then invoices the remainder and closes out the SO.
    so.lines![0].status = 'shipped';
    const balance = await workflowService.raiseInvoiceForMilestone({
      salesOrderId: so.id,
      event: 'completion',
    });
    expect(balance.amount).toBe(4000);
    expect(so.status).toBe('invoiced');
  });

  it('rejects an event missing from the customer schedule', async () => {
    const customer = makeG4Customer({
      label: 'On delivery (test)',
      days: 7,
      milestones: [{ event: 'delivery', pct: 100 }],
    });
    const so = makeG4SalesOrder({ customerId: customer.id });
    await expect(
      workflowService.raiseInvoiceForMilestone({ salesOrderId: so.id, event: 'order_confirmed' }),
    ).rejects.toThrow(/no order confirmed milestone/);
  });
});

/* ──────────────────────────────────────────────────────────────────
 * D8 — approveVariation amends in place; Credit Notes
 * ────────────────────────────────────────────────────────────────── */

let d8Seq = 0;

/** Push a Job (+ MOs) for an SO so approveVariation has something to amend. */
function makeD8Job(
  so: SalesOrder,
  mos: Array<{ qty: number; status: ManufacturingOrder['status'] }>,
): { job: Job; mos: ManufacturingOrder[] } {
  const seq = ++d8Seq;
  const job: Job = {
    id: `job-d8-${seq}`,
    jobNumber: `JOB-D8-${String(seq).padStart(3, '0')}`,
    title: `${so.orderNumber} — D8 test`,
    customerId: so.customerId,
    customerName: so.customerName,
    status: 'in_progress',
    priority: 'medium',
    startDate: '2026-06-01',
    dueDate: '2026-07-01',
    estimatedHours: 40,
    actualHours: 8,
    value: so.total,
    progress: 25,
    assignedTo: 'emp-001',
    salesOrderId: so.id,
    source: 'sales_order',
  };
  mock.jobs.push(job);
  so.jobId = job.id;
  const made = mos.map((m, i) => {
    const mo: ManufacturingOrder = {
      id: `mo-d8-${seq}-${i + 1}`,
      moNumber: `MO-D8-${String(seq).padStart(3, '0')}-${i + 1}`,
      productId: 'prod-001',
      productName: 'Mounting Bracket',
      jobId: job.id,
      jobNumber: job.jobNumber,
      customerId: so.customerId,
      customerName: so.customerName,
      status: m.status,
      priority: 'medium',
      dueDate: '2026-06-20',
      progress: m.status === 'done' ? 100 : 0,
      workOrders: 1,
      operatorId: 'emp-001',
      operatorName: 'Test Operator',
      qty: m.qty,
    };
    mock.manufacturingOrders.push(mo);
    return mo;
  });
  return { job, mos: made };
}

describe('D8 — approveVariation (amend-in-place money cluster)', () => {
  it('additive: bumps so.total so un-raised milestones re-price; open MOs amended; done MOs preserved', async () => {
    const customer = makeG4Customer({
      label: '50/50 (D8 additive)',
      days: 14,
      milestones: [
        { event: 'order_confirmed', pct: 50 },
        { event: 'completion', pct: 50 },
      ],
    });
    const so = makeG4SalesOrder({
      customerId: customer.id,
      total: 10000,
      lines: [{ qty: 10, unitPrice: 1000 }],
    });
    const { job, mos } = makeD8Job(so, [
      { qty: 10, status: 'confirmed' },
      { qty: 5, status: 'done' },
    ]);
    const deposit = await workflowService.raiseInvoiceForMilestone({
      salesOrderId: so.id,
      event: 'order_confirmed',
    });
    expect(deposit.amount).toBe(5000);

    const vo = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'additive',
      costDelta: 2000,
      scheduleDeltaDays: 5,
      description: 'Add 2 more brackets.',
    });
    const jobsBefore = mock.jobs.length;
    const r = await workflowService.approveVariation(vo.id, 'emp-001');

    // No new Job; the live Job amended in place.
    expect(mock.jobs.length).toBe(jobsBefore);
    expect(r.job?.id).toBe(job.id);
    expect(so.total).toBe(12000);
    expect(job.value).toBe(12000);
    expect(job.dueDate).toBe('2026-07-06'); // +5 days
    expect(r.milestoneAdjustment).toEqual({
      previousTotal: 10000,
      newTotal: 12000,
      uninvoicedBefore: 5000,
      uninvoicedAfter: 7000,
    });
    expect(r.creditNote).toBeUndefined();

    // Open MO scaled + flagged; done MO (completed work) untouched.
    expect(mos[0].qty).toBe(12); // 10 × 12000/10000
    expect(mos[0].needsReschedule).toBe(true);
    expect(mos[0].dueDate).toBe('2026-06-25');
    expect(mos[1].qty).toBe(5);
    expect(mos[1].needsReschedule).toBeUndefined();
    expect(r.amendedMos.map((m) => m.id)).toEqual([mos[0].id]);

    // The un-raised completion milestone re-prices off the new total.
    so.lines![0].status = 'shipped';
    const balance = await workflowService.raiseInvoiceForMilestone({
      salesOrderId: so.id,
      event: 'completion',
    });
    expect(balance.amount).toBe(6000); // 50% × amended 12000
  });

  it('descope beyond the uninvoiced remainder raises a draft Credit Note for the difference', async () => {
    const customer = makeG4Customer({
      label: '50/50 (D8 descope)',
      days: 14,
      milestones: [
        { event: 'order_confirmed', pct: 50 },
        { event: 'completion', pct: 50 },
      ],
    });
    const so = makeG4SalesOrder({
      customerId: customer.id,
      total: 10000,
      lines: [{ qty: 10, unitPrice: 1000 }],
    });
    makeD8Job(so, [{ qty: 10, status: 'confirmed' }]);
    await workflowService.raiseInvoiceForMilestone({ salesOrderId: so.id, event: 'order_confirmed' });

    const vo = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'descope',
      costDelta: -7000,
      scheduleDeltaDays: -2,
      description: 'Drop most of the scope.',
    });
    const r = await workflowService.approveVariation(vo.id, 'emp-001');

    // $5,000 deposit raised; only $5,000 uninvoiced — a $7,000 descope
    // owes the customer $2,000 back.
    expect(r.creditNote).toBeDefined();
    expect(r.creditNote!.status).toBe('draft');
    expect(r.creditNote!.amount).toBe(2000);
    expect(r.creditNote!.salesOrderId).toBe(so.id);
    expect(r.creditNote!.variationOrderId).toBe(vo.id);
    expect(r.creditNote!.customerId).toBe(so.customerId);
    expect(r.creditNote!.xeroSyncStatus).toBe('pending');
    expect(mock.creditNotes).toContain(r.creditNote);

    expect(so.total).toBe(3000);
    expect(r.milestoneAdjustment.uninvoicedAfter).toBe(0);
    // Invoices already cover the amended total — nothing left to raise.
    expect(so.status).toBe('invoiced');
  });

  it('descope within the uninvoiced remainder raises NO credit note', async () => {
    const customer = makeG4Customer({
      label: '50/50 (D8 small descope)',
      days: 14,
      milestones: [
        { event: 'order_confirmed', pct: 50 },
        { event: 'completion', pct: 50 },
      ],
    });
    const so = makeG4SalesOrder({
      customerId: customer.id,
      total: 10000,
      lines: [{ qty: 10, unitPrice: 1000 }],
    });
    makeD8Job(so, [{ qty: 10, status: 'confirmed' }]);
    await workflowService.raiseInvoiceForMilestone({ salesOrderId: so.id, event: 'order_confirmed' });

    const vo = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'descope',
      costDelta: -3000,
      scheduleDeltaDays: 0,
      description: 'Trim the scope.',
    });
    const r = await workflowService.approveVariation(vo.id, 'emp-001');
    expect(r.creditNote).toBeUndefined();
    expect(so.total).toBe(7000);
    expect(r.milestoneAdjustment.uninvoicedAfter).toBe(2000);
  });

  it('keeps the baseline snapshot immutable while the live records change', async () => {
    const so = makeG4SalesOrder({ total: 10000, lines: [{ qty: 10, unitPrice: 1000 }] });
    const { job, mos } = makeD8Job(so, [{ qty: 10, status: 'confirmed' }]);

    const vo = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'additive',
      costDelta: 5000,
      scheduleDeltaDays: 10,
      description: 'Big add.',
    });
    const baseline = vo.baseline!;
    expect(Object.isFrozen(baseline)).toBe(true);
    expect(Object.isFrozen(baseline.mos)).toBe(true);
    expect(Object.isFrozen(baseline.mos[0])).toBe(true);
    expect(baseline.soTotal).toBe(10000);
    expect(baseline.uninvoicedRemainder).toBe(10000);
    expect(baseline.jobValue).toBe(10000);
    expect(baseline.jobDueDate).toBe('2026-07-01');
    expect(baseline.mos[0].qty).toBe(10);

    await workflowService.approveVariation(vo.id, 'emp-001');

    // Live records moved…
    expect(so.total).toBe(15000);
    expect(job.value).toBe(15000);
    expect(job.dueDate).toBe('2026-07-11');
    expect(mos[0].qty).toBe(15);
    // …the baseline did not.
    expect(baseline.soTotal).toBe(10000);
    expect(baseline.jobValue).toBe(10000);
    expect(baseline.jobDueDate).toBe('2026-07-01');
    expect(baseline.mos[0].qty).toBe(10);
    expect(() => {
      (baseline as { soTotal: number }).soTotal = 1;
    }).toThrow();
  });
});

describe('Credit Notes — raiseCreditNote / issueCreditNote', () => {
  it('raises a draft credit note pending Xero sync, then issues it', async () => {
    const cn = await workflowService.raiseCreditNote({
      customerId: 'cust-001',
      amount: 450.5,
      reason: 'RMA credit (test).',
      returnId: 'rma-001',
    });
    expect(cn.status).toBe('draft');
    expect(cn.creditNoteNumber).toMatch(/^CN-\d{4}-\d{4}$/);
    expect(cn.amount).toBe(450.5);
    expect(cn.returnId).toBe('rma-001');
    expect(cn.xeroSyncStatus).toBe('pending');
    expect(cn.issuedAt).toBeUndefined();
    expect(mock.creditNotes).toContain(cn);

    const issued = await workflowService.issueCreditNote(cn.id);
    expect(issued.status).toBe('issued');
    expect(issued.issuedAt).toBeTruthy();
    expect(issued.xeroSyncStatus).toBe('synced');

    // Only drafts can be issued.
    await expect(workflowService.issueCreditNote(cn.id)).rejects.toThrow(/only drafts/);
  });

  it('rejects a non-positive amount', async () => {
    await expect(
      workflowService.raiseCreditNote({ customerId: 'cust-001', amount: 0, reason: 'x' }),
    ).rejects.toThrow(/greater than zero/);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Decision 14 — material consumption during manufacture
// ─────────────────────────────────────────────────────────────────────

/** Seed a throwaway MO + WOs + material lines + inventory for D14 tests. */
const seedConsumptionMo = (suffix: string, onHand: number) => {
  const { mo } = seedJobWithMo(`d14-${suffix}`);
  const wo1: WorkOrder = {
    id: `d14-wo1-${suffix}`, woNumber: `WO-D14-${suffix}-1`, manufacturingOrderId: mo.id,
    machineId: 'mach-001', machineName: 'Laser Cutter #1', operation: 'Cut', sequence: 1,
    estimatedMinutes: 60, actualMinutes: 0, status: 'pending',
  };
  const wo2: WorkOrder = {
    id: `d14-wo2-${suffix}`, woNumber: `WO-D14-${suffix}-2`, manufacturingOrderId: mo.id,
    machineId: 'mach-002', machineName: 'Press Brake #2', operation: 'Fold', sequence: 2,
    estimatedMinutes: 30, actualMinutes: 0, status: 'pending',
  };
  mock.workOrders.push(wo1, wo2);
  const inv: InventoryRecord = {
    id: `d14-inv-${suffix}`, productId: `d14-prod-${suffix}`, locationId: 'loc-raw',
    qtyOnHand: onHand, qtyReserved: 0,
  };
  mock.inventoryRecords.push(inv);
  const line: MaterialConsumptionLine = {
    id: `d14-mc-${suffix}`, material: `D14 plate ${suffix}`, plannedQty: 6, consumedQty: 0,
    uom: 'sheets', variance: 0, status: 'ok', manufacturingOrderId: mo.id,
    productId: `d14-prod-${suffix}`, source: 'bom',
  };
  mock.materialConsumption.push(line);
  return { mo, wo1, wo2, inv, line };
};

describe('D14 — backflush at WO completion', () => {
  it('backflushes planned material on the FIRST WO completion only', async () => {
    const { wo1, wo2, inv, line, mo } = seedConsumptionMo('a', 10);
    const r1 = await workflowService.completeWorkOrder(wo1.id);
    expect(r1.workOrder.status).toBe('completed');
    expect(r1.consumed.map((l) => l.id)).toContain(line.id);
    expect(line.consumedQty).toBe(6);
    expect(line.status).toBe('ok');
    expect(inv.qtyOnHand).toBe(4);
    expect(r1.countFlagged).toBe(false);
    expect(
      mock.stockMovements.some((m) => m.reason === 'consume' && m.refId === mo.id),
    ).toBe(true);
    const r2 = await workflowService.completeWorkOrder(wo2.id);
    expect(r2.consumed).toEqual([]);
    expect(line.consumedQty).toBe(6);
  });

  it('applies qty overrides and flags a cycle count when book stock goes negative', async () => {
    const { wo1, inv, line } = seedConsumptionMo('b', 5);
    const r = await workflowService.completeWorkOrder(wo1.id, [{ lineId: line.id, qty: 8 }]);
    expect(line.consumedQty).toBe(8);
    expect(line.status).toBe('over');
    expect(line.variance).toBe(2);
    expect(inv.qtyOnHand).toBe(-3);
    expect(inv.countRequested).toBe(true);
    expect(r.countFlagged).toBe(true);
  });
});

describe('D14 — unplanned floor issues and returns', () => {
  it('issues unplanned material against the MO and supports returns', async () => {
    const { mo } = seedConsumptionMo('c', 10);
    const issued = await workflowService.recordUnplannedIssue({
      manufacturingOrderId: mo.id, material: 'Extra bar', qty: 4, uom: 'pcs', by: 'emp-001',
    });
    expect(issued.line.source).toBe('unplanned');
    expect(issued.line.consumedQty).toBe(4);
    expect(issued.line.status).toBe('over');
    const returned = await workflowService.recordUnplannedIssue({
      manufacturingOrderId: mo.id, material: 'Extra bar', qty: -2, uom: 'pcs', by: 'emp-001',
    });
    expect(returned.line.consumedQty).toBe(2);
    await expect(
      workflowService.recordUnplannedIssue({
        manufacturingOrderId: mo.id, material: 'Extra bar', qty: -5, uom: 'pcs', by: 'emp-001',
      }),
    ).rejects.toThrow(/return more/i);
  });

  it('flag-for-engineering raises an ECO suggestion — the master BoM is untouched', async () => {
    const { mo } = seedConsumptionMo('d', 10);
    const bomCountBefore = mock.billsOfMaterials.length;
    const r = await workflowService.recordUnplannedIssue({
      manufacturingOrderId: mo.id, material: 'Heavier gusset', qty: 2, uom: 'pcs',
      flagForEngineering: true, by: 'emp-001',
    });
    expect(r.eco).toBeTruthy();
    expect(r.eco?.status).toBe('open');
    expect(r.eco?.moNumber).toBe(mo.moNumber);
    expect(mock.ecoSuggestions.some((e) => e.id === r.eco?.id)).toBe(true);
    expect(mock.billsOfMaterials.length).toBe(bomCountBefore);
  });
});
