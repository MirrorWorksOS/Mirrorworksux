import type { MappingEntry, XeroAccount, XeroTaxRate } from '@/types/xero';
import { MappingRow } from '../MappingRow';
import { SectionShell } from './SectionShell';

export interface PurchasesSectionProps {
  entries: MappingEntry[];
  defaults: MappingEntry[];
  accounts: XeroAccount[];
  taxRates: XeroTaxRate[];
  onChangeEntry: (next: MappingEntry) => void;
  allMapped: boolean;
}

export function PurchasesSection({
  entries,
  defaults,
  accounts,
  taxRates,
  onChangeEntry,
  allMapped,
}: PurchasesSectionProps) {
  return (
    <SectionShell
      title="Purchases & costs"
      description="Where bill, expense, and PO costs post in Xero. Direct costs / inventory categories drive job costing."
      allMapped={allMapped}
    >
      {entries.map((e) => (
        <MappingRow
          key={e.sourceKey}
          entry={e}
          accounts={accounts}
          taxRates={taxRates}
          defaultEntry={defaults.find((d) => d.sourceKey === e.sourceKey)}
          onChange={onChangeEntry}
        />
      ))}
    </SectionShell>
  );
}
