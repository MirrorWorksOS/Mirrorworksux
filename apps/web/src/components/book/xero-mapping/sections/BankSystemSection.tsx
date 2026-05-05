import type { MappingEntry, XeroAccount, XeroTaxRate } from '@/types/xero';
import { MappingRow } from '../MappingRow';
import { SectionShell } from './SectionShell';

export interface BankSystemSectionProps {
  entries: MappingEntry[];
  defaults: MappingEntry[];
  accounts: XeroAccount[];
  taxRates: XeroTaxRate[];
  onChangeEntry: (next: MappingEntry) => void;
  allMapped: boolean;
}

export function BankSystemSection({
  entries,
  defaults,
  accounts,
  taxRates,
  onChangeEntry,
  allMapped,
}: BankSystemSectionProps) {
  const banks = entries.filter((e) => e.sourceKey.startsWith('bank.'));
  const system = entries.filter((e) => e.sourceKey.startsWith('system.'));

  return (
    <div className="space-y-6">
      <SectionShell
        title="Bank accounts"
        description="Where MirrorWorks records customer receipts and bill payments."
        allMapped={banks.every((e) => !e.required || e.xeroAccountCode)}
      >
        {banks.map((e) => (
          <MappingRow
            key={e.sourceKey}
            entry={e}
            accounts={accounts}
            taxRates={taxRates}
            defaultEntry={defaults.find((d) => d.sourceKey === e.sourceKey)}
            onChange={onChangeEntry}
            hideTax={e.sourceKey === 'bank.receipts' || e.sourceKey === 'bank.payments'}
          />
        ))}
      </SectionShell>

      <SectionShell
        title="System accounts"
        description="Locked accounts managed by Xero. Shown for reference — they cannot be remapped."
        allMapped={allMapped && system.length > 0}
      >
        {system.map((e) => (
          <MappingRow
            key={e.sourceKey}
            entry={e}
            accounts={accounts}
            taxRates={taxRates}
            onChange={onChangeEntry}
            hideTax
          />
        ))}
      </SectionShell>
    </div>
  );
}
