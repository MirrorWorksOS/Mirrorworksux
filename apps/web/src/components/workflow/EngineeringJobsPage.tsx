/**
 * Engineering Job queue — Phase B4 surface. Filters Jobs with
 * `source: 'engineering'` and exposes the Publish-BoM action that
 * spawns the production Job. Production Jobs spawned from this queue
 * show up below with parent-link breadcrumbs.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileBox, Network } from 'lucide-react';
import * as mock from '@/services/mock';
import { workflowService } from '@/services/workflowService';
import type { Job } from '@/types/entities';
import { JobGraphMini } from './JobGraphMini';

export function EngineeringJobsPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const engineering = mock.jobs.filter((j) => j.source === 'engineering');
  const production = mock.jobs.filter((j) => j.parentJobId && engineering.some((e) => e.id === j.parentJobId));

  const publish = async (engJob: Job) => {
    setBusy(engJob.id);
    try {
      const r = await workflowService.publishBomToProductionJob({
        engineeringJobId: engJob.id,
        productId: 'prod-004',
        revision: 'A',
        components: [
          { productId: 'prod-001', qtyPer: 4, isManufactured: true },
          { productId: 'prod-002', qtyPer: 1, isManufactured: false },
        ],
      });
      toast.success(
        `Published BoM rev ${r.bom.revision}; production Job ${r.productionJob.jobNumber} created.`,
      );
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Publish failed.');
    } finally {
      setBusy(null);
    }
  };

  // Bind to reloadKey so descendants re-render after publish.
  useEffect(() => {}, [reloadKey]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/plan" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Plan
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Engineering Jobs (ETO)</h1>
        <p className="text-sm text-muted-foreground">
          ETO Sales Order lines create an engineering Job that authors a
          BoM. Publishing the BoM spawns the production Job; the two are
          linked via <code>parentJobId</code>.
        </p>
      </div>

      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <FileBox className="h-4 w-4" /> Awaiting BoM publication ({engineering.filter((j) => j.status !== 'completed').length})
        </div>
        {engineering.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No engineering Jobs yet. Confirm a Sales Order with an ETO line to seed
            one (try <Link to="/sell/orders/so-001/journey" className="text-primary underline-offset-2 hover:underline">SO-2026-0085</Link>).
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5">Job</th>
                <th className="py-1.5">Title</th>
                <th className="py-1.5">SO</th>
                <th className="py-1.5">Status</th>
                <th className="py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {engineering.map((j) => {
                const child = mock.jobs.find((c) => c.parentJobId === j.id);
                return (
                  <tr key={j.id} className="border-t">
                    <td className="py-1.5 font-medium">{j.jobNumber}</td>
                    <td className="py-1.5">{j.title}</td>
                    <td className="py-1.5">
                      {j.salesOrderId && (
                        <Link
                          to={`/sell/orders/${j.salesOrderId}/journey`}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {mock.salesOrders.find((s) => s.id === j.salesOrderId)?.orderNumber}
                        </Link>
                      )}
                    </td>
                    <td className="py-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {j.status}
                      </Badge>
                    </td>
                    <td className="py-1.5 text-right">
                      {child ? (
                        <span className="text-xs text-muted-foreground">
                          → {child.jobNumber}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === j.id}
                          onClick={() => void publish(j)}
                        >
                          Publish BoM
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {(engineering.length > 0 || production.length > 0) && (
        <JobGraphMini jobs={[...engineering, ...production]} />
      )}
    </div>
  );
}
