/**
 * Locations tab — StockLocation (bin) CRUD. Distinct from
 * Control → Locations, which manages facility SITES (factories,
 * warehouses, offices); these are the stock bins within them.
 * Replaced by an enable-CTA empty state when Storage Locations is off.
 */
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MapPin, Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageToolbar, ToolbarSpacer } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { Button } from '@/components/ui/button';
import { inventoryService } from '@/services';
import type { LedgerRow } from '@/services/inventoryService';
import type { InventorySettings, StockLocation } from '@/types/entities';
import { StockLocationFormDialog } from './dialogs/StockLocationFormDialog';

const KIND_LABELS: Record<StockLocation['kind'], string> = {
  raw: 'Raw',
  wip: 'WIP',
  finished: 'Finished',
  subcontract: 'Subcontract',
  scrap: 'Scrap (virtual)',
};

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface LocationsTabProps {
  locations: StockLocation[];
  ledger: LedgerRow[];
  settings: InventorySettings;
  onDone: () => void;
}

export function LocationsTab({ locations, ledger, settings, onDone }: LocationsTabProps) {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockLocation | null>(null);

  const statsByLocation = useMemo(() => {
    const map = new Map<string, { items: number; value: number }>();
    for (const row of ledger) {
      if (!row.location) continue;
      const stats = map.get(row.location.id) ?? { items: 0, value: 0 };
      stats.items += 1;
      stats.value += row.value;
      map.set(row.location.id, stats);
    }
    return map;
  }, [ledger]);

  if (!settings.storageLocationsEnabled) {
    return (
      <EmptyState
        title="Storage locations are disabled"
        description="All stock is tracked in a single implicit location. Enable Storage Locations to track bins, transfers, and per-location counts."
        action={{
          label: 'Open Inventory settings',
          onClick: () => navigate('/control/inventory-settings'),
        }}
      />
    );
  }

  const handleDelete = async (location: StockLocation) => {
    try {
      await inventoryService.deleteLocation(location.id);
      toast.success(`Deleted ${location.code}`);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const columns: MwColumnDef<StockLocation>[] = [
    {
      key: 'code', header: 'Code', tooltip: 'Location code',
      cell: (l) => (
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
          {l.code}
        </span>
      ),
    },
    { key: 'name', header: 'Name', tooltip: 'Location name', cell: (l) => l.name },
    {
      key: 'kind', header: 'Kind', tooltip: 'Location classification', headerClassName: 'text-center',
      cell: (l) => (
        <div className="flex justify-center">
          <StatusBadge variant={l.kind === 'scrap' ? 'error' : 'neutral'}>{KIND_LABELS[l.kind]}</StatusBadge>
        </div>
      ),
    },
    {
      key: 'items', header: 'SKUs', tooltip: 'Distinct products stored here',
      headerClassName: 'text-right', className: 'text-right tabular-nums',
      cell: (l) => statsByLocation.get(l.id)?.items ?? 0,
    },
    {
      key: 'value', header: 'Stock Value', tooltip: 'Total value on hand at this location',
      headerClassName: 'text-right', className: 'text-right tabular-nums font-medium',
      cell: (l) => (l.kind === 'scrap' ? '—' : formatCurrency(statsByLocation.get(l.id)?.value ?? 0)),
    },
    {
      key: 'actions', header: '', headerClassName: 'w-[1%]', className: 'w-[1%] whitespace-nowrap',
      cell: (l) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline" size="sm" className="h-8 text-xs"
            onClick={() => { setEditing(l); setFormOpen(true); }}
          >
            Edit
          </Button>
          {l.kind !== 'scrap' && (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive">
                  Delete
                </Button>
              }
              title={`Delete "${l.code}"?`}
              description="Locations with stock on hand cannot be deleted — transfer stock out first."
              confirmLabel="Delete location"
              onConfirm={() => handleDelete(l)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageToolbar>
        <p className="text-sm text-[var(--neutral-500)]">
          Stock bins within your facilities. Facility sites are managed in{' '}
          <Link to="/control/locations" className="font-medium text-foreground underline-offset-2 hover:underline">
            Control → Locations
          </Link>.
        </p>
        <ToolbarSpacer />
        <Button asChild variant="outline" className="h-12 gap-2 border-[var(--neutral-200)] dark:border-[var(--border)] px-5 rounded-full">
          <Link to="/control/inventory-settings">
            <Settings2 className="w-4 h-4" /> Defaults
          </Link>
        </Button>
        <ToolbarPrimaryButton icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>
          New location
        </ToolbarPrimaryButton>
      </PageToolbar>

      <MwDataTable
        columns={columns}
        data={locations}
        keyExtractor={(l) => l.id}
        emptyState={<EmptyState variant="inline" title="No stock locations defined." />}
      />

      <StockLocationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        location={editing}
        onDone={onDone}
      />
    </div>
  );
}
