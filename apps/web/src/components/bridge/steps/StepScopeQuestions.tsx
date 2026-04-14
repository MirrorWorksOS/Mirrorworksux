/**
 * Step 2 (Path C only) — "Tell us about your shop"
 * Slider-based scoping for pen & paper users.
 * Matches PLAT 01 §3.4.1 Scoping Questions.
 */
import { useState } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { cn } from '@/components/ui/utils';
import { Button } from '@/components/ui/button';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

// Q1, Q2: generic count labels (§3.4.1 rows 1–2)
const countLabels: Record<number, string> = {
  0: 'Just a few (1–5)',
  1: 'Some (6–20)',
  2: 'Lots (21–100)',
  3: 'Heaps (100+)',
};

// Q3: machine-specific labels (§3.4.1 row 3)
const machineLabels: Record<number, string> = {
  0: '1',
  1: '2–5',
  2: '6–15',
  3: '16–50',
  4: '50+',
};

// Q5: team size labels matching StepWorkspace.tsx pattern (§3.4.1 row 5)
const teamSizeLabels: Record<number, string> = {
  0: 'Just me',
  1: '2–5',
  2: '6–15',
  3: '16–50',
  4: '51–200',
  5: '200+',
};

const supplierOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'no', label: 'No' },
] as const;

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const;

const inventoryOptions = [
  { value: 'yes', label: 'Yes, formally' },
  { value: 'roughly', label: 'Roughly' },
  { value: 'no', label: 'No' },
] as const;

// Q8: work types matching StepTools.tsx pattern (§3.4.1 row 8)
const workTypeOptions = [
  'Laser cutting',
  'Bending',
  'Welding',
  'Assembly',
  'Finishing',
  'CNC machining',
  'Other',
];

function SliderQuestion({
  label,
  value,
  onChange,
  labels,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  labels: Record<number, string>;
  max: number;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-2xl font-bold text-foreground">{labels[value]}</p>
      <Slider min={0} max={max} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function CardSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all',
              value === opt.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background hover:border-foreground/30'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepScopeQuestions() {
  const { scopeAnswers, setScopeAnswers, goToNextStep, goToPreviousStep } = useBridge();

  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState(0);
  const [machines, setMachines] = useState(0);
  const [teamSize, setTeamSize] = useState(0);
  const [suppliers, setSuppliers] = useState<'yes' | 'no' | 'sometimes'>(scopeAnswers.hasSuppliers);
  const [openWork, setOpenWork] = useState<'yes' | 'no'>(scopeAnswers.hasOpenWork);
  const [inventory, setInventory] = useState<'yes' | 'roughly' | 'no'>(scopeAnswers.tracksInventory);
  const [workTypes, setWorkTypes] = useState<string[]>(scopeAnswers.workTypes);

  const showTemplateBanner = customers === 3 || products === 3;

  const toggleWorkType = (type: string) => {
    setWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleContinue = () => {
    setScopeAnswers({
      customerCount: countLabels[customers],
      productCount: countLabels[products],
      machineCount: machineLabels[machines],
      teamSize: teamSizeLabels[teamSize],
      hasSuppliers: suppliers,
      hasOpenWork: openWork,
      tracksInventory: inventory,
      workTypes,
    });
    goToNextStep();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Tell us about your shop</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us set up only what you need — you can always add more later.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Nothing here imports data by itself — it only tunes what we suggest on the next steps. You can leave and come
          back; your answers are saved for this session.
        </p>
      </div>

      {showTemplateBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--mw-info)]/20 bg-[var(--mw-info-light)] p-4">
          <AlertCircle className="w-5 h-5 text-[var(--mw-info)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--mw-info)]">Got a lot?</p>
            <p className="text-sm text-[var(--mw-info)]">
              Download our template and upload it instead — it's faster for large lists.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <SliderQuestion label="How many customers do you work with regularly?" value={customers} onChange={setCustomers} labels={countLabels} max={3} />
        <SliderQuestion label="How many different products or parts do you make?" value={products} onChange={setProducts} labels={countLabels} max={3} />
        <SliderQuestion label="How many machines are on your shop floor?" value={machines} onChange={setMachines} labels={machineLabels} max={4} />
        <SliderQuestion label="How many people work in your shop (including yourself)?" value={teamSize} onChange={setTeamSize} labels={teamSizeLabels} max={5} />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <CardSelect label="Do you buy materials from regular suppliers?" options={supplierOptions} value={suppliers} onChange={setSuppliers} />
        <CardSelect label="Do you have any open quotes or jobs right now?" options={yesNoOptions} value={openWork} onChange={setOpenWork} />
        <CardSelect label="Do you currently track materials inventory?" options={inventoryOptions} value={inventory} onChange={setInventory} />
      </div>

      {/* Q8: Work types — multi-select chips matching StepTools.tsx pattern */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">What types of work does your shop do?</Label>
        <div className="flex gap-2 flex-wrap">
          {workTypeOptions.map((type) => {
            const selected = workTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleWorkType(type)}
                className={cn(
                  'rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2',
                  selected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:border-foreground/30'
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center text-xs shrink-0',
                  selected ? 'border-background bg-background text-foreground' : 'border-muted-foreground/40'
                )}>
                  {selected && '✓'}
                </span>
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" className="h-12 min-h-[48px]" onClick={goToPreviousStep}>
          Back
        </Button>
        <BridgeSegmentedSkipPrimary
          order="skip-first"
          skipLabel="Skip for now"
          primaryLabel="Continue"
          onSkip={goToNextStep}
          onPrimary={handleContinue}
          skipTooltip="Continue with default shop profile answers. You can refine these later in settings."
          primaryTooltip="Save your answers and go to the next step."
        />
      </div>
    </div>
  );
}
