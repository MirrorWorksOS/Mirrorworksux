/**
 * Mini parent-child Job graph. Renders one root Job plus its descendants
 * (one level of nesting is enough for ETO + VO; future B5 variation
 * chains can recurse). Read-only — clicking a node deep-links to the
 * Order page for the underlying SO.
 */
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Network, ArrowDown } from 'lucide-react';
import type { Job, JobSource } from '@/types/entities';

const SOURCE_TONE: Record<JobSource, string> = {
  sales_order: 'bg-blue-100 text-blue-900',
  replenishment: 'bg-amber-100 text-amber-900',
  engineering: 'bg-purple-100 text-purple-900',
  variation: 'bg-violet-100 text-violet-900',
  manual: 'bg-slate-100 text-slate-900',
};

export interface JobGraphMiniProps {
  /** Roots (Jobs with no parentJobId among the input set). */
  jobs: Job[];
}

export function JobGraphMini({ jobs }: JobGraphMiniProps) {
  if (jobs.length === 0) return null;
  const roots = jobs.filter((j) => !jobs.some((p) => p.id === j.parentJobId));
  const childrenOf = (id: string) => jobs.filter((j) => j.parentJobId === id);
  const renderNode = (job: Job, depth = 0) => (
    <div key={job.id} className="space-y-1" style={{ marginLeft: depth * 24 }}>
      <div className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-xs">
        <span className="font-medium">{job.jobNumber}</span>
        <Badge className={SOURCE_TONE[job.source ?? 'manual']}>
          {job.source ?? 'manual'}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {job.status}
        </Badge>
        {job.qty && (
          <span className="text-muted-foreground">× {job.qty}</span>
        )}
        {job.salesOrderId && (
          <Link
            to={`/sell/orders/${job.salesOrderId}/journey`}
            className="text-primary underline-offset-2 hover:underline"
            title="Open this Job's order journey"
          >
            open
          </Link>
        )}
      </div>
      {childrenOf(job.id).length > 0 && (
        <div className="ml-3 border-l-2 border-muted pl-3">
          <ArrowDown className="mb-0.5 h-3 w-3 text-muted-foreground" />
          {childrenOf(job.id).map((c) => renderNode(c, depth + 1))}
        </div>
      )}
    </div>
  );
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Network className="h-4 w-4" /> Job graph
      </div>
      <div className="space-y-2">{roots.map((r) => renderNode(r))}</div>
    </Card>
  );
}
