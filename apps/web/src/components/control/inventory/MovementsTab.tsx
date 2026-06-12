/**
 * Movements tab — StockMovement history ledger with reason / product /
 * location / date filters. Shows movements pushed by inventoryService
 * AND workflowService (shared mock array), so floor activity surfaces
 * here automatically.
 */
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import {
  PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer,
} from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { MovementView } from '@/services/inventoryService';
import type { InventorySettings, Product, StockLocation, StockMovement } from '@/types/entities';

type Reason = StockMovement['reason'];

const REASON_LABELS: Record<Reason, string> = {
  gr: 'Goods receipt',
  pick: 'Pick',
  consume: 'Consume',
  putaway: 'Put-away',
  sub_out: 'Sub out',
  sub_in: 'Sub in',
  scrap: 'Scrap',
  adjust: 'Adjust',
};

const REASON_BADGE: Record<Reason, 'success' | 'info' | 'neutral' | 'accent' | 'error' | 'warning'> = {
  gr: 'success',
  pick: 'info',
  consume: 'info',
  putaway: 'neutral',
  sub_out: 'accent',
  sub_in: 'accent',
  scrap: 'error',
  adjust: 'warning',
};

/** Routes for movement refs — only refTypes with a real detail page get links. */
function refHref(movement: MovementView): string | undefined {
  switch (movement.refType) {
    case 'mo':
      return `/make/manufacturing-orders/${movement.refId}`;
    case 'work_order':
      return `/make/work-orders/${movement.refId}`;
    case 'po':
      return '/buy/orders';
    default:
      return undefined;
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

const DATE_PRESETS = [
  { key: 'all', label: 'All time' },
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90 days' },
];

interface MovementsTabProps {
  movements: MovementView[];
  products: Product[];
  locations: StockLocation[];
  settings: InventorySettings;
  search: string;
  onSearchChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  productId: string;
  onProductChange: (value: string) => void;
  datePreset: string;
  onDatePresetChange: (value: string) => void;
}

export function MovementsTab({
  movements, products, settings,
  search, onSearchChange,
  reason, onReasonChange,
  productId, onProductChange,
  datePreset, onDatePresetChange,
}: MovementsTabProps) {
  const locationsEnabled = settings.storageLocationsEnabled;

  const filtered = useMemo(() => {
    let rows = movements;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (m) =>
          m.product?.description.toLowerCase().includes(q) ||
          (m.product?.sku ?? m.product?.partNumber ?? '').toLowerCase().includes(q) ||
          (m.note ?? '').toLowerCase().includes(q),
      );
    }
    return rows;
  }, [movements, search]);

  const columns = useMemo<MwColumnDef<MovementView>[]>(() => [
    {
      key: 'at', header: 'When', tooltip: 'Movement timestamp',
      cell: (m) => <span className="text-sm text-[var(--neutral-500)] whitespace-nowrap">{formatTimestamp(m.at)}</span>,
    },
    {
      key: 'product', header: 'Product', tooltip: 'Product moved',
      cell: (m) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{m.product?.description ?? m.productId}</p>
          <p className="text-xs text-[var(--neutral-500)]">{m.product?.sku ?? m.product?.partNumber}</p>
        </div>
      ),
    },
    ...(locationsEnabled
      ? [{
          key: 'route', header: 'From → To', tooltip: 'Source and destination locations',
          cell: (m) => (
            <span className="flex items-center gap-1.5 text-sm text-foreground whitespace-nowrap">
              <span className="text-xs font-medium">{m.fromLocation?.code ?? '—'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
              <span className="text-xs font-medium">{m.toLocation?.code ?? '—'}</span>
            </span>
          ),
        } satisfies MwColumnDef<MovementView>]
      : []),
    {
      key: 'qty', header: 'Qty', tooltip: 'Quantity moved',
      headerClassName: 'text-right', className: 'text-right tabular-nums font-medium',
      cell: (m) => {
        // Sign by net effect on tracked stock: scrap and pure outbound are negative.
        const negative = m.reason === 'scrap' || (m.fromLocationId && !m.toLocationId);
        const positive = !m.fromLocationId && m.toLocationId;
        return (
          <span style={{ color: negative ? 'var(--mw-error)' : positive ? 'var(--mw-success)' : undefined }}>
            {negative ? `-${m.qty}` : positive ? `+${m.qty}` : m.qty}
          </span>
        );
      },
    },
    {
      key: 'reason', header: 'Reason', tooltip: 'Movement reason', headerClassName: 'text-center',
      cell: (m) => (
        <div className="flex flex-col items-center gap-0.5">
          <StatusBadge variant={REASON_BADGE[m.reason]}>{REASON_LABELS[m.reason]}</StatusBadge>
          {m.reasonCode && <span className="text-[10px] text-[var(--neutral-500)]">{m.reasonCode}</span>}
        </div>
      ),
    },
    {
      key: 'ref', header: 'Ref', tooltip: 'Linked order / work order',
      cell: (m) => {
        if (!m.refId) return <span className="text-xs text-[var(--neutral-400)]">—</span>;
        const href = refHref(m);
        const label = `${(m.refType ?? '').toUpperCase().replace('_', ' ')} ${m.refId}`;
        return href ? (
          <Link to={href} className="text-xs font-medium text-foreground underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>
            {label}
          </Link>
        ) : (
          <span className="text-xs text-[var(--neutral-500)]">{label}</span>
        );
      },
    },
    {
      key: 'note', header: 'Note', tooltip: 'Operator note',
      cell: (m) => <span className="text-xs text-[var(--neutral-500)] line-clamp-2">{m.note ?? ''}</span>,
    },
  ], [locationsEnabled]);

  return (
    <div className="space-y-6">
      <PageToolbar>
        <ToolbarSearch value={search} onChange={onSearchChange} placeholder="Search movements..." />
        <ToolbarFilterPills
          value={reason || 'all'}
          onChange={(v) => onReasonChange(v === 'all' ? '' : v)}
          options={[
            { key: 'all', label: 'All' },
            ...Object.entries(REASON_LABELS).map(([key, label]) => ({ key, label })),
          ]}
        />
        <ToolbarSpacer />
        <Select value={productId || 'all'} onValueChange={(v) => onProductChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-52 rounded-xl">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.sku ?? p.partNumber}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={datePreset} onValueChange={onDatePresetChange}>
          <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((p) => (
              <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageToolbar>

      <MwDataTable
        columns={columns}
        data={filtered}
        keyExtractor={(m) => m.id}
        emptyState={
          <EmptyState
            variant="inline"
            title="No movements match."
            description="Record a scrap, adjustment or transfer to get started."
          />
        }
      />
    </div>
  );
}
