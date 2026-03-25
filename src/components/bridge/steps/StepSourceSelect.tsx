import { useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { cn } from '@/components/ui/utils';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import {
  Table2,
  Database,
  Calculator,
  Server,
  PenLine,
} from 'lucide-react';
import type { SourceSystem } from '@/types/bridge';

interface SourceOption {
  id: SourceSystem;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SOURCE_OPTIONS: SourceOption[] = [
  {
    id: 'spreadsheets',
    label: 'Spreadsheets',
    description: 'Excel or CSV files with your business data',
    icon: <Table2 className="w-5 h-5" />,
  },
  {
    id: 'jobboss',
    label: 'JobBOSS',
    description: 'Export from JobBOSS / E2 JobBOSS',
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 'e2shop',
    label: 'E2 Shop System',
    description: 'Export from Shoptech E2',
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 'fulcrum',
    label: 'Fulcrum Pro',
    description: 'Export from Fulcrum Pro ERP',
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 'acumatica',
    label: 'Acumatica',
    description: 'Export from Acumatica Cloud ERP',
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 'odoo',
    label: 'Odoo',
    description: 'Export from Odoo ERP',
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 'xero',
    label: 'Xero',
    description: 'Connect your Xero accounting',
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    id: 'other_erp',
    label: 'Other ERP',
    description: 'Export from another system not listed',
    icon: <Server className="w-5 h-5" />,
  },
  {
    id: 'pen_paper',
    label: 'Pen & paper',
    description: "We'll help you enter everything from scratch",
    icon: <PenLine className="w-5 h-5" />,
  },
];

export function StepSourceSelect() {
  const { sourceSystem, selectSource } = useBridge();
  const [selected, setSelected] = useState<SourceSystem | null>(sourceSystem);

  const handleContinue = () => {
    if (!selected) return;
    selectSource(selected);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Where is your data coming from?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll guide you through bringing your data into MirrorWorks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SOURCE_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={cn(
                'relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                'hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-foreground bg-background shadow-sm'
                  : 'border-border bg-background hover:border-foreground/30'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-foreground'
                    : 'border-muted-foreground/40'
                )}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-muted-foreground">{option.icon}</span>
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <BridgeSegmentedSkipPrimary
          order="skip-first"
          skipLabel="Skip for now"
          primaryLabel="Continue"
          onSkip={() => selectSource('spreadsheets')}
          onPrimary={handleContinue}
          primaryDisabled={!selected}
          skipTooltip="Start with spreadsheets as your source. You can change this later."
          primaryTooltip="Confirm your data source and continue the import wizard."
          primaryDisabledTooltip="Select where your data is coming from to continue."
        />
      </div>
    </div>
  );
}
