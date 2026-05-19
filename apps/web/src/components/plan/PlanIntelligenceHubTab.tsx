import React from 'react';
import { Sparkles, Save, Send, Share2, Upload, Download, FileText, FileSpreadsheet, Ruler, Mail, Phone, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { AISuggestion } from '@/components/shared/ai/AISuggestion';
import { MirrorWorksAgentCard } from '@/components/shared/ai/MirrorWorksAgentCard';
import { IconWell } from '@/components/shared/icons/IconWell';
import { ChatterSummaryCard } from '@/components/shared/chatter';
import { toast } from 'sonner';
interface PlanIntelligenceHubTabProps {
  onOpenBudget?: () => void;
}

export function PlanIntelligenceHubTab({ onOpenBudget }: PlanIntelligenceHubTabProps = {}) {
  return (
    <div className="p-6 space-y-6">
      {/* AI Suggestions */}
      <AISuggestion
        title="Critical path risk"
        confidence={82}
        source="Schedule analysis · resource availability model"
        impact="Potential 3-day delay on job delivery"
      >
        CNC machining operations are on the critical path. Current machine utilisation at 94% — any unplanned downtime will directly impact delivery date. Recommend <strong>pre-booking backup capacity</strong> on CNC-02.
      </AISuggestion>

      <AISuggestion
        title="Material cost variance"
        confidence={91}
        source="Purchase order data · market pricing"
        impact="$2,400 budget overrun if not addressed"
      >
        304 stainless steel pricing has increased 12% since quote. Current BOM cost exceeds budget by <strong>$2,400</strong>. Consider negotiating with secondary supplier or requesting customer approval for cost adjustment.
      </AISuggestion>

      <AISuggestion
        title="Resource conflict"
        confidence={76}
        source="Cross-job scheduling engine"
        impact="Resolves scheduling conflict for 2 jobs"
      >
        Welding operation overlaps with JOB-2026-0015 on Weld-01. Moving this job's welding to <strong>Tuesday PM shift</strong> resolves the conflict with zero impact on delivery date.
      </AISuggestion>

      {/* Customer Engagement Timeline */}
      <Card className="p-6">
        <h3 className=" text-base font-medium text-foreground mb-6">
          Customer Engagement
        </h3>

        <div className="relative pl-8 space-y-6">
          {/* Timeline Line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[var(--border)]" />

          {/* Event 1 — Quote sent */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[var(--mw-blue)] border-2 border-card" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                <span className=" text-sm font-medium text-foreground">
                  Quote #QT-2026-145 sent by email
                </span>
                <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-xs text-[var(--neutral-500)]">
                Mar 10, 2026 at 10:15 AM · by David Miller
              </p>
            </div>
          </div>

          {/* Event 2 — Quote opened */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[var(--mw-blue)] border-2 border-card" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                <span className=" text-sm font-medium text-foreground">
                  Quote #QT-2026-145 opened by customer
                </span>
                <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-xs text-[var(--neutral-500)]">
                Mar 11, 2026 at 2:34 PM · Customer: TechCorp Industries
              </p>
            </div>
          </div>

          {/* Event 3 — Phone call */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[var(--mw-blue)] border-2 border-card" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                <span className=" text-sm font-medium text-foreground">
                  Follow-up call with James Hartley
                </span>
                <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-xs text-[var(--neutral-500)]">
                Mar 12, 2026 at 11:00 AM · by David Miller · Duration: 18 min
              </p>
            </div>
          </div>

          {/* Event 4 — Document uploaded */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[var(--mw-blue)] border-2 border-card" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                <span className=" text-sm font-medium text-foreground">
                  Revised drawing set uploaded
                </span>
                <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-xs text-[var(--neutral-500)]">
                Mar 14, 2026 at 3:45 PM · Drawing_Rev_C.dxf (1.2 MB)
              </p>
            </div>
          </div>

          {/* Event 5 — Quote confirmed (highlighted) */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[var(--mw-yellow-400)] border-2 border-card" />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--mw-yellow-400)]" />
                <span className=" text-sm font-medium text-foreground">
                  Quote #QT-2026-145 confirmed
                </span>
                <Badge className="bg-[var(--mw-mirage)] text-white text-xs">
                  Success
                </Badge>
              </div>
              <p className=" text-xs text-[var(--neutral-500)]">
                Mar 15, 2026 at 9:20 AM · Job MW-001 created automatically
              </p>
            </Card>
          </div>

          {/* Event 6 — Email confirmation sent */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[var(--mw-green)] border-2 border-card" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-[var(--neutral-500)]" />
                <span className=" text-sm font-medium text-foreground">
                  Order confirmation email sent
                </span>
                <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-xs text-[var(--neutral-500)]">
                Mar 15, 2026 at 9:25 AM · Auto-generated by system
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Budget Tracker with AI Insight */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className=" text-base font-medium text-foreground">
              Budget Tracker
            </h3>
            <p className=" text-xs text-[var(--neutral-500)]">
              Real-time cost monitoring
            </p>
          </div>
        </div>

        {/* Budget header row */}
        <div className="grid grid-cols-5 gap-4 mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Category</div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Budget</div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Spent</div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Remaining</div>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Progress</div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Materials */}
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className=" text-xs font-medium text-foreground">Materials</div>
            <div className=" text-xs tabular-nums text-[var(--neutral-500)]">$20,000</div>
            <div className=" text-xs tabular-nums text-foreground">$500</div>
            <div className=" text-xs tabular-nums text-foreground">$19,500</div>
            <ProgressBar value={2.5} size="sm" />
          </div>

          {/* Labour */}
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className=" text-xs font-medium text-foreground">Labour</div>
            <div className=" text-xs tabular-nums text-[var(--neutral-500)]">$20,000</div>
            <div className=" text-xs tabular-nums text-foreground">$10,000</div>
            <div className=" text-xs tabular-nums text-[var(--mw-amber)]">$10,000</div>
            <ProgressBar value={50} size="sm" />
          </div>

          {/* Purchase */}
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className=" text-xs font-medium text-foreground">Purchase</div>
            <div className=" text-xs tabular-nums text-[var(--neutral-500)]">$10,000</div>
            <div className=" text-xs tabular-nums text-foreground">$3,000</div>
            <div className=" text-xs tabular-nums text-foreground">$7,000</div>
            <ProgressBar value={30} size="sm" />
          </div>
        </div>

        {/* AI Insight Banner */}
        <MirrorWorksAgentCard
          title="Budget pacing recommendation"
          suggestion="Labour is already at 50% of budget. MirrorWorks Agent recommends tightening machine utilisation on operations 3-5 before the current run-rate starts to compress margin."
          tone="opportunity"
          statusText="Updated 2 hours ago"
          primaryAction={{
            label: 'View full budget',
            onClick: () => onOpenBudget?.(),
          }}
          detailContent={
            <div className="space-y-2">
              <p>Estimated cycle-time reduction: 15% across operations 3-5.</p>
              <p>Current trajectory still lands within budget if utilisation is corrected this week.</p>
            </div>
          }
          evidenceLevel="expandable"
          detailLabel="Evidence"
          className="mb-4"
        />

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-[var(--border)]" onClick={() => toast.success('Report saved')}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" className="border-[var(--border)]" onClick={() => toast.success('Report sent')}>
            <Send className="w-4 h-4 mr-2" />
            Send Report
          </Button>
          <Button variant="outline" className="border-[var(--border)]" onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              void navigator.clipboard.writeText(window.location.href);
            }
            toast.success('Link copied');
          }}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>

      {/* Files Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className=" text-base font-medium text-foreground">
            Files
          </h3>
          <Button size="sm" className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)]" onClick={() => toast.info('Use the Files card on the Overview tab to upload')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {[
            { name: 'Ring Gear Drawing', type: 'PDF', date: '2 days ago', icon: Ruler },
            { name: 'Pinion Shaft Drawing', type: 'PDF', date: '2 days ago', icon: Ruler },
            { name: 'Spider Gear Drawing', type: 'PDF', date: '2 days ago', icon: Ruler },
            { name: 'Assembly Drawing', type: 'PDF', date: '2 days ago', icon: Ruler },
            { name: 'Differential BOM', type: 'XLSX', date: '3 days ago', icon: FileSpreadsheet },
            { name: 'BOM - Revision 2', type: 'XLSX', date: '1 day ago', icon: FileSpreadsheet }
          ].map((file, i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
            >
              <IconWell icon={file.icon} surface="onLight" className="mb-3" />
              <h4 className=" text-xs font-medium text-foreground mb-1 truncate">
                {file.name}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[var(--neutral-100)] border-transparent text-[var(--neutral-500)] text-xs">
                  {file.type}
                </Badge>
                <span className=" text-xs text-[var(--neutral-500)]">
                  {file.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
          <Button variant="outline" className="border-[var(--border)]" onClick={() => {
            const blob = new Blob(['Job files manifest — JOB-2026-0015\n6 files, last updated 1 day ago\n'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'job-files.txt';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Downloaded all files');
          }}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
          <Button variant="outline" className="border-[var(--border)]" onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              void navigator.clipboard.writeText(window.location.href);
            }
            toast.success('Link copied');
          }}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>

      <ChatterSummaryCard entity={{ type: 'job', id: 'JOB-2026-0015' }} limit={6} />
    </div>
  );
}
