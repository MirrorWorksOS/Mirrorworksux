/**
 * ConfigPreview — WYSIWYG preview of what the sales person sees when configuring
 * this product. Generates dynamic form from product structure + shows calculated values.
 */

import React, { useState, useMemo } from 'react';
import {
  Eye,
  ShoppingCart,
  Weight,
  DollarSign,
  Package,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import type { ProductNode, ProductOption } from './product-studio-types';
import { NODE_TYPE_COLORS, NODE_TYPE_TEXT, NODE_TYPE_LABELS } from './product-studio-types';

export function ConfigPreview() {
  const { getActiveProduct } = useProductBuilderStore();
  const product = getActiveProduct();

  // Track user selections for the preview
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Initialize selections from defaults
  const defaults = useMemo(() => {
    if (!product) return {};
    const d: Record<string, string> = {};
    product.nodes.forEach((n) => {
      n.options.forEach((o) => {
        d[`${n.id}:${o.id}`] = o.defaultValue;
      });
    });
    return d;
  }, [product]);

  const getSelection = (nodeId: string, optId: string) =>
    selections[`${nodeId}:${optId}`] ?? defaults[`${nodeId}:${optId}`] ?? '';

  const setSelection = (nodeId: string, optId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [`${nodeId}:${optId}`]: value }));
  };

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">No product loaded</p>
      </div>
    );
  }

  // Get root node(s) — nodes with no parent
  const rootNodes = product.nodes.filter((n) => n.parentId === null);
  const childMap = new Map<string, ProductNode[]>();
  product.nodes.forEach((n) => {
    if (n.parentId) {
      const existing = childMap.get(n.parentId) || [];
      existing.push(n);
      childMap.set(n.parentId, existing);
    }
  });

  // Calculate total estimated price
  const totalPrice = product.nodes.reduce((sum, n) => {
    return sum + n.pricing.basePrice + n.pricing.perUnit * (n.quantity - 1);
  }, 0);

  // Estimate weight (mock: $10 per kg approximation for demo)
  const estimatedWeight = Math.round(totalPrice / 10);

  // Triggered warnings from rules
  const warnings: string[] = [];
  product.rules.forEach((rule) => {
    if (!rule.enabled) return;
    rule.actions.forEach((action) => {
      if (action.type === 'show_warning') {
        // Check if conditions roughly match current selections
        const conditionsMet = rule.conditionGroups.some((group) =>
          group.conditions.every((cond) => {
            const matchingNode = product.nodes.find((n) =>
              n.options.some((o) => o.name === cond.field),
            );
            if (!matchingNode) return false;
            const matchingOpt = matchingNode.options.find((o) => o.name === cond.field);
            if (!matchingOpt) return false;
            const currentVal = getSelection(matchingNode.id, matchingOpt.id);
            if (cond.operator === 'equals') return currentVal === cond.value;
            return false;
          }),
        );
        if (conditionsMet) warnings.push(action.value);
      }
    });
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[var(--mw-yellow-500)]" />
          <h3 className="text-sm font-semibold text-foreground">Configuration Preview</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Sales View
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* Product header */}
        <div className="px-4 py-4 border-b border-[var(--neutral-100)] dark:border-[var(--neutral-800)]">
          <h2 className="text-base font-bold text-foreground">{product.name}</h2>
          <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="px-4 pt-3">
            {warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-xs text-amber-700 dark:text-amber-300">{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Configuration form */}
        <div className="px-4 py-3 space-y-4">
          {rootNodes.map((rootNode) => (
            <ConfigSection
              key={rootNode.id}
              node={rootNode}
              childMap={childMap}
              allNodes={product.nodes}
              getSelection={getSelection}
              setSelection={setSelection}
              depth={0}
            />
          ))}
        </div>

        {/* Summary panel */}
        <div className="px-4 py-4 mt-2 border-t border-[var(--neutral-200)] dark:border-[var(--neutral-800)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Order Summary
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Estimated Price</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-muted-foreground">Est. Weight</span>
              </div>
              <span className="text-sm font-medium text-foreground">{estimatedWeight} kg</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs text-muted-foreground">Components</span>
              </div>
              <span className="text-sm font-medium text-foreground">{product.nodes.length}</span>
            </div>
          </div>

          {/* Component list */}
          <div className="mt-4 pt-3 border-t border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Bill of Materials
            </h5>
            <div className="space-y-1">
              {product.nodes.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', NODE_TYPE_COLORS[n.type])} />
                    <span className="text-xs text-foreground truncate">{n.name}</span>
                    {n.quantity > 1 && (
                      <span className="text-[10px] text-muted-foreground">x{n.quantity}</span>
                    )}
                  </div>
                  {n.pricing.basePrice > 0 && (
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      ${n.pricing.basePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4 gap-2" size="sm">
            <ShoppingCart className="w-4 h-4" />
            Add to Quote
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Recursive config section ──────────────────────────────────────────────────

function ConfigSection({
  node,
  childMap,
  allNodes,
  getSelection,
  setSelection,
  depth,
}: {
  node: ProductNode;
  childMap: Map<string, ProductNode[]>;
  allNodes: ProductNode[];
  getSelection: (nodeId: string, optId: string) => string;
  setSelection: (nodeId: string, optId: string, value: string) => void;
  depth: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = childMap.get(node.id) || [];
  const hasOptions = node.options.length > 0;

  return (
    <div className={cn(depth > 0 && 'ml-3 pl-3 border-l-2 border-[var(--neutral-200)] dark:border-[var(--neutral-700)]')}>
      {/* Section header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left py-1.5 group"
      >
        {children.length > 0 || hasOptions ? (
          isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )
        ) : (
          <div className="w-3.5" />
        )}
        <div className={cn('w-2 h-2 rounded-full shrink-0', NODE_TYPE_COLORS[node.type])} />
        <span className="text-xs font-semibold text-foreground group-hover:text-[var(--mw-yellow-600)] dark:group-hover:text-[var(--mw-yellow-400)] transition-colors">
          {node.name}
        </span>
        {node.quantity > 1 && (
          <span className="text-[10px] text-muted-foreground">x{node.quantity}</span>
        )}
        <Badge variant="outline" className="text-[9px] ml-auto">
          {NODE_TYPE_LABELS[node.type]}
        </Badge>
      </button>

      {/* Options */}
      {isExpanded && hasOptions && (
        <div className="ml-6 space-y-2.5 py-2">
          {node.options.map((opt) => (
            <OptionField
              key={opt.id}
              option={opt}
              value={getSelection(node.id, opt.id)}
              onChange={(v) => setSelection(node.id, opt.id, v)}
            />
          ))}
        </div>
      )}

      {/* Children */}
      {isExpanded &&
        children.map((child) => (
          <ConfigSection
            key={child.id}
            node={child}
            childMap={childMap}
            allNodes={allNodes}
            getSelection={getSelection}
            setSelection={setSelection}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

// ── Option field renderer ─────────────────────────────────────────────────────

function OptionField({
  option,
  value,
  onChange,
}: {
  option: ProductOption;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (option.type) {
    case 'dropdown':
      return (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            {option.name}
            {option.required && <span className="text-amber-500 ml-0.5">*</span>}
          </label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={`Select ${option.name}...`} />
            </SelectTrigger>
            <SelectContent>
              {option.values.map((v) => (
                <SelectItem key={v} value={v} className="text-xs">
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            {option.name}
            {option.required && <span className="text-amber-500 ml-0.5">*</span>}
          </label>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs w-32"
            min={option.values.length > 0 ? Number(option.values[0]) : undefined}
            max={
              option.values.length > 1
                ? Number(option.values[option.values.length - 1])
                : undefined
            }
          />
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === 'Yes' || value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'Yes' : 'No')}
            className="w-4 h-4 rounded border-[var(--neutral-300)] text-[var(--mw-yellow-500)] focus:ring-[var(--mw-yellow-400)]"
          />
          <label className="text-xs font-medium text-foreground">{option.name}</label>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            {option.name}
            {option.required && <span className="text-amber-500 ml-0.5">*</span>}
          </label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
            placeholder={`Enter ${option.name.toLowerCase()}...`}
          />
        </div>
      );

    default:
      return null;
  }
}
