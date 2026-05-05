import type { MappingEntry, XeroAccount, XeroTaxRate } from '@/types/xero';
import { MappingRow } from '../MappingRow';
import { SectionShell } from './SectionShell';

export interface SalesSectionProps {
  entries: MappingEntry[];
  defaults: MappingEntry[];
  accounts: XeroAccount[];
  taxRates: XeroTaxRate[];
  onChangeEntry: (next: MappingEntry) => void;
  allMapped: boolean;
}

export function SalesSection({
  entries,
  defaults,
  accounts,
  taxRates,
  onChangeEntry,
  allMapped,
}: SalesSectionProps) {
  return (
    <SectionShell
      title="Sales accounts"
      description="Where invoice line revenue posts in Xero. Per-category rows override the default."
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
