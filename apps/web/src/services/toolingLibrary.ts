/**
 * Tooling standard library — pre-defined tool templates grouped by category.
 * Each template has default props that pre-fill ToolingFormDialog fields.
 */

export interface ToolingPropDef {
  type: 'number' | 'text' | 'select';
  label: string;
  defaultValue?: string;
  options?: string[];
}

export interface ToolingTemplate {
  id: string;
  category: string;
  name: string;
  defaultProps: Record<string, ToolingPropDef>;
}

export const TOOLING_TEMPLATES: ToolingTemplate[] = [
  // ── Cutting ──────────────────────────────────────────────────────────
  {
    id: 'cutting-endmill',
    category: 'Cutting',
    name: 'End Mill',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '10' },
      flutes:   { type: 'select', label: 'Flutes', options: ['2', '3', '4', '6'], defaultValue: '4' },
      material: { type: 'select', label: 'Material', options: ['HSS', 'Carbide', 'Cobalt'], defaultValue: 'Carbide' },
    },
  },
  {
    id: 'cutting-drill',
    category: 'Cutting',
    name: 'Drill Bit',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '6' },
      length:   { type: 'number', label: 'Length (mm)', defaultValue: '100' },
    },
  },
  {
    id: 'cutting-tap',
    category: 'Cutting',
    name: 'Tap',
    defaultProps: {
      size:  { type: 'text', label: 'Size', defaultValue: 'M8' },
      pitch: { type: 'number', label: 'Pitch (mm)', defaultValue: '1.25' },
    },
  },
  {
    id: 'cutting-reamer',
    category: 'Cutting',
    name: 'Reamer',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '10' },
    },
  },
  {
    id: 'cutting-insert',
    category: 'Cutting',
    name: 'Insert',
    defaultProps: {
      geometry: { type: 'select', label: 'Geometry', options: ['CNMG', 'DNMG', 'SNMG', 'TNMG'], defaultValue: 'CNMG' },
      grade:    { type: 'text', label: 'Grade', defaultValue: 'P25' },
    },
  },
  {
    id: 'cutting-saw-blade',
    category: 'Cutting',
    name: 'Saw Blade',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '300' },
      teeth:    { type: 'number', label: 'Teeth', defaultValue: '80' },
    },
  },
  {
    id: 'cutting-laser-nozzle',
    category: 'Cutting',
    name: 'Laser Nozzle',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '1.5' },
      type:     { type: 'select', label: 'Type', options: ['Single', 'Double', 'Conical'], defaultValue: 'Single' },
    },
  },

  // ── Forming ──────────────────────────────────────────────────────────
  {
    id: 'forming-press-brake-tool',
    category: 'Forming',
    name: 'Press Brake Tool',
    defaultProps: {
      vDieWidth: { type: 'number', label: 'V-die width (mm)', defaultValue: '12' },
      length:    { type: 'number', label: 'Length (mm)', defaultValue: '835' },
    },
  },
  {
    id: 'forming-punch',
    category: 'Forming',
    name: 'Punch',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '10' },
    },
  },
  {
    id: 'forming-die',
    category: 'Forming',
    name: 'Die',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '10' },
    },
  },

  // ── Welding ──────────────────────────────────────────────────────────
  {
    id: 'welding-mig-tip',
    category: 'Welding',
    name: 'MIG Tip',
    defaultProps: {
      size: { type: 'select', label: 'Size', options: ['0.6mm', '0.8mm', '1.0mm', '1.2mm'], defaultValue: '0.9mm' },
    },
  },
  {
    id: 'welding-tig-nozzle',
    category: 'Welding',
    name: 'TIG Nozzle',
    defaultProps: {
      size: { type: 'select', label: 'Size', options: ['#4', '#5', '#6', '#7', '#8'], defaultValue: '#6' },
    },
  },
  {
    id: 'welding-electrode',
    category: 'Welding',
    name: 'Electrode',
    defaultProps: {
      rodType: { type: 'select', label: 'Rod type', options: ['6010', '6013', '7018', '7016'], defaultValue: '7018' },
    },
  },

  // ── Measuring ────────────────────────────────────────────────────────
  {
    id: 'measuring-calliper',
    category: 'Measuring',
    name: 'Calliper',
    defaultProps: {
      range: { type: 'select', label: 'Range', options: ['0–150mm', '0–200mm', '0–300mm'], defaultValue: '0–150mm' },
    },
  },
  {
    id: 'measuring-micrometer',
    category: 'Measuring',
    name: 'Micrometer',
    defaultProps: {
      range: { type: 'select', label: 'Range', options: ['0–25mm', '25–50mm', '50–75mm', '75–100mm'], defaultValue: '0–25mm' },
    },
  },
  {
    id: 'measuring-gauge-block',
    category: 'Measuring',
    name: 'Gauge Block',
    defaultProps: {
      size: { type: 'text', label: 'Size', defaultValue: '25mm' },
    },
  },

  // ── Workholding ──────────────────────────────────────────────────────
  {
    id: 'workholding-vice',
    category: 'Workholding',
    name: 'Vice',
    defaultProps: {
      jawWidth: { type: 'number', label: 'Jaw width (mm)', defaultValue: '150' },
    },
  },
  {
    id: 'workholding-3jaw-chuck',
    category: 'Workholding',
    name: '3-Jaw Chuck',
    defaultProps: {
      diameter: { type: 'number', label: 'Diameter (mm)', defaultValue: '200' },
    },
  },
  {
    id: 'workholding-fixture',
    category: 'Workholding',
    name: 'Fixture',
    defaultProps: {
      description: { type: 'text', label: 'Description', defaultValue: 'Custom fixture' },
    },
  },
];

export const TOOLING_CATEGORIES = Array.from(new Set(TOOLING_TEMPLATES.map(t => t.category)));
