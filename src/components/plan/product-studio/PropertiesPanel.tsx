/**
 * PropertiesPanel — node properties editor in the right panel.
 * Editable fields: name, SKU, description, type, options, pricing, constraints.
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  DollarSign,
  Hash,
  Sliders,
  FileText,
  Tag,
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
import type {
  ProductNode,
  ProductNodeType,
  ProductOption,
  OptionType,
} from './product-studio-types';
import {
  NODE_TYPE_LABELS,
  NODE_TYPE_COLORS,
  NODE_TYPE_TEXT,
} from './product-studio-types';

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 first:pt-0">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">{children}</label>
  );
}

export function PropertiesPanel() {
  const {
    getActiveProduct,
    selectedNodeId,
    updateNode,
    removeNode,
  } = useProductBuilderStore();

  const product = getActiveProduct();
  const node = product?.nodes.find((n) => n.id === selectedNodeId);

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">No product loaded</p>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-2 max-w-[200px]">
          <div className="w-12 h-12 rounded-xl bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-[var(--neutral-400)]" />
          </div>
          <p className="text-sm font-medium text-foreground">Select a node</p>
          <p className="text-xs text-muted-foreground">
            Click on a node in the canvas to view and edit its properties.
          </p>
        </div>
      </div>
    );
  }

  return <NodeEditor key={node.id} node={node} />;
}

// ── Node Editor (inner component for stable key) ──────────────────────────────

function NodeEditor({ node }: { node: ProductNode }) {
  const { updateNode, removeNode } = useProductBuilderStore();

  const [localName, setLocalName] = useState(node.name);
  const [localSku, setLocalSku] = useState(node.sku);
  const [localDesc, setLocalDesc] = useState(node.description);
  const [localQty, setLocalQty] = useState(node.quantity);
  const [localBasePrice, setLocalBasePrice] = useState(node.pricing.basePrice);
  const [localPerUnit, setLocalPerUnit] = useState(node.pricing.perUnit);
  const [localFormula, setLocalFormula] = useState(node.pricing.formula);
  const [localMinQty, setLocalMinQty] = useState(node.constraints.minQuantity);
  const [localMaxQty, setLocalMaxQty] = useState(node.constraints.maxQuantity);
  const [localRequired, setLocalRequired] = useState(node.constraints.required);

  // New option form
  const [showNewOption, setShowNewOption] = useState(false);
  const [newOptName, setNewOptName] = useState('');
  const [newOptType, setNewOptType] = useState<OptionType>('dropdown');
  const [newOptValues, setNewOptValues] = useState('');
  const [newOptDefault, setNewOptDefault] = useState('');

  const commitField = (field: string, value: any) => {
    updateNode(node.id, { [field]: value });
  };

  const handleAddOption = () => {
    if (!newOptName.trim()) return;
    const opt: ProductOption = {
      id: `opt-${Math.random().toString(36).slice(2, 10)}`,
      name: newOptName,
      type: newOptType,
      values: newOptValues.split(',').map((v) => v.trim()).filter(Boolean),
      defaultValue: newOptDefault,
      required: false,
    };
    updateNode(node.id, { options: [...node.options, opt] });
    setNewOptName('');
    setNewOptType('dropdown');
    setNewOptValues('');
    setNewOptDefault('');
    setShowNewOption(false);
  };

  const handleRemoveOption = (optId: string) => {
    updateNode(node.id, { options: node.options.filter((o) => o.id !== optId) });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
        <div className="flex items-center gap-2">
          <div className={cn('w-2.5 h-2.5 rounded-full', NODE_TYPE_COLORS[node.type])} />
          <h3 className="text-sm font-semibold text-foreground truncate">{node.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeNode(node.id)}
          className="h-7 text-xs gap-1 text-[var(--error)] hover:text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1" style={{ scrollbarWidth: 'thin' }}>
        {/* Basic Info */}
        <SectionHeading icon={FileText} label="Details" />
        <div className="space-y-2.5">
          <div className="space-y-1">
            <FieldLabel>Name</FieldLabel>
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={() => commitField('name', localName)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>SKU / Part Number</FieldLabel>
            <Input
              value={localSku}
              onChange={(e) => setLocalSku(e.target.value)}
              onBlur={() => commitField('sku', localSku)}
              className="h-8 text-xs font-mono"
              placeholder="e.g., BRK-001"
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              onBlur={() => commitField('description', localDesc)}
              className="w-full min-h-[60px] rounded-xl border border-input bg-input-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y transition-[border-color,box-shadow] duration-200"
              placeholder="Describe this item..."
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Type</FieldLabel>
            <Select
              value={node.type}
              onValueChange={(v) => updateNode(node.id, { type: v as ProductNodeType })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(NODE_TYPE_LABELS) as [ProductNodeType, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <FieldLabel>Quantity</FieldLabel>
            <Input
              type="number"
              value={localQty}
              onChange={(e) => setLocalQty(Number(e.target.value))}
              onBlur={() => commitField('quantity', localQty)}
              className="h-8 text-xs w-24"
              min={0}
            />
          </div>
        </div>

        {/* Options */}
        <SectionHeading icon={Sliders} label="Configurable Options" />
        <div className="space-y-2">
          {node.options.length === 0 && !showNewOption && (
            <p className="text-xs text-muted-foreground italic">
              No options defined. Add options to make this item configurable.
            </p>
          )}
          {node.options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-start gap-2 p-2 rounded-lg bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)] border border-[var(--neutral-200)] dark:border-[var(--neutral-800)]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">{opt.name}</span>
                  <Badge variant="outline" className="text-[9px]">
                    {opt.type}
                  </Badge>
                  {opt.required && (
                    <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600 dark:text-amber-400">
                      Required
                    </Badge>
                  )}
                </div>
                {opt.values.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {opt.values.map((v, i) => (
                      <span
                        key={i}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-muted-foreground',
                          v === opt.defaultValue && 'ring-1 ring-[var(--mw-yellow-400)] font-medium text-foreground',
                        )}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveOption(opt.id)}
                className="text-[var(--neutral-400)] hover:text-[var(--error)] transition-colors mt-0.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {showNewOption ? (
            <div className="rounded-lg border-2 border-dashed border-[var(--mw-yellow-400)] p-2.5 space-y-2">
              <Input
                value={newOptName}
                onChange={(e) => setNewOptName(e.target.value)}
                placeholder="Option name (e.g., Material)"
                className="h-7 text-xs"
              />
              <Select value={newOptType} onValueChange={(v) => setNewOptType(v as OptionType)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dropdown" className="text-xs">Dropdown</SelectItem>
                  <SelectItem value="number" className="text-xs">Number</SelectItem>
                  <SelectItem value="checkbox" className="text-xs">Checkbox</SelectItem>
                  <SelectItem value="text" className="text-xs">Text</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newOptValues}
                onChange={(e) => setNewOptValues(e.target.value)}
                placeholder="Values (comma-separated)"
                className="h-7 text-xs"
              />
              <Input
                value={newOptDefault}
                onChange={(e) => setNewOptDefault(e.target.value)}
                placeholder="Default value"
                className="h-7 text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddOption} className="h-7 text-xs" disabled={!newOptName.trim()}>
                  Add
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewOption(false)} className="h-7 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewOption(true)}
              className="h-7 text-xs gap-1 w-full"
            >
              <Plus className="w-3 h-3" />
              Add Option
            </Button>
          )}
        </div>

        {/* Pricing */}
        <SectionHeading icon={DollarSign} label="Pricing" />
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel>Base Price ($)</FieldLabel>
              <Input
                type="number"
                value={localBasePrice}
                onChange={(e) => setLocalBasePrice(Number(e.target.value))}
                onBlur={() => updateNode(node.id, { pricing: { ...node.pricing, basePrice: localBasePrice } })}
                className="h-8 text-xs"
                min={0}
                step={0.01}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel>Per Unit ($)</FieldLabel>
              <Input
                type="number"
                value={localPerUnit}
                onChange={(e) => setLocalPerUnit(Number(e.target.value))}
                onBlur={() => updateNode(node.id, { pricing: { ...node.pricing, perUnit: localPerUnit } })}
                className="h-8 text-xs"
                min={0}
                step={0.01}
              />
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel>Formula / Notes</FieldLabel>
            <Input
              value={localFormula}
              onChange={(e) => setLocalFormula(e.target.value)}
              onBlur={() => updateNode(node.id, { pricing: { ...node.pricing, formula: localFormula } })}
              className="h-8 text-xs"
              placeholder="e.g., Base + qty * $12.50"
            />
          </div>
        </div>

        {/* Constraints */}
        <SectionHeading icon={Hash} label="Constraints" />
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel>Min Quantity</FieldLabel>
              <Input
                type="number"
                value={localMinQty}
                onChange={(e) => setLocalMinQty(Number(e.target.value))}
                onBlur={() => updateNode(node.id, { constraints: { ...node.constraints, minQuantity: localMinQty } })}
                className="h-8 text-xs"
                min={0}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel>Max Quantity</FieldLabel>
              <Input
                type="number"
                value={localMaxQty}
                onChange={(e) => setLocalMaxQty(Number(e.target.value))}
                onBlur={() => updateNode(node.id, { constraints: { ...node.constraints, maxQuantity: localMaxQty } })}
                className="h-8 text-xs"
                min={0}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localRequired}
              onChange={(e) => {
                setLocalRequired(e.target.checked);
                updateNode(node.id, { constraints: { ...node.constraints, required: e.target.checked } });
              }}
              className="w-4 h-4 rounded border-[var(--neutral-300)] text-[var(--mw-yellow-500)] focus:ring-[var(--mw-yellow-400)]"
            />
            <FieldLabel>Required in assembly</FieldLabel>
          </div>
        </div>
      </div>
    </div>
  );
}
