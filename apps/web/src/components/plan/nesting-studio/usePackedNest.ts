// ─── usePackedNest — derive packed sheets from the studio's part list ──
// Pure-derived state hook. The Studio holds part rows + machine config and
// passes them in; this hook returns the packed result + cost rollup so the
// preview / KPIs / save action all consume the same source of truth.

import { useMemo } from 'react';
import {
  packRectangles,
  packTight,
  type PackPart,
  type PackResult,
} from '@/lib/nesting/rectanglePacker';
import type {
  SheetStock,
  Machine,
  MachineNestingConfig,
} from '@/types/entities';

export interface StudioPartRow {
  id: string;
  sourceKind: 'queue' | 'library' | 'manual';
  /** When sourced from a queue item, the queue id. */
  queueItemId?: string;
  workOrderId?: string;
  woNumber?: string;
  manufacturingOrderId?: string;
  jobNumber?: string;
  productId?: string;
  partNumber: string;
  description: string;
  widthMm: number;
  heightMm: number;
  qty: number;
  allowRotation: boolean;
  dxfAssetId?: string;
}

export interface PackedStudioState {
  pack: PackResult;
  totalParts: number;
  totalPlaced: number;
  totalUnplaced: number;
  totalSheets: number;
  avgYieldPercent: number;
  totalRuntimeMin: number;
  /** Cost rollup using the selected stock + machine rates. */
  cost: {
    materialCostAud: number;
    machineCostAud: number;
    labourCostAud: number;
    totalCostAud: number;
  };
}

export interface UsePackedNestArgs {
  parts: StudioPartRow[];
  sheetStock?: SheetStock;
  machine?: Machine;
  config?: MachineNestingConfig;
  /** Hourly labour rate in AUD applied alongside the machine rate. */
  labourRateAud?: number;
  /**
   * When true, run multiple sort × shelf strategies and pick the best.
   * Slower but tighter — the Studio exposes this via "Tight nest" toggle.
   */
  tightNest?: boolean;
}

export function usePackedNest(args: UsePackedNestArgs): PackedStudioState {
  const { parts, sheetStock, machine, config, labourRateAud = 65, tightNest = false } = args;

  return useMemo<PackedStudioState>(() => {
    if (!sheetStock || parts.length === 0) {
      return {
        pack: { sheets: [], unplaced: [] },
        totalParts: parts.reduce((sum, p) => sum + p.qty, 0),
        totalPlaced: 0,
        totalUnplaced: 0,
        totalSheets: 0,
        avgYieldPercent: 0,
        totalRuntimeMin: 0,
        cost: { materialCostAud: 0, machineCostAud: 0, labourCostAud: 0, totalCostAud: 0 },
      };
    }

    const packParts: PackPart[] = parts.map((p) => ({
      id: p.id,
      widthMm: p.widthMm,
      heightMm: p.heightMm,
      qty: p.qty,
      allowRotation: p.allowRotation,
    }));

    const partGapMm = config?.partGapMm ?? 6;
    const edgeGapMm = config?.edgeGapMm ?? 10;

    const packFn = tightNest ? packTight : packRectangles;
    const pack = packFn(packParts, {
      sheetWidthMm: sheetStock.widthMm,
      sheetHeightMm: sheetStock.heightMm,
      partGapMm,
      edgeGapMm,
    });

    const totalPlaced = pack.sheets.reduce((sum, s) => sum + s.placements.length, 0);
    const totalUnplaced = pack.unplaced.length;
    const totalSheets = pack.sheets.length;

    const avgYieldPercent = totalSheets === 0
      ? 0
      : Math.round(
          (pack.sheets.reduce((sum, s) => sum + s.yieldPercent, 0) / totalSheets) * 10,
        ) / 10;

    // Runtime estimate per sheet:
    //   pierces × pierceTime + perimeter / cutSpeed (rough — uses bbox perimeter as a proxy
    //   when DXF perimeter is not available).
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
    const machineCostAud =
      Math.round((totalRuntimeMin / 60) * machineRate * 100) / 100;
    const labourCostAud =
      Math.round((totalRuntimeMin / 60) * labourRateAud * 100) / 100;
    const materialCostAud = sheetStock.costPerSheetAud * totalSheets;
    const totalCostAud =
      Math.round((materialCostAud + machineCostAud + labourCostAud) * 100) / 100;

    return {
      pack,
      totalParts: parts.reduce((sum, p) => sum + p.qty, 0),
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
    };
  }, [parts, sheetStock, machine, config, labourRateAud, tightNest]);
}
