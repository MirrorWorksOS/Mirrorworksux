import { CheckCircle2, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { modulePermissionLabels } from './mock-data';
import type { GroupPermissionSet, ModuleKey, ScopeValue } from './types';

const SCOPE_KEYS = new Set<string>([
  'documents.scope',
  'pipeline.visibility',
  'workorders.scope',
  'timers.scope',
  'orders.scope',
  'requisitions.scope',
  'expenses.scope',
]);

interface PermissionGridProps {
  module: ModuleKey;
  resolved: GroupPermissionSet;
  grantedBy: Record<string, string[]>;
}

function isScopeKey(key: string): boolean {
  return SCOPE_KEYS.has(key);
}

function formatScopeValue(
  key: keyof GroupPermissionSet,
  value: ScopeValue | boolean | undefined,
): string {
  if (value === 'all') return 'All records';
  if (value === 'own') return 'Own records';
  if (key === 'documents.scope') return 'Own records';
  return 'Own';
}

export function PermissionGrid({ module, resolved, grantedBy }: PermissionGridProps) {
  const entries = modulePermissionLabels[module];
  const rows: { key: keyof GroupPermissionSet; label: string }[] = [
    { key: 'documents.scope', label: 'Document visibility' },
    ...entries.map(e => ({ key: e.key, label: e.label })),
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-0">
        {rows.map((row, idx) => {
          const value = resolved[row.key];
          const scope = isScopeKey(row.key as string);
          const striped = idx % 2 === 1;
          const g = grantedBy[row.key as string] ?? [];
          const grantText = g.length > 0 ? `Granted by: ${g.join(', ')}` : '';

          return (
            <div
              key={String(row.key)}
              className={`grid min-h-10 grid-cols-[1fr_auto] items-center gap-3 rounded-md px-3 ${striped ? 'bg-[var(--neutral-100)]' : 'bg-transparent'}`}
            >
              <p className="text-sm text-[var(--neutral-800)]">{row.label}</p>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)]">
                      {scope ? (
                        <span>{formatScopeValue(row.key, value as ScopeValue)}</span>
                      ) : value ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-[var(--mw-mirage)]" />
                          <span className="text-[var(--mw-mirage)]">Enabled</span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-4 w-4 text-[var(--neutral-200)]" />
                          <span>Off</span>
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  {!scope && grantText ? <TooltipContent>{grantText}</TooltipContent> : null}
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
