import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TIERS, FEATURE_GATES, type TierName } from '@/lib/subscription';

const TIER_ORDER: TierName[] = ['Pilot', 'Produce', 'Expand', 'Excel'];

export function AdminTiers() {
  const [draftPrices, setDraftPrices] = useState<Record<TierName, { annual: number; monthly: number }>>(() => ({
    Pilot: { annual: TIERS.Pilot.priceAnnual, monthly: TIERS.Pilot.priceMonthly },
    Produce: { annual: TIERS.Produce.priceAnnual, monthly: TIERS.Produce.priceMonthly },
    Expand: { annual: TIERS.Expand.priceAnnual, monthly: TIERS.Expand.priceMonthly },
    Excel: { annual: TIERS.Excel.priceAnnual, monthly: TIERS.Excel.priceMonthly },
  }));

  const allFeatures = useMemo(() => {
    const rows: { module: string; feature: string; label: string; tiers: Record<TierName, boolean> }[] = [];
    for (const [moduleKey, gates] of Object.entries(FEATURE_GATES)) {
      for (const g of gates) rows.push({ module: moduleKey, ...g });
    }
    return rows;
  }, []);

  const handlePriceChange = (tier: TierName, key: 'annual' | 'monthly', raw: string) => {
    const next = Number(raw);
    if (Number.isNaN(next) || next < 0) return;
    setDraftPrices(prev => ({ ...prev, [tier]: { ...prev[tier], [key]: next } }));
  };

  const handleSave = () => {
    toast.success('Tier catalog saved (mock — edits are in-memory only).');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tier catalog</h1>
        <p className="mt-1 text-sm text-slate-400">Define pricing, user limits, and feature availability across all tenants.</p>
      </div>

      <Card className="bg-slate-900 p-6 text-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Pricing & limits</h2>
          <Button size="sm" onClick={handleSave}>Save changes</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {TIER_ORDER.map(tier => (
            <Card key={tier} className="bg-slate-950 p-4 text-slate-100">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{tier}</h3>
                <Badge variant="secondary">
                  {TIERS[tier].maxUsers === null ? 'Unlimited' : `${TIERS[tier].maxUsers} users`}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-400">Annual $/user/mo</Label>
                  <Input
                    type="number" min={0}
                    value={draftPrices[tier].annual}
                    onChange={e => handlePriceChange(tier, 'annual', e.target.value)}
                    className="bg-slate-900 text-slate-100"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Monthly $/user/mo</Label>
                  <Input
                    type="number" min={0}
                    value={draftPrices[tier].monthly}
                    onChange={e => handlePriceChange(tier, 'monthly', e.target.value)}
                    className="bg-slate-900 text-slate-100"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="bg-slate-900 p-6 text-slate-100">
        <h2 className="mb-4 text-base font-semibold">Feature availability</h2>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400">Module</TableHead>
              <TableHead className="text-slate-400">Feature</TableHead>
              {TIER_ORDER.map(t => (
                <TableHead key={t} className="text-center text-slate-400">{t}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allFeatures.map(row => (
              <TableRow key={`${row.module}-${row.feature}`} className="border-slate-800">
                <TableCell className="text-slate-300">{row.module}</TableCell>
                <TableCell className="text-slate-100">{row.label}</TableCell>
                {TIER_ORDER.map(t => (
                  <TableCell key={t} className="text-center">
                    <Switch
                      checked={row.tiers[t]}
                      onCheckedChange={() => toast('Feature-gate edits require backend (mock-only).')}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
