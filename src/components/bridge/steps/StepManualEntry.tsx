/**
 * Step 5 (Path C) — Guided manual data entry for pen & paper users.
 */
import { useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { Button } from '@/components/ui/button';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/ui/utils';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';

// Guided entry order per PLAT 01 §3.4.2
const ENTITY_FORMS: { key: string; label: string; fields: { name: string; label: string; required?: boolean; placeholder?: string }[] }[] = [
  {
    key: 'machines',
    label: 'Machines & work centres',
    fields: [
      { name: 'name', label: 'Machine name', required: true, placeholder: 'e.g. Trumpf TruLaser 3030' },
      { name: 'type', label: 'Machine type', required: true, placeholder: 'e.g. Laser cutter' },
      { name: 'manufacturer', label: 'Manufacturer', placeholder: 'e.g. Trumpf' },
      { name: 'model', label: 'Model', placeholder: 'e.g. TruLaser 3030' },
    ],
  },
  {
    key: 'materials',
    label: 'Materials & inventory',
    fields: [
      { name: 'name', label: 'Material name', required: true, placeholder: 'e.g. Mild Steel 3mm sheet' },
      { name: 'unit_of_measure', label: 'Unit of measure', required: true, placeholder: 'e.g. sheet, metre, kg' },
      { name: 'category', label: 'Category', placeholder: 'e.g. Sheet metal, Fasteners' },
      { name: 'reorder_point', label: 'Reorder point', placeholder: 'e.g. 10' },
    ],
  },
  {
    key: 'suppliers',
    label: 'Suppliers & vendors',
    fields: [
      { name: 'name', label: 'Company name', required: true, placeholder: 'e.g. Metal Supplies Co' },
      { name: 'contact', label: 'Contact name', placeholder: 'e.g. Dave Wilson' },
      { name: 'email', label: 'Email', placeholder: 'e.g. dave@metalsupplies.com.au' },
      { name: 'phone', label: 'Phone', placeholder: 'e.g. (03) 9555 1234' },
    ],
  },
  {
    key: 'customers',
    label: 'Customers & contacts',
    fields: [
      { name: 'name', label: 'Company name', required: true, placeholder: 'e.g. Ace Fabrication' },
      { name: 'contact', label: 'Contact name', placeholder: 'e.g. Sarah Chen' },
      { name: 'email', label: 'Email', placeholder: 'e.g. sarah@acefab.com' },
      { name: 'phone', label: 'Phone', placeholder: 'e.g. (03) 9555 1234' },
    ],
  },
  {
    key: 'products',
    label: 'Products & BoMs',
    fields: [
      { name: 'part_number', label: 'Part number', required: true, placeholder: 'e.g. BKT-001' },
      { name: 'name', label: 'Description', required: true, placeholder: 'e.g. Mounting bracket 90deg' },
      { name: 'material', label: 'Primary material', placeholder: 'e.g. Mild Steel 3mm' },
      { name: 'price', label: 'Unit price', placeholder: 'e.g. 24.50' },
    ],
  },
  {
    key: 'employees',
    label: 'Employees & operators',
    fields: [
      { name: 'first_name', label: 'First name', required: true, placeholder: 'e.g. Mike' },
      { name: 'last_name', label: 'Last name', required: true, placeholder: 'e.g. Torres' },
      { name: 'role', label: 'Job title / role', placeholder: 'e.g. CNC Operator' },
      { name: 'email', label: 'Email', placeholder: 'e.g. mike@company.com' },
    ],
  },
  {
    key: 'transactions',
    label: 'Open transactions',
    fields: [
      { name: 'type', label: 'Type', required: true, placeholder: 'e.g. Quote, Job, Invoice, PO' },
      { name: 'number', label: 'Reference number', required: true, placeholder: 'e.g. Q-2024-001' },
      { name: 'customer', label: 'Customer', placeholder: 'e.g. Ace Fabrication' },
      { name: 'value', label: 'Value', placeholder: 'e.g. 4,500.00' },
    ],
  },
];

export function StepManualEntry() {
  const { goToNextStep, goToPreviousStep } = useBridge();
  const [currentEntityIndex, setCurrentEntityIndex] = useState(0);
  const [records, setRecords] = useState<Record<string, Record<string, string>[]>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});

  const entity = ENTITY_FORMS[currentEntityIndex];
  const entityRecords = records[entity.key] || [];
  const isLastEntity = currentEntityIndex === ENTITY_FORMS.length - 1;

  const handleAdd = () => {
    const hasRequired = entity.fields
      .filter((f) => f.required)
      .every((f) => formData[f.name]?.trim());
    if (!hasRequired) return;

    setRecords((prev) => ({
      ...prev,
      [entity.key]: [...(prev[entity.key] || []), { ...formData }],
    }));
    setFormData({});
  };

  const handleRemove = (index: number) => {
    setRecords((prev) => ({
      ...prev,
      [entity.key]: (prev[entity.key] || []).filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (isLastEntity) {
      goToNextStep();
    } else {
      setCurrentEntityIndex((i) => i + 1);
      setFormData({});
    }
  };

  const totalEntered = Object.values(records).reduce((acc, r) => acc + r.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Set up your {entity.label.toLowerCase()}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your {entity.label.toLowerCase()} one at a time, or skip to add later.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar progress */}
        <div className="hidden sm:block w-48 shrink-0 space-y-2">
          {ENTITY_FORMS.map((e, i) => {
            const count = (records[e.key] || []).length;
            const isCurrent = i === currentEntityIndex;
            const isDone = i < currentEntityIndex;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => { setCurrentEntityIndex(i); setFormData({}); }}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                  isCurrent && 'bg-[#FFCF4B]/10 font-medium text-foreground',
                  isDone && 'text-[var(--mw-success)]',
                  !isCurrent && !isDone && 'text-muted-foreground'
                )}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : <span className="w-4 h-4 text-center">{i + 1}</span>}
                <span>{e.label}</span>
                {count > 0 && <span className="ml-auto text-xs text-muted-foreground">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {entity.fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-sm">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Input
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="h-10"
                />
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add {entity.label.slice(0, -1).toLowerCase()}
          </Button>

          {/* Records table */}
          {entityRecords.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {entity.fields.map((f) => (
                      <th key={f.name} className="px-3 py-2 text-left font-medium text-muted-foreground">{f.label}</th>
                    ))}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {entityRecords.map((record, idx) => (
                    <tr key={idx} className="border-t">
                      {entity.fields.map((f) => (
                        <td key={f.name} className="px-3 py-2">{record[f.name] || '—'}</td>
                      ))}
                      <td className="px-2 py-2">
                        <button type="button" onClick={() => handleRemove(idx)} className="text-muted-foreground hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          className="h-12 min-h-[48px]"
          onClick={currentEntityIndex > 0 ? () => { setCurrentEntityIndex((i) => i - 1); setFormData({}); } : goToPreviousStep}
        >
          Back
        </Button>
        <BridgeSegmentedSkipPrimary
          order="skip-first"
          skipLabel="Skip for now"
          primaryLabel={
            isLastEntity ? 'Review' : `Next: ${ENTITY_FORMS[currentEntityIndex + 1].label}`
          }
          onSkip={handleNext}
          onPrimary={handleNext}
          skipTooltip={
            isLastEntity
              ? 'Open the review step without adding more rows for this section.'
              : `Move on to ${ENTITY_FORMS[currentEntityIndex + 1].label.toLowerCase()} without saving this form.`
          }
          primaryTooltip={
            isLastEntity
              ? 'Open the review step for everything you entered so far.'
              : `Continue to ${ENTITY_FORMS[currentEntityIndex + 1].label.toLowerCase()}.`
          }
        />
      </div>
    </div>
  );
}
