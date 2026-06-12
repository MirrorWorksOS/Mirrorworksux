/**
 * Ship Returns — RMA management
 * Token-aligned: #141414 → var(--neutral-900), #F0F0F0 → var(--neutral-200), #8A8A8A → var(--neutral-500)
 * Status dots now use semantic colours
 */
import React, { useMemo, useState } from 'react';
import { PlusCircle, ChevronRight } from 'lucide-react';
import * as mock from '@/services/mock';
import { workflowService } from '@/services/workflowService';
import type { CustomerReturn, CustomerReturnDisposition } from '@/types/entities';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { FilterBar } from '@/components/shared/layout/FilterBar';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MW_BAR_TOOLTIP_CURSOR, MW_RECHARTS_ANIMATION_BAR, MW_TOOLTIP_STYLE, MW_BAR_RADIUS_H, MW_FILL } from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';

type RStatus = CustomerReturn['status'];

const rStatusLabel: Record<RStatus, string> = {
  awaiting_receipt: 'Awaiting receipt',
  received: 'Received',
  closed: 'Closed',
};

const rStatusVariant: Record<RStatus, 'warning' | 'info' | 'dark' | 'neutral'> = {
  awaiting_receipt: 'warning',
  received: 'dark',
  closed: 'neutral',
};

/** Table row derived from the live CustomerReturn collection (D13). */
interface RMA {
  id: string;
  returnId: string;
  order: string;
  customer: string;
  items: number;
  reason: string;
  status: RStatus;
  date: string;
  disposition?: CustomerReturnDisposition;
  creditNoteId?: string;
}

const toRow = (r: CustomerReturn): RMA => ({
  id: r.rmaNumber,
  returnId: r.id,
  order:
    mock.shipments.find((s) => s.id === r.shipmentId)?.shipmentNumber ??
    r.salesOrderId ??
    '—',
  customer: r.customerName,
  items: r.qty,
  reason: r.reason,
  status: r.status,
  date: new Date(r.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }),
  disposition: r.disposition,
  creditNoteId: r.creditNoteId,
});

const REASONS = [
  { reason: 'Defective',  count: 8 },
  { reason: 'Damaged',    count: 5 },
  { reason: 'Wrong Item', count: 4 },
  { reason: 'Other',      count: 2 },
];

const TIMELINE_STAGES: RStatus[] = ['awaiting_receipt', 'received', 'closed'];

const returnColumns: MwColumnDef<RMA>[] = [
  { key: 'id', header: 'RMA', tooltip: 'Return merchandise authorisation number', cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.id}</span> },
  { key: 'customer', header: 'Customer', cell: (r) => <span className="text-foreground">{r.customer}</span> },
  { key: 'reason', header: 'Reason', tooltip: 'Return reason category', className: 'text-xs text-[var(--neutral-500)]', cell: (r) => r.reason },
  {
    key: 'status',
    header: 'Status',
    tooltip: 'Current return status',
    cell: (r) => (
      <StatusBadge variant={rStatusVariant[r.status]}>{rStatusLabel[r.status]}</StatusBadge>
    ),
  },
  { key: 'date', header: 'Date', className: 'text-[var(--neutral-500)] tabular-nums', cell: (r) => r.date },
  { key: 'arrow', header: '', cell: () => <ChevronRight className="w-4 h-4 text-[var(--neutral-200)]" /> },
];

const RMA_REASONS = ['Defective', 'Damaged', 'Wrong Item', 'Change of Mind', 'Other'];

export function ShipReturns() {
  const [reloadKey, setReloadKey] = useState(0);
  const rmas = useMemo(
    () => [...mock.customerReturns].reverse().map(toRow),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mock store mutates in place
    [reloadKey],
  );
  const [selected, setSelected] = useState<RMA | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Create-RMA form state — returns are raised against DELIVERED shipments
  // (decision D13: you can't return what hasn't arrived).
  const deliveredShipments = useMemo(
    () => mock.shipments.filter((s) => s.actualDelivery || s.stage === 'delivered'),
    [],
  );
  const [formShipmentId, setFormShipmentId] = useState('');
  const [formItems, setFormItems] = useState('1');
  const [formReason, setFormReason] = useState(RMA_REASONS[0]);

  const resetForm = () => {
    setFormShipmentId('');
    setFormItems('1');
    setFormReason(RMA_REASONS[0]);
  };

  const refreshSelected = (returnId: string) => {
    const fresh = mock.customerReturns.find((r) => r.id === returnId);
    setSelected(fresh ? toRow(fresh) : null);
    setReloadKey((k) => k + 1);
  };

  const handleCreateRma = async () => {
    const items = Number(formItems);
    if (!formShipmentId) {
      toast.error('Pick a delivered shipment to raise the return against');
      return;
    }
    if (!Number.isInteger(items) || items < 1) {
      toast.error('Enter at least 1 item');
      return;
    }
    setBusy(true);
    try {
      const rma = await workflowService.createReturn({
        shipmentId: formShipmentId,
        qty: items,
        reason: formReason,
      });
      toast.success(`${rma.rmaNumber} created`, {
        description: `${rma.customerName} · ${rma.reason} — awaiting receipt`,
      });
      resetForm();
      setCreateOpen(false);
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create the return.');
    } finally {
      setBusy(false);
    }
  };

  const handleReceive = async (row: RMA) => {
    setBusy(true);
    try {
      await workflowService.receiveReturn(row.returnId);
      toast.success(`${row.id} received — choose a disposition.`);
      refreshSelected(row.returnId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Receive failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDispose = async (row: RMA, disposition: CustomerReturnDisposition) => {
    setBusy(true);
    try {
      const creditAmount =
        disposition === 'restock' || disposition === 'scrap'
          ? Number(window.prompt('Credit owed to the customer (0 for none):', '0')) || 0
          : 0;
      const r = await workflowService.disposeReturn(row.returnId, {
        disposition,
        by: 'emp-001',
        creditAmount,
      });
      toast.success(
        `${row.id} closed — ${disposition}` +
          (r.reworkJob ? ` · rework Job ${r.reworkJob.jobNumber}` : '') +
          (r.creditNote ? ` · credit note ${r.creditNote.creditNoteNumber}` : ''),
      );
      refreshSelected(row.returnId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Disposition failed.');
    } finally {
      setBusy(false);
    }
  };

  const pendingCount = rmas.filter(r => r.status === 'awaiting_receipt').length;
  const receivedCount = rmas.filter(r => r.status === 'received').length;
  const closedCount = rmas.filter(r => r.status === 'closed').length;
  const creditedCount = rmas.filter(r => r.creditNoteId).length;

  return (
    <PageShell className="overflow-y-auto">
      <PageHeader
        title="Returns"
        actions={
          <button
            type="button"
            className="h-14 px-5 rounded-full text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground transition-colors flex items-center gap-2 font-medium"
            onClick={() => setCreateOpen(true)}
          >
            <PlusCircle className="w-4 h-4" /> Create RMA
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Awaiting receipt', value: pendingCount, sub: 'Goods on the way back', bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]' },
          { label: 'Received', value: receivedCount, sub: 'Ready for QC disposition', bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'Closed', value: closedCount, sub: `${rmas.length} total RMAs`, bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Credited', value: creditedCount, sub: 'Credit note raised', bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
        ].map(s => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-lg p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search returns…"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <MwDataTable
            columns={returnColumns}
            data={rmas}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => setSelected(r)}
            selectable
            onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
            onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
          />
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <Card className="p-6">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">This month</span>
            <div className="text-3xl text-foreground mt-1 font-medium tabular-nums">12</div>
          </Card>
          <Card className="p-6">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium block mb-4">Top reasons</span>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={REASONS} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 10, fill: 'var(--neutral-500)' }} width={70} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={MW_TOOLTIP_STYLE} cursor={MW_BAR_TOOLTIP_CURSOR} />
                {mwChartPatternDefs()}
                <Bar key="count" dataKey="count" fill={MW_FILL.HATCH_DARK} radius={MW_BAR_RADIUS_H} barSize={10} {...MW_RECHARTS_ANIMATION_BAR} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Avg processing</span>
            <div className="text-3xl text-foreground mt-1 font-medium tabular-nums">
              4.2<span className="text-sm text-[var(--neutral-500)] ml-1">days</span>
            </div>
          </Card>
          <Card className="p-6">
            <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Return rate</span>
            <div className="text-3xl text-foreground mt-1 font-medium tabular-nums">2.8%</div>
          </Card>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Return details</SheetTitle>
          {selected && (() => {
            return (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
                  <p className="text-xl font-medium text-foreground">{selected.id}</p>
                  <SheetDescription className="text-[var(--neutral-500)]">{selected.customer} · {selected.reason}</SheetDescription>
                </SheetHeader>
                <div className="px-6 py-6 space-y-6">
                  <div className="bg-[var(--neutral-100)] rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[var(--neutral-500)]">Order</span><span className="font-medium tabular-nums">{selected.order}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--neutral-500)]">Items</span><span className="font-medium tabular-nums">{selected.items}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--neutral-500)]">Created</span><span>{selected.date}</span></div>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium">Progress</span>
                    <div className="space-y-0 relative mt-3">
                      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[var(--neutral-200)]" />
                      {TIMELINE_STAGES.map((stage, i) => {
                        const idx = TIMELINE_STAGES.indexOf(selected.status);
                        const done = i <= idx;
                        return (
                          <div key={stage} className="flex items-center gap-4 relative py-2">
                            <div className={cn(
                              'w-4 h-4 rounded-full shrink-0 z-10 border-2 transition-colors',
                              done ? 'bg-[var(--mw-mirage)] border-[var(--mw-mirage)]' : 'bg-card border-[var(--border)]'
                            )} />
                            <span className={cn('text-sm', done ? 'text-foreground font-medium' : 'text-[var(--neutral-400)]')}>
                              {rStatusLabel[stage]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {selected.status === 'awaiting_receipt' && (
                      <button
                        disabled={busy}
                        onClick={() => void handleReceive(selected)}
                        className="w-full h-14 rounded-full text-sm bg-[var(--mw-mirage)] text-white hover:bg-[var(--neutral-800)] transition-colors font-medium disabled:opacity-50"
                      >
                        Receive return
                      </button>
                    )}
                    {selected.status === 'received' && (
                      <>
                        <p className="text-xs text-[var(--neutral-500)]">
                          QC disposition (decision D13 — reuses the QC machinery):
                        </p>
                        <button
                          disabled={busy}
                          onClick={() => void handleDispose(selected, 'restock')}
                          className="w-full h-12 rounded-full text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground transition-colors font-medium disabled:opacity-50"
                        >
                          Restock to FG
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => void handleDispose(selected, 'rework')}
                          className="w-full h-12 rounded-full text-sm border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)] transition-colors font-medium disabled:opacity-50"
                        >
                          Raise rework Job
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => void handleDispose(selected, 'scrap')}
                          className="w-full h-12 rounded-full text-sm border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)] transition-colors font-medium disabled:opacity-50"
                        >
                          Scrap
                        </button>
                      </>
                    )}
                    {selected.status === 'closed' && (
                      <div className="rounded-lg bg-[var(--neutral-100)] p-4 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[var(--neutral-500)]">Disposition</span>
                          <span className="font-medium">{selected.disposition ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--neutral-500)]">Credit note</span>
                          <span className="font-medium tabular-nums">
                            {selected.creditNoteId ?? 'none owed'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Create RMA dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) resetForm(); setCreateOpen(o); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create RMA</DialogTitle>
            <DialogDescription>
              Raise a return merchandise authorisation against a shipped order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">Delivered shipment</Label>
              <Select value={formShipmentId} onValueChange={setFormShipmentId}>
                <SelectTrigger className="mt-1 h-10 w-full text-sm">
                  <SelectValue placeholder="Pick a delivered shipment…" />
                </SelectTrigger>
                <SelectContent>
                  {deliveredShipments.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.shipmentNumber} · {s.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-[var(--neutral-500)]">
                Returns are raised against delivered shipments only (PoD recorded).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rma-items" className="text-xs text-[var(--neutral-500)]">Items</Label>
                <Input
                  id="rma-items"
                  type="number"
                  min="1"
                  value={formItems}
                  onChange={(e) => setFormItems(e.target.value)}
                  className="mt-1 h-10 tabular-nums"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--neutral-500)]">Reason</Label>
                <Select value={formReason} onValueChange={setFormReason}>
                  <SelectTrigger className="mt-1 h-10 w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RMA_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-10" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="h-10" disabled={busy} onClick={() => void handleCreateRma()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create RMA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}