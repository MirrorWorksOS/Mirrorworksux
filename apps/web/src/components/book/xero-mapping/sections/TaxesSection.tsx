/**
 * Tax codes section — MW tax codes mapped to a Xero TaxType.
 * Two columns: sales-direction codes on the left, purchases on the right.
 */
import type { MappingEntry, XeroAccount, XeroTaxRate } from '@/types/xero';
import { ArrowRight, Lock } from 'lucide-react';
import { TaxRateCombobox } from '../TaxRateCombobox';
import { SectionShell } from './SectionShell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface TaxesSectionProps {
  entries: MappingEntry[];
  defaults: MappingEntry[];
  /** Used as a placeholder for symmetry with other sections. */
  accounts: XeroAccount[];
  taxRates: XeroTaxRate[];
  onChangeEntry: (next: MappingEntry) => void;
  allMapped: boolean;
}

interface RowProps {
  entry: MappingEntry;
  taxRates: XeroTaxRate[];
  onChange: (next: MappingEntry) => void;
}

function TaxRow({ entry, taxRates, onChange }: RowProps) {
  const isMapped = (entry.xeroTaxType ?? '') !== '';
  const requiredUnmapped = entry.required && !isMapped;
  return (
    <div
      className={
        'flex flex-wrap items-center gap-3 rounded-[var(--shape-md)] border px-3 py-2.5 transition-colors ' +
        (requiredUnmapped
          ? 'bg-[var(--mw-error)]/5 border-[var(--mw-error)]/25'
          : 'bg-background border-[var(--border)]')
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {entry.sourceLabel}
          </span>
          {entry.required && (
            <span className="text-[10px] uppercase tracking-wider text-[var(--mw-error)] font-semibold">
              Required
            </span>
          )}
        </div>
        {entry.sourceDescription && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {entry.sourceDescription}
          </p>
        )}
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-[240px] basis-[240px]">
        <TaxRateCombobox
          taxRates={taxRates}
          value={entry.xeroTaxType ?? ''}
          onChange={(t) => onChange({ ...entry, xeroTaxType: t })}
          direction={entry.taxDirection}
        />
      </div>
    </div>
  );
}

export function TaxesSection({
  entries,
  taxRates,
  onChangeEntry,
  allMapped,
}: TaxesSectionProps) {
  const sales = entries.filter((e) => e.taxDirection === 'sales');
  const purch = entries.filter((e) => e.taxDirection === 'purchases');
  const both = entries.filter((e) => e.taxDirection === undefined);

  return (
    <SectionShell
      title="Tax codes"
      description="Map MirrorWorks tax codes to Xero TaxTypes. Used on every pushed invoice and bill line."
      allMapped={allMapped}
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-[11px] text-muted-foreground">
              <Lock className="size-3" /> AU defaults
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Country code AU — Xero exposes country-specific TaxType enums.
          </TooltipContent>
        </Tooltip>
      }
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sales
          </h3>
          {sales.map((e) => (
            <TaxRow key={e.sourceKey} entry={e} taxRates={taxRates} onChange={onChangeEntry} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Purchases
          </h3>
          {purch.map((e) => (
            <TaxRow key={e.sourceKey} entry={e} taxRates={taxRates} onChange={onChangeEntry} />
          ))}
        </div>
      </div>
      {both.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Other
          </h3>
          {both.map((e) => (
            <TaxRow key={e.sourceKey} entry={e} taxRates={taxRates} onChange={onChangeEntry} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
