/**
 * Differential Assembly — BOM + routing mock data.
 * Authored in Plan, rendered read-only in Make.
 */

import type { AssemblyNode, OperationStatus } from './BomRoutingTree.types';

type Mode = 'plan' | 'make';

/**
 * Generates the Differential Assembly tree. In `make` mode the first couple
 * of ops are already "done" / "in_progress" to match the MO-001 work orders.
 */
export function getDifferentialAssembly(mode: Mode = 'plan'): AssemblyNode {
  const ringGearStatuses: OperationStatus[] =
    mode === 'make'
      ? ['done', 'done', 'done', 'in_progress', 'pending', 'pending', 'pending', 'pending']
      : ['done', 'done', 'done', 'in_progress', 'pending', 'pending', 'pending', 'pending'];

  const pinionStatuses: OperationStatus[] =
    mode === 'make'
      ? ['done', 'pending', 'pending', 'pending', 'pending']
      : ['done', 'in_progress', 'pending', 'pending', 'pending'];

  const spiderStatuses: OperationStatus[] =
    mode === 'make'
      ? ['pending', 'pending', 'pending', 'pending', 'pending']
      : ['pending', 'pending', 'pending', 'pending', 'pending'];

  return {
    name: 'Differential Assembly',
    partNumber: 'DF-ASM-001',
    qty: 1,
    cost: 185000,
    parts: [
      {
        id: 'part-ring-gear',
        name: 'Ring Gear',
        partNumber: 'DF-RG-440',
        kind: 'make',
        qty: 1,
        uom: 'ea',
        material: 'AISI 4820 Steel',
        cost: 18400,
        ncReady: true,
        inputs: [
          { id: 'in-rg-1', name: 'AISI 4820 billet', spec: 'Ø210 × 70mm', qty: 1, uom: 'ea' },
          { id: 'in-rg-2', name: 'Gear hob cutter', spec: 'Module 4', qty: 0.02, uom: 'use' },
        ],
        operations: [
          { id: 'op-rg-1', sequence: 1, name: 'Prepare BOM', workCentre: 'Office', operator: 'D. Miller', minutes: 30, status: ringGearStatuses[0] },
          { id: 'op-rg-2', sequence: 2, name: 'NC files', workCentre: 'CAM Station', operator: 'S. Chen', minutes: 45, status: ringGearStatuses[1], instructionsFile: 'DF-RG-440_op1.nc' },
          { id: 'op-rg-3', sequence: 3, name: 'Rough turn blank', workCentre: 'CNC Lathe', operator: 'K. Doe', minutes: 90, status: ringGearStatuses[2], instructionsFile: 'Turn_Program_v3.pdf' },
          { id: 'op-rg-4', sequence: 4, name: 'Gear hobbing', workCentre: 'Gear Hobber', operator: 'J. Wright', minutes: 180, status: ringGearStatuses[3], instructionsFile: 'Hob_Sequence_M4.pdf' },
          { id: 'op-rg-5', sequence: 5, name: 'Deburr teeth', workCentre: 'Bench', operator: 'M. Johnson', minutes: 45, status: ringGearStatuses[4] },
          { id: 'op-rg-6', sequence: 6, name: 'Case hardening', workCentre: 'Subcontract', operator: 'External', minutes: 480, status: ringGearStatuses[5], subcontract: true, instructionsFile: 'HeatTreat_Spec_58HRC.pdf' },
          { id: 'op-rg-7', sequence: 7, name: 'Finish grind OD', workCentre: 'Cylindrical Grinder', operator: 'T. Park', minutes: 60, status: ringGearStatuses[6] },
          { id: 'op-rg-8', sequence: 8, name: 'CMM check', workCentre: 'QC Bay', operator: 'D. Miller', minutes: 40, status: ringGearStatuses[7], instructionsFile: 'CMM_RingGear_DF-RG-440.pdf' },
        ],
      },
      {
        id: 'part-pinion',
        name: 'Pinion Shaft',
        partNumber: 'DF-PS-50',
        kind: 'make',
        qty: 2,
        uom: 'ea',
        material: 'AISI 4820 Steel',
        cost: 9800,
        ncReady: true,
        inputs: [
          { id: 'in-ps-1', name: 'AISI 4820 bar', spec: 'Ø55 × 300mm', qty: 2, uom: 'ea' },
        ],
        operations: [
          { id: 'op-ps-1', sequence: 1, name: 'NC files', workCentre: 'CAM Station', operator: 'S. Chen', minutes: 30, status: pinionStatuses[0], instructionsFile: 'Pinion_DF-PS-50.nc' },
          { id: 'op-ps-2', sequence: 2, name: 'Turn shaft profile', workCentre: 'CNC Lathe', operator: 'S. Chen', minutes: 75, status: pinionStatuses[1], instructionsFile: 'Turn_Program_PS50.pdf' },
          { id: 'op-ps-3', sequence: 3, name: 'Cut pinion teeth', workCentre: 'Gear Hobber', operator: 'J. Wright', minutes: 120, status: pinionStatuses[2], instructionsFile: 'Hob_BevelCut_v2.pdf' },
          { id: 'op-ps-4', sequence: 4, name: 'Spline grinding', workCentre: 'Grinder', operator: 'T. Park', minutes: 55, status: pinionStatuses[3] },
          { id: 'op-ps-5', sequence: 5, name: 'QC inspection', workCentre: 'QC Bay', operator: 'D. Miller', minutes: 25, status: pinionStatuses[4], instructionsFile: 'QC_Pinion_DF-PS-50.pdf' },
        ],
      },
      {
        id: 'part-spider',
        name: 'Spider Gear',
        partNumber: 'DF-SG-25',
        kind: 'make',
        qty: 4,
        uom: 'ea',
        material: 'AISI 4820 Steel',
        cost: 6200,
        ncReady: false,
        inputs: [
          { id: 'in-sg-1', name: 'AISI 4820 blank', spec: 'Ø80 × 40mm', qty: 4, uom: 'ea' },
        ],
        operations: [
          { id: 'op-sg-1', sequence: 1, name: 'Prepare BOM', workCentre: 'Office', operator: 'D. Miller', minutes: 20, status: spiderStatuses[0] },
          { id: 'op-sg-2', sequence: 2, name: 'Turn spider blanks', workCentre: 'CNC Lathe', operator: 'K. Doe', minutes: 60, status: spiderStatuses[1] },
          { id: 'op-sg-3', sequence: 3, name: 'Bevel gear cutting', workCentre: 'Gear Hobber', operator: 'M. Johnson', minutes: 90, status: spiderStatuses[2], instructionsFile: 'BevelCut_DF-SG-25.pdf' },
          { id: 'op-sg-4', sequence: 4, name: 'Case hardening', workCentre: 'Subcontract', operator: 'External', minutes: 360, status: spiderStatuses[3], subcontract: true, instructionsFile: 'HeatTreat_Spec_56HRC.pdf' },
          { id: 'op-sg-5', sequence: 5, name: 'QC inspection', workCentre: 'QC Bay', operator: 'D. Miller', minutes: 25, status: spiderStatuses[4] },
        ],
      },
      {
        id: 'part-case',
        name: 'Differential Case',
        partNumber: 'DF-HS-01',
        kind: 'buy',
        qty: 1,
        uom: 'ea',
        cost: 2850,
        supplier: 'Driveline Co',
      },
      {
        id: 'part-bearings',
        name: 'Bearing Set',
        partNumber: 'DF-BR-02',
        kind: 'buy',
        qty: 2,
        uom: 'ea',
        cost: 420,
        supplier: 'SKF',
      },
      {
        id: 'part-seals',
        name: 'Seal Kit',
        partNumber: 'DF-SK-03',
        kind: 'buy',
        qty: 1,
        uom: 'ea',
        cost: 180,
        supplier: 'Parker',
      },
    ],
  };
}
