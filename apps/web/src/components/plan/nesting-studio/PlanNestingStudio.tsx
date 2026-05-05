/**
 * PlanNestingStudio — Multi-part nesting workspace.
 *
 * Replaces the legacy single-part Sheet Calculator. Programmers add parts
 * (from the Ready-to-Nest queue, the product library, or manually), pick
 * a machine + sheet stock, and see live multi-sheet packing with yield
 * and cost rollup. Save Draft persists; Confirm hands off to scheduling.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import {
  Calculator,
  Layers,
  Percent,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Library,
} from 'lucide-react';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { TextSegmentedControl } from '@/components/shared/layout/TextSegmentedControl';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import { planService } from '@/services/planService';
import type {
  Machine,
  MachineNestingConfig,
  NestingQueueItem,
  Product,
  SheetStock,
  Nest,
  NestSheet,
  NestPlacement,
} from '@/types/entities';

import { NestSheetPreview, colourForPart } from './NestSheetPreview';
import { type StudioPartRow } from './usePackedNest';
import { useAsyncPackedNest, type NestStrategy } from './useAsyncPackedNest';
import { UploadDxfDialog } from './UploadDxfDialog';
import type { DxfAsset } from '@/types/entities';

/* ── helpers ──────────────────────────────────────────────────────── */

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function fmtMin(min: number): string {
  if (min < 60) return `${min.toFixed(1)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}

function fmtAud(n: number): string {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
}

function partRowFromQueueItem(q: NestingQueueItem): StudioPartRow {
  return {
    id: uid('row'),
    sourceKind: 'queue',
    queueItemId: q.id,
    workOrderId: q.workOrderId,
    woNumber: q.woNumber,
    manufacturingOrderId: q.manufacturingOrderId,
    jobNumber: q.jobNumber,
    productId: q.productId,
    partNumber: q.partNumber,
    description: q.description,
    widthMm: q.bboxMm.widthMm,
    heightMm: q.bboxMm.heightMm,
    qty: q.qtyRequired,
    allowRotation: true,
    dxfAssetId: q.dxfAssetId,
  };
}

function partRowFromProduct(p: Product): StudioPartRow {
  return {
    id: uid('row'),
    sourceKind: 'library',
    productId: p.id,
    partNumber: p.partNumber,
    description: p.description,
    widthMm: p.geometry?.bboxMm.widthMm ?? 0,
    heightMm: p.geometry?.bboxMm.heightMm ?? 0,
    qty: 1,
    allowRotation: p.geometry?.allowRotation ?? true,
    dxfAssetId: p.geometry?.dxfAssetId,
  };
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanNestingStudio() {
  const [searchParams] = useSearchParams();
  const queueItemIdParam = searchParams.get('queueItem');

  const [machines, setMachines] = useState<Machine[]>([]);
  const [configs, setConfigs] = useState<MachineNestingConfig[]>([]);
  const [stocks, setStocks] = useState<SheetStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [queueItems, setQueueItems] = useState<NestingQueueItem[]>([]);

  const [machineId, setMachineId] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [thicknessMm, setThicknessMm] = useState<number | undefined>();
  const [sheetStockId, setSheetStockId] = useState<string>('');

  const [parts, setParts] = useState<StudioPartRow[]>([]);
  const [partGapMm, setPartGapMm] = useState<number>(6);
  const [edgeGapMm, setEdgeGapMm] = useState<number>(10);
  const [allowRotationGlobal, setAllowRotationGlobal] = useState<boolean>(true);
  const [strategy, setStrategy] = useState<NestStrategy>('fast');

  const [isSaving, setIsSaving] = useState(false);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);

  // ── Load data ───────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    void Promise.all([
      planService.getMachines(),
      planService.getMachineNestingConfigs(),
      planService.getSheetStocks(),
      planService.getProductsWithGeometry(),
      planService.getNestingQueue(),
    ]).then(([m, c, s, p, q]) => {
      if (!alive) return;
      // Filter to cutting machines (those with capabilities populated).
      const cuttingMachines = m.filter((mm) => mm.capabilities !== undefined);
      setMachines(cuttingMachines);
      setConfigs(c);
      setStocks(s.filter((st) => st.status === 'available'));
      setProducts(p);
      setQueueItems(q.filter((qq) => qq.status === 'pending'));

      // Sensible default — first machine, its first material/thickness combo.
      if (cuttingMachines.length > 0 && !machineId) {
        const first = cuttingMachines[0];
        setMachineId(first.id);
        const cfg = c.find((cc) => cc.machineId === first.id);
        if (cfg) {
          setMaterial(cfg.material);
          setThicknessMm(cfg.thicknessMm);
        }
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-add a part from a `?queueItem=…` URL param after queue loads.
  useEffect(() => {
    if (!queueItemIdParam || queueItems.length === 0) return;
    const item = queueItems.find((q) => q.id === queueItemIdParam);
    if (!item) return;
    const alreadyAdded = parts.some((p) => p.queueItemId === item.id);
    if (alreadyAdded) return;
    setParts((prev) => [...prev, partRowFromQueueItem(item)]);
    // Snap the machine + material/thickness selectors to the queue item.
    const cfg = configs.find(
      (c) => c.material === item.material && c.thicknessMm === item.thicknessMm,
    );
    if (cfg) {
      setMachineId(cfg.machineId);
      setMaterial(cfg.material);
      setThicknessMm(cfg.thicknessMm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueItemIdParam, queueItems]);

  // ── Derived state ───────────────────────────────────────────────
  const machine = machines.find((m) => m.id === machineId);
  const materialsForMachine = useMemo(() => {
    if (!machine?.capabilities) return [];
    return machine.capabilities.supportedMaterials;
  }, [machine]);

  const thicknessesForCombo = useMemo(() => {
    return Array.from(
      new Set(
        configs
          .filter((c) => c.machineId === machineId && c.material === material)
          .map((c) => c.thicknessMm),
      ),
    ).sort((a, b) => a - b);
  }, [configs, machineId, material]);

  const config = useMemo(() => {
    return configs.find(
      (c) => c.machineId === machineId && c.material === material && c.thicknessMm === thicknessMm,
    );
  }, [configs, machineId, material, thicknessMm]);

  const eligibleStocks = useMemo(() => {
    return stocks.filter(
      (s) =>
        s.material === material &&
        s.thicknessMm === thicknessMm &&
        machine?.capabilities &&
        s.widthMm <= machine.capabilities.maxSheetWidthMm &&
        s.heightMm <= machine.capabilities.maxSheetHeightMm,
    );
  }, [stocks, material, thicknessMm, machine]);

  // Auto-pick a sheet stock when filters change and current selection is invalid.
  useEffect(() => {
    if (eligibleStocks.length === 0) {
      setSheetStockId('');
      return;
    }
    if (!eligibleStocks.find((s) => s.id === sheetStockId)) {
      setSheetStockId(eligibleStocks[0].id);
    }
  }, [eligibleStocks, sheetStockId]);

  // Sync rotation default + part gap from machine config.
  useEffect(() => {
    if (config) {
      setPartGapMm(config.partGapMm);
      setEdgeGapMm(config.edgeGapMm);
      setAllowRotationGlobal(config.allowRotation);
    }
  }, [config]);

  const sheetStock = stocks.find((s) => s.id === sheetStockId);

  // Apply global rotation toggle on top of per-row.
  const partsForPacker = useMemo<StudioPartRow[]>(
    () => parts.map((p) => ({ ...p, allowRotation: allowRotationGlobal && p.allowRotation })),
    [parts, allowRotationGlobal],
  );

  const packed = useAsyncPackedNest({
    parts: partsForPacker,
    sheetStock,
    machine,
    config: config
      ? { ...config, partGapMm, edgeGapMm, allowRotation: allowRotationGlobal }
      : undefined,
    strategy,
  });

  // Clamp the selected sheet index when sheet count shrinks.
  useEffect(() => {
    if (selectedSheetIndex >= packed.totalSheets && packed.totalSheets > 0) {
      setSelectedSheetIndex(0);
    }
  }, [packed.totalSheets, selectedSheetIndex]);

  // ── Part list mutations ─────────────────────────────────────────
  function addQueueItem(item: NestingQueueItem) {
    if (parts.some((p) => p.queueItemId === item.id)) return;
    setParts((prev) => [...prev, partRowFromQueueItem(item)]);
  }

  function addProduct(p: Product) {
    setParts((prev) => [...prev, partRowFromProduct(p)]);
  }

  function addManualPart() {
    setParts((prev) => [
      ...prev,
      {
        id: uid('row'),
        sourceKind: 'manual',
        partNumber: 'NEW-' + (prev.length + 1).toString().padStart(3, '0'),
        description: '',
        widthMm: 200,
        heightMm: 150,
        qty: 1,
        allowRotation: true,
      },
    ]);
  }

  function addDxfPart(args: {
    asset: DxfAsset;
    partNumber: string;
    description: string;
    qty: number;
    allowRotation: boolean;
  }) {
    setParts((prev) => [
      ...prev,
      {
        id: uid('row'),
        sourceKind: 'manual',
        partNumber: args.partNumber,
        description: args.description,
        widthMm: args.asset.bboxMm.widthMm,
        heightMm: args.asset.bboxMm.heightMm,
        qty: args.qty,
        allowRotation: args.allowRotation,
        dxfAssetId: args.asset.id,
      },
    ]);
  }

  function updatePart(id: string, patch: Partial<StudioPartRow>) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function removePart(id: string) {
    setParts((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Save / Confirm ──────────────────────────────────────────────
  function buildNest(status: 'draft' | 'ready_to_schedule'): Nest | null {
    if (!machine || !sheetStock || !thicknessMm || packed.totalSheets === 0) return null;

    const nestSheets: NestSheet[] = packed.pack.sheets.map((s, sheetIdx) => {
      // Group placements by source part row so each Nest placement carries
      // qty + back-links to source WOs.
      const grouped = new Map<number, NestPlacement>();
      for (const placement of s.placements) {
        const part = partsForPacker[placement.partIndex];
        const key = placement.partIndex;
        const existing = grouped.get(key);
        const placementId = uid('p');
        const sourceLink = part.workOrderId
          ? [{ workOrderId: part.workOrderId, woNumber: part.woNumber ?? '', qty: 1 }]
          : [];
        if (existing) {
          existing.qtyOnSheet += 1;
          if (sourceLink.length > 0) {
            const ex = existing.sources.find((x) => x.workOrderId === sourceLink[0].workOrderId);
            if (ex) ex.qty += 1;
            else existing.sources.push(sourceLink[0]);
          }
        } else {
          grouped.set(key, {
            id: placementId,
            productId: part.productId,
            partNumber: part.partNumber,
            dxfAssetId: part.dxfAssetId,
            qtyOnSheet: 1,
            sources: sourceLink,
            xMm: placement.xMm,
            yMm: placement.yMm,
            rotationDeg: placement.rotationDeg,
            bboxMm: { widthMm: placement.widthMm, heightMm: placement.heightMm },
          });
        }
      }
      const placements = Array.from(grouped.values());
      const sheetArea = sheetStock.widthMm * sheetStock.heightMm;
      const usedArea = s.usedAreaMm2;
      return {
        id: uid('ns'),
        sheetStockId: sheetStock.id,
        sheetIndex: sheetIdx + 1,
        placements,
        yieldPercent: s.yieldPercent,
        scrapAreaMm2: Math.max(0, sheetArea - usedArea),
        estimatedRuntimeMin: Math.round(
          (packed.totalRuntimeMin / packed.totalSheets) * 10,
        ) / 10,
      };
    });

    const sourceWorkOrderIds = Array.from(
      new Set(
        partsForPacker
          .map((p) => p.workOrderId)
          .filter((x): x is string => Boolean(x)),
      ),
    );
    const sourceManufacturingOrderIds = Array.from(
      new Set(
        partsForPacker
          .map((p) => p.manufacturingOrderId)
          .filter((x): x is string => Boolean(x)),
      ),
    );

    return {
      id: uid('nst'),
      nestNumber: `NST-DRAFT-${Date.now().toString().slice(-6)}`,
      status,
      machineId: machine.id,
      machineName: machine.name,
      material,
      grade: sheetStock.grade,
      thicknessMm,
      sheets: nestSheets,
      cost: packed.cost,
      totalYieldPercent: packed.avgYieldPercent,
      totalRuntimeMin: packed.totalRuntimeMin,
      createdBy: 'Nesting Studio',
      createdAt: new Date().toISOString(),
      sourceWorkOrderIds,
      sourceManufacturingOrderIds,
    };
  }

  async function handleSave(status: 'draft' | 'ready_to_schedule') {
    const nest = buildNest(status);
    if (!nest) {
      toast.error('Pick a machine, sheet stock, and at least one part first.');
      return;
    }
    setIsSaving(true);
    try {
      await planService.saveNest(nest);
      const queueItemIds = parts.map((p) => p.queueItemId).filter((x): x is string => Boolean(x));
      if (queueItemIds.length > 0) {
        await planService.markQueueItemsPlaced(queueItemIds, nest.id);
      }
      toast.success(
        status === 'draft'
          ? `Saved ${nest.nestNumber} as draft`
          : `${nest.nestNumber} ready to schedule`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ── render ───────────────────────────────────────────────────── */

  const selectedSheet = packed.pack.sheets[selectedSheetIndex];

  return (
    <PageShell>
      <PageHeader
        title="Nesting Studio"
        subtitle="Multi-part nesting on real sheet stock — handoff to schedule when ready"
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Nesting Studio' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isSaving || packed.totalSheets === 0}
            >
              <Save className="h-4 w-4" /> Save draft
            </Button>
            <Button
              onClick={() => handleSave('ready_to_schedule')}
              disabled={isSaving || packed.totalSheets === 0 || packed.totalUnplaced > 0}
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm nest
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Sheets"
            value={packed.totalSheets}
            icon={Layers}
            hint={`${packed.totalPlaced} of ${packed.totalParts} parts placed`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Avg yield"
            value={`${packed.avgYieldPercent}%`}
            icon={Percent}
            hint={packed.totalUnplaced > 0 ? `${packed.totalUnplaced} unplaced` : 'All parts placed'}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Runtime"
            value={fmtMin(packed.totalRuntimeMin)}
            icon={Clock}
            hint={machine?.name ?? '—'}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Cost"
            value={fmtAud(packed.cost.totalCostAud)}
            icon={DollarSign}
            hint={`Material ${fmtAud(packed.cost.materialCostAud)}`}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* ── Setup pane ─────────────────────────────────────────── */}
        <motion.div className="xl:col-span-2" variants={staggerItem} initial="initial" animate="animate">
          <Card variant="flat" className="space-y-5 p-6">
            <header className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">Machine &amp; sheet</h3>
            </header>

            <fieldset className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Machine</Label>
                  <Select value={machineId} onValueChange={(v) => setMachineId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} <span className="text-muted-foreground">· {m.workCenter}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Material</Label>
                  <Select value={material} onValueChange={setMaterial} disabled={materialsForMachine.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialsForMachine.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Thickness (mm)</Label>
                  <Select
                    value={thicknessMm?.toString() ?? ''}
                    onValueChange={(v) => setThicknessMm(Number(v))}
                    disabled={thicknessesForCombo.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Thickness" />
                    </SelectTrigger>
                    <SelectContent>
                      {thicknessesForCombo.map((t) => (
                        <SelectItem key={t} value={t.toString()}>
                          {t} mm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sheet stock</Label>
                  <Select
                    value={sheetStockId}
                    onValueChange={setSheetStockId}
                    disabled={eligibleStocks.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={eligibleStocks.length === 0 ? 'No matching stock' : 'Pick stock'} />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleStocks.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.widthMm}×{s.heightMm} · {s.qtyOnHand} on hand · {fmtAud(s.costPerSheetAud)}
                          {s.isRemnant ? ' · remnant' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </fieldset>

            <div className="rounded-lg bg-[var(--neutral-50)] p-3 text-xs text-muted-foreground">
              {sheetStock ? (
                <>
                  <p>
                    <span className="font-mono font-medium text-foreground">
                      {sheetStock.widthMm}×{sheetStock.heightMm} mm
                    </span>{' '}
                    · {sheetStock.qtyOnHand} on hand · {fmtAud(sheetStock.costPerSheetAud)} ea
                  </p>
                  <p className="mt-1">
                    Machine: <span className="font-mono">{machine?.name}</span> · Control:{' '}
                    <span className="font-mono">{machine?.capabilities?.controlSystem ?? '—'}</span>
                    {' · '}rate <span className="font-mono">{fmtAud(machine?.capabilities?.hourlyRateAud ?? 0)}/hr</span>
                  </p>
                </>
              ) : (
                <p>Pick a machine, material, and thickness to see eligible sheet stock.</p>
              )}
            </div>

            <header className="mt-2 flex items-center gap-2 border-t border-[var(--neutral-200)] pt-5">
              <Layers className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">Pack settings</h3>
            </header>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="partGap">Part gap (mm)</Label>
                <Input
                  id="partGap"
                  type="number"
                  min={0}
                  value={partGapMm}
                  onChange={(e) => setPartGapMm(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edgeGap">Edge gap (mm)</Label>
                <Input
                  id="edgeGap"
                  type="number"
                  min={0}
                  value={edgeGapMm}
                  onChange={(e) => setEdgeGapMm(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div className="flex flex-col justify-end space-y-1.5">
                <Label htmlFor="rot">Allow rotation</Label>
                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    id="rot"
                    checked={allowRotationGlobal}
                    onCheckedChange={setAllowRotationGlobal}
                  />
                  <span className="text-xs text-muted-foreground">
                    {allowRotationGlobal ? '0° / 90°' : '0° only'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Pack strategy</Label>
              <TextSegmentedControl
                ariaLabel="Pack strategy"
                value={strategy}
                onChange={(v) => setStrategy(v as NestStrategy)}
                options={[
                  { key: 'fast', label: 'Fast' },
                  { key: 'tight', label: 'Tight' },
                  { key: 'polygon', label: 'Polygon' },
                ]}
              />
              <p className="text-xs text-muted-foreground">
                {strategy === 'fast' && 'FFDH shelf packer — runs in milliseconds, deterministic.'}
                {strategy === 'tight' && 'Best of 8 sort × shelf strategies. Slower but tighter.'}
                {strategy === 'polygon' && (
                  <>
                    True polygon nesting (NFP / SVGnest) is the next step — runs as <span className="font-medium">Tight</span> today and falls back transparently. The DXF&apos;s polygon already rides through to CAM.
                  </>
                )}
              </p>
              {packed.pending && (
                <p className="text-xs text-muted-foreground">Packing… (worker)</p>
              )}
              {!packed.pending && packed.lastDurationMs > 0 && (
                <p className="text-xs text-muted-foreground">
                  Packed in <span className="font-mono">{packed.lastDurationMs} ms</span>
                  {packed.fellBackTo ? ` · fell back to ${packed.fellBackTo}` : null}
                </p>
              )}
            </div>
          </Card>

          {/* Parts table */}
          <Card variant="flat" className="mt-6 space-y-4 p-6">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-foreground">Parts</h3>
                <Badge variant="secondary">{parts.length} rows</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <AddFromQueueDialog items={queueItems} onAdd={addQueueItem} alreadyIds={parts.map((p) => p.queueItemId).filter((x): x is string => Boolean(x))} />
                <AddFromLibraryDialog products={products} onAdd={addProduct} />
                <UploadDxfDialog onAdd={addDxfPart} />
                <Button size="sm" variant="outline" onClick={addManualPart}>
                  <Plus className="h-4 w-4" /> Manual
                </Button>
              </div>
            </header>

            {parts.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--neutral-300)] p-6 text-center text-sm text-muted-foreground">
                No parts yet. Add from the cut queue, the product library, or type one in.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Part</TableHead>
                    <TableHead className="text-right">W</TableHead>
                    <TableHead className="text-right">H</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-center">Rot</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: colourForPart(idx) }}
                          aria-hidden
                        />
                      </TableCell>
                      <TableCell>
                        {p.sourceKind === 'manual' ? (
                          <div className="space-y-1">
                            <Input
                              value={p.partNumber}
                              onChange={(e) => updatePart(p.id, { partNumber: e.target.value })}
                              className="h-7 w-32 font-mono text-sm"
                              placeholder="Part #"
                            />
                            <Input
                              value={p.description}
                              onChange={(e) => updatePart(p.id, { description: e.target.value })}
                              className="h-6 w-44 text-xs"
                              placeholder="Description"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-mono text-sm">{p.partNumber}</div>
                            <div className="line-clamp-1 text-xs text-muted-foreground">{p.description}</div>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          value={p.widthMm}
                          onChange={(e) => updatePart(p.id, { widthMm: Number(e.target.value) })}
                          className="w-20 text-right font-mono"
                          disabled={p.sourceKind !== 'manual'}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          value={p.heightMm}
                          onChange={(e) => updatePart(p.id, { heightMm: Number(e.target.value) })}
                          className="w-20 text-right font-mono"
                          disabled={p.sourceKind !== 'manual'}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          value={p.qty}
                          onChange={(e) => updatePart(p.id, { qty: Math.max(1, Number(e.target.value)) })}
                          className="w-16 text-right font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={p.allowRotation}
                          onCheckedChange={(v) => updatePart(p.id, { allowRotation: v })}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {p.sourceKind === 'queue' && p.woNumber ? p.woNumber : null}
                          {p.sourceKind === 'library' ? 'Library' : null}
                          {p.sourceKind === 'manual' && !p.dxfAssetId ? 'Manual' : null}
                          {p.dxfAssetId && (
                            <Badge variant="secondary" className="font-mono text-[10px]">
                              DXF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove part"
                          onClick={() => removePart(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </motion.div>

        {/* ── Preview pane ───────────────────────────────────────── */}
        <motion.div className="xl:col-span-3" variants={staggerItem} initial="initial" animate="animate">
          <Card variant="flat" className="space-y-4 p-6">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-medium text-foreground">Sheet preview</h3>
                <p className="text-xs text-muted-foreground">
                  {packed.totalSheets === 0
                    ? 'Pick a sheet stock and add at least one part.'
                    : `Sheet ${selectedSheetIndex + 1} of ${packed.totalSheets}`}
                </p>
              </div>
              {selectedSheet && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Yield {selectedSheet.yieldPercent}%</Badge>
                  <Badge variant="outline">{selectedSheet.placements.length} placements</Badge>
                </div>
              )}
            </header>

            {selectedSheet && sheetStock ? (
              <NestSheetPreview
                sheet={selectedSheet}
                sheetStock={sheetStock}
                parts={partsForPacker}
              />
            ) : (
              <div className="rounded-md border border-dashed border-[var(--neutral-300)] p-12 text-center text-sm text-muted-foreground">
                Live preview will render here once setup is complete.
              </div>
            )}

            {packed.totalSheets > 1 && sheetStock && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {packed.pack.sheets.map((s, idx) => (
                  <button
                    key={s.sheetIndex}
                    onClick={() => setSelectedSheetIndex(idx)}
                    aria-current={idx === selectedSheetIndex}
                    className={`group rounded-md border p-1 transition ${
                      idx === selectedSheetIndex
                        ? 'border-foreground'
                        : 'border-[var(--neutral-200)] hover:border-[var(--neutral-300)]'
                    }`}
                  >
                    <NestSheetPreview
                      sheet={s}
                      sheetStock={sheetStock}
                      parts={partsForPacker}
                      variant="thumbnail"
                    />
                    <div className="pt-1 text-center font-mono text-[10px] text-muted-foreground">
                      #{s.sheetIndex} · {s.yieldPercent}%
                    </div>
                  </button>
                ))}
              </div>
            )}

            {packed.totalUnplaced > 0 && (
              <div className="rounded-md border border-[var(--warning-200,oklch(0.85_0.15_60))] bg-[var(--warning-50,oklch(0.97_0.05_75))] p-3 text-sm">
                <p className="font-medium">{packed.totalUnplaced} part(s) didn’t fit</p>
                <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                  {packed.pack.unplaced.slice(0, 3).map((u, i) => (
                    <li key={i}>{u.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Cost rollup */}
          <Card variant="flat" className="mt-6 p-6">
            <header className="mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
              <h3 className="text-base font-medium text-foreground">Cost rollup</h3>
            </header>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Material</dt>
                <dd className="font-mono">{fmtAud(packed.cost.materialCostAud)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Machine</dt>
                <dd className="font-mono">{fmtAud(packed.cost.machineCostAud)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Labour</dt>
                <dd className="font-mono">{fmtAud(packed.cost.labourCostAud)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="font-mono font-medium">{fmtAud(packed.cost.totalCostAud)}</dd>
              </div>
            </dl>
          </Card>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            <Link to="/plan/schedule-engine" className="underline">
              View Schedule Engine
            </Link>{' '}
            to slot confirmed nests onto the Gantt.
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}

/* ── Add-from dialogs ─────────────────────────────────────────── */

function AddFromQueueDialog({
  items,
  onAdd,
  alreadyIds,
}: {
  items: NestingQueueItem[];
  onAdd: (item: NestingQueueItem) => void;
  alreadyIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const available = items.filter((i) => !alreadyIds.includes(i.id));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Plus className="h-4 w-4" /> From queue ({available.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ready-to-Nest queue</DialogTitle>
          <DialogDescription>
            Click a row to add it to the current nest.
          </DialogDescription>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing waiting in the queue.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO / MO</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {available.map((q) => (
                <TableRow
                  key={q.id}
                  onClick={() => onAdd(q)}
                  className="cursor-pointer transition-colors hover:bg-[var(--neutral-50)]"
                >
                  <TableCell>
                    <div className="font-mono text-xs">{q.woNumber}</div>
                    <div className="text-xs text-muted-foreground">{q.moNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{q.partNumber}</div>
                    <div className="text-xs text-muted-foreground">{q.description}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {q.material} {q.thicknessMm}mm
                  </TableCell>
                  <TableCell className="text-right font-mono">{q.qtyRequired}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{q.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddFromLibraryDialog({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.partNumber.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle),
    );
  }, [products, q]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Library className="h-4 w-4" /> From library
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product library</DialogTitle>
          <DialogDescription>Click a row to add it to the current nest.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search part number or description"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead className="text-right">W × H</TableHead>
              <TableHead>Material</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.id}
                onClick={() => onAdd(p)}
                className="cursor-pointer transition-colors hover:bg-[var(--neutral-50)]"
              >
                <TableCell>
                  <div className="font-mono text-sm">{p.partNumber}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {p.geometry?.bboxMm.widthMm}×{p.geometry?.bboxMm.heightMm}
                </TableCell>
                <TableCell className="text-xs">
                  {p.material} {p.geometry?.thicknessMm ? `· ${p.geometry.thicknessMm}mm` : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
