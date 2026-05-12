/**
 * Ship Tracking — schema-driven filter bar migration.
 *
 * Replaces the dead search input + exception toggle with `ModuleFilterBar`.
 * Wires the facets the existing `Shipment` model supports (status, carrier,
 * search by tracking#/customer). Most other facets in
 * `docs/plans/filters/ship.md` need data prerequisites and are TODO'd.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Clock,
  Columns3,
  DollarSign,
  ExternalLink,
  List as ListIcon,
  PackageCheck,
  Send,
  Truck,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../ui/utils';
import { TimelineView, type TimelineEvent } from '@/components/shared/schedule/TimelineView';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';
import { useDraftInvoiceStore } from '@/store/draftInvoiceStore';

import {
  ModuleFilterBar,
  applyFilters,
  registerSystemPresets,
  useModuleFilters,
  type FilterSchema,
} from '@/components/shared/filters';

type Status = 'shipped' | 'transit' | 'delivering' | 'delivered' | 'exception';

const statusConfig: Record<Status, { label: string; dot: string; badge: string; text: string }> = {
  shipped:    { label: 'Shipped',     dot: 'var(--neutral-400)', badge: 'bg-[var(--neutral-100)]',  text: 'text-[var(--neutral-500)]' },
  transit:    { label: 'In Transit',  dot: 'var(--mw-blue)', badge: 'bg-[var(--mw-blue-100)]',  text: 'text-[var(--mw-blue)]' },
  delivering: { label: 'Delivering',  dot: 'var(--mw-amber)', badge: 'bg-[var(--mw-amber-100)]',  text: 'text-[var(--mw-amber)]' },
  delivered:  { label: 'Delivered',   dot: 'var(--mw-mirage)', badge: 'bg-[var(--neutral-100)]',  text: 'text-foreground' },
  exception:  { label: 'Exception',   dot: 'var(--mw-error)', badge: 'bg-[var(--mw-error-100)]',  text: 'text-[var(--mw-error)]' },
};

interface Shipment {
  tracking: string; customer: string; carrier: string;
  status: Status; eta: string; updated: string;
  /** Inferred invoice amount (AUD) used when auto-drafting on delivery. */
  amount: number;
}

const INITIAL_SHIPMENTS: Shipment[] = [
  { tracking: 'SP-001', customer: 'Meridian Fabrication', carrier: 'StarTrack', status: 'transit',    eta: '03 Mar',  updated: '1h ago',  amount: 18450 },
  { tracking: 'SP-002', customer: 'Acme Steel',     carrier: 'Toll',      status: 'delivering', eta: 'Today',   updated: '25m ago', amount: 9200  },
  { tracking: 'SP-003', customer: 'Pacific Fab',    carrier: 'Aus Post',  status: 'delivered',  eta: '—',       updated: '28 Feb',  amount: 4750  },
  { tracking: 'SP-004', customer: 'Hunter Steel',   carrier: 'TNT',       status: 'exception',  eta: 'Delayed', updated: '5h ago',  amount: 12300 },
  { tracking: 'SP-005', customer: 'BHP Contractors',carrier: 'DHL',       status: 'delivered',  eta: '—',       updated: '27 Feb',  amount: 28900 },
  { tracking: 'SP-006', customer: 'Sydney Rail',    carrier: 'StarTrack', status: 'transit',    eta: '04 Mar',  updated: '3h ago',  amount: 15600 },
  { tracking: 'SP-007', customer: 'Kemppi Welding', carrier: 'Sendle',    status: 'shipped',    eta: '06 Mar',  updated: '1d ago',  amount: 6800  },
  { tracking: 'SP-008', customer: 'Oberon Eng',     carrier: 'Aramex',    status: 'exception',  eta: 'Unknown', updated: '2d ago',  amount: 3400  },
];

const TIMELINE = [
  { step: 'Order Placed',     time: '25 Feb 09:15', done: true },
  { step: 'Picked & Packed',  time: '25 Feb 14:30', done: true },
  { step: 'Shipped',          time: '25 Feb 16:00', done: true },
  { step: 'In Transit',       time: '26 Feb 08:00', done: true,  current: true },
  { step: 'Out for Delivery', time: 'Est. 03 Mar',  done: false },
  { step: 'Delivered',        time: '',             done: false },
];

const trackingColumns: MwColumnDef<Shipment>[] = [
  { key: 'tracking', header: 'Tracking', tooltip: 'Shipment tracking number', cell: (row) => (
    <span className="font-medium tabular-nums text-foreground inline-flex items-center gap-1.5">
      <Truck className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
      {row.tracking}
    </span>
  ) },
  { key: 'customer', header: 'Customer', cell: (row) => <span className="text-foreground">{row.customer}</span> },
  { key: 'carrier', header: 'Carrier', tooltip: 'Shipping carrier', cell: (row) => <span className="text-[var(--neutral-500)]">{row.carrier}</span> },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => {
      const cfg = statusConfig[row.status];
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
          <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.badge, cfg.text)}>{cfg.label}</Badge>
        </div>
      );
    },
  },
  {
    key: 'eta',
    header: 'ETA',
    tooltip: 'Estimated time of arrival',
    cell: (row) => (
      <span className={cn('text-sm', row.eta === 'Today' ? 'font-medium' : 'font-normal', row.status === 'exception' ? 'text-[var(--mw-error)]' : 'text-[var(--neutral-500)]')}>
        {row.eta}
      </span>
    ),
  },
  { key: 'updated', header: 'Updated', cell: (row) => <span className="text-xs text-[var(--neutral-500)]">{row.updated}</span> },
];

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

const MODULE_ID = 'ship.tracking';

const carrierOptions = Array.from(new Set(INITIAL_SHIPMENTS.map((s) => s.carrier))).map((c) => ({
  value: c,
  label: c,
}));

const customerOptions = Array.from(new Set(INITIAL_SHIPMENTS.map((s) => s.customer))).map((c) => ({
  value: c,
  label: c,
}));

const trackingFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Tracking',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'shipped',    label: 'Shipped',    color: 'var(--neutral-400)' },
        { value: 'transit',    label: 'In transit', color: 'var(--mw-blue)' },
        { value: 'delivering', label: 'Delivering', color: 'var(--mw-amber)' },
        { value: 'delivered',  label: 'Delivered',  color: 'var(--mw-success)' },
        { value: 'exception',  label: 'Exception',  color: 'var(--mw-error)' },
      ],
    },
    {
      id: 'carrier',
      label: 'Carrier',
      kind: 'multi',
      icon: Truck,
      pinned: true,
      options: carrierOptions,
    },
    { id: 'customer', label: 'Customer', kind: 'select', options: customerOptions },
    { id: 'value', label: 'Value', kind: 'range', icon: DollarSign },
    // TODO(filters): needs typed `etaAt: ISODate` on Shipment — today's `eta`
    // is a display string ("Today", "03 Mar", "Delayed") and can't power a
    // date facet or Calendar view.
    // TODO(filters): needs typed `lastEventAt: ISODate` on Shipment for the
    // "Silent > 24h" smart-filter.
    // TODO(filters): needs `destination: { state, postcode, lat?, lng? }` on
    // Shipment for the region facet and Map view.
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    // TODO(filters): Map view needs destination + geocoding.
    // TODO(filters): Calendar view needs typed etaAt.
  ],
  defaultView: 'list',
  // TODO(filters): wire dateFacetId once etaAt is ISO.
};

registerSystemPresets(MODULE_ID, [
  {
    name: 'Exceptions board',
    icon: AlertTriangle,
    iconTone: 'error',
    state: {
      values: { status: ['exception'] },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'Delivering today',
    icon: Truck,
    iconTone: 'yellow',
    state: {
      values: { status: ['delivering'] },
      search: '',
      view: 'list',
    },
  },
  {
    name: 'High-value in transit',
    icon: DollarSign,
    iconTone: 'info',
    state: {
      values: { status: ['transit'], value: { from: 10000 } },
      search: '',
      view: 'list',
    },
  },
  // TODO(filters): "Silent > 24h" preset needs typed lastEventAt.
  {
    name: 'Stale — needs review',
    icon: Clock,
    iconTone: 'warning',
    state: {
      values: { status: ['shipped'] },
      search: '',
      view: 'list',
    },
  },
]);

export function ShipTracking() {
  const navigate = useNavigate();
  const addDraftInvoice = useDraftInvoiceStore((s) => s.addFromShipment);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [selected, setSelected]               = useState<Shipment | null>(null);

  const filters = useModuleFilters(trackingFilterSchema);
  const { state } = filters;

  const filtered = useMemo(
    () =>
      applyFilters({
        schema: trackingFilterSchema,
        state,
        rows: shipments,
        getSearchText: (s) => `${s.tracking} ${s.customer} ${s.carrier}`,
        getFacetValue: (s, id) => {
          switch (id) {
            case 'status': return s.status;
            case 'carrier': return s.carrier;
            case 'customer': return s.customer;
            case 'value': return s.amount;
            default: return undefined;
          }
        },
      }),
    [shipments, state],
  );

  const inTransitCount = shipments.filter(s => s.status === 'transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const deliveringCount = shipments.filter(s => s.status === 'delivering').length;
  const exceptionCount = shipments.filter(s => s.status === 'exception').length;

  const markDelivered = (shipment: Shipment) => {
    // Update local state — flip the shipment row to delivered.
    setShipments((prev) =>
      prev.map((s) =>
        s.tracking === shipment.tracking
          ? { ...s, status: 'delivered' as Status, eta: '—', updated: 'just now' }
          : s,
      ),
    );
    setSelected((cur) =>
      cur && cur.tracking === shipment.tracking
        ? { ...cur, status: 'delivered', eta: '—', updated: 'just now' }
        : cur,
    );

    // Push a draft invoice into the shared store and notify the user.
    const draft = addDraftInvoice({
      shipment: shipment.tracking,
      customer: shipment.customer,
      amount: shipment.amount,
    });

    // TODO(backend): book.invoices.draftFromShipment(shipment.tracking)
    toast.success(`Invoice ${draft.id} drafted`, {
      description: `Auto-drafted from delivered shipment ${shipment.tracking}`,
      action: {
        label: 'View in Book',
        onClick: () => navigate(`/book/invoices/${draft.id}`),
      },
    });
  };

  return (
    <PageShell className="overflow-y-auto">
      <PageHeader title="Tracking" />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'In Transit', value: inTransitCount, sub: 'On the way', bg: 'bg-[var(--mw-blue-100)]', text: 'text-[var(--mw-blue)]' },
          { label: 'Delivering', value: deliveringCount, sub: 'Out for delivery', bg: 'bg-[var(--mw-yellow-50)]', text: 'text-foreground' },
          { label: 'Delivered', value: deliveredCount, sub: `${shipments.length} total`, bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
          { label: 'Exceptions', value: exceptionCount, sub: 'Needs attention', bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]' },
        ].map(s => (
          <Card key={s.label} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <p className="text-xs text-[var(--neutral-500)] font-medium mb-1">{s.label}</p>
            <p className={cn('text-2xl tabular-nums font-medium', s.text)}>{s.value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <ModuleFilterBar
        schema={trackingFilterSchema}
        filters={filters}
        searchPlaceholder="Search tracking…"
      />

      <MwDataTable
        columns={trackingColumns}
        data={filtered}
        keyExtractor={(row) => row.tracking}
        onRowClick={(row) => setSelected(row)}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
      />

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Tracking details</SheetTitle>
          {selected && (() => {
            const cfg = statusConfig[selected.status];
            return (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
                  <p className="text-xl  font-medium text-foreground">{selected.tracking}</p>
                  <SheetDescription className="text-[var(--neutral-500)]">{selected.customer} · {selected.carrier}</SheetDescription>
                </SheetHeader>
                <div className="px-6 py-6 space-y-6">
                  {/* Timeline */}
                  <div>
                    <span className="text-xs text-[var(--neutral-500)] tracking-widest uppercase font-medium mb-3 block">Timeline</span>
                    <TimelineView
                      events={TIMELINE.map((evt, i): TimelineEvent => ({
                        id: `step-${i}`,
                        title: evt.step,
                        timestamp: evt.time,
                        status: evt.current ? 'current' : evt.done ? 'completed' : 'upcoming',
                      }))}
                    />
                  </div>

                  {/* Details */}
                  <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-4 space-y-2">
                    {[
                      { l: 'Weight',  v: '12.4 kg',                          mono: true },
                      { l: 'Dims',    v: '45×35×25 cm',                      mono: true },
                      { l: 'Address', v: '45 Industrial Dr, Silverwater NSW', mono: false },
                    ].map(d => (
                      <div key={d.l} className="flex justify-between text-sm">
                        <span className="text-[var(--neutral-500)]">{d.l}</span>
                        <span className={cn('text-foreground font-medium', d.mono && 'tabular-nums')}>{d.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {selected.status !== 'delivered' && (
                      <button
                        onClick={() => markDelivered(selected)}
                        className="w-full h-14 rounded-full text-sm bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <PackageCheck className="w-4 h-4" /> Mark delivered
                      </button>
                    )}
                    <button
                      onClick={() =>
                        // TODO(backend): shipments.notifyCustomer(selected.tracking)
                        toast.success(
                          `Tracking update sent to ${selected.customer}`,
                          {
                            description: `${selected.tracking} · ${cfg?.label ?? selected.status} · ETA ${selected.eta}`,
                          },
                        )
                      }
                      className={cn(
                        'w-full h-14 rounded-full text-sm transition-colors font-medium flex items-center justify-center gap-2',
                        selected.status === 'delivered'
                          ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground'
                          : 'border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)]',
                      )}
                    >
                      <Send className="w-4 h-4" /> Notify customer
                    </button>
                    <button
                      onClick={() =>
                        toast(`Opening ${selected.carrier} carrier portal…`)
                      }
                      className="w-full h-14 rounded-full text-sm border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)] transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Carrier portal
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
