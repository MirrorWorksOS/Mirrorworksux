/**
 * BomRoutingTree — shared types for the integrated BOM + Routing tree
 * (Plan authors, Make inherits read-only).
 */

export type OperationStatus = 'done' | 'in_progress' | 'pending';
export type PartKind = 'make' | 'buy';

export interface MaterialInput {
  id: string;
  name: string;
  spec?: string;
  qty: number;
  uom: string;
}

export interface OperationNode {
  id: string;
  sequence: number;
  name: string;
  workCentre: string;
  operator?: string;
  minutes: number;
  status: OperationStatus;
  instructionsFile?: string;
  subcontract?: boolean;
}

export interface PartNode {
  id: string;
  name: string;
  partNumber: string;
  kind: PartKind;
  qty: number;
  uom: string;
  material?: string;
  cost: number;
  supplier?: string;
  ncReady?: boolean;
  inputs?: MaterialInput[];
  operations?: OperationNode[];
}

export interface AssemblyNode {
  name: string;
  partNumber: string;
  qty: number;
  cost: number;
  parts: PartNode[];
}
