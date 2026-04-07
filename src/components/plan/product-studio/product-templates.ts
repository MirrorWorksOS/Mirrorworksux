/**
 * Product Templates — sample/template products for the Product Studio
 * These give users starting points when building configurable products.
 */

import type { Product } from './product-studio-types';
import {
  shelvingDefinitionEngine,
  bracketDefinitionEngine,
  frameDefinitionEngine,
} from './definition-engine-templates';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Seed Blockly workspace XML for tpl-shelving ──────────────────────────────
//
// Drives Product Studio v2's first-run experience: every shop floor user lands
// on a non-empty canvas with width / depth / shelves / finish_colour declared
// and three operations (laser cut, bend, weld) that consume those variables.
// Editing any input in the sidebar instantly re-prices the BOM, work-order,
// and cost rollups — proving the configurator loop end-to-end.
//
// The XML is hand-rolled instead of generated so we can ship a tight,
// pedagogical layout (no trial-and-error blocks). It's loaded by the v2 store
// migration only when the persisted product has no `blocklyXml` of its own —
// user-authored work is never overwritten. See `migrateBlocklyXmlSeeds` in
// `productBuilderStore.ts`.
const SHELVING_SEED_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="mw_when_pricing" id="hat-shelving" x="40" y="40">
    <value name="PRODUCT">
      <block type="mw_product_ref" id="hat-shelving-product">
        <field name="PRODUCT_ID">tpl-shelving</field>
      </block>
    </value>
    <next>
      <block type="mw_input_dimension" id="in-width">
        <field name="NAME">width</field>
        <field name="UNIT">mm</field>
        <value name="DEFAULT">
          <shadow type="mw_number"><field name="VALUE">1200</field></shadow>
        </value>
        <next>
          <block type="mw_input_dimension" id="in-depth">
            <field name="NAME">depth</field>
            <field name="UNIT">mm</field>
            <value name="DEFAULT">
              <shadow type="mw_number"><field name="VALUE">400</field></shadow>
            </value>
            <next>
              <block type="mw_input_quantity" id="in-shelves">
                <field name="NAME">shelves</field>
                <value name="DEFAULT">
                  <shadow type="mw_number"><field name="VALUE">4</field></shadow>
                </value>
                <next>
                  <block type="mw_input_choice" id="in-finish">
                    <field name="NAME">finish_colour</field>
                    <field name="OPTIONS">Signal Grey,Jet Black,Raw Steel</field>
                    <field name="DEFAULT">Signal Grey</field>
                    <next>
                      <block type="mw_op_laser_cut" id="op-laser">
                        <value name="PERIMETER">
                          <block type="mw_arithmetic" id="laser-perim-mul">
                            <field name="OP">MUL</field>
                            <value name="A">
                              <block type="mw_arithmetic" id="laser-perim-add">
                                <field name="OP">ADD</field>
                                <value name="A">
                                  <block type="mw_get_variable" id="laser-w">
                                    <field name="NAME">width</field>
                                  </block>
                                </value>
                                <value name="B">
                                  <block type="mw_get_variable" id="laser-d">
                                    <field name="NAME">depth</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <value name="B">
                              <block type="mw_number" id="laser-perim-2">
                                <field name="VALUE">2</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <value name="PIERCES">
                          <block type="mw_arithmetic" id="laser-pierces-mul">
                            <field name="OP">MUL</field>
                            <value name="A">
                              <block type="mw_get_variable" id="laser-pierces-s">
                                <field name="NAME">shelves</field>
                              </block>
                            </value>
                            <value name="B">
                              <block type="mw_number" id="laser-pierces-4">
                                <field name="VALUE">4</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <value name="CUT_RATE">
                          <shadow type="mw_number"><field name="VALUE">4500</field></shadow>
                        </value>
                        <next>
                          <block type="mw_op_bend" id="op-bend">
                            <value name="COUNT">
                              <block type="mw_arithmetic" id="bend-count-mul">
                                <field name="OP">MUL</field>
                                <value name="A">
                                  <block type="mw_get_variable" id="bend-s">
                                    <field name="NAME">shelves</field>
                                  </block>
                                </value>
                                <value name="B">
                                  <block type="mw_number" id="bend-4">
                                    <field name="VALUE">4</field>
                                  </block>
                                </value>
                              </block>
                            </value>
                            <value name="SEC_PER">
                              <shadow type="mw_number"><field name="VALUE">20</field></shadow>
                            </value>
                            <next>
                              <block type="mw_op_weld" id="op-weld">
                                <value name="LENGTH_MM">
                                  <block type="mw_arithmetic" id="weld-len-mul">
                                    <field name="OP">MUL</field>
                                    <value name="A">
                                      <block type="mw_arithmetic" id="weld-len-add">
                                        <field name="OP">ADD</field>
                                        <value name="A">
                                          <block type="mw_get_variable" id="weld-w">
                                            <field name="NAME">width</field>
                                          </block>
                                        </value>
                                        <value name="B">
                                          <block type="mw_get_variable" id="weld-d">
                                            <field name="NAME">depth</field>
                                          </block>
                                        </value>
                                      </block>
                                    </value>
                                    <value name="B">
                                      <block type="mw_number" id="weld-len-2">
                                        <field name="VALUE">2</field>
                                      </block>
                                    </value>
                                  </block>
                                </value>
                                <value name="SEC_PER_MM">
                                  <shadow type="mw_number"><field name="VALUE">1.5</field></shadow>
                                </value>
                                <next>
                                  <block type="mw_cost_overhead_pct" id="cost-overhead">
                                    <field name="PCT_INLINE">15</field>
                                    <next>
                                      <block type="mw_cost_margin_pct" id="cost-margin">
                                        <field name="PCT_INLINE">25</field>
                                      </block>
                                    </next>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
  <block type="mw_when_making" id="hat-shelving-making" x="40" y="780">
    <value name="PRODUCT">
      <block type="mw_product_ref" id="hat-shelving-making-product">
        <field name="PRODUCT_ID">tpl-shelving</field>
      </block>
    </value>
  </block>
</xml>`;

// ── Seed Blockly XML for tpl-bracket ─────────────────────────────────────────
//
// A small, fast-read recipe: width input + bend angle + laser cut + bend +
// powder coat. Designed to be small enough that the user can scan the whole
// canvas at once and see how the inputs map onto operations. Used as a
// reusable sub-assembly by `tpl-frame` below to demonstrate composition.
const BRACKET_SEED_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="mw_when_pricing" id="hat-bracket" x="40" y="40">
    <value name="PRODUCT">
      <block type="mw_product_ref" id="hat-bracket-product">
        <field name="PRODUCT_ID">tpl-bracket</field>
      </block>
    </value>
    <next>
      <block type="mw_input_dimension" id="bk-in-width">
        <field name="NAME">plate_width</field>
        <field name="UNIT">mm</field>
        <value name="DEFAULT">
          <shadow type="mw_number"><field name="VALUE">200</field></shadow>
        </value>
        <next>
          <block type="mw_input_dimension" id="bk-in-height">
            <field name="NAME">plate_height</field>
            <field name="UNIT">mm</field>
            <value name="DEFAULT">
              <shadow type="mw_number"><field name="VALUE">120</field></shadow>
            </value>
            <next>
              <block type="mw_input_angle" id="bk-in-angle">
                <field name="NAME">bend_angle</field>
                <field name="DEFAULT">90</field>
                <next>
                  <block type="mw_op_laser_cut" id="bk-op-laser">
                    <value name="PERIMETER">
                      <block type="mw_arithmetic" id="bk-perim-mul">
                        <field name="OP">MUL</field>
                        <value name="A">
                          <block type="mw_arithmetic" id="bk-perim-add">
                            <field name="OP">ADD</field>
                            <value name="A">
                              <block type="mw_get_variable" id="bk-perim-w">
                                <field name="NAME">plate_width</field>
                              </block>
                            </value>
                            <value name="B">
                              <block type="mw_get_variable" id="bk-perim-h">
                                <field name="NAME">plate_height</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <value name="B">
                          <block type="mw_number" id="bk-perim-2">
                            <field name="VALUE">2</field>
                          </block>
                        </value>
                      </block>
                    </value>
                    <value name="PIERCES">
                      <shadow type="mw_number"><field name="VALUE">4</field></shadow>
                    </value>
                    <value name="CUT_RATE">
                      <shadow type="mw_number"><field name="VALUE">4500</field></shadow>
                    </value>
                    <next>
                      <block type="mw_op_bend" id="bk-op-bend">
                        <value name="COUNT">
                          <shadow type="mw_number"><field name="VALUE">1</field></shadow>
                        </value>
                        <value name="SEC_PER">
                          <shadow type="mw_number"><field name="VALUE">25</field></shadow>
                        </value>
                        <next>
                          <block type="mw_cost_adjust" id="bk-cost-pc">
                            <field name="CATEGORY">material</field>
                            <field name="LABEL">Powder coat (flat)</field>
                            <value name="AMOUNT">
                              <shadow type="mw_number"><field name="VALUE">18</field></shadow>
                            </value>
                            <next>
                              <block type="mw_cost_overhead_pct" id="bk-cost-overhead">
                                <field name="PCT_INLINE">15</field>
                                <next>
                                  <block type="mw_cost_margin_pct" id="bk-cost-margin">
                                    <field name="PCT_INLINE">25</field>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
  <block type="mw_when_making" id="hat-bracket-making" x="40" y="720">
    <value name="PRODUCT">
      <block type="mw_product_ref" id="hat-bracket-making-product">
        <field name="PRODUCT_ID">tpl-bracket</field>
      </block>
    </value>
  </block>
</xml>`;

// ── Seed Blockly XML for tpl-frame ───────────────────────────────────────────
//
// Demonstrates composition: a frame product that drops the bracket above in as
// a sub-assembly via `mw_op_assemble_with`. The recursive evaluator pulls the
// bracket's BOM, ops, and material/labour costs into this product's rollup
// (multiplied by quantity). The frame's own overhead/margin re-apply at the
// outermost level — child percentages are intentionally dropped during the
// recursive merge to prevent overhead compounding.
const FRAME_SEED_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="mw_when_pricing" id="hat-frame" x="40" y="40">
    <value name="PRODUCT">
      <block type="mw_product_ref" id="hat-frame-product">
        <field name="PRODUCT_ID">tpl-frame</field>
      </block>
    </value>
    <next>
      <block type="mw_input_dimension" id="fr-in-length">
        <field name="NAME">length</field>
        <field name="UNIT">mm</field>
        <value name="DEFAULT">
          <shadow type="mw_number"><field name="VALUE">1200</field></shadow>
        </value>
        <next>
          <block type="mw_input_dimension" id="fr-in-width">
            <field name="NAME">width</field>
            <field name="UNIT">mm</field>
            <value name="DEFAULT">
              <shadow type="mw_number"><field name="VALUE">600</field></shadow>
            </value>
            <next>
              <block type="mw_input_quantity" id="fr-in-brackets">
                <field name="NAME">bracket_count</field>
                <value name="DEFAULT">
                  <shadow type="mw_number"><field name="VALUE">4</field></shadow>
                </value>
                <next>
                  <block type="mw_op_weld" id="fr-op-weld">
                    <field name="TYPE">MIG</field>
                    <value name="LENGTH_MM">
                      <block type="mw_arithmetic" id="fr-weld-len-mul">
                        <field name="OP">MUL</field>
                        <value name="A">
                          <block type="mw_arithmetic" id="fr-weld-len-add">
                            <field name="OP">ADD</field>
                            <value name="A">
                              <block type="mw_get_variable" id="fr-weld-l">
                                <field name="NAME">length</field>
                              </block>
                            </value>
                            <value name="B">
                              <block type="mw_get_variable" id="fr-weld-w">
                                <field name="NAME">width</field>
                              </block>
                            </value>
                          </block>
                        </value>
                        <value name="B">
                          <block type="mw_number" id="fr-weld-2">
                            <field name="VALUE">2</field>
                          </block>
                        </value>
                      </block>
                    </value>
                    <value name="SEC_PER_MM">
                      <shadow type="mw_number"><field name="VALUE">1.5</field></shadow>
                    </value>
                    <next>
                      <block type="mw_op_assemble_with" id="fr-subasm-bracket">
                        <value name="PRODUCT">
                          <block type="mw_product_ref" id="fr-bracket-ref">
                            <field name="PRODUCT_ID">tpl-bracket</field>
                          </block>
                        </value>
                        <value name="QTY">
                          <block type="mw_get_variable" id="fr-bracket-qty">
                            <field name="NAME">bracket_count</field>
                          </block>
                        </value>
                        <next>
                          <block type="mw_cost_overhead_pct" id="fr-cost-overhead">
                            <field name="PCT_INLINE">15</field>
                            <next>
                              <block type="mw_cost_margin_pct" id="fr-cost-margin">
                                <field name="PCT_INLINE">25</field>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
  <block type="mw_when_making" id="hat-frame-making" x="40" y="700">
    <value name="PRODUCT">
      <block type="mw_product_ref" id="hat-frame-making-product">
        <field name="PRODUCT_ID">tpl-frame</field>
      </block>
    </value>
  </block>
</xml>`;

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

export const steelShelvingTemplate: Product = {
  id: 'tpl-shelving',
  name: 'Custom Steel Shelving Unit',
  description: 'Configurable industrial shelving with adjustable dimensions, shelf count, and finishes',
  nodes: shelvingNodes,
  edges: shelvingEdges,
  rules: [],
  definitionEngine: shelvingDefinitionEngine(),
  lifecycleStatus: 'published',
  definitionVersion: 1,
  createdAt: '2026-03-15T09:30:00Z',
  updatedAt: '2026-04-01T14:22:00Z',
  thumbnail: 'shelving',
  blocklyXml: SHELVING_SEED_XML,
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

export const customBracketTemplate: Product = {
  id: 'tpl-bracket',
  name: 'Custom Bracket Assembly',
  description: 'Configurable mounting bracket for structural steel, with material and weld options',
  nodes: bracketNodes,
  edges: bracketEdges,
  rules: [],
  definitionEngine: bracketDefinitionEngine(),
  lifecycleStatus: 'published',
  definitionVersion: 1,
  createdAt: '2026-02-20T11:00:00Z',
  updatedAt: '2026-03-28T16:45:00Z',
  thumbnail: 'bracket',
  blocklyXml: BRACKET_SEED_XML,
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

export const weldedFrameTemplate: Product = {
  id: 'tpl-frame',
  name: 'Welded Steel Frame',
  description: 'Rectangular welded frame for equipment mounting with size and surface treatment options',
  nodes: frameNodes,
  edges: frameEdges,
  rules: [],
  definitionEngine: frameDefinitionEngine(),
  lifecycleStatus: 'published',
  definitionVersion: 1,
  createdAt: '2026-01-10T08:15:00Z',
  updatedAt: '2026-03-30T10:30:00Z',
  thumbnail: 'frame',
  blocklyXml: FRAME_SEED_XML,
};

// ── All templates ────────────────────────────────────────────────────────────

export const productTemplates: Product[] = [
  steelShelvingTemplate,
  customBracketTemplate,
  weldedFrameTemplate,
];
