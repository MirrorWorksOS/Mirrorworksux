/**
 * Product Builder Store — Zustand state management for Product Studio
 * Persists product definitions to localStorage
 */

import { create } from 'zustand';
import type {
  Product,
  ProductNode,
  ProductEdge,
  ProductRule,
  RightPanelTab,
  CanvasTransform,
} from '@/components/plan/product-studio/product-studio-types';
import { productTemplates } from '@/components/plan/product-studio/product-templates';

// ── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'mw-product-studio';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  // Seed with templates on first load
  const templates = productTemplates.map((t) => ({
    ...t,
    id: `prod-${Math.random().toString(36).slice(2, 10)}`,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return templates;
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ── Store Interface ──────────────────────────────────────────────────────────

interface ProductBuilderState {
  // Product list
  products: Product[];
  activeProductId: string | null;

  // Canvas / editor state
  selectedNodeId: string | null;
  rightPanelTab: RightPanelTab;
  canvasTransform: CanvasTransform;
  showPreview: boolean;

  // Product CRUD
  loadProducts: () => void;
  createProduct: (name: string, description: string) => Product;
  duplicateProduct: (id: string) => Product | null;
  deleteProduct: (id: string) => void;
  setActiveProduct: (id: string | null) => void;
  updateProductMeta: (id: string, name: string, description: string) => void;

  // Node CRUD
  addNode: (node: ProductNode) => void;
  updateNode: (nodeId: string, updates: Partial<ProductNode>) => void;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, position: { x: number; y: number }) => void;

  // Edge CRUD
  addEdge: (edge: ProductEdge) => void;
  removeEdge: (edgeId: string) => void;

  // Rule CRUD
  addRule: (rule: ProductRule) => void;
  updateRule: (ruleId: string, updates: Partial<ProductRule>) => void;
  removeRule: (ruleId: string) => void;
  reorderRules: (ruleIds: string[]) => void;

  // UI state
  setSelectedNode: (nodeId: string | null) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setCanvasTransform: (transform: CanvasTransform) => void;
  setShowPreview: (show: boolean) => void;

  // Helpers
  getActiveProduct: () => Product | null;
}

// ── Helper — update active product in list ───────────────────────────────────

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

// ── Store ────────────────────────────────────────────────────────────────────

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

  // ── Node CRUD ──────────────────────────────────────────────────────────────

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
    // Remove node + any child nodes + related edges
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
        rules: p.rules.filter((r) => !idsToRemove.has(r.nodeId)),
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

  // ── Edge CRUD ──────────────────────────────────────────────────────────────

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

  // ── Rule CRUD ──────────────────────────────────────────────────────────────

  addRule: (rule) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      rules: [...p.rules, rule],
    }));
    saveProducts(products);
    set({ products });
  },

  updateRule: (ruleId, updates) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      rules: p.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    }));
    saveProducts(products);
    set({ products });
  },

  removeRule: (ruleId) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => ({
      ...p,
      rules: p.rules.filter((r) => r.id !== ruleId),
    }));
    saveProducts(products);
    set({ products });
  },

  reorderRules: (ruleIds) => {
    const { activeProductId: activeId } = get();
    const products = updateActive(get().products, activeId, (p) => {
      const ruleMap = new Map(p.rules.map((r) => [r.id, r]));
      const reordered = ruleIds
        .map((id, i) => {
          const r = ruleMap.get(id);
          return r ? { ...r, priority: i + 1 } : null;
        })
        .filter(Boolean) as ProductRule[];
      return { ...p, rules: reordered };
    });
    saveProducts(products);
    set({ products });
  },

  // ── UI state ───────────────────────────────────────────────────────────────

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setCanvasTransform: (transform) => set({ canvasTransform: transform }),
  setShowPreview: (show) => set({ showPreview: show }),

  getActiveProduct: () => {
    const { products, activeProductId } = get();
    return products.find((p) => p.id === activeProductId) || null;
  },
}));
