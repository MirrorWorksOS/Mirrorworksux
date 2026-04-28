/**
 * MakeWorkOrderDetail — full-page work-order detail with deep links.
 * Routes: /make/work-orders/:id and /make/work-orders/new (isNew mode).
 *
 * Floor-execution lives in /floor (kiosk session, traveller-aware). This page
 * is the office-side single source of truth — for browsing, editing header
 * fields, and linking back to the parent MO.
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router';
import { ArrowLeft, ArrowRight, Save, Wrench, Factory } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { workOrders, manufacturingOrders } from '@/services';

const WO_BY_ID = Object.fromEntries(workOrders.map((w) => [w.id, w]));
const MO_BY_ID = Object.fromEntries(manufacturingOrders.map((m) => [m.id, m]));

type EditableWorkOrder = {
  id: string;
  woNumber: string;
  manufacturingOrderId: string;
  machineName: string;
  operation: string;
  sequence: number;
  estimatedMinutes: number;
  actualMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  operatorName: string;
};

const createBlankWorkOrder = (preset: { manufacturingOrderId?: string } = {}): EditableWorkOrder => ({
  id: `new-${Date.now()}`,
  woNumber: '',
  manufacturingOrderId: preset.manufacturingOrderId ?? '',
  machineName: '',
  operation: '',
  sequence: 1,
  estimatedMinutes: 0,
  actualMinutes: 0,
  status: 'pending',
  operatorName: '',
});

const TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'execution', label: 'Execution' },
];

export function MakeWorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = !id || id === 'new';
  const [activeTab, setActiveTab] = useState('overview');

  const stored = !isNew && id ? WO_BY_ID[id] : undefined;
  const initialBlank = useMemo(
    () => createBlankWorkOrder({ manufacturingOrderId: searchParams.get('moId') ?? undefined }),
    [searchParams],
  );

  const [draft, setDraft] = useState<EditableWorkOrder>(() =>
    stored
      ? {
          id: stored.id,
          woNumber: stored.woNumber,
          manufacturingOrderId: stored.manufacturingOrderId,
          machineName: stored.machineName,
          operation: stored.operation,
          sequence: stored.sequence,
          estimatedMinutes: stored.estimatedMinutes,
          actualMinutes: stored.actualMinutes,
          status: stored.status as EditableWorkOrder['status'],
          operatorName: stored.operatorName ?? '',
        }
      : initialBlank,
  );

  if (!isNew && !stored) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/make/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to work orders
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Work order not found.</p>
      </div>
    );
  }

  const parentMO = draft.manufacturingOrderId ? MO_BY_ID[draft.manufacturingOrderId] : undefined;

  const handleSave = () => {
    // TODO(backend): isNew ? workOrders.create(draft) : workOrders.update(draft.id, draft)
    if (isNew) {
      toast.success('Work order created');
      navigate(`/make/work-orders/${draft.id}`, { replace: true });
    } else {
      toast.success('Work order saved');
    }
  };

  const renderTabPanel = (tab: string) => {
    if (tab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiStatCard label="Estimated" value={`${draft.estimatedMinutes} min`} icon={Wrench} />
            <KpiStatCard label="Actual" value={`${draft.actualMinutes} min`} icon={Wrench} />
            <KpiStatCard
              label="Variance"
              value={`${draft.actualMinutes - draft.estimatedMinutes} min`}
              icon={Wrench}
            />
          </div>

          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-medium text-foreground">Work order header</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">WO Number</Label>
                <Input
                  value={draft.woNumber}
                  onChange={(e) => setDraft({ ...draft, woNumber: e.target.value })}
                  placeholder="WO-2026-NNNN"
                  className="mt-1 h-10 border-[var(--border)] tabular-nums"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">Operation</Label>
                <Input
                  value={draft.operation}
                  onChange={(e) => setDraft({ ...draft, operation: e.target.value })}
                  placeholder="e.g. Rough turn Ring Gear blank"
                  className="mt-1 h-10 border-[var(--border)]"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">Machine</Label>
                <Input
                  value={draft.machineName}
                  onChange={(e) => setDraft({ ...draft, machineName: e.target.value })}
                  placeholder="CNC Lathe"
                  className="mt-1 h-10 border-[var(--border)]"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">Operator</Label>
                <Input
                  value={draft.operatorName}
                  onChange={(e) => setDraft({ ...draft, operatorName: e.target.value })}
                  placeholder="Assigned operator"
                  className="mt-1 h-10 border-[var(--border)]"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">Sequence</Label>
                <Input
                  type="number"
                  value={draft.sequence}
                  onChange={(e) => setDraft({ ...draft, sequence: Number(e.target.value) || 0 })}
                  className="mt-1 h-10 border-[var(--border)] tabular-nums"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">Estimated min</Label>
                <Input
                  type="number"
                  value={draft.estimatedMinutes}
                  onChange={(e) => setDraft({ ...draft, estimatedMinutes: Number(e.target.value) || 0 })}
                  className="mt-1 h-10 border-[var(--border)] tabular-nums"
                />
              </div>
            </div>
          </Card>

          {parentMO && (
            <Card className="p-6 space-y-2">
              <h3 className="text-sm font-medium text-foreground inline-flex items-center gap-2">
                <Factory className="w-4 h-4 text-[var(--neutral-500)]" />
                Parent manufacturing order
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground tabular-nums">{parentMO.moNumber}</p>
                  <p className="text-xs text-[var(--neutral-500)]">
                    {parentMO.productName} &middot; {parentMO.customerName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-[var(--border)]"
                  onClick={() => navigate(`/make/manufacturing-orders/${parentMO.id}`)}
                >
                  Open MO <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      );
    }

    if (tab === 'execution') {
      return (
        <Card className="p-6 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Floor execution</h3>
          <p className="text-sm text-[var(--neutral-500)]">
            Live execution (timer, parts counter, traveller scan) happens inside the kiosk session at <Link to="/floor" className="text-[var(--mw-blue)] hover:underline">/floor</Link>.
            This page is the office-side header view; status is reflected back here once the operator clocks the run.
          </p>
          <div className="pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[var(--neutral-500)]">Status</p>
              <div className="mt-1">
                <StatusBadge status={draft.status === 'in_progress' ? 'progress' : draft.status === 'completed' ? 'completed' : 'draft'}>
                  {draft.status}
                </StatusBadge>
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--neutral-500)]">Actual min</p>
              <p className="font-medium tabular-nums mt-1">{draft.actualMinutes}</p>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Make', href: '/make' },
        { label: 'Work orders', href: '/make/work-orders' },
        { label: isNew ? 'New' : draft.woNumber || draft.id },
      ]}
      title={isNew ? 'New Work Order' : draft.woNumber || 'Work Order'}
      subtitle={
        isNew ? (
          <span className="text-sm text-[var(--neutral-500)]">
            Capture WO details and click Save to create.
          </span>
        ) : (
          <span className="text-sm text-[var(--neutral-500)]">
            {draft.operation} &middot; {draft.machineName}
          </span>
        )
      }
      metaRow={
        isNew ? null : (
          <div className="flex items-center gap-2">
            <StatusBadge status={draft.status === 'in_progress' ? 'progress' : draft.status === 'completed' ? 'completed' : 'draft'}>
              {draft.status}
            </StatusBadge>
            {parentMO && (
              <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs tabular-nums">
                {parentMO.moNumber}
              </Badge>
            )}
          </div>
        )
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to="/make/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" /> {isNew ? 'Save' : 'Save changes'}
          </Button>
        </>
      }
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}
