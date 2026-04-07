/**
 * ProductCanvas — visual tree/node-based canvas for product hierarchy.
 * Pannable & zoomable via pointer events + wheel, with SVG edge lines.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDrop, useDragLayer } from 'react-dnd';
import { ZoomIn, ZoomOut, Maximize2, Plus, Layers, Box, CircleDot, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { createEmptyEngine } from '@/lib/product-studio/evaluate';
import { ProductNodeComponent } from './ProductNode';
import {
  appendToRoot,
  createStubBlock,
  deepRegenerateIds,
  RULE_PALETTE_DND_TYPE,
  type PaletteKind,
} from './rule-workspace-utils';
import type { ProductNodeType, ProductNode } from './product-studio-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NODE_TYPE_ICON: Record<ProductNodeType, React.ElementType> = {
  assembly: Layers,
  component: Box,
  raw_material: CircleDot,
  service: Wrench,
};

const NODE_TYPE_LABEL: Record<ProductNodeType, string> = {
  assembly: 'Assembly',
  component: 'Component',
  raw_material: 'Raw Material',
  service: 'Service',
};

export function ProductCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    getActiveProduct,
    selectedNodeId,
    setSelectedNode,
    canvasTransform,
    setCanvasTransform,
    moveNode,
    addNode,
    addEdge,
  } = useProductBuilderStore();

  const product = getActiveProduct();
  const nodes = product?.nodes || [];
  const edges = product?.edges || [];

  const paletteDragging = useDragLayer(
    (monitor) => monitor.isDragging() && monitor.getItemType() === RULE_PALETTE_DND_TYPE,
  );

  const [{ isOverPaletteTarget, canDropPalette }, dropPalette] = useDrop(
    () => ({
      accept: RULE_PALETTE_DND_TYPE,
      canDrop: () => {
        const p = useProductBuilderStore.getState().getActiveProduct();
        return !!p && !p.locked;
      },
      drop: (item: { kind: PaletteKind }) => {
        const { getActiveProduct, setDefinitionEngine } = useProductBuilderStore.getState();
        const p = getActiveProduct();
        if (!p || p.locked) return;
        const engine = p.definitionEngine ?? createEmptyEngine();
        const firstVarId = engine.variables[0]?.id ?? '';
        const stub = deepRegenerateIds(createStubBlock(item.kind, firstVarId));
        setDefinitionEngine(appendToRoot(engine, stub));
      },
      collect: (monitor) => ({
        isOverPaletteTarget: monitor.isOver({ shallow: true }),
        canDropPalette: monitor.canDrop(),
      }),
    }),
    [],
  );

  // ── Panning ──────────────────────────────────────────────────────────────
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('[data-canvas-bg]')) return;
      setSelectedNode(null);
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      transformStart.current = { x: canvasTransform.x, y: canvasTransform.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [canvasTransform, setSelectedNode],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCanvasTransform({
        ...canvasTransform,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy,
      });
    },
    [isPanning, canvasTransform, setCanvasTransform],
  );

  const handleCanvasPointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // ── Zoom (wheel) ──────────────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.min(2, Math.max(0.3, canvasTransform.scale + delta));
      setCanvasTransform({ ...canvasTransform, scale: newScale });
    },
    [canvasTransform, setCanvasTransform],
  );

  const zoomIn = () =>
    setCanvasTransform({ ...canvasTransform, scale: Math.min(2, canvasTransform.scale + 0.15) });
  const zoomOut = () =>
    setCanvasTransform({ ...canvasTransform, scale: Math.max(0.3, canvasTransform.scale - 0.15) });
  const fitView = () => setCanvasTransform({ x: 0, y: 0, scale: 1 });

  // ── Node dragging ─────────────────────────────────────────────────────────
  const dragNodeId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      dragNodeId.current = nodeId;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nodeScreenX = node.position.x * canvasTransform.scale + canvasTransform.x + rect.left;
      const nodeScreenY = node.position.y * canvasTransform.scale + canvasTransform.y + rect.top;
      dragOffset.current = {
        x: e.clientX - nodeScreenX,
        y: e.clientY - nodeScreenY,
      };
    },
    [nodes, canvasTransform],
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragNodeId.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - dragOffset.current.x - canvasTransform.x - rect.left) / canvasTransform.scale;
      const y = (e.clientY - dragOffset.current.y - canvasTransform.y - rect.top) / canvasTransform.scale;
      moveNode(dragNodeId.current, { x: Math.round(x), y: Math.round(y) });
    };
    const onPointerUp = () => {
      dragNodeId.current = null;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [canvasTransform, moveNode]);

  // ── Add node ──────────────────────────────────────────────────────────────
  const handleAddNode = useCallback(
    (type: ProductNodeType) => {
      const id = `node-${Math.random().toString(36).slice(2, 10)}`;
      // Place near center of current view
      const cx = (-canvasTransform.x + 400) / canvasTransform.scale;
      const cy = (-canvasTransform.y + 300) / canvasTransform.scale;
      const newNode: ProductNode = {
        id,
        type,
        name: `New ${NODE_TYPE_LABEL[type]}`,
        sku: '',
        description: '',
        options: [],
        position: { x: Math.round(cx + Math.random() * 40 - 20), y: Math.round(cy + Math.random() * 40 - 20) },
        parentId: selectedNodeId,
        pricing: { basePrice: 0, perUnit: 0, formula: '' },
        constraints: { minQuantity: 1, maxQuantity: 99, required: false },
        quantity: 1,
      };
      addNode(newNode);
      setSelectedNode(id);
    },
    [canvasTransform, selectedNodeId, addNode, setSelectedNode],
  );

  // ── Render edges as SVG lines ─────────────────────────────────────────────
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative flex-1 overflow-hidden bg-[var(--neutral-50)] dark:bg-[var(--neutral-950)] rounded-xl border border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
      {paletteDragging && (
        <div
          ref={dropPalette}
          className={cn(
            'absolute inset-0 z-[30] rounded-xl transition-[box-shadow,background-color] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
            isOverPaletteTarget && canDropPalette && 'bg-[var(--mw-yellow-400)]/[0.08] ring-2 ring-inset ring-[var(--mw-yellow-400)]',
          )}
          aria-hidden
        />
      )}

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <Button variant="outline" size="icon" onClick={zoomIn} className="h-8 w-8 rounded-lg bg-card">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomOut} className="h-8 w-8 rounded-lg bg-card">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={fitView} className="h-8 w-8 rounded-lg bg-card">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Add node button */}
      <div className="absolute top-3 left-3 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 bg-card">
              <Plus className="w-4 h-4" />
              Add Node
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(Object.keys(NODE_TYPE_LABEL) as ProductNodeType[]).map((type) => {
              const Icon = NODE_TYPE_ICON[type];
              return (
                <DropdownMenuItem key={type} onClick={() => handleAddNode(type)} className="gap-2">
                  <Icon className="w-4 h-4" />
                  {NODE_TYPE_LABEL[type]}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-3 right-3 z-20 text-[10px] font-mono text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md border border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
        {Math.round(canvasTransform.scale * 100)}%
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className={cn(
          'w-full h-full',
          isPanning ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onWheel={handleWheel}
        data-canvas-bg
      >
        {/* Dot grid pattern background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <pattern
              id="canvas-dots"
              x={canvasTransform.x % (20 * canvasTransform.scale)}
              y={canvasTransform.y % (20 * canvasTransform.scale)}
              width={20 * canvasTransform.scale}
              height={20 * canvasTransform.scale}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={1}
                cy={1}
                r={1}
                className="fill-[var(--neutral-300)] dark:fill-[var(--neutral-700)]"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#canvas-dots)" />
        </svg>

        {/* Transformed layer */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {edges.map((edge) => {
              const source = nodeMap.get(edge.sourceId);
              const target = nodeMap.get(edge.targetId);
              if (!source || !target) return null;

              const sx = source.position.x;
              const sy = source.position.y;
              const tx = target.position.x;
              const ty = target.position.y;

              // Curved connection line
              const midY = (sy + ty) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`}
                    fill="none"
                    strokeWidth={2}
                    className="stroke-[var(--neutral-300)] dark:stroke-[var(--neutral-600)]"
                  />
                  {/* Small circle at connection point */}
                  <circle
                    cx={tx}
                    cy={ty}
                    r={4}
                    className="fill-[var(--neutral-300)] dark:fill-[var(--neutral-600)]"
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <ProductNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={setSelectedNode}
              onDragStart={handleNodeDragStart}
              scale={canvasTransform.scale}
            />
          ))}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ left: 300, top: 200 }}>
              <div className="text-center space-y-3 max-w-xs">
                <div className="w-16 h-16 rounded-2xl bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center mx-auto">
                  <Layers className="w-8 h-8 text-[var(--neutral-400)]" />
                </div>
                <p className="text-sm font-medium text-foreground">Start Building</p>
                <p className="text-xs text-muted-foreground">
                  Click &quot;Add node&quot; to add assemblies and components. Drag rule blocks from the left rail and drop them here to build product logic.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
