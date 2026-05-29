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
  GateFailure,
} from '@/services/workflowService';
import * as mock from '@/services/mock';

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
        productId: 'prod-005', // make_to_stock — has a BoM, becomes MTO
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

describe('B1 — confirmSalesOrder (MTO + MTS + ETO dispatch)', () => {
  it('dispatches each line to the correct route', async () => {
    const jobsBefore = mock.jobs.length;
    const result = await workflowService.confirmSalesOrder(mock.salesOrders[0].id);
    expect(result.salesOrder.status).toBe('in_production');
    // Three lines → MTO job + MTS job + ETO engineering job.
    expect(result.perLine).toHaveLength(3);
    expect(result.perLine.map((p) => p.route).sort()).toEqual([
      'eto',
      'make_to_stock',
      'mto',
    ]);
    expect(mock.jobs.length).toBeGreaterThanOrEqual(jobsBefore + 3);
    // ETO line should produce an engineering Job source.
    const etoLine = result.perLine.find((p) => p.route === 'eto')!;
    const engJob = mock.jobs.find((j) => j.id === etoLine.jobId);
    expect(engJob?.source).toBe('engineering');
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

describe('B2 — Catalogue Sale fast path', () => {
  it('reserves stock + creates a PickList', async () => {
    const so = mock.salesOrders[2];
    so.status = 'confirmed';
    so.lines = [
      {
        id: 'soline-cat-1',
        salesOrderId: so.id,
        productId: 'prod-005',
        description: 'Cable Tray × 2',
        qty: 2,
        unitPrice: 38,
        routeOverride: 'catalogue_sale',
        status: 'pending',
      },
    ];
    const result = await workflowService.confirmSalesOrder(so.id);
    const catLine = result.perLine.find((p) => p.route === 'catalogue_sale');
    expect(catLine?.pickListId).toBeTruthy();
    const pl = mock.pickLists.find((p) => p.id === catLine!.pickListId);
    expect(pl?.lines.length).toBeGreaterThan(0);
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

describe('B4 — ETO publish BoM → production Job', () => {
  it('creates a production Job with parentJobId', async () => {
    const engJob = mock.jobs.find((j) => j.source === 'engineering');
    expect(engJob).toBeDefined();
    const result = await workflowService.publishBomToProductionJob({
      engineeringJobId: engJob!.id,
      productId: 'prod-004',
      revision: 'A',
      components: [
        { productId: 'prod-001', qtyPer: 4, isManufactured: true },
        { productId: 'prod-002', qtyPer: 1, isManufactured: false },
      ],
    });
    expect(result.productionJob.parentJobId).toBe(engJob!.id);
    expect(result.productionJob.source).toBe('sales_order');
    expect(engJob!.status).toBe('completed');
  });
});

describe('B5 — Variation Order', () => {
  it('raises a VO awaiting approval, then approves + spawns a delta Job', async () => {
    const so = mock.salesOrders[0];
    const vo = await workflowService.createVariation({
      parentSalesOrderId: so.id,
      type: 'additive',
      costDelta: 1500,
      scheduleDeltaDays: 3,
      description: 'Add 5x bracket.',
    });
    expect(vo.status).toBe('awaiting_approval');
    expect(vo.variationChainId).toBeTruthy();
    const approved = await workflowService.approveVariation(vo.id, 'emp-001');
    expect(approved.vo.status).toBe('approved');
    expect(approved.deltaJob?.source).toBe('variation');
    expect(approved.deltaJob?.variationChainId).toBe(vo.variationChainId);
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

describe('B7 — Subcontract release + receive', () => {
  it('releases a subcontract dispatch and receives it back', async () => {
    const wo = mock.workOrders[0];
    const dispatch = await workflowService.releaseSubcontract({
      workOrderId: wo.id,
      operationId: 'op-1',
      supplierId: mock.suppliers[0].id,
      materialModel: 'free_issue',
    });
    expect(dispatch.status).toBe('subcontract_in_transit');
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
