/**
 * Searchable account picker grouped by Xero AccountType.
 *
 * Wraps the shared `Select` and renders each item as
 *   {Code} · {Name}                          [TYPE]
 * where TYPE is the Xero AccountType (REVENUE, EXPENSE, BANK, …).
 */
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import type {
  XeroAccount,
  XeroAccountClass,
  XeroAccountType,
} from '@/types/xero';

export interface AccountComboboxProps {
  accounts: XeroAccount[];
  /** Selected account Code. Empty string = unmapped. */
  value: string;
  onChange: (code: string) => void;
  filter?: {
    classes?: XeroAccountClass[];
    types?: XeroAccountType[];
    paymentsEnabled?: boolean;
  };
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TYPE_LABEL: Record<XeroAccountType, string> = {
  BANK: 'Bank',
  CURRENT: 'Current asset',
  CURRLIAB: 'Current liability',
  DEPRECIATN: 'Depreciation',
  DIRECTCOSTS: 'Direct costs',
  EQUITY: 'Equity',
  EXPENSE: 'Expense',
  FIXED: 'Fixed asset',
  INVENTORY: 'Inventory',
  LIABILITY: 'Liability',
  NONCURRENT: 'Non-current asset',
  OTHERINCOME: 'Other income',
  OVERHEADS: 'Overheads',
  PREPAYMENT: 'Prepayment',
  REVENUE: 'Revenue',
  SALES: 'Sales',
  TERMLIAB: 'Term liability',
  PAYG: 'PAYG',
  SUPERANNUATIONEXPENSE: 'Super expense',
  SUPERANNUATIONLIABILITY: 'Super liability',
  WAGESEXPENSE: 'Wages expense',
  WAGESPAYABLELIABILITY: 'Wages payable',
};

const TYPE_ORDER: XeroAccountType[] = [
  'REVENUE',
  'OTHERINCOME',
  'SALES',
  'DIRECTCOSTS',
  'INVENTORY',
  'EXPENSE',
  'OVERHEADS',
  'WAGESEXPENSE',
  'SUPERANNUATIONEXPENSE',
  'PAYG',
  'DEPRECIATN',
  'BANK',
  'CURRENT',
  'PREPAYMENT',
  'FIXED',
  'NONCURRENT',
  'CURRLIAB',
  'LIABILITY',
  'TERMLIAB',
  'WAGESPAYABLELIABILITY',
  'SUPERANNUATIONLIABILITY',
  'EQUITY',
];

export function AccountCombobox({
  accounts,
  value,
  onChange,
  filter,
  placeholder = 'Select account…',
  disabled,
  className,
}: AccountComboboxProps) {
  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      if (filter?.classes && !filter.classes.includes(acc.Class)) return false;
      if (filter?.types && !filter.types.includes(acc.Type)) return false;
      if (filter?.paymentsEnabled && !acc.EnablePaymentsToAccount) return false;
      return true;
    });
  }, [accounts, filter]);

  const grouped = useMemo(() => {
    const map = new Map<XeroAccountType, XeroAccount[]>();
    for (const acc of filtered) {
      const arr = map.get(acc.Type) ?? [];
      arr.push(acc);
      map.set(acc.Type, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.Code.localeCompare(b.Code));
    }
    const ordered: { type: XeroAccountType; accounts: XeroAccount[] }[] = [];
    for (const t of TYPE_ORDER) {
      const arr = map.get(t);
      if (arr && arr.length > 0) ordered.push({ type: t, accounts: arr });
    }
    return ordered;
  }, [filtered]);

  const selectedAccount = filtered.find((a) => a.Code === value);

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange(v)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('h-9 text-sm', className)}>
        <SelectValue placeholder={placeholder}>
          {selectedAccount ? (
            <span className="flex min-w-0 items-center gap-2">
              {selectedAccount.SystemAccount && (
                <Lock className="size-3 text-muted-foreground shrink-0" />
              )}
              <span className="font-mono text-xs text-muted-foreground shrink-0">
                {selectedAccount.Code}
              </span>
              <span className="truncate">{selectedAccount.Name}</span>
              <Badge
                variant="secondary"
                className="ml-auto shrink-0 rounded-full px-1.5 py-0 text-[10px] font-normal"
              >
                {TYPE_LABEL[selectedAccount.Type]}
              </Badge>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[360px] min-w-[420px]">
        {grouped.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No matching Xero accounts
          </div>
        ) : (
          grouped.map(({ type, accounts: accs }) => (
            <SelectGroup key={type}>
              <SelectLabel className="text-[10px] uppercase tracking-wider">
                {TYPE_LABEL[type]}
              </SelectLabel>
              {accs.map((acc) => (
                <SelectItem key={acc.AccountID} value={acc.Code}>
                  <span className="flex min-w-0 items-center gap-2">
                    {acc.SystemAccount && (
                      <Lock className="size-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-mono text-xs text-muted-foreground shrink-0 w-12">
                      {acc.Code}
                    </span>
                    <span className="truncate">{acc.Name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
