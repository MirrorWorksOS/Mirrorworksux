/**
 * Product Templates — sample/template products for the Product Studio
 * These give users starting points when building configurable products.
 */

import type { Product } from './product-studio-types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Template 1: Steel Shelving Unit ──────────────────────────────────────────

const shelvingNodes = [
  {
    id: 'shelf-root',
    type: 'assembly' as const,
    name: 'Custom Steel Shelving Unit',
    sku: 'SHELF-CFG-001',
    description: 'Configurable industrial shelving with adjustable shelf count and load rating',
    options: [
      { id: 'opt-1', name: 'Height', type: 'dropdown' as const, values: ['1800mm', '2100mm', '2400mm'], defaultValue: '2100mm', required: true },
      { id: 'opt-2', name: 'Width', type: 'dropdown' as const, values: ['900mm', '1200mm', '1500mm'], defaultValue: '1200mm', required: true },
      { id: 'opt-3', name: 'Finish', type: 'dropdown' as const, values: ['Powder Coat - Grey', 'Powder Coat - Black', 'Galvanised', 'Raw Steel'], defaultValue: 'Powder Coat - Grey', required: true },
    ],
    position: { x: 400, y: 60 },
    parentId: null,
    pricing: { basePrice: 450, perUnit: 0, formula: 'Base + shelves * $45' },
    constraints: { minQuantity: 1, maxQuantity: 100, required: true },
    quantity: 1,
  },
  {
    id: 'shelf-frame',
    type: 'assembly' as const,
    name: 'Frame Assembly',
    sku: 'SHELF-FRM-001',
    description: 'Welded upright frame with cross-bracing',
    options: [
      { id: 'opt-4', name: 'Load Rating', type: 'dropdown' as const, values: ['Light (150kg/shelf)', 'Medium (300kg/shelf)', 'Heavy (500kg/shelf)'], defaultValue: 'Medium (300kg/shelf)', required: true },
    ],
    position: { x: 200, y: 220 },
    parentId: 'shelf-root',
    pricing: { basePrice: 180, perUnit: 0, formula: '' },
    constraints: { minQuantity: 1, maxQuantity: 1, required: true },
    quantity: 1,
  },
  {
    id: 'shelf-uprights',
    type: 'component' as const,
    name: 'Upright Post',
    sku: 'SHELF-UP-001',
    description: '50x50 RHS steel upright with bolt holes at 50mm intervals',
    options: [],
    position: { x: 80, y: 380 },
    parentId: 'shelf-frame',
    pricing: { basePrice: 28, perUnit: 28, formula: '$28 each' },
    constraints: { minQuantity: 4, maxQuantity: 4, required: true },
    quantity: 4,
  },
  {
    id: 'shelf-bracing',
    type: 'component' as const,
    name: 'Cross Brace',
    sku: 'SHELF-XB-001',
    description: 'Diagonal cross-brace for lateral stability',
    options: [],
    position: { x: 320, y: 380 },
    parentId: 'shelf-frame',
    pricing: { basePrice: 12, perUnit: 12, formula: '$12 each' },
    constraints: { minQuantity: 2, maxQuantity: 4, required: true },
    quantity: 2,
  },
  {
    id: 'shelf-shelves',
    type: 'assembly' as const,
    name: 'Shelf Deck',
    sku: 'SHELF-DK-001',
    description: 'Pressed steel shelf deck with reinforcement ribs',
    options: [
      { id: 'opt-5', name: 'Number of Shelves', type: 'number' as const, values: ['3', '4', '5', '6'], defaultValue: '4', required: true },
    ],
    position: { x: 600, y: 220 },
    parentId: 'shelf-root',
    pricing: { basePrice: 45, perUnit: 45, formula: '$45 per shelf' },
    constraints: { minQuantity: 3, maxQuantity: 6, required: true },
    quantity: 4,
  },
  {
    id: 'shelf-steel',
    type: 'raw_material' as const,
    name: 'Mild Steel Sheet',
    sku: 'MAT-MS-1.6',
    description: '1.6mm mild steel sheet for shelf decks',
    options: [
      { id: 'opt-6', name: 'Thickness', type: 'dropdown' as const, values: ['1.2mm', '1.6mm', '2.0mm'], defaultValue: '1.6mm', required: true },
    ],
    position: { x: 520, y: 380 },
    parentId: 'shelf-shelves',
    pricing: { basePrice: 35, perUnit: 0, formula: '' },
    constraints: { minQuantity: 1, maxQuantity: 10, required: true },
    quantity: 1,
  },
  {
    id: 'shelf-coating',
    type: 'service' as const,
    name: 'Powder Coating',
    sku: 'SVC-PC-001',
    description: 'Professional powder coat finish',
    options: [
      { id: 'opt-7', name: 'Colour', type: 'dropdown' as const, values: ['Signal Grey RAL 7004', 'Jet Black RAL 9005', 'Safety Yellow RAL 1003', 'Custom RAL'], defaultValue: 'Signal Grey RAL 7004', required: true },
    ],
    position: { x: 720, y: 380 },
    parentId: 'shelf-shelves',
    pricing: { basePrice: 65, perUnit: 0, formula: 'Flat rate' },
    constraints: { minQuantity: 0, maxQuantity: 1, required: false },
    quantity: 1,
  },
];

const shelvingEdges = [
  { id: 'e1', sourceId: 'shelf-root', targetId: 'shelf-frame' },
  { id: 'e2', sourceId: 'shelf-root', targetId: 'shelf-shelves' },
  { id: 'e3', sourceId: 'shelf-frame', targetId: 'shelf-uprights' },
  { id: 'e4', sourceId: 'shelf-frame', targetId: 'shelf-bracing' },
  { id: 'e5', sourceId: 'shelf-shelves', targetId: 'shelf-steel' },
  { id: 'e6', sourceId: 'shelf-shelves', targetId: 'shelf-coating' },
];

const shelvingRules = [
  {
    id: 'rule-1',
    name: 'Heavy load requires thicker steel',
    nodeId: 'shelf-steel',
    conditionGroups: [
      {
        id: 'cg-1',
        type: 'and' as const,
        conditions: [
          { id: 'c-1', field: 'Load Rating', operator: 'equals' as const, value: 'Heavy (500kg/shelf)' },
        ],
      },
    ],
    actions: [
      { id: 'a-1', type: 'change_quantity' as const, target: 'shelf-steel', value: 'Thickness = 2.0mm' },
      { id: 'a-2', type: 'adjust_price' as const, target: 'shelf-steel', value: '+$15 per shelf' },
    ],
    caseStatements: [],
    priority: 1,
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'Galvanised finish skips powder coating',
    nodeId: 'shelf-coating',
    conditionGroups: [
      {
        id: 'cg-2',
        type: 'and' as const,
        conditions: [
          { id: 'c-2', field: 'Finish', operator: 'equals' as const, value: 'Galvanised' },
        ],
      },
    ],
    actions: [
      { id: 'a-3', type: 'remove_component' as const, target: 'shelf-coating', value: 'Powder Coating' },
    ],
    caseStatements: [],
    priority: 2,
    enabled: true,
  },
];

export const steelShelvingTemplate: Product = {
  id: 'tpl-shelving',
  name: 'Custom Steel Shelving Unit',
  description: 'Configurable industrial shelving with adjustable dimensions, shelf count, and finishes',
  nodes: shelvingNodes,
  edges: shelvingEdges,
  rules: shelvingRules,
  createdAt: '2026-03-15T09:30:00Z',
  updatedAt: '2026-04-01T14:22:00Z',
  thumbnail: 'shelving',
};

// ── Template 2: Custom Bracket Assembly ──────────────────────────────────────

const bracketNodes = [
  {
    id: 'bracket-root',
    type: 'assembly' as const,
    name: 'Custom Bracket Assembly',
    sku: 'BRK-CFG-001',
    description: 'Configurable mounting bracket for structural steel applications',
    options: [
      { id: 'opt-b1', name: 'Mounting Type', type: 'dropdown' as const, values: ['Wall Mount', 'Beam Clamp', 'Base Plate'], defaultValue: 'Wall Mount', required: true },
      { id: 'opt-b2', name: 'Material Grade', type: 'dropdown' as const, values: ['Grade 250', 'Grade 350', 'Stainless 304'], defaultValue: 'Grade 350', required: true },
    ],
    position: { x: 400, y: 60 },
    parentId: null,
    pricing: { basePrice: 85, perUnit: 0, formula: 'Base + material surcharge' },
    constraints: { minQuantity: 1, maxQuantity: 500, required: true },
    quantity: 1,
  },
  {
    id: 'bracket-plate',
    type: 'component' as const,
    name: 'Base Plate',
    sku: 'BRK-BP-001',
    description: 'Laser cut base plate with mounting holes',
    options: [
      { id: 'opt-b3', name: 'Thickness', type: 'dropdown' as const, values: ['6mm', '8mm', '10mm', '12mm'], defaultValue: '8mm', required: true },
    ],
    position: { x: 200, y: 220 },
    parentId: 'bracket-root',
    pricing: { basePrice: 22, perUnit: 0, formula: '' },
    constraints: { minQuantity: 1, maxQuantity: 1, required: true },
    quantity: 1,
  },
  {
    id: 'bracket-gusset',
    type: 'component' as const,
    name: 'Gusset Plate',
    sku: 'BRK-GP-001',
    description: 'Triangular gusset for reinforcement',
    options: [],
    position: { x: 400, y: 220 },
    parentId: 'bracket-root',
    pricing: { basePrice: 15, perUnit: 15, formula: '$15 each' },
    constraints: { minQuantity: 1, maxQuantity: 4, required: true },
    quantity: 2,
  },
  {
    id: 'bracket-fasteners',
    type: 'raw_material' as const,
    name: 'Fastener Kit',
    sku: 'BRK-FK-001',
    description: 'M12 bolts, nuts, washers',
    options: [
      { id: 'opt-b4', name: 'Bolt Grade', type: 'dropdown' as const, values: ['Grade 4.6', 'Grade 8.8', 'Grade 10.9'], defaultValue: 'Grade 8.8', required: true },
    ],
    position: { x: 600, y: 220 },
    parentId: 'bracket-root',
    pricing: { basePrice: 8, perUnit: 0, formula: '' },
    constraints: { minQuantity: 1, maxQuantity: 1, required: true },
    quantity: 1,
  },
  {
    id: 'bracket-welding',
    type: 'service' as const,
    name: 'Welding',
    sku: 'SVC-WLD-001',
    description: 'MIG welding of bracket assembly',
    options: [
      { id: 'opt-b5', name: 'Weld Spec', type: 'dropdown' as const, values: ['Standard', 'Full Penetration', 'Certified (AS/NZS 1554)'], defaultValue: 'Standard', required: true },
    ],
    position: { x: 300, y: 380 },
    parentId: 'bracket-root',
    pricing: { basePrice: 35, perUnit: 0, formula: '' },
    constraints: { minQuantity: 1, maxQuantity: 1, required: true },
    quantity: 1,
  },
];

const bracketEdges = [
  { id: 'be1', sourceId: 'bracket-root', targetId: 'bracket-plate' },
  { id: 'be2', sourceId: 'bracket-root', targetId: 'bracket-gusset' },
  { id: 'be3', sourceId: 'bracket-root', targetId: 'bracket-fasteners' },
  { id: 'be4', sourceId: 'bracket-root', targetId: 'bracket-welding' },
];

const bracketRules = [
  {
    id: 'rule-b1',
    name: 'Stainless requires certified welding',
    nodeId: 'bracket-welding',
    conditionGroups: [
      {
        id: 'cg-b1',
        type: 'and' as const,
        conditions: [
          { id: 'c-b1', field: 'Material Grade', operator: 'equals' as const, value: 'Stainless 304' },
        ],
      },
    ],
    actions: [
      { id: 'a-b1', type: 'change_quantity' as const, target: 'bracket-welding', value: 'Weld Spec = Certified (AS/NZS 1554)' },
      { id: 'a-b2', type: 'adjust_price' as const, target: 'bracket-welding', value: '+$45' },
      { id: 'a-b3', type: 'require_approval' as const, target: 'bracket-root', value: 'Engineering review required for stainless' },
    ],
    caseStatements: [],
    priority: 1,
    enabled: true,
  },
];

export const customBracketTemplate: Product = {
  id: 'tpl-bracket',
  name: 'Custom Bracket Assembly',
  description: 'Configurable mounting bracket for structural steel, with material and weld options',
  nodes: bracketNodes,
  edges: bracketEdges,
  rules: bracketRules,
  createdAt: '2026-02-20T11:00:00Z',
  updatedAt: '2026-03-28T16:45:00Z',
  thumbnail: 'bracket',
};

// ── Template 3: Welded Frame ─────────────────────────────────────────────────

const frameNodes = [
  {
    id: 'frame-root',
    type: 'assembly' as const,
    name: 'Welded Steel Frame',
    sku: 'FRM-CFG-001',
    description: 'Rectangular welded frame for equipment mounting, guards, and enclosures',
    options: [
      { id: 'opt-f1', name: 'Length', type: 'number' as const, values: ['600', '900', '1200', '1500', '1800'], defaultValue: '1200', required: true },
      { id: 'opt-f2', name: 'Width', type: 'number' as const, values: ['400', '600', '800', '1000'], defaultValue: '600', required: true },
      { id: 'opt-f3', name: 'Height', type: 'number' as const, values: ['400', '600', '800', '1000', '1200'], defaultValue: '800', required: true },
      { id: 'opt-f4', name: 'Surface Treatment', type: 'dropdown' as const, values: ['None', 'Primer Only', 'Powder Coat', 'Hot Dip Galvanise'], defaultValue: 'Powder Coat', required: true },
    ],
    position: { x: 400, y: 60 },
    parentId: null,
    pricing: { basePrice: 320, perUnit: 0, formula: 'Varies by size + treatment' },
    constraints: { minQuantity: 1, maxQuantity: 50, required: true },
    quantity: 1,
  },
  {
    id: 'frame-members',
    type: 'component' as const,
    name: 'Structural Members',
    sku: 'FRM-SM-001',
    description: 'RHS or SHS steel sections cut to size',
    options: [
      { id: 'opt-f5', name: 'Section Size', type: 'dropdown' as const, values: ['40x40 SHS', '50x50 SHS', '50x25 RHS', '75x50 RHS', '100x50 RHS'], defaultValue: '50x50 SHS', required: true },
    ],
    position: { x: 200, y: 220 },
    parentId: 'frame-root',
    pricing: { basePrice: 85, perUnit: 0, formula: '' },
    constraints: { minQuantity: 1, maxQuantity: 1, required: true },
    quantity: 1,
  },
  {
    id: 'frame-steel',
    type: 'raw_material' as const,
    name: 'Steel Section Stock',
    sku: 'MAT-SHS-50',
    description: 'Structural hollow section, 6.1m lengths',
    options: [],
    position: { x: 100, y: 380 },
    parentId: 'frame-members',
    pricing: { basePrice: 45, perUnit: 0, formula: 'Per length' },
    constraints: { minQuantity: 1, maxQuantity: 20, required: true },
    quantity: 2,
  },
  {
    id: 'frame-feet',
    type: 'component' as const,
    name: 'Adjustable Feet',
    sku: 'FRM-FT-001',
    description: 'Levelling feet with M16 thread',
    options: [
      { id: 'opt-f6', name: 'Include Feet', type: 'checkbox' as const, values: ['Yes', 'No'], defaultValue: 'Yes', required: false },
    ],
    position: { x: 400, y: 220 },
    parentId: 'frame-root',
    pricing: { basePrice: 6, perUnit: 6, formula: '$6 each' },
    constraints: { minQuantity: 0, maxQuantity: 8, required: false },
    quantity: 4,
  },
  {
    id: 'frame-weld',
    type: 'service' as const,
    name: 'Frame Welding',
    sku: 'SVC-WLD-002',
    description: 'MIG weld frame assembly',
    options: [],
    position: { x: 600, y: 220 },
    parentId: 'frame-root',
    pricing: { basePrice: 120, perUnit: 0, formula: 'Labour + consumables' },
    constraints: { minQuantity: 1, maxQuantity: 1, required: true },
    quantity: 1,
  },
  {
    id: 'frame-treat',
    type: 'service' as const,
    name: 'Surface Treatment',
    sku: 'SVC-SFC-001',
    description: 'Finish / treatment service',
    options: [],
    position: { x: 500, y: 380 },
    parentId: 'frame-root',
    pricing: { basePrice: 80, perUnit: 0, formula: '' },
    constraints: { minQuantity: 0, maxQuantity: 1, required: false },
    quantity: 1,
  },
];

const frameEdges = [
  { id: 'fe1', sourceId: 'frame-root', targetId: 'frame-members' },
  { id: 'fe2', sourceId: 'frame-root', targetId: 'frame-feet' },
  { id: 'fe3', sourceId: 'frame-root', targetId: 'frame-weld' },
  { id: 'fe4', sourceId: 'frame-members', targetId: 'frame-steel' },
  { id: 'fe5', sourceId: 'frame-root', targetId: 'frame-treat' },
];

const frameRules = [
  {
    id: 'rule-f1',
    name: 'Hot dip galv adds lead time warning',
    nodeId: 'frame-treat',
    conditionGroups: [
      {
        id: 'cg-f1',
        type: 'and' as const,
        conditions: [
          { id: 'c-f1', field: 'Surface Treatment', operator: 'equals' as const, value: 'Hot Dip Galvanise' },
        ],
      },
    ],
    actions: [
      { id: 'a-f1', type: 'show_warning' as const, target: 'frame-root', value: 'Hot dip galvanising adds 5-7 business days lead time' },
      { id: 'a-f2', type: 'adjust_price' as const, target: 'frame-treat', value: '+$95' },
    ],
    caseStatements: [],
    priority: 1,
    enabled: true,
  },
  {
    id: 'rule-f2',
    name: 'Large frame requires heavier section',
    nodeId: 'frame-members',
    conditionGroups: [
      {
        id: 'cg-f2',
        type: 'and' as const,
        conditions: [
          { id: 'c-f2', field: 'Length', operator: 'greater_than' as const, value: '1500' },
          { id: 'c-f3', field: 'Height', operator: 'greater_than' as const, value: '1000' },
        ],
      },
    ],
    actions: [
      { id: 'a-f3', type: 'show_warning' as const, target: 'frame-members', value: 'Recommend 75x50 RHS or larger for this frame size' },
    ],
    caseStatements: [],
    priority: 2,
    enabled: true,
  },
];

export const weldedFrameTemplate: Product = {
  id: 'tpl-frame',
  name: 'Welded Steel Frame',
  description: 'Rectangular welded frame for equipment mounting with size and surface treatment options',
  nodes: frameNodes,
  edges: frameEdges,
  rules: frameRules,
  createdAt: '2026-01-10T08:15:00Z',
  updatedAt: '2026-03-30T10:30:00Z',
  thumbnail: 'frame',
};

// ── All templates ────────────────────────────────────────────────────────────

export const productTemplates: Product[] = [
  steelShelvingTemplate,
  customBracketTemplate,
  weldedFrameTemplate,
];
