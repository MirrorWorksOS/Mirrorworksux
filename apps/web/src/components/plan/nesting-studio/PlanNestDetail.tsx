/**
 * PlanNestDetail — Read-only Nest deep-dive.
 *
 * Operator's view of a scheduled or in-progress nest: full sheet preview,
 * pick-list of placements, source WO/MO traceability, cost rollup, and
 * DXF/CSV exports for the CAM hand-off.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Layers,
  Percent,
  Clock,
  DollarSign,
  Download,
  FileText,
  CheckCircle2,
  CornerDownLeft,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { planService } from '@/services/planService';
import type { Nest, SheetStock } from '@/types/entities';
import { NestSheetPreview } from './NestSheetPreview';
import {
  buildPickListCsv,
  buildSheetDxf,
  downloadStringAsFile,
} from '@/lib/nesting/exportPickList';

function fmtAud(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
}

function fmtMin(n: number) {
  if (n < 60) return `${n.toFixed(1)} min`;
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  return `${h}h ${m}m`;
}

export function PlanNestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nest, setNest] = useState<Nest | null>(null);
  const [stocks, setStocks] = useState<SheetStock[]>([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    if (!id) return;
    const [n, s] = await Promise.all([
      planService.getNestById(id),
      planService.getSheetStocks(),
    ]);
    // Clone so React re-renders after status mutations on the in-memory store.
    if (n) setNest({ ...n });
    setStocks([...s]);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sheetStock = useMemo<SheetStock | undefined>(() => {
    if (!nest) return undefined;
    const sheetStockId = nest.sheets[selectedSheet]?.sheetStockId;
    return stocks.find((s) => s.id === sheetStockId);
  }, [nest, selectedSheet, stocks]);

  if (!nest) {
    return (
      <PageShell>
        <PageHeader title="Nest" breadcrumbs={[{ label: 'Plan', href: '/plan' }, { label: 'Nests', href: '/plan/nests' }]} />
        <Card variant="flat" className="p-12 text-center text-sm text-muted-foreground">
          Loading…
        </Card>
      </PageShell>
    );
  }

  // Synthesise a partRows array for NestSheetPreview's labelling.
  const previewParts = nest.sheets.flatMap((ns) =>
    ns.placements.map((p, idx) => ({
      id: `${ns.id}-${p.id}`,
      sourceKind: 'queue' as const,
      partNumber: p.partNumber,
      description: '',
      widthMm: p.bboxMm.widthMm,
      heightMm: p.bboxMm.heightMm,
      qty: p.qtyOnSheet,
      allowRotation: true,
      productId: p.productId,
      _idx: idx,
    })),
  );

  const sheet = nest.sheets[selectedSheet];

  async function handleDownloadDxf() {
    if (!nest || !sheet) return;
    const dxf = buildSheetDxf(nest, sheet.sheetIndex);
    downloadStringAsFile(
      dxf,
      `${nest.nestNumber}-sheet-${sheet.sheetIndex}.dxf`,
      'application/dxf',
    );
    toast.success(`Downloaded ${nest.nestNumber} sheet ${sheet.sheetIndex}.dxf`);
  }

  function handleDownloadPickList() {
    if (!nest) return;
    const csv = buildPickListCsv(nest);
    downloadStringAsFile(csv, `${nest.nestNumber}-picklist.csv`, 'text/csv');
    toast.success('Downloaded pick-list');
  }

  async function handleSchedule() {
    if (!nest) return;
    setBusy(true);
    try {
      await planService.scheduleNest(nest.id);
      toast.success('Scheduled · stock reserved');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAdvance(status: 'cutting' | 'done') {
    if (!nest) return;
    setBusy(true);
    try {
      await planService.setNestStatus(nest.id, status);
      toast.success(status === 'cutting' ? 'Cutting started' : 'Nest complete');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title={nest.nestNumber}
        subtitle={`${nest.machineName} · ${nest.material} ${nest.thicknessMm}mm · ${nest.grade}`}
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Nests', href: '/plan/nests' },
          { label: nest.nestNumber },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <CornerDownLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPickList}>
              <FileText className="h-4 w-4" /> Pick-list CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadDxf}>
              <Download className="h-4 w-4" /> Sheet DXF
            </Button>
            {nest.status === 'ready_to_schedule' && (
              <Button size="sm" onClick={handleSchedule} disabled={busy}>
                Schedule
              </Button>
            )}
            {nest.status === 'scheduled' && (
              <Button size="sm" onClick={() => handleAdvance('cutting')} disabled={busy}>
                Start cut
              </Button>
            )}
            {nest.status === 'cutting' && (
              <Button size="sm" onClick={() => handleAdvance('done')} disabled={busy}>
                <CheckCircle2 className="h-4 w-4" /> Mark done
              </Button>
            )}
          </div>
        }
      />

      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Sheets" value={nest.sheets.length} icon={Layers} hint={`Status: ${nest.status.replace('_', ' ')}`} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Yield" value={`${nest.totalYieldPercent}%`} icon={Percent} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Runtime" value={fmtMin(nest.totalRuntimeMin)} icon={Clock} hint={nest.machineName} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard label="Cost" value={fmtAud(nest.cost.totalCostAud)} icon={DollarSign} hint={`Material ${fmtAud(nest.cost.materialCostAud)}`} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card variant="flat" className="space-y-4 p-6 xl:col-span-3">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-foreground">
                Sheet {sheet?.sheetIndex} of {nest.sheets.length}
              </h3>
              {sheetStock && (
                <p className="text-xs text-muted-foreground">
                  {sheetStock.widthMm}×{sheetStock.heightMm} mm · {fmtAud(sheetStock.costPerSheetAud)} ea
                </p>
              )}
            </div>
            {sheet && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Yield {sheet.yieldPercent}%</Badge>
                <Badge variant="outline">{sheet.placements.length} placements</Badge>
              </div>
            )}
          </header>

          {sheet && sheetStock ? (
            <NestSheetPreview
              sheet={{
                sheetIndex: sheet.sheetIndex,
                placements: sheet.placements.map((pl, idx) => ({
                  partId: pl.id,
                  partIndex: idx,
                  xMm: pl.xMm,
                  yMm: pl.yMm,
                  widthMm: pl.bboxMm.widthMm,
                  heightMm: pl.bboxMm.heightMm,
                  rotationDeg: (pl.rotationDeg === 90 ? 90 : 0) as 0 | 90,
                })),
                usedAreaMm2: 0,
                yieldPercent: sheet.yieldPercent,
              }}
              sheetStock={sheetStock}
              parts={previewParts}
            />
          ) : (
            <div className="rounded-md border border-dashed border-[var(--neutral-300)] p-12 text-center text-sm text-muted-foreground">
              No sheets on this nest.
            </div>
          )}

          {nest.sheets.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {nest.sheets.map((s, idx) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={idx === selectedSheet ? 'default' : 'outline'}
                  onClick={() => setSelectedSheet(idx)}
                >
                  Sheet {s.sheetIndex} · {s.yieldPercent}%
                </Button>
              ))}
            </div>
          )}
        </Card>

        <Card variant="flat" className="space-y-4 p-6 xl:col-span-2">
          <h3 className="text-base font-medium text-foreground">Placements on this sheet</h3>
          {sheet && sheet.placements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Source WO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheet.placements.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{p.partNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.bboxMm.widthMm}×{p.bboxMm.heightMm} · {p.rotationDeg}°
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{p.qtyOnSheet}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.sources.map((s, i) => (
                        <div key={i} className="font-mono">
                          {s.woNumber} · {s.qty}
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No placements.</p>
          )}
        </Card>
      </div>

      {/* Cost rollup + source jobs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card variant="flat" className="p-6">
          <h3 className="mb-3 text-base font-medium text-foreground">Cost rollup</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Material</dt>
              <dd className="font-mono">{fmtAud(nest.cost.materialCostAud)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Machine</dt>
              <dd className="font-mono">{fmtAud(nest.cost.machineCostAud)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Labour</dt>
              <dd className="font-mono">{fmtAud(nest.cost.labourCostAud)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="font-mono font-medium">{fmtAud(nest.cost.totalCostAud)}</dd>
            </div>
          </dl>
        </Card>
        <Card variant="flat" className="p-6">
          <h3 className="mb-3 text-base font-medium text-foreground">Source jobs</h3>
          <ul className="space-y-1 text-sm">
            {nest.sourceManufacturingOrderIds.map((mo) => (
              <li key={mo} className="font-mono text-xs">
                <Link to={`/make/manufacturing-orders/${mo}`} className="underline">
                  {mo}
                </Link>
              </li>
            ))}
            {nest.sourceManufacturingOrderIds.length === 0 && (
              <li className="text-xs text-muted-foreground">No linked MOs (manual nest).</li>
            )}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
