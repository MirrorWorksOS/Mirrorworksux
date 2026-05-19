/**
 * Single mapping row — MW source on the left, account combobox + (optional)
 * tax-rate combobox + status dot + kebab on the right.
 *
 * Visual idiom borrowed from FieldMappingRow (bridge wizard) — green
 * background when mapped, soft red tint when required-and-unmapped, lock
 * icon for system rows.
 */
import { ArrowRight, MoreHorizontal, RotateCcw, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';
import type { MappingEntry, XeroAccount, XeroTaxRate } from '@/types/xero';
import { AccountCombobox } from './AccountCombobox';
import { TaxRateCombobox } from './TaxRateCombobox';

export interface MappingRowProps {
  entry: MappingEntry;
  accounts: XeroAccount[];
  taxRates: XeroTaxRate[];
  defaultEntry?: MappingEntry;
  onChange: (next: MappingEntry) => void;
  /** Hide the tax column entirely (Bank section). */
  hideTax?: boolean;
}

export function MappingRow({
  entry,
  accounts,
  taxRates,
  defaultEntry,
  onChange,
  hideTax,
}: MappingRowProps) {
  const isMapped = entry.xeroAccountCode !== '';
  const requiredUnmapped = entry.required && !isMapped;
  const system = !!entry.system;

  return (
    <div
      className={cn(
        'group flex flex-wrap items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
        system
          ? 'bg-[var(--neutral-100)]/50 border-[var(--border)] opacity-90'
          : requiredUnmapped
            ? 'bg-[var(--mw-error)]/5 border-[var(--mw-error)]/25'
            : isMapped
              ? 'bg-background border-[var(--border)]'
              : 'bg-background border-[var(--border)] border-dashed',
      )}
    >
      {/* Source label */}
      <div className="min-w-0 flex-[1.2] basis-[40%]">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {entry.sourceLabel}
          </span>
          {entry.required && !system && (
            <span className="text-[10px] uppercase tracking-wider text-[var(--mw-error)] font-semibold">
              Required
            </span>
          )}
          {system && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Lock className="size-3" /> System
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                Managed by Xero — cannot be remapped
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {entry.sourceDescription && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {entry.sourceDescription}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />

      {/* Account picker */}
      <div className="min-w-0 flex-[1.4] basis-[44%]">
        <AccountCombobox
          accounts={accounts}
          value={entry.xeroAccountCode}
          onChange={(code) => onChange({ ...entry, xeroAccountCode: code })}
          filter={entry.accountFilter}
          disabled={system}
          placeholder={system ? 'Managed by Xero' : 'Select account…'}
        />
      </div>

      {/* Tax rate picker */}
      {!hideTax && (
        <div className="min-w-[200px] basis-[200px]">
          {entry.taxDirection !== undefined ||
          entry.xeroTaxType !== undefined ? (
            <TaxRateCombobox
              taxRates={taxRates}
              value={entry.xeroTaxType ?? ''}
              onChange={(t) => onChange({ ...entry, xeroTaxType: t })}
              direction={entry.taxDirection}
              disabled={system}
            />
          ) : (
            <div className="h-9" />
          )}
        </div>
      )}

      {/* Status + kebab */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              aria-label={
                system
                  ? 'System account'
                  : requiredUnmapped
                    ? 'Required and unmapped'
                    : isMapped
                      ? 'Mapped'
                      : 'Optional, not mapped'
              }
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                system
                  ? 'bg-[var(--neutral-400)]'
                  : requiredUnmapped
                    ? 'bg-[var(--mw-warning)]'
                    : isMapped
                      ? 'bg-[var(--mw-mirage)]'
                      : 'bg-[var(--neutral-300)]',
              )}
            />
          </TooltipTrigger>
          <TooltipContent side="top">
            {system
              ? 'Managed by Xero'
              : requiredUnmapped
                ? 'Required — please map an account'
                : isMapped
                  ? 'Mapped'
                  : 'Optional — leave to skip'}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="Row actions"
              disabled={system}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {defaultEntry && (
              <DropdownMenuItem
                onSelect={() =>
                  onChange({
                    ...entry,
                    xeroAccountCode: defaultEntry.xeroAccountCode,
                    xeroTaxType: defaultEntry.xeroTaxType,
                  })
                }
              >
                <RotateCcw className="mr-2 size-4" />
                Reset to default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() =>
                onChange({ ...entry, xeroAccountCode: '', xeroTaxType: '' })
              }
            >
              <X className="mr-2 size-4" />
              Clear mapping
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
