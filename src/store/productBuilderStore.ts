/**
 * Product Builder Store — Zustand state management for Product Studio
 * Persists product definitions to localStorage
 */

import { create } from 'zustand';
import type {
  Product,
  ProductNode,
  ProductEdge,
  RightPanelTab,
  CanvasTransform,
} from '@/components/plan/product-studio/product-studio-types';
import { productTemplates } from '@/components/plan/product-studio/product-templates';
import { defaultDefinitionEngineForProductId } from '@/components/plan/product-studio/definition-engine-templates';
import type { ProductDefinitionEngine } from '@/lib/product-studio/types';
import { createEmptyEngine } from '@/lib/product-studio/evaluate';

// ── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'mw-product-studio';

/** Map legacy prod-* seeded rows back to stable template ids so /plan/product-studio/tpl-* deep links work. */
function migrateLegacyProductIds(products: Product[]): Product[] {
  const tplIdsInUse = new Set(
    products.filter((p) => productTemplates.some((t) => t.id === p.id)).map((p) => p.id),
  );
  return products.map((p) => {
    if (!p.id.startsWith('prod-')) return p;
    const tpl = productTemplates.find((t) => t.name === p.name);
    if (tpl && !tplIdsInUse.has(tpl.id)) {
      tplIdsInUse.add(tpl.id);
      return { ...p, id: tpl.id };
    }
    return p;
  });
}

/** Attach definition engine when missing; strip legacy form rules only when migrating that product */
function migrateDefinitionEngine(products: Product[]): Product[] {
  return products.map((p) => {
    const needsEngine = !p.definitionEngine;
    return {
      ...p,
      rules: needsEngine ? [] : p.rules,
      definitionEngine: p.definitionEngine ?? defaultDefinitionEngineForProductId(p.id),
      lifecycleStatus: p.lifecycleStatus ?? 'draft',
      definitionVersion: p.definitionVersion ?? 1,
    };
  });
}

/**
 * Backfill `blocklyXml` from template seeds when the persisted product has none.
 *
 * Strictly additive: we ONLY write a non-empty `blocklyXml` when the persisted
 * value is `undefined` or an empty string. A user who has authored their own
 * blocks always wins — we never overwrite their work. This is what gives
 * Studio v2 a working starter recipe on first run without breaking anyone who
 * has already started editing.
 */
function migrateBlocklyXmlSeeds(products: Product[]): Product[] {
  return products.map((p) => {
    if (p.blocklyXml && p.blocklyXml.trim().length > 0) return p;
    const tpl = productTemplates.find((t) => t.id === p.id);
    if (!tpl?.blocklyXml) return p;
    return { ...p, blocklyXml: tpl.blocklyXml };
  });
}

/**
 * Ensure every shipping template product is present in the user's library.
 *
 * Strictly additive: we ONLY append a template when no persisted product
 * already has the same id. User-authored data is never touched, never
 * reordered, never overwritten. Existing template entries keep their persisted
 * blocklyXml / scenarioInputs / lifecycleStatus etc.
 *
 * This is what makes the `mw_product_ref` dropdown always have the seeded
 * library to point at — without it, a user who created their own first
 * product (so localStorage initialised with their custom row instead of the
 * templates) would see an empty Products dropdown forever.
 */
function migrateTemplateProducts(products: Product[]): Product[] {
  const existingIds = new Set(products.map((p) => p.id));
  const missing = productTemplates.filter((t) => !existingIds.has(t.id));
  if (missing.length === 0) return products;
  return [...products, ...missing.map((t) => ({ ...t }))];
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        let migrated = migrateLegacyProductIds(parsed);
        migrated = migrateDefinitionEngine(migrated);
        migrated = migrateBlocklyXmlSeeds(migrated);
        // Append any shipping template products that aren't yet in the user's
        // library so the Products dropdown always has the seeded references
        // to point at. Existing rows are untouched.
        migrated = migrateTemplateProducts(migrated);
        if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
        return migrated;
      }
    }
  } catch {
    // ignore parse errors
  }
  const templates = productTemplates.map((t) => ({ ...t }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return templates;
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ── Store Interface ──────────────────────────────────────────────────────────

interface ProductBuilderState {
  products: Product[];
  activeProductId: string | null;
  selectedNodeId: string | null;
  rightPanelTab: RightPanelTab;
  canvasTransform: CanvasTransform;
  showPreview: boolean;

  loadProducts: () => void;
  createProduct: (name: string, description: string) => Product;
  duplicateProduct: (id: string) => Product | null;
  deleteProduct: (id: string) => void;
  setActiveProduct: (id: string | null) => void;
  updateProductMeta: (id: string, name: string, description: string) => void;

  addNode: (node: ProductNode) => void;
  updateNode: (nodeId: string, updates: Partial<ProductNode>) => void;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, position: { x: number; y: number }) => void;

  addEdge: (edge: ProductEdge) => void;
  removeEdge: (edgeId: string) => void;

  setDefinitionEngine: (engine: ProductDefinitionEngine) => void;
  setLifecycleStatus: (status: 'draft' | 'published') => void;
  setLocked: (locked: boolean) => void;
  /** Persist Blockly v2 authoring state (workspace XML + sidecar extras). */
  setBlocklyState: (xml: string, extras: unknown) => void;
  /** Persist per-product scenario input values for the Studio v2 sidebar. */
  setScenarioInputs: (
    inputs: Record<string, string | number | boolean>,
  ) => void;

  setSelectedNode: (nodeId: string | null) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setCanvasTransform: (transform: CanvasTransform) => void;
  setShowPreview: (show: boolean) => void;

  getActiveProduct: () => Product | null;
}

function updateActive(
  products: Product[],
  activeId: string | null,
  updater: (p: Product) => Product,
): Product[] {
  if (!activeId) return products;
  return products.map((p) =>
    p.id === activeId ? updater({ ...p, updatedAt: new Date().toISOString() }) : p,
  );
}

export const useProductBuilderStore = create<ProductBuilderState>((set, get) => ({
  products: loadProducts(),
  activeProductId: null,
  selectedNodeId: null,
  rightPanelTab: 'properties',
  canvasTransform: { x: 0, y: 0, scale: 1 },
  showPreview: false,

  loadProducts: () => {
    set({ products: loadProducts() });
  },

  createProduct: (name, description) => {
    const newProduct: Product = {
      id: `prod-${Math.random().toString(36).slice(2, 10)}`,
      name,
      description,
      nodes: [],
      edges: [],
      rules: [],
      definitionEngine: createEmptyEngine(),
      lifecycleStatus: 'draft',
      definitionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const products = [...get().products, newProduct];
    saveProducts(products);
    set({ products, activeProductId: newProduct.id });
    return newProduct;
  },

  duplicateProduct: (id) => {
    const source = get().products.find((p) => p.id === id);
    if (!source) return null;
    const dup: Product = {
      ...structuredClone(source),
      id: `prod-${Math.random().toString(36).slice(2, 10)}`,
      name: `${source.name} (Copy)`,
      lifecycleStatus: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const products = [...get().products, dup];
    saveProducts(products);
    set({ products });
    return dup;
  },

  deleteProduct: (id) => {
    const products = get().products.filter((p) => p.id !== id);
    saveProducts(products);
    set({
      products,
      activeProductId: get().activeProductId === id ? null : get().activeProductId,
    });
  },

  setActiveProduct: (id) => {
    set({ activeProductId: id, selectedNodeId: null, canvasTransform: { x: 0, y: 0, scale: 1 } });
  },

  updateProductMeta: (id, name, description) => {
    const products = get().products.map((p) =>
      p.id === id ? { ...p, name, description, updatedAt: new Date().toISOString() } : p,
    );
    saveProducts(products);
    set({ products });
  },

  addNode: (node) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      nodes: [...p.nodes, node],
      edges: node.parentId
        ? [
            ...p.edges,
            {
              id: `e-${Math.random().toString(36).slice(2, 10)}`,
              sourceId: node.parentId,
              targetId: node.id,
            },
          ]
        : p.edges,
    }));
    saveProducts(products);
    set({ products });
  },

  updateNode: (nodeId, updates) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    }));
    saveProducts(products);
    set({ products });
  },

  removeNode: (nodeId) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => {
      const idsToRemove = new Set<string>();
      const collectChildren = (id: string) => {
        idsToRemove.add(id);
        p.nodes.filter((n) => n.parentId === id).forEach((n) => collectChildren(n.id));
      };
      collectChildren(nodeId);
      return {
        ...p,
        nodes: p.nodes.filter((n) => !idsToRemove.has(n.id)),
        edges: p.edges.filter(
          (e) => !idsToRemove.has(e.sourceId) && !idsToRemove.has(e.targetId),
        ),
      };
    });
    saveProducts(products);
    set({ products, selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId });
  },

  moveNode: (nodeId, position) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    }));
    saveProducts(products);
    set({ products });
  },

  addEdge: (edge) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      edges: [...p.edges, edge],
    }));
    saveProducts(products);
    set({ products });
  },

  removeEdge: (edgeId) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      edges: p.edges.filter((e) => e.id !== edgeId),
    }));
    saveProducts(products);
    set({ products });
  },

  setDefinitionEngine: (engine) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      definitionEngine: engine,
    }));
    saveProducts(products);
    set({ products });
  },

  setLifecycleStatus: (lifecycleStatus) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({ ...p, lifecycleStatus }));
    saveProducts(products);
    set({ products });
  },

  setLocked: (locked) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({ ...p, locked }));
    saveProducts(products);
    set({ products });
  },

  setBlocklyState: (xml, extras) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      blocklyXml: xml,
      blocklyExtras: extras,
    }));
    saveProducts(products);
    set({ products });
  },

  setScenarioInputs: (inputs) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      scenarioInputs: inputs,
    }));
    saveProducts(products);
    set({ products });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setCanvasTransform: (transform) => set({ canvasTransform: transform }),
  setShowPreview: (show) => set({ showPreview: show }),

  getActiveProduct: () => {
    const { products, activeProductId } = get();
    return products.find((p) => p.id === activeProductId) || null;
  },
}));
