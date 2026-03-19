import React from 'react';
import { Sparkles, Save, Send, Share2, Upload, Download, Camera, Paperclip, FileText, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

export function PlanIntelligenceHubTab() {
  return (
    <div className="p-6 space-y-6">
      {/* Quote Status Timeline */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-6">
          Quote Status
        </h3>
        
        <div className="relative pl-8 space-y-6">
          {/* Timeline Line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[#E5E5E5]" />
          
          {/* Event 1 */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[#0A7AFF] border-2 border-white" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A]">
                  Quote #QT-2026-145 Sent by email
                </span>
                <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                  Completed
                </Badge>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                Mar 10, 2026 at 10:15 AM • by David Miller
              </p>
            </div>
          </div>

          {/* Event 2 */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[#0A7AFF] border-2 border-white" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A]">
                  Quote #QT-2026-145 Opened
                </span>
                <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                  Completed
                </Badge>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                Mar 11, 2026 at 2:34 PM • Customer: TechCorp Industries
              </p>
            </div>
          </div>

          {/* Event 3 - Highlighted */}
          <div className="relative">
            <div className="absolute left-[-29px] w-4 h-4 rounded-full bg-[#FFCF4B] border-2 border-white" />
            <div className="bg-[#FFFBF0] border border-[#FFCF4B] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#2C2C2C]" />
                <span className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A]">
                  Quote #QT-2026-145 Confirmed
                </span>
                <Badge className="bg-[#36B37E] text-white text-xs">
                  Success
                </Badge>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">
                Mar 15, 2026 at 9:20 AM • Job MW-001 created automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tracker with AI Insight */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Budget Tracker
            </h3>
            <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
              Real-time cost monitoring
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
              Materials
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#737373]">
              $20,000
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#0A0A0A]">
              $500
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#36B37E]">
              $19,500
            </div>
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#36B37E]" style={{ width: '2.5%' }} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
              Labour
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#737373]">
              $20,000
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#0A0A0A]">
              $10,000
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#FF8B00]">
              $10,000
            </div>
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#FF8B00]" style={{ width: '50%' }} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
              Purchase
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#737373]">
              $10,000
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#0A0A0A]">
              $3,000
            </div>
            <div className="font-['Roboto_Mono',monospace] text-[13px] text-[#36B37E]">
              $7,000
            </div>
            <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#36B37E]" style={{ width: '30%' }} />
            </div>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-[#FFCF4B] rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#FFCF4B]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#2C2C2C]">
                  Intelligence Hub
                </span>
                <span className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                  2 hours ago
                </span>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#2C2C2C]">
                Labor costs are tracking 50% of budget allocation. Consider optimizing machine utilization for operations 3-5 to reduce cycle time by an estimated 15%. Current trajectory suggests completion within budget constraints.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-[#E5E5E5]">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" className="border-[#E5E5E5]">
            <Send className="w-4 h-4 mr-2" />
            Send Report
          </Button>
          <Button variant="outline" className="border-[#E5E5E5]">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
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
            { name: 'Bill of Materials', type: 'XLSX', date: '3 days ago', color: 'bg-[#36B37E]' },
            { name: 'BOM - Revision 2', type: 'XLSX', date: '1 day ago', color: 'bg-[#36B37E]' }
          ].map((file, i) => (
            <div
              key={i}
              className="border border-[#E5E5E5] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            >
              <div className={cn('w-10 h-10 rounded flex items-center justify-center mb-3', file.color)}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-1 truncate">
                {file.name}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#F5F5F5] border-transparent text-[#737373] text-xs">
                  {file.type}
                </Badge>
                <span className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                  {file.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-[#E5E5E5]">
          <Button variant="outline" className="border-[#E5E5E5]">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
          <Button variant="outline" className="border-[#E5E5E5]">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Chatter - Full View */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-6">
          Chatter
        </h3>

        {/* Messages */}
        <div className="space-y-6 mb-6 max-h-[600px] overflow-y-auto">
          {/* Day Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373]">
              Today
            </span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          {/* Intelligence Hub Message */}
          <div className="bg-[#FFCF4B] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#FFCF4B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#2C2C2C]">
                    Intelligence Hub
                  </span>
                  <span className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                    10:24 AM
                  </span>
                </div>
                <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#2C2C2C] mb-3">
                  Job production complete in Make module. All quality checkpoints passed. Ready for final inspection.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-[#2C2C2C] text-[#2C2C2C]">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-[#E5E5E5] flex-shrink-0">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback className="text-xs">DM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                  David Miller
                </span>
                <span className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                  9:15 AM
                </span>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">
                BOM has been finalized. All materials are in stock. We can proceed with scheduling the laser cutting operations for tomorrow morning.
              </p>
            </div>
          </div>

          {/* File Upload Message */}
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-[#E5E5E5] flex-shrink-0">
              <AvatarImage src="https://i.pravatar.cc/150?img=5" />
              <AvatarFallback className="text-xs">JW</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                  Jill Wright
                </span>
                <span className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                  8:45 AM
                </span>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A] mb-3">
                Uploaded BOM and NC files for review
              </p>
              <div className="flex gap-2">
                <div className="border border-[#E5E5E5] rounded-lg p-3 flex items-center gap-3 hover:bg-[#FAFAFA] cursor-pointer">
                  <div className="w-8 h-8 bg-[#36B37E] rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#0A0A0A]">
                      BOM_MW001_v2.xlsx
                    </p>
                    <p className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                      245 KB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373]">
              Yesterday
            </span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          {/* System Message */}
          <div className="bg-[#F5F5F5] rounded-lg p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#737373]" />
            <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373]">
              Job stage changed from <strong>Planning</strong> to <strong>Materials</strong>
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-4 border-t border-[#E5E5E5]">
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