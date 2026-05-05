// ─── useAsyncPackedNest — worker-backed packing hook ─────────────────
// Drop-in replacement for usePackedNest that runs the packer in a web
// worker so big nests don't jank the UI. Same return shape — adds a
// `pending` flag and a `lastDurationMs` for the perf indicator.

import { useEffect, useMemo, useRef, useState } from 'react';
// Vite's `?worker` suffix rewrites this into a Worker constructor at
// build time, scoped to this module.
import NestingWorkerCtor from '@/lib/nesting/nestingWorker?worker';
import type { PackPart, PackResult } from '@/lib/nesting/rectanglePacker';
import type {
  Machine,
  MachineNestingConfig,
  SheetStock,
} from '@/types/entities';
import type { StudioPartRow } from './usePackedNest';

export type NestStrategy = 'fast' | 'tight' | 'polygon';

export interface AsyncPackedNest {
  pack: PackResult;
  totalParts: number;
  totalPlaced: number;
  totalUnplaced: number;
  totalSheets: number;
  avgYieldPercent: number;
  totalRuntimeMin: number;
  cost: {
    materialCostAud: number;
    machineCostAud: number;
    labourCostAud: number;
    totalCostAud: number;
  };
  pending: boolean;
  lastDurationMs: number;
  fellBackTo: 'tight' | null;
}

export interface UseAsyncPackedNestArgs {
  parts: StudioPartRow[];
  sheetStock?: SheetStock;
  machine?: Machine;
  config?: MachineNestingConfig;
  labourRateAud?: number;
  strategy: NestStrategy;
}

const EMPTY_PACK: PackResult = { sheets: [], unplaced: [] };

export function useAsyncPackedNest(args: UseAsyncPackedNestArgs): AsyncPackedNest {
  const { parts, sheetStock, machine, config, labourRateAud = 65, strategy } = args;

  const workerRef = useRef<Worker | null>(null);
  const reqIdRef = useRef(0);
  const [pack, setPack] = useState<PackResult>(EMPTY_PACK);
  const [pending, setPending] = useState(false);
  const [lastDurationMs, setLastDurationMs] = useState(0);
  const [fellBackTo, setFellBackTo] = useState<'tight' | null>(null);

  // Lazily construct the worker on first use, tear down on unmount.
  useEffect(() => {
    const w = new NestingWorkerCtor();
    workerRef.current = w;
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const partGapMm = config?.partGapMm ?? 6;
  const edgeGapMm = config?.edgeGapMm ?? 10;

  const packKey = useMemo(() => {
    return JSON.stringify({
      parts: parts.map((p) => ({
        id: p.id,
        w: p.widthMm,
        h: p.heightMm,
        q: p.qty,
        r: p.allowRotation,
      })),
      sheetW: sheetStock?.widthMm,
      sheetH: sheetStock?.heightMm,
      partGapMm,
      edgeGapMm,
      strategy,
    });
  }, [parts, sheetStock?.widthMm, sheetStock?.heightMm, partGapMm, edgeGapMm, strategy]);

  useEffect(() => {
    if (!sheetStock || parts.length === 0) {
      setPack(EMPTY_PACK);
      setPending(false);
      setFellBackTo(null);
      return;
    }
    const worker = workerRef.current;
    if (!worker) return;

    const reqId = ++reqIdRef.current;
    setPending(true);

    const packParts: PackPart[] = parts.map((p) => ({
      id: p.id,
      widthMm: p.widthMm,
      heightMm: p.heightMm,
      qty: p.qty,
      allowRotation: p.allowRotation,
    }));

    const handler = (e: MessageEvent) => {
      const data = e.data as { reqId: number; result: PackResult; durationMs: number; fellBackTo?: 'tight' };
      // Drop stale responses — only accept the latest request id.
      if (data.reqId !== reqIdRef.current) return;
      setPack(data.result);
      setLastDurationMs(data.durationMs);
      setFellBackTo(data.fellBackTo ?? null);
      setPending(false);
      worker.removeEventListener('message', handler);
    };
    worker.addEventListener('message', handler);

    worker.postMessage({
      reqId,
      parts: packParts,
      opts: {
        sheetWidthMm: sheetStock.widthMm,
        sheetHeightMm: sheetStock.heightMm,
        partGapMm,
        edgeGapMm,
      },
      strategy,
    });

    return () => {
      worker.removeEventListener('message', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packKey]);

  return useMemo<AsyncPackedNest>(() => {
    const totalSheets = pack.sheets.length;
    const totalPlaced = pack.sheets.reduce((s, sh) => s + sh.placements.length, 0);
    const totalUnplaced = pack.unplaced.length;
    const avgYieldPercent = totalSheets === 0
      ? 0
      : Math.round(
          (pack.sheets.reduce((s, sh) => s + sh.yieldPercent, 0) / totalSheets) * 10,
        ) / 10;

    const cutSpeed = config?.cutSpeedMmPerMin ?? 4000;
    const pierceTime = config?.pierceTimeSec ?? 1.0;
    const totalRuntimeMin = pack.sheets.reduce((sum, s) => {
      const sheetRuntime = s.placements.reduce((acc, pl) => {
        const perim = (pl.widthMm + pl.heightMm) * 2;
        const cutMin = perim / cutSpeed;
        const pierceMin = pierceTime / 60;
        return acc + cutMin + pierceMin;
      }, 0);
      return sum + sheetRuntime;
    }, 0);

    const machineRate = machine?.capabilities?.hourlyRateAud ?? 100;
    const machineCostAud = sheetStock
      ? Math.round((totalRuntimeMin / 60) * machineRate * 100) / 100
      : 0;
    const labourCostAud = sheetStock
      ? Math.round((totalRuntimeMin / 60) * labourRateAud * 100) / 100
      : 0;
    const materialCostAud = sheetStock ? sheetStock.costPerSheetAud * totalSheets : 0;
    const totalCostAud = Math.round((materialCostAud + machineCostAud + labourCostAud) * 100) / 100;

    return {
      pack,
      totalParts: parts.reduce((s, p) => s + p.qty, 0),
      totalPlaced,
      totalUnplaced,
      totalSheets,
      avgYieldPercent,
      totalRuntimeMin: Math.round(totalRuntimeMin * 10) / 10,
      cost: {
        materialCostAud: Math.round(materialCostAud * 100) / 100,
        machineCostAud,
        labourCostAud,
        totalCostAud,
      },
      pending,
      lastDurationMs,
      fellBackTo,
    };
  }, [pack, parts, sheetStock, machine, config, labourRateAud, pending, lastDurationMs, fellBackTo]);
}

