/**
 * Reorder Rules admin — Phase B3 surface. Shows each product reorder
 * rule alongside current on-hand + the gap to reorderPoint, plus a
 * "Run monitor now" CTA that fires the cron mutation manually.
 *
 * Also lists the most-recent replenishment Jobs so customers see the
 * monitor's output.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Warehouse, RefreshCw, ArrowLeft } from 'lucide-react';
import * as mock from '@/services/mock';
import { workflowService } from '@/services/workflowService';
import type { Job } from '@/types/entities';

export function ReorderRulesPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [, force] = useState(0);
  const [busy, setBusy] = useState(false);
  const [replenJobs, setReplenJobs] = useState<Job[]>([]);

  useEffect(() => {
    setReplenJobs(
      mock.jobs.filter((j) => j.source === 'replenishment').slice(-12).reverse(),
    );
  }, [reloadKey]);

  const runMonitor = async () => {
    setBusy(true);
    try {
      const created = await workflowService.runReorderMonitor();
      toast.success(
        created.length === 0
          ? 'No rules tripped — every catalogued product is above its reorder point.'
          : `Created ${created.length} replenishment Job(s).`,
      );
      setReloadKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/plan" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Plan
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reorder Rules</h1>
          <p className="text-sm text-muted-foreground">
            Per-product replenishment thresholds. The monitor fires on a cron
            (here it's manual) and creates Make-to-Stock Jobs against the{' '}
            <em>Stock</em> pseudo-customer.
          </p>
        </div>
        <Button onClick={runMonitor} disabled={busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> Run monitor now
        </Button>
      </div>

      <Card className="p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-1.5">Product</th>
              <th className="py-1.5">On hand</th>
              <th className="py-1.5">Reorder point</th>
              <th className="py-1.5">Reorder qty</th>
              <th className="py-1.5">Lead (d)</th>
              <th className="py-1.5">Shortage</th>
              <th className="py-1.5">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {mock.productReorderRules.map((rule) => {
              const product = mock.products.find((p) => p.id === rule.productId);
              const onHand = mock.inventoryRecords
                .filter((i) => i.productId === rule.productId)
                .reduce((s, i) => s + i.qtyOnHand - i.qtyReserved, 0);
              const below = onHand < rule.reorderPoint;
              return (
                <tr key={rule.id} className="border-t">
                  <td className="py-1.5">
                    <div className="font-medium">{product?.partNumber ?? rule.productId}</div>
                    <div className="text-xs text-muted-foreground">{product?.description}</div>
                  </td>
                  <td className={`py-1.5 ${below ? 'text-rose-700' : ''}`}>
                    <span className="font-medium">{onHand}</span>
                    <input
                      type="number"
                      className="ml-2 w-16 rounded border bg-card px-1 py-0.5 text-[11px]"
                      defaultValue={onHand}
                      title="Adjust on-hand (demo)"
                      onBlur={(e) => {
                        const target = mock.inventoryRecords.find(
                          (i) => i.productId === rule.productId && i.locationId === 'loc-fg',
                        );
                        if (target) {
                          target.qtyOnHand = Number(e.target.value) || 0;
                          force((n) => n + 1);
                        }
                      }}
                    />
                  </td>
                  <td className="py-1.5">{rule.reorderPoint}</td>
                  <td className="py-1.5">{rule.reorderQty}</td>
                  <td className="py-1.5">{rule.leadTimeDays}</td>
                  <td className="py-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {rule.shortageBehaviour}
                    </Badge>
                  </td>
                  <td className="py-1.5">
                    <Badge variant={rule.enabled ? 'default' : 'outline'} className="text-[10px]">
                      {rule.enabled ? 'on' : 'off'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Warehouse className="h-4 w-4" /> Recent replenishment Jobs
        </div>
        {replenJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            None yet. Drop a product's on-hand below its reorder point and Run monitor.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {replenJobs.map((j) => (
              <li key={j.id} className="flex items-center justify-between gap-2">
                <span>
                  {j.jobNumber} · {j.title} · qty {j.qty} · due {j.dueDate}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {j.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
