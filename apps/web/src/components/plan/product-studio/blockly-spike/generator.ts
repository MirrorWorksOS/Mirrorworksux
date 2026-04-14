/**
 * Code generator for the Product Studio Blockly spike.
 *
 * Walks the workspace's top-level blocks and emits a tiny JSON shape that mimics
 * the future ProductDefinitionEngine v2. This proves that the authoring layer
 * (Blockly) and the runtime (engine JSON) can be cleanly decoupled.
 */

import * as Blockly from 'blockly/core';

export type SpikeNode =
  | { type: 'when_configured'; body: SpikeNode[] }
  | { type: 'set_variable'; name: string; value: SpikeNode | null }
  | { type: 'add_bom_line'; name: string; sku: string; quantity: SpikeNode | null }
  | { type: 'show_warning'; message: string }
  | { type: 'arithmetic'; op: 'ADD' | 'SUB' | 'MUL' | 'DIV'; a: SpikeNode | null; b: SpikeNode | null }
  | { type: 'compare'; op: 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE'; a: SpikeNode | null; b: SpikeNode | null }
  | { type: 'number'; value: number };

export interface SpikeProgram {
  schemaVersion: 'spike-1';
  triggers: SpikeNode[];
}

function nodeFromBlock(block: Blockly.Block | null): SpikeNode | null {
  if (!block) return null;

  switch (block.type) {
    case 'mw_when_configured': {
      const body: SpikeNode[] = [];
      let next = block.getNextBlock();
      while (next) {
        const n = nodeFromBlock(next);
        if (n) body.push(n);
        next = next.getNextBlock();
      }
      return { type: 'when_configured', body };
    }

    case 'mw_set_variable': {
      return {
        type: 'set_variable',
        name: block.getFieldValue('NAME') ?? '',
        value: nodeFromBlock(block.getInputTargetBlock('VALUE')),
      };
    }

    case 'mw_add_bom_line': {
      return {
        type: 'add_bom_line',
        name: block.getFieldValue('NAME') ?? '',
        sku: block.getFieldValue('SKU') ?? '',
        quantity: nodeFromBlock(block.getInputTargetBlock('QTY')),
      };
    }

    case 'mw_show_warning': {
      return {
        type: 'show_warning',
        message: block.getFieldValue('MESSAGE') ?? '',
      };
    }

    case 'mw_arithmetic': {
      return {
        type: 'arithmetic',
        op: (block.getFieldValue('OP') ?? 'ADD') as 'ADD' | 'SUB' | 'MUL' | 'DIV',
        a: nodeFromBlock(block.getInputTargetBlock('A')),
        b: nodeFromBlock(block.getInputTargetBlock('B')),
      };
    }

    case 'mw_compare': {
      return {
        type: 'compare',
        op: (block.getFieldValue('OP') ?? 'EQ') as 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE',
        a: nodeFromBlock(block.getInputTargetBlock('A')),
        b: nodeFromBlock(block.getInputTargetBlock('B')),
      };
    }

    case 'mw_number': {
      return { type: 'number', value: Number(block.getFieldValue('VALUE') ?? 0) };
    }

    default:
      return null;
  }
}

export function generateSpikeProgram(workspace: Blockly.Workspace): SpikeProgram {
  const triggers: SpikeNode[] = [];
  for (const top of workspace.getTopBlocks(true)) {
    if (top.type !== 'mw_when_configured') continue;
    const node = nodeFromBlock(top);
    if (node) triggers.push(node);
  }
  return { schemaVersion: 'spike-1', triggers };
}
