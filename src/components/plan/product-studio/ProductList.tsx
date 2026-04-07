/**
 * ProductList — grid of saved products with cards showing name, type indicator, node count, last edited.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Copy,
  Trash2,
  MoreVertical,
  Layers,
  Box,
  CircleDot,
  Wrench,
  Clock,
  Zap,
  ArrowRight,
  Lock,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import type { Product } from './product-studio-types';

const THUMBNAIL_ICONS: Record<string, React.ElementType> = {
  shelving: Layers,
  bracket: Box,
  frame: CircleDot,
};

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getNodeTypeCounts(product: Product) {
  const counts: Record<string, number> = {};
  product.nodes.forEach((n) => {
    counts[n.type] = (counts[n.type] || 0) + 1;
  });
  return counts;
}

export function ProductList() {
  const navigate = useNavigate();
  const { products, createProduct, duplicateProduct, deleteProduct, setActiveProduct } =
    useProductBuilderStore();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const product = createProduct(newName, newDesc);
    setShowNewDialog(false);
    setNewName('');
    setNewDesc('');
    navigate(`/plan/product-studio/${product.id}`);
  };

  const handleOpen = (productId: string) => {
    setActiveProduct(productId);
    navigate(`/plan/product-studio/${productId}`);
  };

  const handleOpenV2 = (productId: string) => {
    setActiveProduct(productId);
    navigate(`/plan/product-studio/v2/${productId}`);
  };

  const handleDuplicate = (productId: string) => {
    duplicateProduct(productId);
  };

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build configurable products with visual structure trees and smart rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/plan/product-studio/v2')}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            Open Visual editor
            <Badge
              variant="outline"
              className="ml-1 h-[18px] rounded-full border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] px-1.5 text-[9px] font-medium uppercase tracking-wider text-[var(--neutral-800)]"
            >
              v2 beta
            </Badge>
          </Button>
          <Button onClick={() => setShowNewDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Product
          </Button>
        </div>
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center">
            <Box className="w-10 h-10 text-[var(--neutral-400)]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-medium text-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first configurable product to start building visual product structures with smart configuration rules.
            </p>
          </div>
          <Button onClick={() => setShowNewDialog(true)} className="gap-2 mt-2">
            <Plus className="w-4 h-4" />
            Create First Product
          </Button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* New product card */}
          <motion.div variants={staggerItem}>
            <Card
              className="h-full min-h-[200px] flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-[var(--neutral-300)] dark:border-[var(--neutral-700)] hover:border-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-400)]/5 transition-all duration-200 group"
              onClick={() => setShowNewDialog(true)}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center group-hover:bg-[var(--mw-yellow-400)]/20 transition-colors">
                <Plus className="w-6 h-6 text-[var(--neutral-400)] group-hover:text-[var(--mw-yellow-500)] transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-3 group-hover:text-foreground transition-colors">
                New Product
              </p>
            </Card>
          </motion.div>

          {/* Product cards */}
          {products.map((product) => {
            const typeCounts = getNodeTypeCounts(product);
            const ThumbnailIcon = THUMBNAIL_ICONS[product.thumbnail || ''] || Layers;

            return (
              <motion.div key={product.id} variants={staggerItem}>
                <Card
                  className="h-full min-h-[200px] flex flex-col cursor-pointer hover:shadow-md transition-all duration-200 group"
                  onClick={() => handleOpen(product.id)}
                >
                  {/* Thumbnail area */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="h-24 rounded-xl bg-gradient-to-br from-[var(--neutral-100)] to-[var(--neutral-50)] dark:from-[var(--neutral-800)] dark:to-[var(--neutral-900)] flex items-center justify-center relative overflow-hidden">
                      <ThumbnailIcon className="w-10 h-10 text-[var(--neutral-300)] dark:text-[var(--neutral-600)]" strokeWidth={1} />
                      {/* Node count badges in corner */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {product.nodes.length > 0 && (
                          <Badge variant="secondary" className="text-[9px] h-5 bg-card/80 backdrop-blur-sm">
                            {product.nodes.length} nodes
                          </Badge>
                        )}
                        {(product.definitionEngine?.rootBlocks.length ?? 0) > 0 && (
                          <Badge variant="secondary" className="text-[9px] h-5 bg-card/80 backdrop-blur-sm gap-0.5">
                            <Zap className="w-2.5 h-2.5" />
                            {product.definitionEngine?.rootBlocks.length}
                          </Badge>
                        )}
                        {product.blocklyXml && (
                          <Badge className="text-[9px] h-5 gap-0.5 border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--neutral-800)] backdrop-blur-sm">
                            <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                            v2
                          </Badge>
                        )}
                        {product.lifecycleStatus === 'published' && (
                          <Badge className="text-[9px] h-5 bg-[var(--mw-green)]/15 text-[var(--mw-green)] border-0">
                            Published
                          </Badge>
                        )}
                        {product.locked && (
                          <Badge variant="outline" className="text-[9px] h-5 px-1">
                            <Lock className="w-2.5 h-2.5" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[var(--mw-yellow-600)] dark:group-hover:text-[var(--mw-yellow-400)] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpen(product.id); }} className="gap-2 text-xs">
                            <ArrowRight className="w-3.5 h-3.5" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenV2(product.id); }} className="gap-2 text-xs">
                            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Edit in v2 (beta)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(product.id); }} className="gap-2 text-xs">
                            <Copy className="w-3.5 h-3.5" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                            className="gap-2 text-xs text-[var(--error)] focus:text-[var(--error)]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Type breakdown */}
                    <div className="flex items-center gap-2 mt-2.5">
                      {Object.entries(typeCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-1">
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              type === 'assembly' && 'bg-blue-500',
                              type === 'component' && 'bg-emerald-500',
                              type === 'raw_material' && 'bg-amber-500',
                              type === 'service' && 'bg-purple-500',
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 pb-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(product.updatedAt)}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* New Product Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Configurable Product</DialogTitle>
            <DialogDescription>
              Give your product a name and description to get started. You can always change these later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Product Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Custom Steel Shelving Unit"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full min-h-[80px] rounded-xl border border-input bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y transition-[border-color,box-shadow] duration-200"
                placeholder="Describe the product and its configurable aspects..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
