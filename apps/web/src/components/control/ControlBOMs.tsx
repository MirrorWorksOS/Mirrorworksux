/**
 * Control BOMs — Bill of Materials management
 * Full list with expandable BOM lines
 */
import { useMemo, useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FilterBar } from '@/components/shared/layout/FilterBar';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { BomEditorSheet, type BomDraft, type BomLineDraft } from './BomEditorSheet';


interface BOMLine {
  sku: string; description: string; qty: number; unit: string; type: 'material' | 'purchased' | 'labour';
}
interface BOM {
  id: string; product: string; sku: string; version: string; componentCount: number; status: 'active' | 'draft' | 'obsolete'; updatedAt: string; lines: BOMLine[];
}

const BOMS: BOM[] = [
  {
    id: '1', product: 'Server Rack Chassis', sku: 'PROD-SR-001', version: 'v1.2',
    componentCount: 6, status: 'active', updatedAt: '15 Mar',
    lines: [
      { sku: 'MS-10-3678',  description: '10mm Mild Steel Plate',       qty: 4,    unit: 'sheet',  type: 'material' },
      { sku: 'RHS-50252',   description: 'RHS 50x25x2.5 — Cut',        qty: 8,    unit: 'length', type: 'material' },
      { sku: 'HW-KIT-001',  description: 'Hardware Kit M10 SS',        qty: 2,    unit: 'kit',    type: 'purchased' },
      { sku: 'PNT-RAL7035', description: 'Powder Coat RAL 7035',       qty: 1.5,  unit: 'kg',     type: 'material' },
      { sku: 'LABOUR-FAB',  description: 'Fabrication — CNC cutting',  qty: 2,    unit: 'hrs',    type: 'labour' },
      { sku: 'LABOUR-WLD',  description: 'Welding — MIG',              qty: 3,    unit: 'hrs',    type: 'labour' },
    ],
  },
  {
    id: '2', product: 'Structural Bracket Type A', sku: 'PROD-BP-002', version: 'v1.0',
    componentCount: 4, status: 'active', updatedAt: '08 Mar',
    lines: [
      { sku: 'MS-10-3678', description: '10mm Mild Steel Plate', qty: 0.5, unit: 'sheet',  type: 'material' },
      { sku: 'FST-M10A4',  description: 'SS Fasteners M10',     qty: 4,   unit: 'each',   type: 'purchased' },
      { sku: 'LABOUR-FAB', description: 'Fabrication — press',  qty: 0.5, unit: 'hrs',    type: 'labour' },
      { sku: 'LABOUR-FIN', description: 'Finishing — grind',    qty: 0.25, unit: 'hrs',   type: 'labour' },
    ],
  },
  {
    id: '3', product: 'Aluminium Enclosure 600x400', sku: 'PROD-AE-003', version: 'v2.1',
    componentCount: 8, status: 'active', updatedAt: '20 Feb',
    lines: [
      { sku: 'AL-5052-BP', description: 'Aluminium Base Plate',   qty: 2,  unit: 'each',  type: 'material' },
      { sku: 'AL-5052-SA', description: 'Aluminium Support Arm',  qty: 4,  unit: 'each',  type: 'material' },
      { sku: 'HW-KIT-001', description: 'Hardware Kit M10',       qty: 1,  unit: 'kit',   type: 'purchased' },
      { sku: 'SEAL-001',   description: 'IP65 Seal Strip',        qty: 2.4, unit: 'm',    type: 'purchased' },
      { sku: 'LABOUR-FAB', description: 'Fabrication — fold',     qty: 1,  unit: 'hrs',   type: 'labour' },
      { sku: 'LABOUR-ASM', description: 'Assembly',               qty: 0.5, unit: 'hrs',  type: 'labour' },
      { sku: 'LABOUR-QC',  description: 'QC inspection',          qty: 0.25, unit: 'hrs', type: 'labour' },
      { sku: 'LABOUR-PKG', description: 'Packing',                qty: 0.25, unit: 'hrs', type: 'labour' },
    ],
  },
  {
    id: '4', product: 'Rail Platform Guard', sku: 'PROD-RPG-004', version: 'v1.0',
    componentCount: 5, status: 'draft', updatedAt: '19 Mar',
    lines: [
      { sku: 'MS-10-3678',  description: '10mm MS Plate',      qty: 6,  unit: 'sheet', type: 'material' },
      { sku: 'RHS-50252',   description: 'RHS 50x25 section',  qty: 12, unit: 'length',type: 'material' },
      { sku: 'HW-KIT-001',  description: 'Hardware Kit M10',   qty: 4,  unit: 'kit',   type: 'purchased' },
      { sku: 'LABOUR-FAB',  description: 'Fabrication',        qty: 8,  unit: 'hrs',   type: 'labour' },
      { sku: 'LABOUR-WLD',  description: 'Welding',            qty: 6,  unit: 'hrs',   type: 'labour' },
    ],
  },
];

/* Column definitions for the nested BOM-lines sub-table */
const bomLineColumns: MwColumnDef<BOMLine>[] = [
  { key: 'sku',         header: 'SKU',         tooltip: 'Component SKU', cell: (line) => <span className="text-xs font-medium text-[var(--neutral-500)]">{line.sku}</span> },
  { key: 'description', header: 'Description', tooltip: 'Component description', cell: (line) => <span className="text-sm text-foreground">{line.description}</span> },
  { key: 'qty',         header: 'Qty',         tooltip: 'Quantity required', cell: (line) => <span className="text-sm font-medium tabular-nums">{line.qty}</span>, className: 'text-right', headerClassName: 'text-right' },
  { key: 'unit',        header: 'Unit',        tooltip: 'Unit of measure', cell: (line) => <span className="text-sm text-[var(--neutral-500)]">{line.unit}</span> },
  {
    key: 'type', header: 'Type', tooltip: 'Line type',
    cell: (line) => {
      const variantMap: Record<string, 'accent' | 'info' | 'neutral'> = {
        material: 'accent',
        purchased: 'info',
        labour: 'neutral',
      };
      return (
        <StatusBadge variant={variantMap[line.type] ?? 'neutral'}>
          {line.type}
        </StatusBadge>
      );
    },
  },
];

export function ControlBOMs() {
  const [search,    setSearch]   = useState('');
  const [expanded,  setExpanded] = useState<Set<string>>(new Set());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<BomDraft | undefined>();

  const filtered = BOMS.filter(b =>
    b.product.toLowerCase().includes(search.toLowerCase()) ||
    b.sku.toLowerCase().includes(search.toLowerCase())
  );

  const subAssemblyOptions = useMemo(
    () => BOMS.map((b) => ({ id: b.id, product: b.product, sku: b.sku })),
    [],
  );

  const openEdit = (bom: BOM) => {
    setEditing({
      id: bom.id,
      product: bom.product,
      sku: bom.sku,
      version: bom.version,
      status: bom.status,
      lines: bom.lines.map<BomLineDraft>((l, i) => ({
        key: `existing-${bom.id}-${i}`,
        kind: l.type,
        sku: l.sku,
        description: l.description,
        qty: l.qty,
        unit: l.unit,
      })),
    });
    setEditorOpen(true);
  };

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* Column definitions for the outer BOM table */
  const bomColumns: MwColumnDef<BOM>[] = [
    {
      key: 'expand', header: '', headerClassName: 'w-8',
      cell: (bom) => expanded.has(bom.id)
        ? <ChevronDown className="w-4 h-4 text-[var(--neutral-500)]" />
        : <ChevronRight className="w-4 h-4 text-[var(--neutral-500)]" />,
    },
    { key: 'product',   header: 'Product', tooltip: 'Finished product name', cell: (bom) => <span className="text-sm text-foreground font-medium">{bom.product}</span> },
    { key: 'sku',       header: 'SKU', tooltip: 'Product SKU', cell: (bom) => <span className="text-xs font-medium text-[var(--neutral-500)]">{bom.sku}</span> },
    { key: 'version',   header: 'Version', tooltip: 'BOM revision', cell: (bom) => <span className="text-sm font-medium text-[var(--neutral-500)]">{bom.version}</span> },
    { key: 'components',header: 'Components', tooltip: 'Number of line items', cell: (bom) => <span className="text-sm font-medium tabular-nums">{bom.componentCount}</span>, className: 'text-right', headerClassName: 'text-right' },
    { key: 'updated',   header: 'Updated', tooltip: 'Last modified date', cell: (bom) => <span className="text-sm text-[var(--neutral-500)]">{bom.updatedAt}</span> },
    {
      key: 'status', header: 'Status', headerClassName: 'text-center', tooltip: 'BOM lifecycle status',
      cell: (bom) => (
        <div className="flex justify-center">
          <StatusBadge status={bom.status as any}>
            {bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: 'actions', header: 'Actions', headerClassName: 'text-right',
      cell: (bom) => (
        <div className="text-right" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-12 min-h-[48px] text-xs text-[var(--neutral-500)] hover:text-foreground"
            onClick={() => openEdit(bom)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  /**
   * We wrap MwDataTable rows and expansion panels together using a custom
   * data mapping: each BOM becomes 1-2 visual rows (the main row + optional
   * expanded detail). Because MwDataTable renders one <TableRow> per data
   * item, we handle the expansion inside the cell renderer of a special
   * "full-row" approach by placing the sub-table immediately after the parent
   * via React.Fragment and an extra data entry.
   *
   * For cleaner integration we flatten the data array so that expanded BOMs
   * inject a "detail" pseudo-row.
   */
  type FlatRow = { kind: 'bom'; bom: BOM } | { kind: 'detail'; bom: BOM };

  const flatData: FlatRow[] = [];
  for (const bom of filtered) {
    flatData.push({ kind: 'bom', bom });
    if (expanded.has(bom.id)) {
      flatData.push({ kind: 'detail', bom });
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-foreground">Bills of Materials</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">{BOMS.filter(b => b.status === 'active').length} active BOMs</p>
        </div>
        <Button
          className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2"
          onClick={() => {
            setEditing(undefined);
            setEditorOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> New BOM
        </Button>
      </div>

      <ToolbarSummaryBar
        segments={[
          { key: 'active', label: 'Active', value: BOMS.filter(b => b.status === 'active').length, color: 'var(--mw-yellow-400)' },
          { key: 'draft', label: 'Draft', value: BOMS.filter(b => b.status === 'draft').length, color: 'var(--mw-mirage)' },
          { key: 'obsolete', label: 'Obsolete', value: BOMS.filter(b => b.status === 'obsolete').length, color: 'var(--neutral-400)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <MwDataTable<BOM>
        columns={bomColumns}
        data={filtered}
        keyExtractor={(bom) => bom.id}
        onRowClick={(bom) => toggle(bom.id)}
        selectable
        onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
        onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
        filterBar={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search BOMs..."
          />
        }
        emptyState={<p className="text-sm text-muted-foreground">No BOMs match your search.</p>}
      />

      {/* Expanded BOM-line sub-tables rendered outside the parent MwDataTable */}
      {filtered.map(bom => {
        if (!expanded.has(bom.id)) return null;
        return (
          <div key={`detail-${bom.id}`} className="-mt-6 px-4">
            <div className="bg-[var(--neutral-100)] rounded-b-lg px-4 py-4 border border-t-0 border-[var(--neutral-100)]">
              <MwDataTable<BOMLine>
                columns={bomLineColumns}
                data={bom.lines}
                keyExtractor={(_line, i) => i}
              />
            </div>
          </div>
        );
      })}

      <BomEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        bom={editing}
        availableSubAssemblies={subAssemblyOptions}
      />
    </motion.div>
  );
}
