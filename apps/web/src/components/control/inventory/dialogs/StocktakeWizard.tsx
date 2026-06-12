/**
 * Stocktake wizard — location → count → review → approve.
 * Step shell salvaged from the retired ControlInventory page, now wired
 * to inventoryService (expected counts from the live ledger; Approve
 * produces real `adjust` movements via applyStocktake). The location
 * step is skipped when storage locations are disabled in settings.
 */
import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/ui/utils';
import { inventoryService } from '@/services';
import type { InventorySettings, StockLocation } from '@/types/entities';

type StocktakeStep = 'location' | 'count' | 'review' | 'approve';

interface StocktakeCount {
  productId: string;
  name: string;
  sku: string;
  expected: number;
  counted: number | null;
  unitCost: number;
}

interface StocktakeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: StockLocation[];
  settings: InventorySettings;
  onDone: () => void;
}

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function StocktakeWizard({
  open, onOpenChange, locations, settings, onDone,
}: StocktakeWizardProps) {
  const locationsEnabled = settings.storageLocationsEnabled;
  const stockLocations = useMemo(
    () => locations.filter((l) => l.kind !== 'scrap'),
    [locations],
  );

  const steps: { key: StocktakeStep; label: string }[] = useMemo(
    () => [
      ...(locationsEnabled ? [{ key: 'location' as const, label: 'Select Location' }] : []),
      { key: 'count', label: 'Count' },
      { key: 'review', label: 'Review' },
      { key: 'approve', label: 'Approve' },
    ],
    [locationsEnabled],
  );

  const [step, setStep] = useState<StocktakeStep>(steps[0].key);
  const [selectedLocationId, setSelectedLocationId] = useState(stockLocations[0]?.id ?? '');
  const [counts, setCounts] = useState<StocktakeCount[]>([]);
  const [busy, setBusy] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const initCounts = async (locationId?: string) => {
    const rows = await inventoryService.listLedger(
      locationsEnabled ? { locationId } : {},
    );
    setCounts(rows.map((r) => ({
      productId: r.product.id,
      name: r.product.description,
      sku: r.product.sku ?? r.product.partNumber,
      expected: r.qtyOnHand,
      counted: null,
      unitCost: r.unitCost,
    })));
  };

  const resetWizard = () => {
    setStep(steps[0].key);
    setCounts([]);
  };

  const handleNext = async () => {
    if (step === 'location') {
      await initCounts(selectedLocationId);
      setStep('count');
    } else if (step === 'count') {
      setStep('review');
    } else if (step === 'review') {
      setStep('approve');
    } else {
      setBusy(true);
      try {
        const { movements, varianceValue } = await inventoryService.applyStocktake({
          locationId: locationsEnabled ? selectedLocationId : undefined,
          counts: counts
            .filter((c) => c.counted !== null)
            .map((c) => ({ productId: c.productId, countedQty: c.counted! })),
        });
        toast.success(
          movements.length === 0
            ? 'Stocktake approved — no discrepancies'
            : `Stocktake approved — ${movements.length} adjustment${movements.length !== 1 ? 's' : ''} (${formatCurrency(varianceValue)} impact)`,
        );
        onOpenChange(false);
        resetWizard();
        onDone();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Stocktake failed');
      } finally {
        setBusy(false);
      }
    }
  };

  const handleBack = () => {
    const previous = steps[currentStepIndex - 1];
    if (previous) setStep(previous.key);
  };

  const handleOpenChange = async (next: boolean) => {
    onOpenChange(next);
    if (next && !locationsEnabled) {
      // No location step — load counts straight away.
      await initCounts();
      setStep('count');
    }
    if (!next) resetWizard();
  };

  const updateCount = (productId: string, value: number) => {
    setCounts((prev) => prev.map((c) => (c.productId === productId ? { ...c, counted: value } : c)));
  };

  const discrepancies = counts.filter((c) => c.counted !== null && c.counted !== c.expected);
  const totalVarianceValue = discrepancies.reduce(
    (sum, d) => sum + ((d.counted ?? 0) - d.expected) * d.unitCost,
    0,
  );

  const selectedLocation = stockLocations.find((l) => l.id === selectedLocationId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Stocktake</DialogTitle>
          <DialogDescription>
            Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.label}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 transition-colors',
                i <= currentStepIndex ? 'bg-[var(--mw-yellow-400)] text-primary-foreground' : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[var(--neutral-500)]',
              )}>
                {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 rounded-full transition-colors',
                  i < currentStepIndex ? 'bg-[var(--mw-yellow-400)]' : 'bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]',
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {step === 'location' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Location</Label>
              <div className="grid grid-cols-2 gap-2">
                {stockLocations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={cn(
                      'px-3 py-2 rounded-md border text-sm text-left transition-colors',
                      selectedLocationId === loc.id
                        ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10 text-foreground'
                        : 'border-[var(--neutral-200)] dark:border-[var(--border)] text-[var(--neutral-600)] hover:border-[var(--neutral-400)]',
                    )}
                  >
                    <span className="font-medium">{loc.code}</span>
                    <span className="block text-xs text-[var(--neutral-500)]">{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'count' && (
            <div className="space-y-3">
              {locationsEnabled && (
                <p className="text-sm text-[var(--neutral-500)]">
                  Location: <span className="font-medium text-foreground">{selectedLocation?.code}</span>
                </p>
              )}
              {counts.length === 0 ? (
                <p className="text-sm text-[var(--neutral-500)] py-6 text-center">No items found at this location.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {counts.map((c) => (
                    <div key={c.productId} className="flex items-center gap-3 bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/50 rounded-md p-3 border border-[var(--neutral-200)] dark:border-[var(--border)]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-xs text-[var(--neutral-500)]">{c.sku} · Expected: {c.expected}</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        className="w-24 h-10 text-right tabular-nums"
                        placeholder="Count"
                        value={c.counted ?? ''}
                        onChange={(e) => updateCount(c.productId, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--neutral-500)]">
                {discrepancies.length === 0 ? 'No discrepancies found.' : `${discrepancies.length} discrepancies found.`}
              </p>
              {discrepancies.length > 0 && (
                <>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {discrepancies.map((d) => {
                      const variance = (d.counted ?? 0) - d.expected;
                      const valueImpact = variance * d.unitCost;
                      return (
                        <div key={d.productId} className="flex items-center justify-between bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/50 rounded-md p-3 border border-[var(--neutral-200)] dark:border-[var(--border)]">
                          <div>
                            <p className="text-sm font-medium text-foreground">{d.name}</p>
                            <p className="text-xs text-[var(--neutral-500)]">Expected: {d.expected} / Counted: {d.counted}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn('text-sm font-medium tabular-nums', variance > 0 ? 'text-[var(--mw-success)]' : 'text-[var(--mw-error)]')}>
                              {variance > 0 ? '+' : ''}{variance}
                            </p>
                            <p className="text-xs text-[var(--neutral-500)] tabular-nums">{formatCurrency(valueImpact)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--neutral-200)] dark:border-[var(--border)]">
                    <span className="text-sm text-[var(--neutral-500)]">Total value impact</span>
                    <span className={cn('text-sm font-bold tabular-nums', totalVarianceValue >= 0 ? 'text-[var(--mw-success)]' : 'text-[var(--mw-error)]')}>
                      {totalVarianceValue >= 0 ? '+' : ''}{formatCurrency(totalVarianceValue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'approve' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--mw-success-light)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[var(--mw-success)]" />
              </div>
              <p className="text-sm font-medium text-foreground">Ready to approve</p>
              <p className="text-sm text-[var(--neutral-500)]">
                {counts.filter((c) => c.counted !== null).length} of {counts.length} items counted
                {locationsEnabled && selectedLocation ? ` at ${selectedLocation.code}` : ''}.
                {discrepancies.length > 0 && ` ${discrepancies.length} discrepancies (${formatCurrency(totalVarianceValue)} impact).`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStepIndex > 0 && (
            <Button variant="outline" className="gap-1 rounded-full" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <div className="flex-1" />
          <Button
            className="gap-1 rounded-full bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleNext}
            disabled={busy}
          >
            {step === 'approve' ? 'Approve & Save' : 'Next'}
            {step !== 'approve' && <ChevronRight className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
