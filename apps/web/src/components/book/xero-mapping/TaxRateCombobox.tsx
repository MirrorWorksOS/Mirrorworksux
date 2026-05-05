/**
 * Tax-rate picker, filtered by direction (sales / purchases) using
 * Xero's CanApplyToRevenue / CanApplyToExpenses flags.
 */
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import type { XeroTaxRate } from '@/types/xero';

export interface TaxRateComboboxProps {
  taxRates: XeroTaxRate[];
  value: string;
  onChange: (taxType: string) => void;
  direction?: 'sales' | 'purchases';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TaxRateCombobox({
  taxRates,
  value,
  onChange,
  direction,
  placeholder = 'No tax',
  disabled,
  className,
}: TaxRateComboboxProps) {
  const filtered = useMemo(() => {
    if (!direction) return taxRates;
    return taxRates.filter((t) =>
      direction === 'sales' ? t.CanApplyToRevenue : t.CanApplyToExpenses,
    );
  }, [taxRates, direction]);

  const selected = filtered.find((t) => t.TaxType === value);

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange(v)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('h-9 text-sm', className)}>
        <SelectValue placeholder={placeholder}>
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{selected.Name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {selected.EffectiveRate}%
              </span>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[280px] min-w-[280px]">
        {filtered.map((rate) => (
          <SelectItem key={rate.TaxType} value={rate.TaxType}>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{rate.Name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {rate.EffectiveRate}%
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
