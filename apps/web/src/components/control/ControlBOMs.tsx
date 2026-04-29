/**
 * Control BOMs — Bill of Materials management
 * Full list with expandable BOM lines
 */
import { useMemo, useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Layers, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'motion/react';
import { staggerContainer } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FilterBar } from '@/components/shared/layout/FilterBar';
import { ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { cn } from '@/components/ui/utils';
import {
  BomEditorSheet,
  type BomDraft,
  type BomLineDraft,
  type BomKind,
  computeRollup,
  lineExtendedCost,
} from './BomEditorSheet';
import { routesLibraryService } from '@/services';

type BOMLineType = 'material' | 'purchased' | 'labour' | 'subAssembly';

interface BOMLine {
  sku: string;
  description: string;
  qty: number;
  unit: string;
  type: BOMLineType;
  unitCost?: number;
  scrapPercent?: number;
  reference?: string;
  consumedAtStep?: number;
  manufacturer?: string;
  mpn?: string;
  leadTimeDays?: number;
}

interface BOM {
  id: string;
  product: string;
  sku: string;
  version: string;
  componentCount: number;
  status: 'active' | 'draft' | 'obsolete';
  updatedAt: string;
  lines: BOMLine[];
  kind?: BomKind;
  effectiveFrom?: string;
  effectiveTo?: string;
  routeId?: string;
  notes?: string;
}

const BOMS: BOM[] = [
  {
    id: '1', product: 'Server Rack Chassis', sku: 'PROD-SR-001', version: 'v1.2',
    componentCount: 6, status: 'active', updatedAt: '15 Mar',
    kind: 'manufacture', effectiveFrom: '2026-03-15',
    routeId: 'route-sheet-standard',
    lines: [
      { sku: 'MS-10-3678',  description: '10mm Mild Steel Plate',       qty: 4,    unit: 'sheet',  type: 'material',  unitCost: 185.00, scrapPercent: 5, reference: 'DWG-SR001-PL', consumedAtStep: 1 },
      { sku: 'RHS-50252',   description: 'RHS 50x25x2.5 — Cut',        qty: 8,    unit: 'length', type: 'material',  unitCost: 12.80,  scrapPercent: 2, reference: 'DWG-SR001-FR', consumedAtStep: 1 },
      { sku: 'HW-KIT-001',  description: 'Hardware Kit M10 SS',        qty: 2,    unit: 'kit',    type: 'purchased', unitCost: 8.40,   manufacturer: 'Bossard', mpn: 'BHW-M10-A4-K', leadTimeDays: 5 },
      { sku: 'PNT-RAL7035', description: 'Powder Coat RAL 7035',       qty: 1.5,  unit: 'kg',     type: 'material',  unitCost: 11.00,  scrapPercent: 8, consumedAtStep: 4 },
      { sku: 'LABOUR-FAB',  description: 'Fabrication — CNC cutting',  qty: 2,    unit: 'hrs',    type: 'labour',    unitCost: 85.00,  consumedAtStep: 1 },
      { sku: 'LABOUR-WLD',  description: 'Welding — MIG',              qty: 3,    unit: 'hrs',    type: 'labour',    unitCost: 92.00,  consumedAtStep: 3 },
    ],
  },
  {
    id: '2', product: 'Structural Bracket Type A', sku: 'PROD-BP-002', version: 'v1.0',
    componentCount: 4, status: 'active', updatedAt: '08 Mar',
    kind: 'manufacture', effectiveFrom: '2026-03-08',
    lines: [
      { sku: 'MS-10-3678', description: '10mm Mild Steel Plate', qty: 0.5, unit: 'sheet',  type: 'material',  unitCost: 185.00, scrapPercent: 10, reference: 'DWG-BP002' },
      { sku: 'FST-M10A4',  description: 'SS Fasteners M10',     qty: 4,   unit: 'each',   type: 'purchased', unitCost: 0.80,   manufacturer: 'Bossard', mpn: 'M10-A4-SS', leadTimeDays: 3 },
      { sku: 'LABOUR-FAB', description: 'Fabrication — press',  qty: 0.5, unit: 'hrs',    type: 'labour',    unitCost: 85.00 },
      { sku: 'LABOUR-FIN', description: 'Finishing — grind',    qty: 0.25, unit: 'hrs',   type: 'labour',    unitCost: 75.00 },
    ],
  },
  {
    id: '3', product: 'Aluminium Enclosure 600x400', sku: 'PROD-AE-003', version: 'v2.1',
    componentCount: 8, status: 'active', updatedAt: '20 Feb',
    kind: 'manufacture', effectiveFrom: '2026-02-20',
    notes: 'IP65 — supersedes v2.0; sealing strip vendor changed.',
    lines: [
      { sku: 'AL-5052-BP', description: 'Aluminium Base Plate',   qty: 2,  unit: 'each',  type: 'material',  unitCost: 28.50, scrapPercent: 3 },
      { sku: 'AL-5052-SA', description: 'Aluminium Support Arm',  qty: 4,  unit: 'each',  type: 'material',  unitCost: 34.20, scrapPercent: 3 },
      { sku: 'HW-KIT-001', description: 'Hardware Kit M10',       qty: 1,  unit: 'kit',   type: 'purchased', unitCost: 8.40, manufacturer: 'Bossard', mpn: 'BHW-M10-A4-K', leadTimeDays: 5 },
      { sku: 'SEAL-001',   description: 'IP65 Seal Strip',        qty: 2.4, unit: 'm',    type: 'purchased', unitCost: 5.50, manufacturer: 'Wurth', mpn: 'IP65-EPDM-3MM', leadTimeDays: 14 },
      { sku: 'LABOUR-FAB', description: 'Fabrication — fold',     qty: 1,  unit: 'hrs',   type: 'labour',    unitCost: 85.00 },
      { sku: 'LABOUR-ASM', description: 'Assembly',               qty: 0.5, unit: 'hrs',  type: 'labour',    unitCost: 70.00 },
      { sku: 'LABOUR-QC',  description: 'QC inspection',          qty: 0.25, unit: 'hrs', type: 'labour',    unitCost: 90.00 },
      { sku: 'LABOUR-PKG', description: 'Packing',                qty: 0.25, unit: 'hrs', type: 'labour',    unitCost: 60.00 },
    ],
  },
  {
    id: '4', product: 'Rail Platform Guard', sku: 'PROD-RPG-004', version: 'v1.0',
    componentCount: 5, status: 'draft', updatedAt: '19 Mar',
    kind: 'manufacture', effectiveFrom: '2026-04-15',
    notes: 'Pending design review — fastener spec under review.',
    lines: [
      { sku: 'MS-10-3678',  description: '10mm MS Plate',      qty: 6,  unit: 'sheet', type: 'material',  unitCost: 185.00, scrapPercent: 5 },
      { sku: 'RHS-50252',   description: 'RHS 50x25 section',  qty: 12, unit: 'length',type: 'material',  unitCost: 12.80,  scrapPercent: 3 },
      { sku: 'HW-KIT-001',  description: 'Hardware Kit M10',   qty: 4,  unit: 'kit',   type: 'purchased', unitCost: 8.40,  manufacturer: 'Bossard', mpn: 'BHW-M10-A4-K', leadTimeDays: 5 },
      { sku: 'LABOUR-FAB',  description: 'Fabrication',        qty: 8,  unit: 'hrs',   type: 'labour',    unitCost: 85.00 },
      { sku: 'LABOUR-WLD',  description: 'Welding',            qty: 6,  unit: 'hrs',   type: 'labour',    unitCost: 92.00 },
    ],
  },
];

const formatAud = (n: number) =>
  n.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const KIND_BADGE: Record<BomKind, { label: string; class: string }> = {
  manufacture: { label: 'Manufacture', class: 'bg-[var(--mw-yellow-100)] text-[var(--mw-yellow-900)]' },
  kit:         { label: 'Kit',         class: 'bg-[var(--mw-info-light)] text-[var(--mw-info)]' },
  phantom:     { label: 'Phantom',     class: 'bg-[var(--neutral-100)] text-[var(--neutral-700)]' },
  subcontract: { label: 'Subcontract', class: 'bg-[var(--mw-amber-100)] text-[var(--mw-amber)]' },
};

/* Column definitions for the nested BOM-lines sub-table */
const bomLineColumns: MwColumnDef<BOMLine>[] = [
  { key: 'sku',         header: 'SKU',         tooltip: 'Component SKU', cell: (line) => <span className="text-xs font-medium text-[var(--neutral-500)]">{line.sku}</span> },
  {
    key: 'description', header: 'Description', tooltip: 'Component description',
    cell: (line) => (
      <div className="space-y-0.5">
        <span className="text-sm text-foreground">{line.description}</span>
        {(line.manufacturer || line.mpn || line.reference) && (
          <div className="text-[10px] text-[var(--neutral-500)] flex flex-wrap gap-2">
            {line.manufacturer && <span>{line.manufacturer}</span>}
            {line.mpn && <span className="font-mono">{line.mpn}</span>}
            {line.reference && <span className="font-mono">{line.reference}</span>}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'op', header: 'Op', tooltip: 'Routing step that consumes this line',
    headerClassName: 'text-center',
    cell: (line) => (
      <div className="flex justify-center">
        {line.consumedAtStep !== undefined ? (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-mirage)] text-white text-[10px] font-medium tabular-nums">
            {line.consumedAtStep}
          </span>
        ) : (
          <span className="text-xs text-[var(--neutral-300)]">—</span>
        )}
      </div>
    ),
  },
  { key: 'qty', header: 'Qty', tooltip: 'Quantity required', cell: (line) => <span className="text-sm font-medium tabular-nums">{line.qty}</span>, className: 'text-right', headerClassName: 'text-right' },
  { key: 'unit', header: 'Unit', tooltip: 'Unit of measure', cell: (line) => <span className="text-sm text-[var(--neutral-500)]">{line.unit}</span> },
  {
    key: 'scrap', header: 'Scrap%', tooltip: 'Extra qty issued for yield/scrap loss',
    headerClassName: 'text-right',
    cell: (line) => (
      <span className="text-xs text-[var(--neutral-500)] tabular-nums">
        {line.scrapPercent ? `${line.scrapPercent}%` : '—'}
      </span>
    ),
    className: 'text-right',
  },
  {
    key: 'unitCost', header: 'Unit cost', tooltip: 'Per-unit cost',
    headerClassName: 'text-right',
    cell: (line) => (
      <span className="text-xs text-[var(--neutral-500)] tabular-nums">
        {line.unitCost !== undefined ? formatAud(line.unitCost) : '—'}
      </span>
    ),
    className: 'text-right',
  },
  {
    key: 'extCost', header: 'Ext cost', tooltip: 'qty × unit × (1 + scrap%)',
    headerClassName: 'text-right',
    cell: (line) => {
      const ext = lineExtendedCost(line as unknown as BomLineDraft);
      return (
        <span className="text-sm font-medium text-foreground tabular-nums">
          {ext > 0 ? formatAud(ext) : '—'}
        </span>
      );
    },
    className: 'text-right',
  },
  {
    key: 'type', header: 'Type', tooltip: 'Line type',
    cell: (line) => {
      const variantMap: Record<string, 'accent' | 'info' | 'neutral'> = {
        material: 'accent',
        purchased: 'info',
        labour: 'neutral',
        subAssembly: 'info',
      };
      return (
        <StatusBadge variant={variantMap[line.type] ?? 'neutral'}>
          {line.type}
        </StatusBadge>
      );
    },
  },
];

/** Total cost of one BOM at this level (no sub-assembly resolution). */
function bomTotalCost(bom: BOM): number {
  return computeRollup(bom.lines as unknown as BomLineDraft[]).total;
}

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
      kind: bom.kind ?? 'manufacture',
      effectiveFrom: bom.effectiveFrom,
      effectiveTo: bom.effectiveTo,
      routeId: bom.routeId,
      notes: bom.notes,
      lines: bom.lines.map<BomLineDraft>((l, i) => ({
        key: `existing-${bom.id}-${i}`,
        kind: l.type,
        sku: l.sku,
        description: l.description,
        qty: l.qty,
        unit: l.unit,
        unitCost: l.unitCost,
        scrapPercent: l.scrapPercent,
        reference: l.reference,
        consumedAtStep: l.consumedAtStep,
        manufacturer: l.manufacturer,
        mpn: l.mpn,
        leadTimeDays: l.leadTimeDays,
      })),
    });
    setEditorOpen(true);
  };

  /** BOMs that reference this BOM as a sub-assembly. (No example data yet —
   *  hooks into the structure for future expansion.) */
  const whereUsed = (bomId: string): BOM[] =>
    BOMS.filter((b) =>
      b.lines.some((l) => l.type === 'subAssembly' && l.sku === bomId),
    );

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
    {
      key: 'product', header: 'Product', tooltip: 'Finished product + SKU',
      cell: (bom) => (
        <div className="space-y-0.5">
          <div className="text-sm text-foreground font-medium">{bom.product}</div>
          <div className="text-xs text-[var(--neutral-500)] font-mono">{bom.sku}</div>
        </div>
      ),
    },
    {
      key: 'kind', header: 'Type', tooltip: 'BOM kind drives downstream flow',
      cell: (bom) => {
        const k = bom.kind ?? 'manufacture';
        const meta = KIND_BADGE[k];
        return (
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', meta.class)}>
            <Layers className="h-2.5 w-2.5" />
            {meta.label}
          </span>
        );
      },
    },
    { key: 'version', header: 'Version', tooltip: 'BOM revision', cell: (bom) => <span className="text-sm font-medium text-[var(--neutral-500)]">{bom.version}</span> },
    {
      key: 'effective', header: 'Effective', tooltip: 'Effectivity window',
      cell: (bom) =>
        bom.effectiveFrom ? (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--neutral-500)]">
            <Calendar className="h-3 w-3" />
            {bom.effectiveFrom}
            {bom.effectiveTo ? ` → ${bom.effectiveTo}` : ''}
          </span>
        ) : (
          <span className="text-xs text-[var(--neutral-300)]">—</span>
        ),
    },
    { key: 'components', header: 'Lines', tooltip: 'Number of line items at this level', cell: (bom) => <span className="text-sm font-medium tabular-nums">{bom.lines.length}</span>, className: 'text-right', headerClassName: 'text-right' },
    {
      key: 'totalCost', header: 'Total cost',
      tooltip: 'Rolled-up cost at this level (sub-assemblies show their nested rollup)',
      headerClassName: 'text-right',
      cell: (bom) => {
        const total = bomTotalCost(bom);
        return (
          <span className="text-sm font-bold text-foreground tabular-nums">
            {total > 0 ? formatAud(total) : '—'}
          </span>
        );
      },
      className: 'text-right',
    },
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
      key: 'actions', header: '', headerClassName: 'text-right w-20',
      cell: (bom) => (
        <div className="text-right" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-[var(--neutral-500)] hover:text-foreground"
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
        const rollup = computeRollup(bom.lines as unknown as BomLineDraft[]);
        const usedIn = whereUsed(bom.id);
        return (
          <div key={`detail-${bom.id}`} className="-mt-6 px-4 space-y-4">
            <div className="bg-[var(--neutral-100)] rounded-b-lg px-4 py-4 border border-t-0 border-[var(--neutral-100)]">
              {/* Notes */}
              {bom.notes && (
                <div className="mb-3 rounded-[var(--shape-md)] bg-card border border-[var(--border)] px-3 py-2 text-xs text-[var(--neutral-600)]">
                  <span className="font-medium text-foreground">Notes: </span>
                  {bom.notes}
                </div>
              )}

              <MwDataTable<BOMLine>
                columns={bomLineColumns}
                data={bom.lines}
                keyExtractor={(_line, i) => i}
              />

              {/* Cost rollup strip */}
              {rollup.total > 0 && (
                <div className="mt-3 rounded-[var(--shape-md)] bg-card border border-[var(--border)] p-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--neutral-500)] font-medium">
                      Cost rollup
                    </span>
                    <span className="text-base font-bold tabular-nums">
                      {formatAud(rollup.total)}
                    </span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)]">
                    {(['material', 'purchased', 'labour', 'subAssembly'] as const).map((k) => {
                      const v = rollup.byKind[k];
                      if (v <= 0) return null;
                      const pct = (v / rollup.total) * 100;
                      const colour = {
                        material: 'bg-[var(--mw-yellow-400)]',
                        purchased: 'bg-[var(--mw-info)]',
                        labour: 'bg-[var(--neutral-400)]',
                        subAssembly: 'bg-[var(--mw-blue)]',
                      }[k];
                      return <div key={k} className={cn('h-full', colour)} style={{ width: `${pct}%` }} />;
                    })}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] tabular-nums text-[var(--neutral-500)]">
                    {(['material', 'purchased', 'labour', 'subAssembly'] as const).map((k) => {
                      const v = rollup.byKind[k];
                      if (v <= 0) return null;
                      const label = { material: 'Material', purchased: 'Purchased', labour: 'Labour', subAssembly: 'Sub-asm' }[k];
                      return (
                        <span key={k}>
                          {label}: {formatAud(v)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Where-used */}
              <div className="mt-3 rounded-[var(--shape-md)] bg-card border border-[var(--border)] p-3">
                <div className="text-[10px] uppercase tracking-wider text-[var(--neutral-500)] font-medium mb-1.5">
                  Where used
                </div>
                {usedIn.length === 0 ? (
                  <div className="text-xs text-[var(--neutral-500)]">
                    Not used as a sub-assembly in any other BOM.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {usedIn.map((parent) => (
                      <Badge
                        key={parent.id}
                        variant="outline"
                        className="text-[10px] gap-1"
                      >
                        <Layers className="h-2.5 w-2.5" />
                        {parent.product} <span className="font-mono text-[var(--neutral-400)]">{parent.sku}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <BomEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        bom={editing}
        availableSubAssemblies={subAssemblyOptions}
        routeOpCount={
          editing?.routeId
            ? routesLibraryService.byId(editing.routeId)?.steps.length ?? 0
            : 0
        }
      />
    </motion.div>
  );
}
