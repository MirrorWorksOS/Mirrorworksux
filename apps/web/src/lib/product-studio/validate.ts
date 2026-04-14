/**
 * Static validation for definition engine blocks (IDs, node refs, tables).
 */

import type { Product } from '@/components/plan/product-studio/product-studio-types';
import type { EngineBlock, ProductDefinitionEngine, ValidationIssue } from './types';
import { ENGINE_SCHEMA_VERSION } from './types';

function walkBlocks(blocks: EngineBlock[], fn: (b: EngineBlock) => void): void {
  for (const b of blocks) {
    fn(b);
    if (b.type === 'sequence') walkBlocks(b.children, fn);
    if (b.type === 'if_chain') {
      for (const br of b.branches) walkBlocks(br.children, fn);
    }
  }
}

export function validateDefinitionEngine(
  product: Product,
  engine: ProductDefinitionEngine | undefined,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!engine) {
    issues.push({ level: 'warning', message: 'No definition engine — add variables and rules in the Logic tab.' });
    return issues;
  }

  if (engine.schemaVersion !== ENGINE_SCHEMA_VERSION) {
    issues.push({
      level: 'error',
      message: `Definition engine schema mismatch (expected v${ENGINE_SCHEMA_VERSION}).`,
    });
    return issues;
  }

  const varIds = new Set(engine.variables.map((v) => v.id));
  const tableIds = new Set(engine.lookupTables.map((t) => t.id));
  const nodeIds = new Set(product.nodes.map((n) => n.id));

  for (const v of engine.variables) {
    if (v.kind === 'selection' && v.source) {
      if (!nodeIds.has(v.source.nodeId)) {
        issues.push({
          level: 'error',
          message: `Variable "${v.label}" references missing node.`,
        });
      }
    }
  }

  const checkBlock = (b: EngineBlock): void => {
    switch (b.type) {
      case 'set_variable':
        if (!varIds.has(b.variableId)) {
          issues.push({
            level: 'error',
            message: `Unknown variable "${b.variableId}" in set block.`,
            blockId: b.id,
          });
        }
        if (b.mode === 'lookup') {
          if (!tableIds.has(b.tableId)) {
            issues.push({
              level: 'error',
              message: `Unknown lookup table "${b.tableId}".`,
              blockId: b.id,
            });
          }
          if (!varIds.has(b.keyVariableId)) {
            issues.push({
              level: 'error',
              message: `Unknown key variable "${b.keyVariableId}".`,
              blockId: b.id,
            });
          }
        }
        break;
      case 'if_chain':
        for (const br of b.branches) {
          if (br.condition && !varIds.has(br.condition.leftVariableId)) {
            issues.push({
              level: 'error',
              message: `Unknown variable in condition.`,
              blockId: br.condition.id,
            });
          }
        }
        break;
      case 'bom_override':
        if (!nodeIds.has(b.nodeId)) {
          issues.push({
            level: 'error',
            message: `BOM override references missing node "${b.nodeId}".`,
            blockId: b.id,
          });
        }
        break;
      default:
        break;
    }
  };

  walkBlocks(engine.rootBlocks, checkBlock);

  if (engine.rootBlocks.length === 0 && engine.variables.length > 0) {
    issues.push({
      level: 'warning',
      message: 'Variables defined but no logic blocks — outputs will only reflect the canvas.',
    });
  }

  return issues;
}
