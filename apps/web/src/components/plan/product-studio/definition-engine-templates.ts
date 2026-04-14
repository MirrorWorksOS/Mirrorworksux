/**
 * Default ProductDefinitionEngine payloads per template product id.
 */

import type { ProductDefinitionEngine } from '@/lib/product-studio/types';
import { ENGINE_SCHEMA_VERSION } from '@/lib/product-studio/types';

export function shelvingDefinitionEngine(): ProductDefinitionEngine {
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: [
      {
        id: 'v-load',
        label: 'Load rating',
        kind: 'selection',
        source: { nodeId: 'shelf-frame', optionId: 'opt-4' },
      },
      {
        id: 'v-finish',
        label: 'Frame finish',
        kind: 'selection',
        source: { nodeId: 'shelf-root', optionId: 'opt-3' },
      },
      {
        id: 'v-thickness',
        label: 'Derived sheet thickness',
        kind: 'derived',
      },
    ],
    lookupTables: [
      {
        id: 'tbl-load-thickness',
        label: 'Load rating → sheet thickness',
        rows: [
          { key: 'Light (150kg/shelf)', value: '1.2mm' },
          { key: 'Medium (300kg/shelf)', value: '1.6mm' },
          { key: 'Heavy (500kg/shelf)', value: '2.0mm' },
        ],
      },
    ],
    rootBlocks: [
      {
        id: 'blk-set-thickness',
        type: 'set_variable',
        variableId: 'v-thickness',
        mode: 'lookup',
        tableId: 'tbl-load-thickness',
        keyVariableId: 'v-load',
      },
      {
        id: 'blk-heavy',
        type: 'if_chain',
        branches: [
          {
            id: 'br-heavy',
            condition: {
              id: 'c-heavy',
              leftVariableId: 'v-load',
              operator: 'equals',
              rightValue: 'Heavy (500kg/shelf)',
            },
            children: [
              {
                id: 'op-plasma',
                type: 'operation',
                name: 'Laser cut — stiffener inserts',
                workCentre: 'Laser cell 2',
                setupMinutes: 15,
                runMinutesPerUnit: 2.5,
              },
              {
                id: 'ph-stiff',
                type: 'bom_phantom',
                name: 'Shelf stiffener strip',
                sku: 'SHELF-STF-001',
                quantity: 4,
                unit: 'ea',
              },
              {
                id: 'cost-heavy',
                type: 'cost_adjust',
                category: 'material',
                label: 'Heavy load material surcharge',
                amount: 15,
              },
            ],
          },
          { id: 'br-else-heavy', condition: null, children: [] },
        ],
      },
      {
        id: 'blk-galv',
        type: 'if_chain',
        branches: [
          {
            id: 'br-galv',
            condition: {
              id: 'c-galv',
              leftVariableId: 'v-finish',
              operator: 'equals',
              rightValue: 'Galvanised',
            },
            children: [
              {
                id: 'ov-hide-coat',
                type: 'bom_override',
                nodeId: 'shelf-coating',
                hidden: true,
              },
            ],
          },
          { id: 'br-else-galv', condition: null, children: [] },
        ],
      },
    ],
  };
}

export function bracketDefinitionEngine(): ProductDefinitionEngine {
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: [
      {
        id: 'v-material',
        label: 'Material grade',
        kind: 'selection',
        source: { nodeId: 'bracket-root', optionId: 'opt-b2' },
      },
    ],
    lookupTables: [],
    rootBlocks: [
      {
        id: 'blk-ss',
        type: 'if_chain',
        branches: [
          {
            id: 'br-ss',
            condition: {
              id: 'c-ss',
              leftVariableId: 'v-material',
              operator: 'equals',
              rightValue: 'Stainless 304',
            },
            children: [
              {
                id: 'warn-ss',
                type: 'warning',
                message: 'Engineering review required for stainless fabrication.',
              },
              {
                id: 'cost-ss',
                type: 'cost_adjust',
                category: 'labour',
                label: 'Certified welding premium',
                amount: 45,
              },
              {
                id: 'op-prep',
                type: 'operation',
                name: 'Weld prep — stainless',
                workCentre: 'Bay 3',
                setupMinutes: 25,
                runMinutesPerUnit: 8,
              },
            ],
          },
          { id: 'br-else-ss', condition: null, children: [] },
        ],
      },
    ],
  };
}

export function frameDefinitionEngine(): ProductDefinitionEngine {
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: [
      {
        id: 'v-treatment',
        label: 'Surface treatment',
        kind: 'selection',
        source: { nodeId: 'frame-root', optionId: 'opt-f4' },
      },
      {
        id: 'v-len',
        label: 'Frame length',
        kind: 'selection',
        source: { nodeId: 'frame-root', optionId: 'opt-f1' },
      },
      {
        id: 'v-hgt',
        label: 'Frame height',
        kind: 'selection',
        source: { nodeId: 'frame-root', optionId: 'opt-f3' },
      },
    ],
    lookupTables: [],
    rootBlocks: [
      {
        id: 'blk-galv',
        type: 'if_chain',
        branches: [
          {
            id: 'br-galv',
            condition: {
              id: 'c-galv',
              leftVariableId: 'v-treatment',
              operator: 'equals',
              rightValue: 'Hot Dip Galvanise',
            },
            children: [
              {
                id: 'warn-galv',
                type: 'warning',
                message: 'Hot dip galvanising adds 5–7 business days lead time.',
              },
              {
                id: 'cost-galv',
                type: 'cost_adjust',
                category: 'material',
                label: 'Hot dip galvanising',
                amount: 95,
              },
            ],
          },
          { id: 'br-else-galv', condition: null, children: [] },
        ],
      },
      {
        id: 'blk-large',
        type: 'if_chain',
        branches: [
          {
            id: 'br-large',
            condition: {
              id: 'c-large-a',
              leftVariableId: 'v-len',
              operator: 'greater_than',
              rightValue: '1500',
            },
            children: [
              {
                id: 'blk-large-h',
                type: 'if_chain',
                branches: [
                  {
                    id: 'br-h',
                    condition: {
                      id: 'c-h',
                      leftVariableId: 'v-hgt',
                      operator: 'greater_than',
                      rightValue: '1000',
                    },
                    children: [
                      {
                        id: 'warn-large',
                        type: 'warning',
                        message: 'Recommend 75×50 RHS or larger for this frame size.',
                      },
                    ],
                  },
                  { id: 'br-else-h', condition: null, children: [] },
                ],
              },
            ],
          },
          { id: 'br-else-large', condition: null, children: [] },
        ],
      },
    ],
  };
}

// Stub engines for the v2-only templates. Studio v2 routes everything through
// `blocklyXml`, so these don't need rules in the v1 IR — an empty `rootBlocks`
// array is sufficient. The function still has to exist so the Product type's
// required `definitionEngine` field has something to reference.
function emptyEngine(): ProductDefinitionEngine {
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: [],
    lookupTables: [],
    rootBlocks: [],
  };
}

export const cableTrayDefinitionEngine = emptyEngine;
export const enclosureDefinitionEngine = emptyEngine;
export const handrailDefinitionEngine = emptyEngine;

const DEFAULTS: Record<string, () => ProductDefinitionEngine> = {
  'tpl-shelving': shelvingDefinitionEngine,
  'tpl-bracket': bracketDefinitionEngine,
  'tpl-frame': frameDefinitionEngine,
  'tpl-cable-tray': cableTrayDefinitionEngine,
  'tpl-enclosure': enclosureDefinitionEngine,
  'tpl-handrail': handrailDefinitionEngine,
};

export function defaultDefinitionEngineForProductId(productId: string): ProductDefinitionEngine {
  const fn = DEFAULTS[productId];
  if (fn) return fn();
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    variables: [],
    lookupTables: [],
    rootBlocks: [],
  };
}
