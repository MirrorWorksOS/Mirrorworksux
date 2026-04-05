/**
 * RuleCard — a single IF/THEN rule block in the Logic Panel.
 * Visual, draggable rule card with conditions and actions.
 */

import React, { useState } from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Play,
  ToggleLeft,
  ToggleRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import type {
  ProductRule,
  ConditionGroup,
  RuleCondition,
  RuleAction,
} from './product-studio-types';
import {
  RULE_OPERATOR_LABELS,
  RULE_ACTION_LABELS,
} from './product-studio-types';

interface RuleCardProps {
  rule: ProductRule;
  onUpdate: (id: string, updates: Partial<ProductRule>) => void;
  onRemove: (id: string) => void;
}

export function RuleCard({ rule, onUpdate, onRemove }: RuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [testResult, setTestResult] = useState<'pass' | 'fail' | null>(null);

  const handleToggleEnabled = () => {
    onUpdate(rule.id, { enabled: !rule.enabled });
  };

  const handleTestRule = () => {
    // Simulate a test — in a real app this would evaluate the rule against sample values
    setTestResult(Math.random() > 0.3 ? 'pass' : 'fail');
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all duration-200',
        rule.enabled
          ? 'border-[var(--neutral-200)] dark:border-[var(--neutral-700)]'
          : 'border-dashed border-[var(--neutral-300)] dark:border-[var(--neutral-600)] opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="cursor-grab active:cursor-grabbing text-[var(--neutral-400)] hover:text-foreground transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {rule.name}
        </span>

        {/* Test result indicator */}
        {testResult && (
          <Badge
            variant={testResult === 'pass' ? 'default' : 'destructive'}
            className={cn(
              'text-[10px] gap-1',
              testResult === 'pass' && 'bg-emerald-500',
            )}
          >
            {testResult === 'pass' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            {testResult === 'pass' ? 'Pass' : 'Fail'}
          </Badge>
        )}

        <Badge variant="outline" className="text-[10px]">
          P{rule.priority}
        </Badge>

        <button
          onClick={handleToggleEnabled}
          className={cn(
            'transition-colors',
            rule.enabled ? 'text-emerald-500' : 'text-[var(--neutral-400)]',
          )}
          title={rule.enabled ? 'Disable rule' : 'Enable rule'}
        >
          {rule.enabled ? (
            <ToggleRight className="w-5 h-5" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Conditions */}
          {rule.conditionGroups.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                  WHEN
                </span>
                {group.conditions.length > 1 && (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {group.type}
                  </Badge>
                )}
              </div>
              {group.conditions.map((condition, ci) => (
                <div key={condition.id} className="flex items-center gap-1.5 pl-4">
                  {ci > 0 && (
                    <span className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase w-7">
                      {group.type}
                    </span>
                  )}
                  <div className="flex-1 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      {condition.field}
                    </span>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400">
                      {RULE_OPERATOR_LABELS[condition.operator]}
                    </span>
                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                      {condition.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Actions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              THEN
            </span>
            {rule.actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-1.5 pl-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-lg px-2.5 py-1.5"
              >
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {RULE_ACTION_LABELS[action.type]}
                </span>
                {action.value && (
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                    {action.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Case statements */}
          {rule.caseStatements.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                CASES
              </span>
              {rule.caseStatements.map((cs) => (
                <div
                  key={cs.id}
                  className="flex items-center gap-1.5 pl-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-lg px-2.5 py-1.5"
                >
                  <span className="text-[10px] font-semibold text-purple-500 uppercase">IS</span>
                  <span className="text-xs font-semibold text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">
                    {cs.whenValue}
                  </span>
                  <span className="text-[10px] text-purple-500">then</span>
                  <span className="text-xs text-purple-700 dark:text-purple-300">
                    {RULE_ACTION_LABELS[cs.action.type]} {cs.action.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-[var(--neutral-100)] dark:border-[var(--neutral-800)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestRule}
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <Play className="w-3 h-3" />
              Test Rule
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(rule.id)}
              className="h-7 text-xs gap-1 text-[var(--error)] hover:text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
