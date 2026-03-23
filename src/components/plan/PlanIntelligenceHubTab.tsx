import React from 'react';
import { Sparkles, Save, Send, Share2, Upload, Download, Camera, Paperclip, FileText, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { AIInsightCard, AIInsightMessage } from '../shared/AIInsightCard';

export function PlanIntelligenceHubTab() {
  return (
    <div className="p-6 space-y-6">
      {/* Quote Status Timeline */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
        <h3 className=" text-[16px] font-semibold text-[#1A2732] mb-6">
          Quote Status
        </h3>
        
        <div className="relative pl-8 space-y-6">
          {/* Timeline Line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[var(--border)]" />
          
          {/* Event 1 */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[#0A7AFF] border-2 border-white" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className=" text-[14px] font-medium text-[#1A2732]">
                  Quote #QT-2026-145 Sent by email
                </span>
                <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-[13px] text-[#737373]">
                Mar 10, 2026 at 10:15 AM • by David Miller
              </p>
            </div>
          </div>

          {/* Event 2 */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[#0A7AFF] border-2 border-white" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className=" text-[14px] font-medium text-[#1A2732]">
                  Quote #QT-2026-145 Opened
                </span>
                <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                  Completed
                </Badge>
              </div>
              <p className=" text-[13px] text-[#737373]">
                Mar 11, 2026 at 2:34 PM • Customer: TechCorp Industries
              </p>
            </div>
          </div>

          {/* Event 3 - Highlighted */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[#FFCF4B] border-2 border-white" />
            <div className="bg-white border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#FFCF4B]" />
                <span className=" text-[14px] font-medium text-[#1A2732]">
                  Quote #QT-2026-145 Confirmed
                </span>
                <Badge className="bg-[#1A2732] text-white text-xs">
                  Success
                </Badge>
              </div>
              <p className=" text-[13px] text-[#737373]">
                Mar 15, 2026 at 9:20 AM • Job MW-001 created automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tracker with AI Insight */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className=" text-[16px] font-semibold text-[#1A2732]">
              Budget Tracker
            </h3>
            <p className=" text-[13px] text-[#737373]">
              Real-time cost monitoring
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className=" text-[13px] font-medium text-[#1A2732]">
              Materials
            </div>
            <div className=" text-[13px] text-[#737373]">
              $20,000
            </div>
            <div className=" text-[13px] text-[#1A2732]">
              $500
            </div>
            <div className=" text-[13px] text-[#1A2732]">
              $19,500
            </div>
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#1A2732]" style={{ width: '2.5%' }} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 items-center">
            <div className=" text-[13px] font-medium text-[#1A2732]">
              Labour
            </div>
            <div className=" text-[13px] text-[#737373]">
              $20,000
            </div>
            <div className=" text-[13px] text-[#1A2732]">
              $10,000
            </div>
            <div className=" text-[13px] text-[#FF8B00]">
              $10,000
            </div>
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#FF8B00]" style={{ width: '50%' }} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 items-center">
            <div className=" text-[13px] font-medium text-[#1A2732]">
              Purchase
            </div>
            <div className=" text-[13px] text-[#737373]">
              $10,000
            </div>
            <div className=" text-[13px] text-[#1A2732]">
              $3,000
            </div>
            <div className=" text-[13px] text-[#1A2732]">
              $7,000
            </div>
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#1A2732]" style={{ width: '30%' }} />
            </div>
          </div>
        </div>

        {/* AI Insight Banner */}
        <AIInsightCard
          title="AI budget insight"
          updatedAt="2 hours ago"
          actionLabel="View full budget"
          className="mb-4"
        >
          Labor costs are tracking 50% of budget allocation. Consider optimising machine utilisation for operations 3–5 to reduce cycle time by an estimated 15%. Current trajectory suggests completion within budget constraints.
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
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className=" text-[16px] font-semibold text-[#1A2732]">
            Files
          </h3>
          <Button size="sm" className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C]">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {/* File Cards */}
          {[
            { name: 'Drawing Set 01', type: 'PDF', date: '2 days ago', color: 'bg-[#EF4444]' },
            { name: 'Drawing Set 02', type: 'PDF', date: '2 days ago', color: 'bg-[#EF4444]' },
            { name: 'Drawing Set 03', type: 'PDF', date: '2 days ago', color: 'bg-[#EF4444]' },
            { name: 'Drawing Set 04', type: 'PDF', date: '2 days ago', color: 'bg-[#EF4444]' },
            { name: 'Bill of Materials', type: 'XLSX', date: '3 days ago', color: 'bg-[#1A2732]' },
            { name: 'BOM - Revision 2', type: 'XLSX', date: '1 day ago', color: 'bg-[#1A2732]' }
          ].map((file, i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-lg p-4 hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <div className={cn('w-10 h-10 rounded flex items-center justify-center mb-3', file.color)}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h4 className=" text-[13px] font-medium text-[#1A2732] mb-1 truncate">
                {file.name}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                  {file.type}
                </Badge>
                <span className=" text-[11px] text-[#737373]">
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
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
        <h3 className=" text-[16px] font-semibold text-[#1A2732] mb-6">
          Chatter
        </h3>

        {/* Messages */}
        <div className="space-y-6 mb-6 max-h-[600px] overflow-y-auto">
          {/* Day Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className=" text-[12px] font-medium text-[#737373]">
              Today
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Intelligence Hub Message */}
          <AIInsightMessage timestamp="10:24 AM" actions={
            <Button size="sm" variant="outline" className="h-7 text-xs border-[var(--border)] text-[#1A2732]">
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
                <span className=" text-[13px] font-medium text-[#1A2732]">
                  David Miller
                </span>
                <span className=" text-[11px] text-[#737373]">
                  9:15 AM
                </span>
              </div>
              <p className=" text-[13px] text-[#1A2732]">
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
                <span className=" text-[13px] font-medium text-[#1A2732]">
                  Jill Wright
                </span>
                <span className=" text-[11px] text-[#737373]">
                  8:45 AM
                </span>
              </div>
              <p className=" text-[13px] text-[#1A2732] mb-3">
                Uploaded BOM and NC files for review
              </p>
              <div className="flex gap-2">
                <div className="border border-[var(--border)] rounded-lg p-3 flex items-center gap-3 hover:bg-[#F5F5F5] cursor-pointer">
                  <div className="w-8 h-8 bg-[#1A2732] rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className=" text-[12px] font-medium text-[#1A2732]">
                      BOM_MW001_v2.xlsx
                    </p>
                    <p className=" text-[11px] text-[#737373]">
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
            <span className=" text-[12px] font-medium text-[#737373]">
              Yesterday
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* System Message */}
          <div className="bg-[#F5F5F5] rounded-lg p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#737373]" />
            <p className=" text-[12px] text-[#737373]">
              Job stage changed from <strong>Planning</strong> to <strong>Materials</strong>
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Paperclip className="w-5 h-5 text-[#737373]" />
          </Button>
          <Input placeholder="Type a message..." className="flex-1" />
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Camera className="w-5 h-5 text-[#737373]" />
          </Button>
          <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C]">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}