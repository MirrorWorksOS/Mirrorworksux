/**
 * BuyRequisitionDetail — Full-page requisition detail using JobWorkspaceLayout.
 * Route: /buy/requisitions/:id
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle2, XCircle, Send, Printer } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { toast } from 'sonner';
import { requisitions, employees, purchaseOrders } from '@/services';

/* ------------------------------------------------------------------ */
/*  Build lookup from centralised data                                */
/* ------------------------------------------------------------------ */

const REQ_BY_ID = Object.fromEntries(
  requisitions.map((r) => [r.id, r]),
);

const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? id;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_LABEL: Record<string, string> = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
  converted: 'Converted to PO',
};

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'line-items', label: 'Line Items' },
  { id: 'approvals', label: 'Approvals' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const createBlankRequisition = () => ({
  id: `new-${Date.now()}`,
  reqNumber: 'REQ-NEW',
  requestorId: '',
  requestorName: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'draft' as const,
  items: [] as any[],
  total: 0,
});

export function BuyRequisitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isNew = !id || id === 'new';
  const req = isNew ? createBlankRequisition() : (id ? REQ_BY_ID[id] : undefined);

  const handleSave = () => {
    // TODO(backend): isNew ? requisitions.create(req) : requisitions.update(req.id, req)
    if (isNew && req) {
      toast.success('Requisition created');
      navigate(`/buy/requisitions/${req.id}`, { replace: true });
    } else {
      toast.success('Requisition saved');
    }
  };

  const tabConfig = useMemo(() => {
    if (!req) return DEFAULT_TABS;
    return DEFAULT_TABS.map((t) => {
      if (t.id === 'line-items') return { ...t, count: req.items.length };
      return t;
    });
  }, [req]);

  if (!req) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/buy/requisitions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to requisitions
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Requisition not found. Open one from the requisitions list.
        </p>
      </div>
    );
  }

  const linkedPO = purchaseOrders.find((po) => po.total === req.total && po.supplierId);

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left — Details */}
            <Card className="lg:col-span-3 p-6 space-y-5">
              <h3 className="text-sm font-medium text-foreground">Requisition Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Requisition #', value: req.reqNumber },
                  { label: 'Date', value: fmtDate(req.date) },
                  { label: 'Requestor', value: req.requestorName },
                  { label: 'Department', value: empName(req.requestorId).includes('Sharma') ? 'Purchasing' : 'Sales' },
                  { label: 'Total Value', value: fmtCurrency(req.total) },
                  { label: 'Items', value: `${req.items.length} line item${req.items.length !== 1 ? 's' : ''}` },
                ].map((f) => (
                  <div key={f.label}>
                    <Label className="text-xs text-[var(--neutral-500)]">{f.label}</Label>
                    <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right — Status + Actions */}
            <Card className="lg:col-span-2 p-6 space-y-5">
              <h3 className="text-sm font-medium text-foreground">Status</h3>
              <StatusBadge status={req.status === 'pending_approval' ? 'pending' : req.status}>
                {STATUS_LABEL[req.status] ?? req.status}
              </StatusBadge>

              {linkedPO && (
                <div className="pt-4 border-t border-[var(--border)]">
                  <Label className="text-xs text-[var(--neutral-500)]">Linked PO</Label>
                  <Link
                    to={`/buy/orders`}
                    className="text-sm font-medium text-[var(--mw-blue)] hover:underline block mt-0.5"
                  >
                    {linkedPO.poNumber}
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <Button
                  className="w-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                  onClick={() => toast.success('Requisition approved')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[var(--border)]"
                  onClick={() => toast('Requisition rejected')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'line-items': {
        type ReqItem = (typeof req.items)[number];
        const columns: MwColumnDef<ReqItem>[] = [
          {
            key: 'productId',
            header: 'Item',
            tooltip: 'Product SKU',
            cell: (item) => <span className="font-medium tabular-nums">{item.productId}</span>,
          },
          {
            key: 'description',
            header: 'Description',
            cell: (item) => <span className="text-foreground">{item.description}</span>,
          },
          {
            key: 'qty',
            header: 'Qty',
            headerClassName: 'text-right',
            cell: (item) => <span className="tabular-nums">{item.qty}</span>,
            className: 'text-right',
          },
          {
            key: 'estimatedCost',
            header: 'Est. Cost',
            headerClassName: 'text-right',
            cell: (item) => <span className="tabular-nums">{fmtCurrency(item.estimatedCost)}</span>,
            className: 'text-right',
          },
          {
            key: 'total',
            header: 'Total',
            headerClassName: 'text-right',
            cell: (item) => (
              <span className="font-medium tabular-nums">
                {fmtCurrency(item.qty * item.estimatedCost)}
              </span>
            ),
            className: 'text-right',
          },
        ];

        return (
          <div className="space-y-4">
            <MwDataTable<ReqItem>
              columns={columns}
              data={req.items}
              keyExtractor={(_, i) => i}
              striped
            />
            <div className="flex justify-end px-2">
              <div className="text-sm font-medium text-foreground tabular-nums">
                Total: {fmtCurrency(req.total)}
              </div>
            </div>
          </div>
        );
      }

      case 'approvals':
        return (
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Approval History</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[var(--neutral-100)] rounded-[var(--shape-lg)]">
                <Send className="w-4 h-4 text-[var(--neutral-500)]" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">Submitted by {req.requestorName}</p>
                  <p className="text-xs text-[var(--neutral-500)]">{fmtDate(req.date)}</p>
                </div>
                <StatusBadge variant="neutral">Submitted</StatusBadge>
              </div>
              {req.status === 'approved' && (
                <div className="flex items-center gap-3 p-3 bg-[var(--neutral-100)] rounded-[var(--shape-lg)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--mw-green)]" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Approved by Sarah Chen</p>
                    <p className="text-xs text-[var(--neutral-500)]">{fmtDate(req.date)}</p>
                  </div>
                  <StatusBadge variant="success">Approved</StatusBadge>
                </div>
              )}
              {req.status === 'pending_approval' && (
                <div className="flex items-center gap-3 p-3 border border-dashed border-[var(--border)] rounded-[var(--shape-lg)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--neutral-400)]" />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--neutral-500)]">Awaiting approval</p>
                  </div>
                  <StatusBadge variant="warning">Pending</StatusBadge>
                </div>
              )}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Buy', href: '/buy' },
        { label: 'Requisitions', href: '/buy/requisitions' },
        { label: isNew ? 'New' : req.reqNumber },
      ]}
      title={isNew ? 'New Requisition' : `Requisition ${req.reqNumber}`}
      subtitle={
        isNew ? (
          <span className="text-sm text-[var(--neutral-500)]">
            Fill out the details below and click Save to create.
          </span>
        ) : (
          <span className="text-sm text-[var(--neutral-500)]">
            {req.requestorName} &middot; {fmtDate(req.date)} &middot; {fmtCurrency(req.total)}
          </span>
        )
      }
      metaRow={
        isNew ? null : (
          <div className="flex items-center gap-2">
            <StatusBadge status={req.status === 'pending_approval' ? 'pending' : req.status}>
              {STATUS_LABEL[req.status] ?? req.status}
            </StatusBadge>
          </div>
        )
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to="/buy/requisitions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          {isNew ? (
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={handleSave}
            >
              Save
            </Button>
          ) : (
            <>
              <Button variant="outline" className="border-[var(--border)]" onClick={() => toast('Printing…')}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button
                className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
                onClick={() => {
                  // TODO(backend): requisitions.convertToPO(req.id) — server creates the PO and returns its id
                  navigate(`/buy/orders/new?requisitionId=${req.id}`);
                }}
              >
                <Send className="mr-2 h-4 w-4" /> Convert to PO
              </Button>
            </>
          )}
        </>
      }
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}
