/**
 * Universal Order page — the Phase E one-canonical-page-per-order
 * surface, extended with interactive demos for every archetype so a
 * customer click-through can experience all seven flows.
 *
 * Stages render inline as the order progresses. Demo action buttons
 * for each archetype (B1–B7) sit in a single sticky panel; the page
 * reactively shows whatever state the mutation produces (Jobs spawned,
 * Pick Lists created, Variations awaiting approval, Rework chains,
 * Subcontract dispatches).
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertOctagon, Truck, Wrench, Network } from 'lucide-react';
import type {
  GateFailureDetail,
  Job,
  JobSource,
  JourneyStage,
  PickList,
  ProductRoute,
  SalesOrder,
  SubcontractDispatch,
  VariationOrder,
  WorkOrder,
} from '@/types/entities';
import { sellService } from '@/services/sellService';
import {
  workflowService,
  evaluateSoToJob,
  evaluateMakeToShip,
} from '@/services/workflowService';
import * as mock from '@/services/mock';
import { JourneyStepper } from './JourneyStepper';
import { GateBanner } from './GateBanner';
import { RouteChip } from './RouteChip';
import { AdvanceButton } from './AdvanceButton';
import { VOImpactPanel } from './VOImpactPanel';
import { SubcontractTimeline } from './SubcontractTimeline';
import { QcReworkInspector } from './QcReworkInspector';
import { JobGraphMini } from './JobGraphMini';
import { RouteOverrideSelect } from './RouteOverrideSelect';
import { EntityPeek } from './EntityPeek';

// ── Stage inference ───────────────────────────────────────────────

function inferStage(so: SalesOrder, pickLists: PickList[]): JourneyStage {
  if (pickLists.length > 0) {
    const allPicked = pickLists.every((p) => p.status === 'picked');
    return allPicked ? 'dispatch' : 'manufacturing';
  }
  switch (so.status) {
    case 'draft':
      return 'sales_order';
    case 'confirmed':
      return 'job';
    case 'in_production':
      return 'manufacturing';
    case 'shipped':
      return 'dispatch';
    case 'invoiced':
      return 'invoice';
    default:
      return 'sales_order';
  }
}

function completedBefore(stage: JourneyStage): JourneyStage[] {
  const order: JourneyStage[] = [
    'quote',
    'sales_order',
    'job',
    'bom',
    'mrp',
    'schedule',
    'manufacturing',
    'qc',
    'dispatch',
    'invoice',
  ];
  return order.slice(0, Math.max(0, order.indexOf(stage)));
}

function actionForStage(stage: JourneyStage) {
  switch (stage) {
    case 'sales_order':
      return { label: 'Confirm Sales Order', key: 'confirm' as const };
    case 'manufacturing':
      return { label: 'Pick & Dispatch', key: 'pick' as const };
    case 'dispatch':
      return { label: 'Mark Delivered', key: 'deliver' as const };
    default:
      return { label: 'Advance', key: 'none' as const };
  }
}

const sourceLabel: Record<JobSource, string> = {
  sales_order: 'Sales Order',
  replenishment: 'Replenishment',
  engineering: 'Engineering',
  variation: 'Variation',
  manual: 'Manual',
};

// ── Component ──────────────────────────────────────────────────────

export function OrderJourneyPage() {
  const { id } = useParams<{ id: string }>();
  const [so, setSo] = useState<SalesOrder | undefined>();
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [variations, setVariations] = useState<VariationOrder[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [subcontracts, setSubcontracts] = useState<SubcontractDispatch[]>([]);
  const [failures, setFailures] = useState<GateFailureDetail[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      const orders = await sellService.getSalesOrders();
      const order = orders.find((o) => o.id === id);
      const picks = await workflowService.getPickListsForSO(id);
      const vs = await workflowService.getVariationsFor(id);
      if (!alive) return;
      setSo(order);
      setPickLists(picks);
      setVariations(vs);
      setJobs(mock.jobs.filter((j) => j.salesOrderId === id));
      setWorkOrders(mock.workOrders.slice(0, 8));
      setSubcontracts(mock.subcontractDispatches.slice().reverse());
    })();
    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  const currentStage = useMemo<JourneyStage>(
    () => (so ? inferStage(so, pickLists) : 'sales_order'),
    [so, pickLists],
  );
  const completed = useMemo(() => completedBefore(currentStage), [currentStage]);
  const action = actionForStage(currentStage);

  if (!so) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Order not found.{' '}
          <Link to="/sell/orders" className="text-primary underline-offset-2 hover:underline">
            Back to orders
          </Link>
          .
        </p>
      </div>
    );
  }

  const refresh = () => setReloadKey((k) => k + 1);

  const evaluate = (): GateFailureDetail[] => {
    if (action.key === 'confirm') return evaluateSoToJob(so);
    if (action.key === 'pick') {
      const job = jobs[0];
      return job ? evaluateMakeToShip(job) : [];
    }
    return [];
  };

  const onAdvance = async (): Promise<unknown> => {
    if (action.key === 'confirm') {
      const result = await workflowService.confirmSalesOrder(so.id);
      toast.success(
        `Confirmed — ${result.perLine.length} line(s): ${result.perLine
          .map((l) => l.route)
          .join(', ')}`,
      );
      return result;
    }
    if (action.key === 'pick') {
      const picks = await Promise.all(
        pickLists
          .filter((p) => p.status === 'pending')
          .map((p) => workflowService.pickPickList(p.id, 'emp-003')),
      );
      toast.success(`Picked ${picks.length} pick list(s).`);
      return picks;
    }
    if (action.key === 'deliver') {
      toast.success('Marked delivered (demo).');
      return null;
    }
    return null;
  };

  // ── Per-archetype demo actions ──────────────────────────────────

  const demoActions: Array<{
    archetype: string;
    label: string;
    fn: () => Promise<void>;
  }> = [
    {
      archetype: 'B1',
      label: 'Confirm SO + dispatch lines',
      fn: async () => {
        try {
          const r = await workflowService.confirmSalesOrder(so.id);
          toast.success(`B1 — dispatched ${r.perLine.length} line(s).`);
          refresh();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : String(e));
        }
      },
    },
    {
      archetype: 'B2',
      label: 'Pick all pending pick lists',
      fn: async () => {
        const pending = pickLists.filter((p) => p.status === 'pending');
        if (pending.length === 0) {
          toast.message('B2 — no pending pick lists. Confirm a catalogue line first.');
          return;
        }
        for (const p of pending) await workflowService.pickPickList(p.id, 'emp-003');
        toast.success(`B2 — picked ${pending.length} pick list(s).`);
        refresh();
      },
    },
    {
      archetype: 'B3',
      label: 'Run MTS reorder monitor',
      fn: async () => {
        const inv = mock.inventoryRecords.find(
          (i) => i.productId === 'prod-005' && i.locationId === 'loc-fg',
        );
        if (inv) inv.qtyOnHand = Math.min(inv.qtyOnHand, 50);
        const created = await workflowService.runReorderMonitor();
        toast.success(
          created.length > 0
            ? `B3 — created ${created.length} replenishment Job(s).`
            : 'B3 — no rules tripped (already replenished).',
        );
        refresh();
      },
    },
    {
      archetype: 'B4',
      label: 'Publish ETO BoM → spawn production Job',
      fn: async () => {
        const engJob = mock.jobs.find(
          (j) => j.source === 'engineering' && !mock.jobs.some((c) => c.parentJobId === j.id),
        );
        if (!engJob) {
          toast.message('B4 — no engineering Job awaiting publish. Run B1 with an ETO line first.');
          return;
        }
        const r = await workflowService.publishBomToProductionJob({
          engineeringJobId: engJob.id,
          productId: 'prod-004',
          revision: 'A',
          components: [
            { productId: 'prod-001', qtyPer: 4, isManufactured: true },
            { productId: 'prod-002', qtyPer: 1, isManufactured: false },
          ],
        });
        toast.success(
          `B4 — Published BoM rev ${r.bom.revision}; production Job ${r.productionJob.jobNumber} created.`,
        );
        refresh();
      },
    },
    {
      archetype: 'B5',
      label: 'Raise additive VO',
      fn: async () => {
        const vo = await workflowService.createVariation({
          parentSalesOrderId: so.id,
          type: 'additive',
          costDelta: 1500,
          scheduleDeltaDays: 3,
          description: 'Add 5× bracket (demo).',
        });
        toast.success(`B5 — Raised ${vo.voNumber} (awaiting approval).`);
        refresh();
      },
    },
    {
      archetype: 'B5',
      label: 'Approve oldest pending VO',
      fn: async () => {
        const pending = mock.variationOrders.find(
          (v) => v.parentSalesOrderId === so.id && v.status === 'awaiting_approval',
        );
        if (!pending) {
          toast.message('B5 — no VO awaiting approval. Raise one first.');
          return;
        }
        const r = await workflowService.approveVariation(pending.id, 'emp-001');
        toast.success(
          r.deltaJob
            ? `B5 — Approved ${r.vo.voNumber}; delta Job ${r.deltaJob.jobNumber} spawned.`
            : `B5 — Approved ${r.vo.voNumber} (descope; no delta job).`,
        );
        refresh();
      },
    },
    {
      archetype: 'B6',
      label: 'QC fail → spawn rework WO',
      fn: async () => {
        const wo = mock.workOrders[0];
        if (!wo) {
          toast.error('B6 — no Work Orders to inspect.');
          return;
        }
        await workflowService.recordQualityCheck({
          workOrderId: wo.id,
          result: 'fail',
          inspectorId: 'emp-002',
        });
        try {
          const rework = await workflowService.createReworkWorkOrder({
            parentWorkOrderId: wo.id,
            raisedBy: 'emp-002',
          });
          toast.success(`B6 — QC failed on ${wo.woNumber}; rework ${rework.woNumber} created.`);
        } catch (e) {
          toast.error(
            e instanceof Error ? `B6 — ${e.message}` : 'B6 — rework cap escalation.',
          );
        }
        refresh();
      },
    },
    {
      archetype: 'B7',
      label: 'Release subcontract → receive back',
      fn: async () => {
        const wo = mock.workOrders[1] ?? mock.workOrders[0];
        if (!wo) {
          toast.error('B7 — no Work Orders available.');
          return;
        }
        const dispatch = await workflowService.releaseSubcontract({
          workOrderId: wo.id,
          operationId: 'op-1',
          supplierId: mock.suppliers[0].id,
          materialModel: 'free_issue',
        });
        await new Promise((r) => setTimeout(r, 200));
        await workflowService.receiveSubcontract(dispatch.id);
        toast.success(
          `B7 — Released ${wo.woNumber} to ${mock.suppliers[0].company}; received back.`,
        );
        refresh();
      },
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/sell/orders" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Orders
        </Link>
        <span>/</span>
        <span>{so.orderNumber}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Order</div>
          <h1 className="text-2xl font-semibold">{so.orderNumber}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {so.customerName} · Due {so.deliveryDate} · Total ${so.total.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{so.status}</Badge>
          {action.key !== 'none' && (
            <AdvanceButton
              label={action.label}
              evaluate={evaluate}
              onAdvance={onAdvance}
              onFailures={setFailures}
              onSuccess={refresh}
            />
          )}
        </div>
      </div>

      <JourneyStepper
        currentStage={currentStage}
        completedStages={completed}
        blocked={failures.length > 0}
      />

      {failures.length > 0 && <GateBanner failures={failures} />}

      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Sales Order lines</div>
          <div className="text-xs text-muted-foreground">
            Route is set by <span className="font-medium">Product.defaultRoute</span> and can be overridden per line.
          </div>
        </div>
        {!so.lines || so.lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No line items captured yet — Confirm SO will synthesise one from the order total.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5">Product</th>
                <th className="py-1.5">Qty</th>
                <th className="py-1.5">Unit Price</th>
                <th className="py-1.5">Route</th>
                <th className="py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {so.lines.map((line) => {
                const product = mock.products.find((p) => p.id === line.productId);
                const defaultRoute = product?.defaultRoute ?? 'mto';
                return (
                  <tr key={line.id} className="border-t">
                    <td className="py-1.5">{line.description}</td>
                    <td className="py-1.5">{line.qty}</td>
                    <td className="py-1.5">${line.unitPrice.toFixed(2)}</td>
                    <td className="py-1.5">
                      <RouteOverrideSelect
                        defaultRoute={defaultRoute}
                        routeOverride={line.routeOverride}
                        onChange={(r) => {
                          line.routeOverride = r;
                          refresh();
                        }}
                        disabled={line.status !== 'pending'}
                      />
                    </td>
                    <td className="py-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {line.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {jobs.length > 0 && <JobGraphMini jobs={jobs} />}

      {pickLists.length > 0 && (
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Truck className="h-4 w-4" /> Pick lists (Catalogue Sale fast path)
          </div>
          <ul className="space-y-1 text-sm">
            {pickLists.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span>
                  {p.pickNumber} · {p.lines.length} line(s)
                </span>
                <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {variations.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Variation orders (B5)</div>
          {variations.map((v) => (
            <VOImpactPanel key={v.id} variation={v} onChanged={refresh} />
          ))}
        </div>
      )}

      {workOrders.length > 0 && (
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Wrench className="h-4 w-4" /> Work Order inspectors (B6 — operator QC)
          </div>
          <div className="space-y-2">
            {workOrders.slice(0, 3).map((w) => (
              <QcReworkInspector key={w.id} workOrder={w} onChanged={refresh} />
            ))}
          </div>
        </Card>
      )}

      {subcontracts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertOctagon className="h-4 w-4" /> Subcontract dispatches (B7)
          </div>
          {subcontracts.slice(0, 3).map((s) => (
            <SubcontractTimeline key={s.id} dispatch={s} />
          ))}
        </div>
      )}

      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Demo all seven archetypes</div>
          <div className="text-xs text-muted-foreground">
            Click each to fire the matching mutation; the page reactively updates.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {demoActions.map((a, i) => (
            <Button
              key={`${a.archetype}-${i}`}
              size="sm"
              variant="outline"
              onClick={() => void a.fn()}
            >
              <span className="mr-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                {a.archetype}
              </span>
              {a.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
