/**
 * ProductNode — individual node on the product structure canvas
 * Color-coded by type with drag support, selection state, and option count badge.
 */

import React, { useCallback, useRef } from 'react';
import {
  Box,
  Layers,
  CircleDot,
  Wrench,
  GripVertical,
  Settings2,
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import type { ProductNode as ProductNodeType, ProductNodeType as NodeType } from './product-studio-types';
import {
  NODE_TYPE_COLORS,
  NODE_TYPE_COLORS_LIGHT,
  NODE_TYPE_BORDER,
  NODE_TYPE_TEXT,
  NODE_TYPE_LABELS,
} from './product-studio-types';

const NODE_ICONS: Record<NodeType, React.ElementType> = {
  assembly: Layers,
  component: Box,
  raw_material: CircleDot,
  service: Wrench,
};

interface ProductNodeProps {
  node: ProductNodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  scale: number;
}

export function ProductNodeComponent({
  node,
  isSelected,
  onSelect,
  onDragStart,
  scale,
}: ProductNodeProps) {
  const Icon = NODE_ICONS[node.type];
  const optionCount = node.options.length;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelect(node.id);
      onDragStart(node.id, e);
    },
    [node.id, onSelect, onDragStart],
  );

  return (
    <div
      className={cn(
        'absolute select-none cursor-grab active:cursor-grabbing',
        'group transition-shadow duration-200',
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `translate(-50%, -50%)`,
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        className={cn(
          'relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3 min-w-[160px] max-w-[200px]',
          'bg-card dark:bg-card shadow-[var(--card-shadow-rest)]',
          'transition-[box-shadow,transform] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
          NODE_TYPE_BORDER[node.type],
          isSelected && 'ring-2 ring-[var(--mw-yellow-400)] shadow-md border-[var(--mw-yellow-400)]',
          !isSelected &&
            'transition-[box-shadow] duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:shadow-[var(--card-shadow-elevated)]',
        )}
      >
        {/* Drag handle */}
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-card border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] rounded-full p-0.5 shadow-sm">
            <GripVertical className="w-3 h-3 text-[var(--neutral-400)]" />
          </div>
        </div>

        {/* Type badge */}
        <div className={cn(
          'absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider',
          NODE_TYPE_COLORS[node.type],
          'text-white',
        )}>
          {NODE_TYPE_LABELS[node.type]}
        </div>

        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center mt-2',
          NODE_TYPE_COLORS_LIGHT[node.type],
        )}>
          <Icon className={cn('w-5 h-5', NODE_TYPE_TEXT[node.type])} strokeWidth={1.5} />
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-foreground text-center leading-tight line-clamp-2">
          {node.name}
        </span>

        {/* SKU */}
        {node.sku && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {node.sku}
          </span>
        )}

        {/* Option count */}
        {optionCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Settings2 className="w-3 h-3" />
            <span>{optionCount} option{optionCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Quantity badge */}
        {node.quantity > 1 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--mw-mirage)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            x{node.quantity}
          </div>
        )}
      </div>
    </div>
  );
}
