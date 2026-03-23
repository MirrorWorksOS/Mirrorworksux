import React from 'react';
import { CheckCircle2, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GroupPermissionSet } from './types';

interface PermissionGridRow {
  key: keyof GroupPermissionSet;
  label: string;
  grantedBy: string[];
}

interface PermissionGridProps {
  resolved: GroupPermissionSet;
  grantedBy: Record<keyof GroupPermissionSet, string[]>;
}

const labels: Array<{ key: keyof GroupPermissionSet; label: string }> = [
  { key: 'documents.scope', label: 'View records scope' },
  { key: 'quotes.create', label: 'Create quotes' },
  { key: 'orders.create', label: 'Create orders' },
  { key: 'jobs.assign', label: 'Assign jobs' },
  { key: 'quality.approve', label: 'Approve quality checks' },
  { key: 'maintenance.schedule', label: 'Schedule maintenance' },
  { key: 'reports.access', label: 'Access reports' },
  { key: 'settings.access', label: 'Access settings' },
];

export function PermissionGrid({ resolved, grantedBy }: PermissionGridProps) {
  const rows: PermissionGridRow[] = labels.map(item => ({
    key: item.key,
    label: item.label,
    grantedBy: grantedBy[item.key] ?? [],
  }));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-0">
        {rows.map((row, idx) => {
          const value = resolved[row.key];
          const isScope = row.key === 'documents.scope';
          const striped = idx % 2 === 1;
          const grantText = row.grantedBy.length > 0 ? `Granted by: ${row.grantedBy.join(', ')}` : '';

          return (
            <div
              key={row.key}
              className={`grid min-h-10 grid-cols-[1fr_auto] items-center gap-3 rounded-md px-3 ${striped ? 'bg-[var(--neutral-100)]' : 'bg-transparent'}`}
            >
              <p className="text-sm text-[var(--neutral-800)]">{row.label}</p>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)]">
                      {isScope ? (
                        <span>{value === 'all' ? 'All records' : 'Own records'}</span>
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
                  {!isScope && grantText ? <TooltipContent>{grantText}</TooltipContent> : null}
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
