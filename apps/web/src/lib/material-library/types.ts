/**
 * Material library — type definitions.
 *
 * First-class entity referenced by Product Studio blocks (Materials toolbox category).
 * Mirrors the shape locked in `docs/product-studio-spec.md`.
 */

export type MaterialType =
  | 'sheet'
  | 'plate'
  | 'tube'
  | 'rhs'
  | 'shs'
  | 'angle'
  | 'flat_bar'
  | 'round_bar'
  | 'wire'
  | 'mesh';

export type MaterialCostUnit = 'per_kg' | 'per_m' | 'per_sheet';

export interface MaterialStockSize {
  /** mm — sheet/plate */
  width?: number;
  /** mm — sheet/plate/tube */
  length?: number;
  /** mm — sheet/plate */
  thickness?: number;
  /** mm — round bar / round tube */
  diameter?: number;
  /** e.g. '50x50x3' — RHS / SHS / angle */
  profile?: string;
}

export interface MaterialSupplier {
  name: string;
  leadTimeDays: number;
}

export interface MaterialCost {
  unit: MaterialCostUnit;
  amount: number;
  /** ISO 4217 — defaults to 'AUD' */
  currency: string;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  type: MaterialType;
  /** e.g. '304', '316', '250MPa' */
  grade: string;
  densityKgM3: number;
  cost: MaterialCost;
  stockSizes: MaterialStockSize[];
  /** Standard available thicknesses (mm) */
  thicknesses: number[];
  /** Finish ids (referenced from finish library) */
  compatibleFinishes: string[];
  suppliers: MaterialSupplier[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  sheet: 'Sheet',
  plate: 'Plate',
  tube: 'Tube',
  rhs: 'RHS',
  shs: 'SHS',
  angle: 'Angle',
  flat_bar: 'Flat bar',
  round_bar: 'Round bar',
  wire: 'Wire',
  mesh: 'Mesh',
};
