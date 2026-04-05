/**
 * RuleBuilder — IF/THEN visual logic panel for defining configuration rules.
 * Appears as a tab in the right panel when a node or the product is selected.
 */

import React, { useState } from 'react';
import {
  Plus,
  Zap,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { useProductBuilderStore } from '@/store/productBuilderStore';
import { RuleCard } from './RuleCard';
import type {
  ProductRule,
  RuleOperator,
  RuleActionType,
  ConditionGroupType,
} from './product-studio-types';
import {
  RULE_OPERATOR_LABELS,
  RULE_ACTION_LABELS,
} from './product-studio-types';

export function RuleBuilder() {
  const {
    getActiveProduct,
    selectedNodeId,
    addRule,
    updateRule,
    removeRule,
  } = useProductBuilderStore();

  const product = getActiveProduct();
  const [isCreating, setIsCreating] = useState(false);

  // New rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newField, setNewField] = useState('');
  const [newOperator, setNewOperator] = useState<RuleOperator>('equals');
  const [newValue, setNewValue] = useState('');
  const [newActionType, setNewActionType] = useState<RuleActionType>('add_component');
  const [newActionValue, setNewActionValue] = useState('');
  const [newGroupType, setNewGroupType] = useState<ConditionGroupType>('and');

  if (!product) return null;

  // Collect all option field names across nodes for the condition field dropdown
  const allFields = Array.from(
    new Set(
      product.nodes.flatMap((n) => n.options.map((o) => o.name)),
    ),
  );

  // Filter rules to show: all if no node selected, or only rules for selected node
  const filteredRules = selectedNodeId
    ? product.rules.filter((r) => r.nodeId === selectedNodeId)
    : product.rules;

  const handleCreateRule = () => {
    if (!newRuleName.trim() || !newField.trim()) return;

    const rule: ProductRule = {
      id: `rule-${Math.random().toString(36).slice(2, 10)}`,
      name: newRuleName,
      nodeId: selectedNodeId || product.nodes[0]?.id || '',
      conditionGroups: [
        {
          id: `cg-${Math.random().toString(36).slice(2, 10)}`,
          type: newGroupType,
          conditions: [
            {
              id: `c-${Math.random().toString(36).slice(2, 10)}`,
              field: newField,
              operator: newOperator,
              value: newValue,
            },
          ],
        },
      ],
      actions: [
        {
          id: `a-${Math.random().toString(36).slice(2, 10)}`,
          type: newActionType,
          target: selectedNodeId || '',
          value: newActionValue,
        },
      ],
      caseStatements: [],
      priority: filteredRules.length + 1,
      enabled: true,
    };
    addRule(rule);

    // Reset form
    setNewRuleName('');
    setNewField('');
    setNewOperator('equals');
    setNewValue('');
    setNewActionType('add_component');
    setNewActionValue('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neutral-200)] dark:border-[var(--neutral-800)]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--mw-yellow-500)]" />
          <h3 className="text-sm font-semibold text-foreground">Configuration Rules</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreating(!isCreating)}
          className="h-7 text-xs gap-1"
        >
          <Plus className="w-3 h-3" />
          New Rule
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {/* Info callout */}
        {filteredRules.length === 0 && !isCreating && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">No rules yet</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                Rules let you automate product configuration. For example: "When material is Stainless, add certified welding."
              </p>
            </div>
          </div>
        )}

        {/* Create rule form */}
        {isCreating && (
          <div className="rounded-xl border-2 border-dashed border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/5 p-3 space-y-3">
            <p className="text-xs font-semibold text-foreground">Create New Rule</p>

            <Input
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              placeholder="Rule name (e.g., Heavy load requires thicker steel)"
              className="h-8 text-xs"
            />

            {/* Condition section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">WHEN</p>
              <div className="flex gap-1.5">
                <Select value={newField} onValueChange={setNewField}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allFields.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">
                        {f}
                      </SelectItem>
                    ))}
                    <SelectItem value="Quantity" className="text-xs">Quantity</SelectItem>
                    <SelectItem value="Price" className="text-xs">Price</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newOperator} onValueChange={(v) => setNewOperator(v as RuleOperator)}>
                  <SelectTrigger className="h-8 text-xs w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(RULE_OPERATOR_LABELS) as [RuleOperator, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value..."
                className="h-8 text-xs"
              />
            </div>

            {/* Action section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">THEN</p>
              <Select value={newActionType} onValueChange={(v) => setNewActionType(v as RuleActionType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(RULE_ACTION_LABELS) as [RuleActionType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={newActionValue}
                onChange={(e) => setNewActionValue(e.target.value)}
                placeholder="Action detail (e.g., +$15 per shelf)"
                className="h-8 text-xs"
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateRule}
                disabled={!newRuleName.trim() || !newField.trim()}
                className="h-8 text-xs"
              >
                Create Rule
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing rules */}
        {filteredRules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onUpdate={updateRule}
            onRemove={removeRule}
          />
        ))}
      </div>
    </div>
  );
}
