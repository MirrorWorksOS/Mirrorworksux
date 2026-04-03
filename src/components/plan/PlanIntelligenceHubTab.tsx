import React, { useState } from 'react';
import { Sparkles, Save, Send, Share2, Upload, Download, Camera, Paperclip, FileText, Clock, Mail, Phone, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { ProgressBar } from '@/components/shared/data/ProgressBar';
import { AIInsightCard, AIInsightMessage } from '@/components/shared/ai/AIInsightCard';
import { AISuggestion } from '@/components/shared/ai/AISuggestion';
import { IconWell } from '@/components/shared/icons/IconWell';
import { toast } from 'sonner';

export function PlanIntelligenceHubTab() {
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: "I've analyzed the job data. The current schedule looks on track with 67% completion. Would you like me to suggest optimizations?" },
      ]);
    }, 800);
  };

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
      <div className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
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
            <div className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-4">
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
            </div>
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
      </div>

      {/* Budget Tracker with AI Insight */}
      <div className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
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
        <AIInsightCard
          title="AI budget insight"
          updatedAt="2 hours ago"
          actionLabel="View full budget"
          className="mb-4"
        >
          Labour costs are tracking 50% of budget allocation. Consider optimising machine utilisation for operations 3–5 to reduce cycle time by an estimated 15%. Current trajectory suggests completion within budget constraints.
        </AIInsightCard>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-[var(--border)]">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" className="border-[var(--border)]">
            <Send className="w-4 h-4 mr-2" />
            Send Report
          </Button>
          <Button variant="outline" className="border-[var(--border)]">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className=" text-base font-medium text-foreground">
            Files
          </h3>
          <Button size="sm" className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)]">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {[
            { name: 'Drawing Set 01', type: 'PDF', date: '2 days ago', color: 'bg-[var(--mw-error)]' },
            { name: 'Drawing Set 02', type: 'PDF', date: '2 days ago', color: 'bg-[var(--mw-error)]' },
            { name: 'Drawing Set 03', type: 'PDF', date: '2 days ago', color: 'bg-[var(--mw-error)]' },
            { name: 'Drawing Set 04', type: 'PDF', date: '2 days ago', color: 'bg-[var(--mw-error)]' },
            { name: 'Bill of Materials', type: 'XLSX', date: '3 days ago', color: 'bg-[var(--mw-mirage)]' },
            { name: 'BOM - Revision 2', type: 'XLSX', date: '1 day ago', color: 'bg-[var(--mw-mirage)]' }
          ].map((file, i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-[var(--shape-lg)] p-4 hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
            >
              <div className={cn('w-10 h-10 rounded flex items-center justify-center mb-3', file.color)}>
                <FileText className="w-5 h-5 text-white" />
              </div>
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
          <Button variant="outline" className="border-[var(--border)]">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
          <Button variant="outline" className="border-[var(--border)]">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Chatter - Full View */}
      <div className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
        <h3 className=" text-base font-medium text-foreground mb-6">
          Chatter
        </h3>

        {/* Messages */}
        <div className="space-y-6 mb-6 max-h-[600px] overflow-y-auto">
          {/* Day Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className=" text-xs font-medium text-[var(--neutral-500)]">
              Today
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Intelligence Hub Message */}
          <AIInsightMessage timestamp="10:24 AM" actions={
            <Button size="sm" variant="outline" className="h-12 text-xs border-[var(--border)] text-foreground">
              View Details
            </Button>
          }>
            Job production complete in Make module. All quality checkpoints passed. Ready for final inspection.
          </AIInsightMessage>

          {/* User Message */}
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-[var(--border)] flex-shrink-0">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback className="text-xs">DM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className=" text-xs font-medium text-foreground">
                  David Miller
                </span>
                <span className=" text-xs text-[var(--neutral-500)]">
                  9:15 AM
                </span>
              </div>
              <p className=" text-xs text-foreground">
                BOM has been finalized. All materials are in stock. We can proceed with scheduling the laser cutting operations for tomorrow morning.
              </p>
            </div>
          </div>

          {/* File Upload Message */}
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-[var(--border)] flex-shrink-0">
              <AvatarImage src="https://i.pravatar.cc/150?img=5" />
              <AvatarFallback className="text-xs">JW</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className=" text-xs font-medium text-foreground">
                  Jill Wright
                </span>
                <span className=" text-xs text-[var(--neutral-500)]">
                  8:45 AM
                </span>
              </div>
              <p className=" text-xs text-foreground mb-3">
                Uploaded BOM and NC files for review
              </p>
              <div className="flex gap-2">
                <div className="border border-[var(--border)] rounded-[var(--shape-lg)] p-3 flex items-center gap-3 hover:bg-[var(--neutral-100)] cursor-pointer">
                  <IconWell icon={FileText} size="sm" />
                  <div>
                    <p className=" text-xs font-medium text-foreground">
                      BOM_MW001_v2.xlsx
                    </p>
                    <p className=" text-xs text-[var(--neutral-500)]">
                      245 KB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className=" text-xs font-medium text-[var(--neutral-500)]">
              Yesterday
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* System Message */}
          <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--neutral-500)]" />
            <p className=" text-xs text-[var(--neutral-500)]">
              Job stage changed from <strong>Planning</strong> to <strong>Materials</strong>
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        {chatMessages.length > 0 && (
          <div className="space-y-2 mb-4">
            {chatMessages.map((m, i) => (
              <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : '')}>
                {m.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--mw-yellow-400)] flex items-center justify-center text-[10px] font-bold shrink-0">AI</div>
                )}
                <div className={cn(
                  'rounded-lg px-3 py-2 text-xs max-w-[85%]',
                  m.role === 'user'
                    ? 'bg-[var(--mw-mirage)] text-white'
                    : 'bg-[var(--neutral-100)] text-foreground',
                )}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Paperclip className="w-5 h-5 text-[var(--neutral-500)]" />
          </Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(); }}
          />
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Camera className="w-5 h-5 text-[var(--neutral-500)]" />
          </Button>
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)]" onClick={handleChatSubmit}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
