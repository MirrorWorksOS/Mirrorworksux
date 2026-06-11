/**
 * Engineering Job queue — Phase B4 surface, reworked for decision D7.
 * Filters Jobs with `source: 'engineering'` and walks the customer
 * drawing-approval state machine (in_design → submitted_for_approval →
 * approved | revision_requested). Publishing the approved (or waived)
 * BoM creates Manufacturing Orders under the PARENT Job — the order's
 * Job, reachable via `parentJobId`. No separate production Job exists.
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, FileBox, Send, ShieldCheck, Undo2 } from 'lucide-react';
import * as mock from '@/services/mock';
import { workflowService, GateFailure, evaluateBomPublish } from '@/services/workflowService';
import type { EngineeringApprovalStatus, GateFailureDetail, Job } from '@/types/entities';
import { GateBanner } from './GateBanner';
import { JobGraphMini } from './JobGraphMini';

const APPROVAL_LABELS: Record<EngineeringApprovalStatus, string> = {
  in_design: 'In design',
  submitted_for_approval: 'Awaiting customer approval',
  approved: 'Approved',
  revision_requested: 'Revision requested',
};

const APPROVAL_BADGE_CLASS: Record<EngineeringApprovalStatus, string> = {
  in_design: 'border-muted-foreground/30 text-muted-foreground',
  submitted_for_approval: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  revision_requested: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

function ApprovalBadge({ job }: { job: Job }) {
  const status = job.approvalStatus ?? 'in_design';
  return (
    <span className="inline-flex items-center gap-1">
      <Badge variant="outline" className={`text-[10px] ${APPROVAL_BADGE_CLASS[status]}`}>
        {APPROVAL_LABELS[status]}
      </Badge>
      {job.waiver && (
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400"
          title={`Approval waived by ${job.waiver.by}: ${job.waiver.reason}`}
        >
          Waived
        </Badge>
      )}
    </span>
  );
}

export function EngineeringJobsPage() {
  const [, setReloadKey] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [waiverFor, setWaiverFor] = useState<Job | null>(null);
  const [waiverBy, setWaiverBy] = useState('');
  const [waiverReason, setWaiverReason] = useState('');
  const [gateFailures, setGateFailures] = useState<GateFailureDetail[]>([]);

  const refresh = () => setReloadKey((k) => k + 1);

  const engineering = mock.jobs.filter((j) => j.source === 'engineering');
  const parents = mock.jobs.filter((j) => engineering.some((e) => e.parentJobId === j.id));

  const run = async (jobId: string, fn: () => Promise<void>) => {
    setBusy(jobId);
    try {
      await fn();
      refresh();
    } catch (e) {
      if (e instanceof GateFailure) {
        setGateFailures(e.details);
      } else {
        toast.error(e instanceof Error ? e.message : 'Action failed.');
      }
    } finally {
      setBusy(null);
    }
  };

  const submit = (j: Job) =>
    run(j.id, async () => {
      await workflowService.submitForApproval(j.id);
      toast.success(`${j.jobNumber} submitted — drawings published to the customer portal for review.`);
    });

  const decide = (j: Job, decision: 'approved' | 'revision_requested') =>
    run(j.id, async () => {
      await workflowService.approveEngineeringJob(j.id, { decision, by: 'Customer (portal)' });
      toast.success(
        decision === 'approved'
          ? `${j.jobNumber} approved by the customer.`
          : `${j.jobNumber} — customer requested a revision.`,
      );
    });

  const publish = (j: Job) =>
    run(j.id, async () => {
      setGateFailures([]);
      const r = await workflowService.publishBom({
        engineeringJobId: j.id,
        productId: 'prod-004',
        revision: 'A',
        components: [
          { productId: 'prod-001', qtyPer: 4, isManufactured: true },
          { productId: 'prod-002', qtyPer: 1, isManufactured: false },
        ],
      });
      toast.success(
        `Published BoM rev ${r.bom.revision}; ${r.manufacturingOrders.length} MO(s) created under parent Job ${r.parentJob.jobNumber}.`,
      );
    });

  const saveWaiver = async () => {
    if (!waiverFor) return;
    try {
      await workflowService.waiveBomApproval(waiverFor.id, { by: waiverBy, reason: waiverReason });
      toast.success(`Approval waived on ${waiverFor.jobNumber} by ${waiverBy.trim()}.`);
      setWaiverFor(null);
      setWaiverBy('');
      setWaiverReason('');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Waiver failed.');
    }
  };

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
          ETO Sales Order lines create a child engineering Job that authors a BoM.
          Customer drawing approval gates the publish: submit for approval, then —
          once approved (or waived with who/why recorded) — publishing the BoM
          creates Manufacturing Orders under the parent Job (the order&apos;s Job,
          linked via <code>parentJobId</code>).
        </p>
      </div>

      <GateBanner failures={gateFailures} title="BoM publish blocked" />

      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <FileBox className="h-4 w-4" /> Engineering queue (
          {engineering.filter((j) => j.status !== 'completed').length} open)
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
                <th className="py-1.5">Approval</th>
                <th className="py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {engineering.map((j) => {
                const approval = j.approvalStatus ?? 'in_design';
                const published = j.status === 'completed';
                const publishable = evaluateBomPublish(j).length === 0;
                const rowBusy = busy === j.id;
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
                      <ApprovalBadge job={j} />
                    </td>
                    <td className="py-1.5 text-right">
                      {published ? (
                        <span className="text-xs text-muted-foreground">
                          BoM published → MOs under{' '}
                          {mock.jobs.find((p) => p.id === j.parentJobId)?.jobNumber ?? 'parent Job'}
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {(approval === 'in_design' || approval === 'revision_requested') && (
                            <Button size="sm" variant="outline" disabled={rowBusy} onClick={() => void submit(j)}>
                              <Send className="mr-1 h-3.5 w-3.5" />
                              {approval === 'revision_requested' ? 'Resubmit for approval' : 'Submit for approval'}
                            </Button>
                          )}
                          {approval === 'submitted_for_approval' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={rowBusy}
                                title="Demo stand-in for the customer portal approval action."
                                onClick={() => void decide(j, 'approved')}
                              >
                                Approve (portal demo)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={rowBusy}
                                title="Demo stand-in for the customer portal request-revision action."
                                onClick={() => void decide(j, 'revision_requested')}
                              >
                                <Undo2 className="mr-1 h-3.5 w-3.5" /> Request revision (portal demo)
                              </Button>
                            </>
                          )}
                          {approval !== 'approved' && !j.waiver && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={rowBusy}
                              onClick={() => setWaiverFor(j)}
                            >
                              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Waive approval
                            </Button>
                          )}
                          <span
                            title={
                              publishable
                                ? 'Publish the BoM — creates MOs under the parent Job.'
                                : 'Blocked: customer approval (or a recorded waiver) is required before the BoM can publish.'
                            }
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={rowBusy || !publishable}
                              onClick={() => void publish(j)}
                            >
                              Publish BoM
                            </Button>
                          </span>
                          {!publishable && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-muted-foreground"
                              disabled={rowBusy}
                              title="Demo: attempt the publish anyway to see gate failure bom_unapproved."
                              onClick={() => void publish(j)}
                            >
                              Force (gate demo)
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {engineering.length > 0 && (
        <JobGraphMini jobs={[...parents, ...engineering]} />
      )}

      <Dialog open={waiverFor !== null} onOpenChange={(open) => !open && setWaiverFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Waive customer approval — {waiverFor?.jobNumber}</DialogTitle>
            <DialogDescription>
              Internal waiver of the customer drawing approval (decision D7). Who is
              waiving it and why is recorded on the engineering Job; the BoM can then
              publish without portal approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="waiver-by" className="text-xs font-medium">Waived by</label>
              <Input
                id="waiver-by"
                value={waiverBy}
                onChange={(e) => setWaiverBy(e.target.value)}
                placeholder="e.g. Dana Reeve (lead)"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="waiver-reason" className="text-xs font-medium">Reason</label>
              <Textarea
                id="waiver-reason"
                value={waiverReason}
                onChange={(e) => setWaiverReason(e.target.value)}
                placeholder="Why is the customer approval being waived?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiverFor(null)}>
              Cancel
            </Button>
            <Button
              disabled={!waiverBy.trim() || !waiverReason.trim()}
              onClick={() => void saveWaiver()}
            >
              Record waiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
