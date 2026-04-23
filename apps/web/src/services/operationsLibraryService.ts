/**
 * Operations Library service — atomic standard operations defined in
 * Control → Operations. The Plan BOM-routing tree's "Add op" picker reads
 * from this list so every job uses a consistent vocabulary of operations.
 *
 * Routes (Control → Routes) are templates that bundle multiple standard ops
 * into a named sequence; see routesLibraryService.
 */

export interface StandardOperation {
  id: string;
  name: string;
  /** Default work centre / machine when the op is applied to a part. */
  defaultWorkCentre: string;
  /** Default planned minutes (overridable per-part). */
  defaultMinutes: number;
  /** Marks this op as outside-processing / subcontract by default. */
  isSubcontract?: boolean;
  /** Free-text description shown in the picker hover. */
  description?: string;
  /** Optional grouping label (e.g. "Cutting", "Forming", "Finishing"). */
  category?: string;
}

const LIBRARY: StandardOperation[] = [
  { id: 'std-op-prep', name: 'Prepare BOM', defaultWorkCentre: 'Office', defaultMinutes: 30, category: 'Planning' },
  { id: 'std-op-nc', name: 'NC files', defaultWorkCentre: 'CAM Station', defaultMinutes: 45, category: 'Planning' },
  { id: 'std-op-program', name: 'Programming', defaultWorkCentre: 'CAM Station', defaultMinutes: 60, category: 'Planning', description: 'Program the machine' },

  { id: 'std-op-laser', name: 'Laser Cut', defaultWorkCentre: 'Laser Cutter', defaultMinutes: 25, category: 'Cutting' },
  { id: 'std-op-turret', name: 'Turret Punch', defaultWorkCentre: 'Turret Punch', defaultMinutes: 30, category: 'Cutting' },
  { id: 'std-op-saw', name: 'Sawing', defaultWorkCentre: 'Bandsaw', defaultMinutes: 15, category: 'Cutting' },

  { id: 'std-op-bend', name: 'Press Brake', defaultWorkCentre: 'Press Brake', defaultMinutes: 35, category: 'Forming' },
  { id: 'std-op-roll', name: 'Plate Rolling', defaultWorkCentre: 'Plate Roller', defaultMinutes: 40, category: 'Forming' },

  { id: 'std-op-mill', name: 'Milling', defaultWorkCentre: 'CNC Mill', defaultMinutes: 60, category: 'Machining', description: 'Milling' },
  { id: 'std-op-turn', name: 'Turning', defaultWorkCentre: 'CNC Lathe', defaultMinutes: 60, category: 'Machining' },
  { id: 'std-op-drill', name: 'Drilling', defaultWorkCentre: 'Drill Press', defaultMinutes: 20, category: 'Machining' },
  { id: 'std-op-grind', name: 'Grinding', defaultWorkCentre: 'Grinder', defaultMinutes: 45, category: 'Machining' },

  { id: 'std-op-weld', name: 'Welding', defaultWorkCentre: 'Weld Bay', defaultMinutes: 60, category: 'Joining' },
  { id: 'std-op-rivet', name: 'Riveting', defaultWorkCentre: 'Bench', defaultMinutes: 25, category: 'Joining' },
  { id: 'std-op-assy', name: 'Assembly', defaultWorkCentre: 'Assembly Bay', defaultMinutes: 90, category: 'Joining' },

  { id: 'std-op-deburr', name: 'Deburr', defaultWorkCentre: 'Bench', defaultMinutes: 20, category: 'Finishing' },
  { id: 'std-op-sand', name: 'Sand Blast', defaultWorkCentre: 'Blast Booth', defaultMinutes: 30, category: 'Finishing' },
  { id: 'std-op-paint', name: 'Painting', defaultWorkCentre: 'Subcontract', defaultMinutes: 240, isSubcontract: true, category: 'Finishing' },
  { id: 'std-op-powder', name: 'Powder Coating', defaultWorkCentre: 'Subcontract', defaultMinutes: 240, isSubcontract: true, category: 'Finishing' },
  { id: 'std-op-plate', name: 'Plating', defaultWorkCentre: 'Subcontract', defaultMinutes: 360, isSubcontract: true, category: 'Finishing' },
  { id: 'std-op-heat', name: 'Heat Treating', defaultWorkCentre: 'Subcontract', defaultMinutes: 480, isSubcontract: true, category: 'Finishing' },

  { id: 'std-op-inspect', name: 'Inspection', defaultWorkCentre: 'QC Bay', defaultMinutes: 25, category: 'Quality' },
  { id: 'std-op-cmm', name: 'CMM check', defaultWorkCentre: 'QC Bay', defaultMinutes: 40, category: 'Quality' },
  { id: 'std-op-test', name: 'Testing', defaultWorkCentre: 'QC Bay', defaultMinutes: 30, category: 'Quality' },
  { id: 'std-op-final', name: 'Final Testing', defaultWorkCentre: 'QC Bay', defaultMinutes: 45, category: 'Quality' },
  { id: 'std-op-recut', name: 'Recut', defaultWorkCentre: 'Laser Cutter', defaultMinutes: 25, category: 'Quality', description: 'Recut' },
];

export const operationsLibraryService = {
  list(): StandardOperation[] {
    return [...LIBRARY];
  },
  byId(id: string): StandardOperation | undefined {
    return LIBRARY.find((o) => o.id === id);
  },
  categories(): string[] {
    return Array.from(new Set(LIBRARY.map((o) => o.category).filter(Boolean) as string[]));
  },
};
