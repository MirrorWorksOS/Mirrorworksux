/**
 * ProductStudio — main editor page for building configurable products.
 * Layout: Toolbar top, Rules rail left, product canvas centre, Properties (and optional Preview) right.
 * Handles route param for product loading and top-level layout orchestration.
 */

import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Save,
  Eye,
  TestTube2,
  Download,
  Upload,
  MoreHorizontal,
  Pencil,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { validateDefinitionEngine } from '@/lib/product-studio/validate';
import { ProductCanvas } from './ProductCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { VisualRuleWorkspace } from './VisualRuleWorkspace';
import { ConfigPreview } from './ConfigPreview';
import { ProductList } from './ProductList';
// ── Editor Layout ────────────────────────────────────────────────────────────

function ProductEditor() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const {
    products,
    activeProductId,
    setActiveProduct,
    getActiveProduct,
    updateProductMeta,
    showPreview,
    setShowPreview,
    selectedNodeId,
    setLifecycleStatus,
    setLocked,
  } = useProductBuilderStore();

  // Load product from route param
  useEffect(() => {
    if (productId && productId !== activeProductId) {
      const exists = products.find((p) => p.id === productId);
      if (exists) {
        setActiveProduct(productId);
      } else {
        navigate('/plan/product-studio', { replace: true });
      }
    }
  }, [productId, activeProductId, products, setActiveProduct, navigate]);

  const product = getActiveProduct();

  // Editable product name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    if (product) setEditName(product.name);
  }, [product?.name]);

  const handleSaveName = () => {
    if (product && editName.trim()) {
      updateProductMeta(product.id, editName, product.description);
    }
    setIsEditingName(false);
  };

  const handleSave = () => {
    // Data auto-persists to localStorage; show a flash confirmation
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  // Validation issues (canvas + definition engine)
  const issues: string[] = [];
  if (product) {
    if (product.nodes.length === 0) issues.push('Product has no nodes');
    const noRoot = product.nodes.filter((n) => !n.parentId);
    if (noRoot.length === 0 && product.nodes.length > 0) issues.push('No root assembly found');
    product.nodes.forEach((n) => {
      if (!n.name.trim()) issues.push(`Node "${n.id}" has no name`);
      if (!n.sku.trim() && n.type !== 'service') issues.push(`${n.name || 'Unnamed node'} needs a SKU`);
    });
    validateDefinitionEngine(product, product.definitionEngine).forEach((v) => {
      if (v.level === 'error') issues.push(v.message);
    });
  }

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] bg-background">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--neutral-200)] dark:border-[var(--neutral-800)] bg-card shrink-0">
        {/* Back */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setActiveProduct(null);
            navigate('/plan/product-studio');
          }}
          className="h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Product name — click to edit */}
        {isEditingName ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
              className="h-8 text-sm font-semibold w-64"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={handleSaveName} className="h-7 w-7">
              <Check className="w-4 h-4 text-emerald-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsEditingName(false)} className="h-7 w-7">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="group flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:text-muted-foreground"
          >
            {product.name}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        <div className="flex-1" />

        {/* Status */}
        <AnimatePresence mode="wait">
          {saveFlash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Saved</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Badge variant="outline" className="text-[10px]">
          {product.nodes.length} nodes
        </Badge>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'h-8 text-[10px] px-2',
            product.lifecycleStatus === 'published' && 'border-[var(--mw-green)]/50 text-[var(--mw-green)]',
          )}
          onClick={() =>
            setLifecycleStatus(product.lifecycleStatus === 'published' ? 'draft' : 'published')
          }
          title="Toggle draft / published"
        >
          {product.lifecycleStatus === 'published' ? 'Published' : 'Draft'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={product.locked ? 'Unlock definition' : 'Lock definition'}
          onClick={() => setLocked(!product.locked)}
        >
          {product.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 opacity-50" />}
        </Button>

        {/* Action buttons */}
        <Button variant="outline" size="sm" onClick={handleSave} className="h-8 gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>

        <Button
          variant={showPreview ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 gap-1.5 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs">
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs">
              <TestTube2 className="w-3.5 h-3.5" />
              Test All Rules
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Main area: Rules | Canvas | Properties (+ Preview) ─────────────── */}
      <DndProvider backend={HTML5Backend}>
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-72 shrink-0 flex-col border-r border-[var(--border)] bg-white dark:bg-card min-h-0">
            <VisualRuleWorkspace />
          </aside>

          <div className="min-w-0 flex-1 p-3 transition-all duration-300">
            <ProductCanvas />
          </div>

          <div
            className={cn(
              'flex min-h-0 shrink-0 flex-col border-l border-[var(--neutral-200)] bg-card transition-all duration-300 dark:border-[var(--neutral-800)]',
              showPreview ? 'min-w-[280px] flex-1 basis-0' : 'w-[min(100%,420px)]',
            )}
          >
            {showPreview ? (
              <div className="flex min-h-0 flex-1">
                <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
                  <div className="shrink-0 border-b border-[var(--border)] px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Properties</p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <PropertiesPanel />
                  </div>
                </div>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="shrink-0 border-b border-[var(--border)] px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Preview</p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <ConfigPreview />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-[var(--border)] px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Properties</p>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <PropertiesPanel />
                </div>
              </>
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── Validation bar ───────────────────────────────────────────────────── */}
      {issues.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} found:
          </span>
          <div className="flex-1 flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {issues.slice(0, 3).map((issue, i) => (
              <Badge key={i} variant="outline" className="text-[10px] border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shrink-0">
                {issue}
              </Badge>
            ))}
            {issues.length > 3 && (
              <span className="text-[10px] text-amber-500">+{issues.length - 3} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Route Component ──────────────────────────────────────────────────────────
// Renders list or editor based on whether productId param is present.

export function ProductStudio() {
  const { productId } = useParams<{ productId: string }>();

  if (productId) {
    return <ProductEditor />;
  }

  return <ProductList />;
}
