/**
 * Finish library — type definitions.
 *
 * First-class entity referenced by Product Studio blocks (Finishes toolbox category).
 * Mirrors the shape locked in `docs/product-studio-spec.md`.
 */

export type FinishType =
  | 'powder_coat'
  | 'galv'
  | 'paint'
  | 'anodise'
  | 'polish'
  | 'passivate';

export type FinishSource = 'in_house' | 'subcontract';

export interface FinishColour {
  /** RAL code, e.g. 'RAL 9005' */
  ral: string;
  /** Friendly name, e.g. 'Jet Black' */
  name: string;
}

export interface FinishSubcontractor {
  name: string;
  contact: string;
}

export interface FinishShipping {
  /** Flat fee per dispatch (AUD) */
  fixed: number;
  /** Variable rate per kg (AUD/kg) */
  perKg: number;
  /** Variable rate per km (AUD/km) */
  perKm: number;
}

export interface Finish {
  id: string;
  name: string;
  code: string;
  type: FinishType;
  /** Cost per square metre (AUD/m²) */
  costPerM2: number;
  /** Optional flat fee (AUD); 0 if none */
  flatFee: number;
  /** Setup / minimum charge (AUD) */
  setupCost: number;
  leadTimeDays: number;
  colour: FinishColour | null;
  /** Material ids this finish bonds to */
  compatibleMaterials: string[];
  source: FinishSource;
  subcontractor: FinishSubcontractor | null;
  shipping: FinishShipping | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const FINISH_TYPE_LABELS: Record<FinishType, string> = {
  powder_coat: 'Powder coat',
  galv: 'Galvanise',
  paint: 'Paint',
  anodise: 'Anodise',
  polish: 'Polish',
  passivate: 'Passivate',
};
