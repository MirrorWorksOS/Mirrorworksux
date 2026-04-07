import type { EngineBlock, EngineCondition, ProductDefinitionEngine } from '@/lib/product-studio/types';

export type PaletteKind =
  | 'if_chain'
  | 'set_literal'
  | 'set_lookup'
  | 'bom_phantom'
  | 'bom_override'
  | 'operation'
  | 'cost_adjust'
  | 'warning'
  | 'sequence';

function rid(): string {
  return `b-${Math.random().toString(36).slice(2, 10)}`;
}

export function deepRegenerateIds(block: EngineBlock): EngineBlock {
  const id = rid();
  switch (block.type) {
    case 'sequence':
      return { ...block, id, children: block.children.map(deepRegenerateIds) };
    case 'if_chain':
      return {
        ...block,
        id,
        branches: block.branches.map((br) => ({
          ...br,
          id: rid(),
          condition: br.condition ? { ...br.condition, id: rid() } : null,
          children: br.children.map(deepRegenerateIds),
        })),
      };
    default:
      return { ...block, id };
  }
}

export function createStubBlock(kind: PaletteKind, firstVarId: string): EngineBlock {
  const emptyCond = (v: string): EngineCondition => ({
    id: rid(),
    leftVariableId: v,
    operator: 'equals',
    rightValue: '',
  });

  switch (kind) {
    case 'sequence':
      return { type: 'sequence', id: rid(), children: [] };
    case 'if_chain':
      return {
        type: 'if_chain',
        id: rid(),
        branches: [
          { id: rid(), condition: emptyCond(firstVarId || ''), children: [] },
          { id: rid(), condition: null, children: [] },
        ],
      };
    case 'set_literal':
      return {
        type: 'set_variable',
        id: rid(),
        variableId: firstVarId,
        mode: 'literal',
        value: '',
      };
    case 'set_lookup':
      return {
        type: 'set_variable',
        id: rid(),
        variableId: firstVarId,
        mode: 'lookup',
        tableId: '',
        keyVariableId: firstVarId,
      };
    case 'bom_phantom':
      return {
        type: 'bom_phantom',
        id: rid(),
        name: 'New line',
        sku: 'PHANTOM-001',
        quantity: 1,
        unit: 'ea',
      };
    case 'bom_override':
      return {
        type: 'bom_override',
        id: rid(),
        nodeId: '',
        hidden: false,
      };
    case 'operation':
      return {
        type: 'operation',
        id: rid(),
        name: 'New operation',
        workCentre: 'Cell 1',
        setupMinutes: 10,
        runMinutesPerUnit: 5,
      };
    case 'cost_adjust':
      return {
        type: 'cost_adjust',
        id: rid(),
        category: 'material',
        label: 'Adjustment',
        amount: 0,
      };
    case 'warning':
      return {
        type: 'warning',
        id: rid(),
        message: 'Configuration note',
      };
    default:
      return { type: 'sequence', id: rid(), children: [] };
  }
}

export function appendToRoot(engine: ProductDefinitionEngine, block: EngineBlock): ProductDefinitionEngine {
  return { ...engine, rootBlocks: [...engine.rootBlocks, block] };
}

export function appendToBranchChildren(
  engine: ProductDefinitionEngine,
  branchPath: { blockId: string; branchId: string },
  block: EngineBlock,
): ProductDefinitionEngine {
  function walk(bs: EngineBlock[]): EngineBlock[] {
    return bs.map((b) => {
      if (b.type === 'if_chain' && b.id === branchPath.blockId) {
        return {
          ...b,
          branches: b.branches.map((br) =>
            br.id === branchPath.branchId ? { ...br, children: [...br.children, block] } : br,
          ),
        };
      }
      if (b.type === 'sequence') {
        return { ...b, children: walk(b.children) };
      }
      if (b.type === 'if_chain') {
        return {
          ...b,
          branches: b.branches.map((br) => ({
            ...br,
            children: walk(br.children),
          })),
        };
      }
      return b;
    });
  }
  return { ...engine, rootBlocks: walk(engine.rootBlocks) };
}

export function removeBlockByIdAnywhere(blocks: EngineBlock[], id: string): EngineBlock[] {
  const out: EngineBlock[] = [];
  for (const b of blocks) {
    const s = stripBlock(b, id);
    if (s) out.push(s);
  }
  return out;
}

function stripBlock(b: EngineBlock, id: string): EngineBlock | null {
  if (b.id === id) return null;
  if (b.type === 'sequence') {
    return { ...b, children: removeBlockByIdAnywhere(b.children, id) };
  }
  if (b.type === 'if_chain') {
    return {
      ...b,
      branches: b.branches.map((br) => ({
        ...br,
        children: removeBlockByIdAnywhere(br.children, id),
      })),
    };
  }
  return b;
}

export function replaceBlockById(blocks: EngineBlock[], targetId: string, next: EngineBlock): EngineBlock[] {
  return blocks.map((b) => mapReplaceDeep(b, targetId, next));
}

function mapReplaceDeep(b: EngineBlock, targetId: string, next: EngineBlock): EngineBlock {
  if (b.id === targetId) return next;
  if (b.type === 'sequence') {
    return { ...b, children: replaceBlockById(b.children, targetId, next) };
  }
  if (b.type === 'if_chain') {
    return {
      ...b,
      branches: b.branches.map((br) => ({
        ...br,
        condition:
          br.condition?.id === targetId ? (next as unknown as EngineCondition) : br.condition,
        children: replaceBlockById(br.children, targetId, next),
      })),
    };
  }
  return b;
}
