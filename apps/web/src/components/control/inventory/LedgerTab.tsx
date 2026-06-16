/**
 * Ledger tab — product × location on-hand grid. The location column and
 * filter are gated by the Storage Locations setting; when off, rows
 * aggregate per product (done in inventoryService.listLedger).
 */
import { useMemo } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import {
  PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer,
} from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import type { LedgerRow } from '@/services/inventoryService';
import type { InventorySettings, StockLocation } from '@/types/entities';

const KIND_LABELS: Record<string, string> = {
  all: 'All',
  raw: 'Raw',
  wip: 'WIP',
  finished: 'Finished',
  subcontract: 'Subcontract',
};

const KIND_BADGE: Record<string, 'neutral' | 'info' | 'accent' | 'warning'> = {
  raw: 'neutral',
  wip: 'warning',
  finished: 'accent',
  subcontract: 'info',
};

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface LedgerTabProps {
  rows: LedgerRow[];
  locations: StockLocation[];
  settings: InventorySettings;
  search: string;
  onSearchChange: (value: string) => void;
  kind: string;
  onKindChange: (value: string) => void;
  locationId: string;
  onLocationChange: (value: string) => void;
  lowOnly: boolean;
  onLowOnlyChange: (value: boolean) => void;
}

export function LedgerTab({
  rows, locations, settings,
  search, onSearchChange,
  kind, onKindChange,
  locationId, onLocationChange,
  lowOnly, onLowOnlyChange,
}: LedgerTabProps) {
  const locationsEnabled = settings.storageLocationsEnabled;

  const stockLocations = useMemo(
    () => locations.filter((l) => l.kind !== 'scrap'),
    [locations],
  );

  const columns = useMemo<MwColumnDef<LedgerRow>[]>(() => [
    {
      key: 'sku', header: 'SKU', tooltip: 'Stock-keeping unit code',
      cell: (r) => r.product.sku ?? r.product.partNumber,
      className: 'text-xs font-medium text-[var(--neutral-500)]',
    },
    {
      key: 'product', header: 'Product', tooltip: 'Product description',
      cell: (r) => r.product.description,
      className: 'font-medium text-foreground',
    },
    ...(locationsEnabled
      ? [
          {
            key: 'location', header: 'Location', tooltip: 'Stock location (bin)',
            cell: (r) => r.location?.code ?? '—',
            className: 'text-xs font-medium text-[var(--neutral-500)]',
          } satisfies MwColumnDef<LedgerRow>,
          {
            key: 'kind', header: 'Kind', tooltip: 'Location kind', headerClassName: 'text-center',
            cell: (r) => (
              <div className="flex justify-center">
                {r.location ? (
                  <StatusBadge variant={KIND_BADGE[r.location.kind] ?? 'neutral'}>
                    {KIND_LABELS[r.location.kind] ?? r.location.kind}
                  </StatusBadge>
                ) : '—'}
              </div>
            ),
          } satisfies MwColumnDef<LedgerRow>,
        ]
      : []),
    {
      key: 'onHand', header: 'On Hand', tooltip: 'Current stock quantity',
      headerClassName: 'text-right', className: 'text-right font-medium tabular-nums',
      cell: (r) => (
        <span
          style={{
            color:
              r.reorderState === 'out'
                ? 'var(--mw-error)'
                : r.reorderState === 'low'
                  ? 'var(--mw-amber)'
                  : undefined,
          }}
        >
          {r.qtyOnHand}
        </span>
      ),
    },
    {
      key: 'reserved', header: 'Reserved', tooltip: 'Quantity reserved against orders / work orders',
      headerClassName: 'text-right', className: 'text-right text-[var(--neutral-500)] tabular-nums',
      cell: (r) => r.qtyReserved,
    },
    {
      key: 'available', header: 'Available', tooltip: 'On hand minus reserved',
      headerClassName: 'text-right', className: 'text-right tabular-nums',
      cell: (r) => r.qtyAvailable,
    },
    {
      key: 'unitCost', header: 'Unit Cost', tooltip: 'Standard cost (display-only valuation)',
      headerClassName: 'text-right', className: 'text-right tabular-nums',
      cell: (r) => formatCurrency(r.unitCost),
    },
    {
      key: 'value', header: 'Value', tooltip: 'On hand × unit cost',
      headerClassName: 'text-right', className: 'text-right tabular-nums font-medium',
      cell: (r) => formatCurrency(r.value),
    },
    {
      key: 'status', header: 'Status', tooltip: 'Stock level vs reorder rules', headerClassName: 'text-center',
      cell: (r) => (
        <div className="flex justify-center">
          {r.reorderState === 'ok' ? (
            <StatusBadge status="active" withDot>OK</StatusBadge>
          ) : (
            <Link
              to="/buy/reorder-rules"
              onClick={(e) => e.stopPropagation()}
              title="Open reorder rules in Buy"
            >
              <StatusBadge status={r.reorderState === 'low' ? 'pending' : 'cancelled'} withDot>
                {r.reorderState === 'low' ? 'Low' : 'Out'}
              </StatusBadge>
            </Link>
          )}
        </div>
      ),
    },
  ], [locationsEnabled]);

  return (
    <div className="space-y-6">
      <PageToolbar>
        <ToolbarSearch value={search} onChange={onSearchChange} placeholder="Search by name or SKU..." />
        <ToolbarFilterPills
          value={kind}
          onChange={onKindChange}
          options={Object.entries(KIND_LABELS).map(([key, label]) => ({ key, label }))}
        />
        <ToolbarSpacer />
        {locationsEnabled && (
          <Select value={locationId || 'all'} onValueChange={(v) => onLocationChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-12 min-h-[48px] border-[var(--border)] w-48 rounded-xl">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {stockLocations.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-12 min-h-[48px] rounded-full px-5',
            lowOnly
              ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10 text-foreground'
              : 'border-[var(--neutral-200)] dark:border-[var(--border)]',
          )}
          onClick={() => onLowOnlyChange(!lowOnly)}
        >
          Low stock only
        </Button>
      </PageToolbar>

      <MwDataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => `${r.inventoryRecordId}-${r.location?.id ?? 'agg'}`}
        emptyState={
          <EmptyState
            variant="inline"
            title="No stock matches your filters."
            description="Import opening balances or record a goods receipt to get started."
          />
        }
      />
    </div>
  );
}
