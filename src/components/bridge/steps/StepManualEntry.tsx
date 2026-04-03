/**
 * Guided manual data entry (PLAT 01). Machines include optional connectivity for shop-floor / networking setup.
 */
import { useState, useRef, useEffect } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { Button } from '@/components/ui/button';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/components/ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { ChevronDown, Plus, Trash2, CheckCircle, Check, ChevronsUpDown } from 'lucide-react';

type FieldDef = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: 'input' | 'combobox';
  options?: { value: string; label: string }[];
  /** Allow user to create new options that aren't in the predefined list */
  allowCreate?: boolean;
  searchPlaceholder?: string;
  /** Returns a dynamic placeholder based on current form state */
  dynamicPlaceholder?: (formData: Record<string, string>) => string;
};

type EntityFormDef = {
  key: string;
  label: string;
  fields: FieldDef[];
};

// ─── Material categories with profile-specific dimension hints ────────────────

type MaterialCategory = {
  value: string;
  label: string;
  dimensionHint: string;
};

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  { value: 'sheet_metal',        label: 'Sheet metal',              dimensionHint: 'e.g. 3mm × 1200 × 2400mm' },
  { value: 'coil',               label: 'Coil',                     dimensionHint: 'e.g. 1.6mm × 1200mm wide' },
  { value: 'plate',              label: 'Plate',                    dimensionHint: 'e.g. 10mm × 2400 × 6000mm' },
  { value: 'rhs',                label: 'RHS (Rectangular Hollow)', dimensionHint: 'e.g. 75 × 50 × 3mm × 6.5m' },
  { value: 'shs',                label: 'SHS (Square Hollow)',      dimensionHint: 'e.g. 50 × 50 × 3mm × 6.5m' },
  { value: 'chs',                label: 'CHS (Circular Hollow)',    dimensionHint: 'e.g. 48.3 OD × 3.2mm × 6.5m' },
  { value: 'flat_bar',           label: 'Flat bar',                 dimensionHint: 'e.g. 50 × 5mm × 6m' },
  { value: 'round_bar',          label: 'Round bar',                dimensionHint: 'e.g. 20mm dia × 6m' },
  { value: 'angle',              label: 'Angle',                    dimensionHint: 'e.g. 50 × 50 × 5mm × 6m' },
  { value: 'channel',            label: 'Channel (PFC)',            dimensionHint: 'e.g. 100 PFC × 6m' },
  { value: 'ub',                 label: 'UB (Universal Beam)',      dimensionHint: 'e.g. 200UB25.4 × 12m' },
  { value: 'uc',                 label: 'UC (Universal Column)',    dimensionHint: 'e.g. 150UC23.4 × 12m' },
  { value: 'pipe',               label: 'Pipe',                     dimensionHint: 'e.g. DN50 × 3.2mm × 6m' },
  { value: 'tube',               label: 'Tube',                     dimensionHint: 'e.g. 25.4 OD × 1.6mm × 6m' },
  { value: 'mesh',               label: 'Mesh',                     dimensionHint: 'e.g. 5mm wire × 100mm centres' },
  { value: 'grating',            label: 'Grating',                  dimensionHint: 'e.g. 32 × 5mm bar × 40mm pitch' },
  { value: 'fasteners',          label: 'Fasteners',                dimensionHint: 'e.g. M12 × 50mm' },
  { value: 'welding_consumables',label: 'Welding consumables',      dimensionHint: 'e.g. 1.0mm × 15kg spool' },
  { value: 'abrasives',          label: 'Abrasives',                dimensionHint: 'e.g. 125mm × 6mm' },
  { value: 'paint_coatings',     label: 'Paint & coatings',         dimensionHint: 'e.g. 20L' },
];

const CATEGORY_OPTIONS = MATERIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

// ─── Employee groups / departments ────────────────────────────────────────────

const EMPLOYEE_GROUPS: { value: string; label: string }[] = [
  { value: 'production',    label: 'Production' },
  { value: 'fabrication',   label: 'Fabrication' },
  { value: 'welding',       label: 'Welding' },
  { value: 'cnc_machining', label: 'CNC / Machining' },
  { value: 'laser_cutting', label: 'Laser cutting' },
  { value: 'finishing',     label: 'Finishing & painting' },
  { value: 'quality',       label: 'Quality control' },
  { value: 'engineering',   label: 'Engineering / Design' },
  { value: 'maintenance',   label: 'Maintenance' },
  { value: 'dispatch',      label: 'Dispatch / Shipping' },
  { value: 'purchasing',    label: 'Purchasing' },
  { value: 'sales',         label: 'Sales' },
  { value: 'estimating',    label: 'Estimating' },
  { value: 'admin',         label: 'Office / Admin' },
  { value: 'management',    label: 'Management' },
];

function formatCustomValue(val: string | undefined): string {
  if (!val) return '';
  if (!val.startsWith('custom_')) return val;
  return val.slice(7).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDimensionPlaceholder(formData: Record<string, string>): string {
  const match = MATERIAL_CATEGORIES.find((c) => c.value === formData.category);
  return match?.dimensionHint ?? 'Select a category first';
}

// ─── Combobox field (Popover + Command) ───────────────────────────────────────

function ComboboxField({
  value,
  onChange,
  options: defaultOptions,
  placeholder,
  allowCreate = false,
  searchPlaceholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  allowCreate?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customOptions, setCustomOptions] = useState<{ value: string; label: string }[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  const allOptions = [...defaultOptions.filter((o) => o.value !== 'other'), ...customOptions];

  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const selected = allOptions.find((o) => o.value === value);
  const trimmed = search.trim();
  const exactMatch = trimmed
    ? allOptions.some((o) => o.label.toLowerCase() === trimmed.toLowerCase())
    : true;
  const showCreate = allowCreate && trimmed.length > 0 && !exactMatch;

  const handleCreate = () => {
    const newValue = `custom_${trimmed.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomOptions((prev) => {
      if (prev.some((o) => o.value === newValue)) return prev;
      return [...prev, { value: newValue, label: trimmed }];
    });
    onChange(newValue);
    setSearch('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs',
            'hover:bg-[var(--neutral-50)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className="truncate">{selected ? selected.label : (placeholder ?? 'Select…')}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={triggerWidth ? { width: triggerWidth } : undefined}
      >
        <Command shouldFilter={true}>
          <CommandInput
            placeholder={searchPlaceholder ?? 'Search…'}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {allowCreate ? (
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-sm flex items-center gap-2"
                  onMouseDown={(e) => { e.preventDefault(); handleCreate(); }}
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  Create &ldquo;{trimmed}&rdquo;
                </button>
              ) : (
                'No match found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {allOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? '' : option.value);
                    setSearch('');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-3.5 w-3.5',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreate && (
              <CommandGroup forceMount>
                <CommandItem
                  value={`__create__${trimmed}`}
                  onSelect={handleCreate}
                  className="text-muted-foreground"
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Create &ldquo;{trimmed}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Optional fields aligned with shop-floor connectivity (see Confluence machine networking spec). */
const MACHINE_CONNECTIVITY_FIELDS: {
  name: string;
  label: string;
  placeholder?: string;
}[] = [
  {
    name: 'integration_context',
    label: 'Integration or protocol',
    placeholder: 'e.g. OPC-UA, OEM cloud API, edge gateway',
  },
  {
    name: 'network_identifier',
    label: 'Network identifier',
    placeholder: 'e.g. Hostname, IP, or device ID',
  },
  {
    name: 'connectivity_notes',
    label: 'Connectivity notes',
    placeholder: 'e.g. Static IP, VLAN, firewall rules pending',
  },
];

// Guided entry order per PLAT 01 §3.4.2
const ENTITY_FORMS: EntityFormDef[] = [
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
      { name: 'category', label: 'Category', type: 'combobox', options: CATEGORY_OPTIONS, allowCreate: true, searchPlaceholder: 'Search or create category…', placeholder: 'Select category…' },
      { name: 'dimensions', label: 'Dimensions', dynamicPlaceholder: getDimensionPlaceholder },
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
      { name: 'group', label: 'Group', type: 'combobox', options: EMPLOYEE_GROUPS, allowCreate: true, searchPlaceholder: 'Search or create group…', placeholder: 'Select group…' },
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

function getDisplayedFields(entity: EntityFormDef) {
  if (entity.key === 'machines') {
    return [
      ...entity.fields,
      { name: 'network_planned', label: 'Live data planned' },
      ...MACHINE_CONNECTIVITY_FIELDS,
    ];
  }
  return entity.fields;
}

export function StepManualEntry() {
  const { goToNextStep, goToPreviousStep } = useBridge();
  const [currentEntityIndex, setCurrentEntityIndex] = useState(0);
  const [records, setRecords] = useState<Record<string, Record<string, string>[]>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [connectivityOpen, setConnectivityOpen] = useState(false);

  const entity = ENTITY_FORMS[currentEntityIndex];
  const displayedFields = getDisplayedFields(entity);
  const entityRecords = records[entity.key] || [];
  const isLastEntity = currentEntityIndex === ENTITY_FORMS.length - 1;
  const isMachines = entity.key === 'machines';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Set up your {entity.label.toLowerCase()}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your {entity.label.toLowerCase()} one at a time, or skip to add later.
        </p>
      </div>

      <div className="flex gap-6">
        <div className="hidden sm:block w-48 shrink-0 space-y-2">
          {ENTITY_FORMS.map((e, i) => {
            const count = (records[e.key] || []).length;
            const isCurrent = i === currentEntityIndex;
            const isDone = i < currentEntityIndex;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => {
                  setCurrentEntityIndex(i);
                  setFormData({});
                }}
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

        <div className="flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {entity.fields.map((field) => {
              const placeholder = field.dynamicPlaceholder
                ? field.dynamicPlaceholder(formData)
                : field.placeholder;

              return (
                <div key={field.name} className="space-y-1.5">
                  <Label className="text-sm">
                    {field.label}
                    {field.required && <span className="text-[var(--mw-error)] ml-0.5">*</span>}
                  </Label>
                  {field.type === 'combobox' && field.options ? (
                    <ComboboxField
                      value={formData[field.name] || ''}
                      onChange={(val) => setFormData((prev) => ({ ...prev, [field.name]: val }))}
                      options={field.options}
                      placeholder={placeholder}
                      allowCreate={field.allowCreate}
                      searchPlaceholder={field.searchPlaceholder}
                    />
                  ) : (
                    <Input
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={placeholder}
                      className="h-10"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {isMachines && (
            <Collapsible open={connectivityOpen} onOpenChange={setConnectivityOpen}>
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-[var(--neutral-100)] transition-colors"
              >
                <span>Connectivity (optional)</span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 transition-transform', connectivityOpen && 'rotate-180')}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  If this machine will send data to MirrorWorks (network, OEM cloud, or shop-floor device), capture
                  details now or add them later in Control → Machines.
                </p>
                <div className="flex items-start gap-3 rounded-lg border border-[var(--neutral-200)] bg-white p-4">
                  <Checkbox
                    id="network_planned"
                    checked={formData.network_planned === 'yes'}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        network_planned: checked === true ? 'yes' : '',
                      }))
                    }
                    className="mt-0.5"
                  />
                  <Label htmlFor="network_planned" className="text-sm font-normal leading-snug cursor-pointer">
                    Plan to connect this machine for live data (networked device, cloud API, or edge gateway)
                  </Label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {MACHINE_CONNECTIVITY_FIELDS.map((field) => (
                    <div key={field.name} className="space-y-1.5 sm:col-span-2">
                      <Label className="text-sm">{field.label}</Label>
                      <Input
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="h-10"
                      />
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add {entity.label.slice(0, -1).toLowerCase()}
          </Button>

          {entityRecords.length > 0 && (() => {
            const recordColumns: MwColumnDef<Record<string, string>>[] = [
              ...displayedFields.map((f) => ({
                key: f.name,
                header: f.label,
                className: 'whitespace-nowrap max-w-[12rem] truncate',
                cell: (record: Record<string, string>) => {
                  if (f.name === 'network_planned') {
                    return record.network_planned === 'yes' ? 'Yes' : '—';
                  }
                  if (f.name === 'category' && entity.key === 'materials') {
                    const cat = MATERIAL_CATEGORIES.find((c) => c.value === record.category);
                    return cat?.label || formatCustomValue(record[f.name]) || '—';
                  }
                  if (f.name === 'group' && entity.key === 'employees') {
                    const grp = EMPLOYEE_GROUPS.find((g) => g.value === record.group);
                    return grp?.label || formatCustomValue(record[f.name]) || '—';
                  }
                  return record[f.name] || '—';
                },
              })),
              {
                key: '_delete',
                header: '',
                headerClassName: 'w-10',
                cell: (_record: Record<string, string>, idx: number) => (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-muted-foreground hover:text-[var(--mw-error)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ),
              },
            ];
            return (
              <MwDataTable
                columns={recordColumns}
                data={entityRecords}
                keyExtractor={(_r, i) => String(i)}
              />
            );
          })()}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          className="h-12 min-h-[48px]"
          onClick={
            currentEntityIndex > 0
              ? () => {
                  setCurrentEntityIndex((i) => i - 1);
                  setFormData({});
                }
              : goToPreviousStep
          }
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
