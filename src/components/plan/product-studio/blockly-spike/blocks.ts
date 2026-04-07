/**
 * Block definitions for the Product Studio Blockly spike.
 *
 * 6 blocks across 3 categories — proves the look-and-feel and the code-generator pattern.
 *
 *   Triggers (yellow)
 *     - mw_when_configured       hat block
 *
 *   Operators (green)
 *     - mw_arithmetic            reporter (number)
 *     - mw_compare               boolean (hex)
 *
 *   Outputs (grey)
 *     - mw_set_variable          statement
 *     - mw_add_bom_line          statement
 *     - mw_show_warning          statement
 */

import * as Blockly from 'blockly/core';

// MirrorWorks brand-ish colours that read well at Blockly's default saturation.
const COLOUR_TRIGGER = 45;   // yellow
const COLOUR_OPERATOR = 120; // green
const COLOUR_OUTPUT = 0;     // red/grey-ish — the cap colour

export function registerSpikeBlocks(): void {
  // ── Triggers ──────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_when_configured'] = {
    init() {
      this.appendDummyInput().appendField('When product is configured');
      this.setNextStatement(true, null);
      this.setColour(COLOUR_TRIGGER);
      this.setTooltip('Runs every time a configuration option changes.');
    },
  };

  // ── Operators ─────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_arithmetic'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['+', 'ADD'],
          ['−', 'SUB'],
          ['×', 'MUL'],
          ['÷', 'DIV'],
        ]),
        'OP',
      );
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setInputsInline(true);
      this.setColour(COLOUR_OPERATOR);
      this.setTooltip('Arithmetic on two numbers.');
    },
  };

  Blockly.Blocks['mw_compare'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'EQ'],
          ['≠', 'NEQ'],
          ['<', 'LT'],
          ['≤', 'LTE'],
          ['>', 'GT'],
          ['≥', 'GTE'],
        ]),
        'OP',
      );
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Boolean');
      this.setInputsInline(true);
      this.setColour(COLOUR_OPERATOR);
      this.setTooltip('Compare two numbers; returns a boolean.');
    },
  };

  // ── Outputs ───────────────────────────────────────────────────────────────
  Blockly.Blocks['mw_set_variable'] = {
    init() {
      this.appendDummyInput()
        .appendField('Set')
        .appendField(new Blockly.FieldTextInput('width'), 'NAME')
        .appendField('to');
      this.appendValueInput('VALUE').setCheck(['Number', 'String']);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(30);
      this.setTooltip('Sets a named variable to a value.');
    },
  };

  Blockly.Blocks['mw_add_bom_line'] = {
    init() {
      this.appendDummyInput()
        .appendField('Add BOM line')
        .appendField(new Blockly.FieldTextInput('Mounting bracket'), 'NAME')
        .appendField('SKU')
        .appendField(new Blockly.FieldTextInput('BKT-001'), 'SKU');
      this.appendValueInput('QTY').setCheck('Number').appendField('qty');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(COLOUR_OUTPUT);
      this.setTooltip('Adds a phantom line to the BOM.');
    },
  };

  Blockly.Blocks['mw_show_warning'] = {
    init() {
      this.appendDummyInput()
        .appendField('Show warning')
        .appendField(new Blockly.FieldTextInput('Heads up'), 'MESSAGE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(COLOUR_OUTPUT);
      this.setTooltip('Surfaces a warning in the configuration preview.');
    },
  };

  // ── Number literal (used by value sockets) ────────────────────────────────
  // We deliberately don't pull in Blockly's full default block set for the spike;
  // a tiny number literal is enough to make the workspace feel real.
  Blockly.Blocks['mw_number'] = {
    init() {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(0), 'VALUE');
      this.setOutput(true, 'Number');
      this.setColour(210);
      this.setTooltip('A number literal.');
    },
  };
}
