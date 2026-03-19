import React from 'react';
import { Calendar, Save, Share2, Expand, Send, Upload, Download, Camera, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';

export function PlanOverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Column - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        {/* Job Metadata Section */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">
              Job Details
            </h2>
            <Button variant="outline" className="border-[#E5E5E5]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <div className="space-y-4">
            {/* Job ID and Stage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Job ID #
                </label>
                <Input
                  value="MW-001"
                  readOnly
                  className="bg-[#F5F5F5] border-transparent font-['JetBrains_Mono',monospace]"
                />
              </div>
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Stage
                </label>
                <Select defaultValue="planning">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="inProduction">In Production</SelectItem>
                    <SelectItem value="reviewClose">Review & Close</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Customer
                </label>
                <Input placeholder="Select customer..." />
              </div>
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Customer Contact
                </label>
                <Input placeholder="Primary contact name" />
              </div>
            </div>

            {/* PO and Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Customer PO
                </label>
                <Input placeholder="Purchase order reference" />
              </div>
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Tags
                </label>
                <div className="flex gap-2">
                  <Badge className="bg-[#EF4444] text-white">Urgent</Badge>
                  <Badge className="bg-[#36B37E] text-white">Priority</Badge>
                </div>
              </div>
            </div>

            {/* Sales Order and Opportunity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Sales Order
                </label>
                <Input placeholder="e.g., GGPC-001" />
              </div>
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Opportunity
                </label>
                <Input placeholder="Linked opportunity" />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Order Date
                </label>
                <Input type="date" defaultValue="2026-03-15" />
              </div>
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Planned Production Date
                </label>
                <Input type="date" defaultValue="2026-04-01" />
              </div>
              <div>
                <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                  Expected Delivery Date
                </label>
                <Input type="date" defaultValue="2026-04-15" />
              </div>
            </div>

            {/* Sales Rep */}
            <div>
              <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                Sales Representative
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select sales rep..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="david">David Miller</SelectItem>
                  <SelectItem value="sarah">Sarah Chen</SelectItem>
                  <SelectItem value="mike">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Shipping and Description */}
            <div>
              <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                Shipping Instructions
              </label>
              <Textarea
                placeholder="Special handling notes, delivery instructions..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
                Description
              </label>
              <Textarea
                placeholder="Job description, scope of work, special requirements..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Products
            </h3>
            <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
              Materials sold
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E5E5E5]">
                <tr>
                  <th className="text-left pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">Part</th>
                  <th className="text-left pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">To Produce</th>
                  <th className="text-left pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">Inventory</th>
                  <th className="text-left pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">UoM</th>
                  <th className="text-left pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">Status</th>
                  <th className="text-left pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">Responsible</th>
                  <th className="text-center pb-3 font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">CAD</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E5E5E5]">
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">Manifold Bracket</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">800</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">0</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">Units</td>
                  <td className="py-3">
                    <Badge className="bg-[#36B37E] text-white text-xs">Produced</Badge>
                  </td>
                  <td className="py-3">
                    <Avatar className="w-6 h-6 border border-[#E5E5E5]">
                      <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                      <AvatarFallback className="text-xs">DM</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-3 text-center">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      📐
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-[#E5E5E5]">
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">Angle B</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">5,000</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">2,550</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">Units</td>
                  <td className="py-3">
                    <Badge className="bg-[#FFCF4B] text-[#2C2C2C] text-xs">In Progress</Badge>
                  </td>
                  <td className="py-3">
                    <Avatar className="w-6 h-6 border border-[#E5E5E5]">
                      <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                      <AvatarFallback className="text-xs">SC</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-3 text-center">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      📐
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">Sliding Brace</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">10,000</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">500</td>
                  <td className="py-3 font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">Units</td>
                  <td className="py-3">
                    <Badge className="bg-[#0A7AFF] text-white text-xs">Scheduled</Badge>
                  </td>
                  <td className="py-3">
                    <Avatar className="w-6 h-6 border border-[#E5E5E5]">
                      <AvatarImage src="https://i.pravatar.cc/150?img=8" />
                      <AvatarFallback className="text-xs">MJ</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-3 text-center">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      📐
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E5E5E5]">
            <Button variant="outline" className="border-[#E5E5E5]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-[#E5E5E5]">
              <Expand className="w-4 h-4 mr-2" />
              Expand
            </Button>
            <Button variant="outline" className="border-[#E5E5E5]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">
              Budget
            </h3>
            <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
              Project running costs
            </p>
          </div>

          <div className="space-y-4">
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

          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#E5E5E5]">
            <Button variant="outline" className="border-[#E5E5E5]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-[#E5E5E5]">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button variant="outline" className="border-[#E5E5E5]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - 1/3 width */}
      <div className="space-y-6">
        {/* Schedule Mini-Calendar */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
              Schedule
            </h3>
            <Calendar className="w-4 h-4 text-[#737373]" />
          </div>
          
          <div className="bg-[#FAFAFA] rounded-lg p-3 mb-4">
            <div className="text-center mb-2">
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                April 2026
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                <div
                  key={day}
                  className={cn(
                    'font-[\'Geist:Regular\',sans-serif] text-[12px] p-1 rounded',
                    day === 15 ? 'bg-[#FFCF4B] text-[#2C2C2C] font-medium' :
                    day === 8 || day === 22 ? 'bg-[#F5F5F5] text-[#0A0A0A]' :
                    'text-[#737373]'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2 bg-[#FAFAFA] rounded">
              <p className="font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#0A0A0A] mb-1">
                Order 3rd party powder coating
              </p>
              <p className="font-['Geist:Regular',sans-serif] text-[11px] text-[#737373]">
                Apr 12, 9:00-10:00
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1 border-[#E5E5E5] text-xs">
              <Expand className="w-3 h-3 mr-1" />
              Expand
            </Button>
            <Button size="sm" className="flex-1 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Create
            </Button>
          </div>
        </div>

        {/* Intelligence Hub Preview */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
              Intelligence Hub
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              <Expand className="w-3 h-3 mr-1" />
              Expand
            </Button>
          </div>

          <div className="bg-[#F5F5F5] rounded-lg aspect-video mb-3 flex items-center justify-center">
            <span className="text-4xl">🔧</span>
          </div>

          <p className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A] mb-2">
            Customer engagement and notes
          </p>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-[#E5E5E5] flex-shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                <AvatarFallback className="text-xs">JW</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#0A0A0A]">
                  Jill Wright uploaded BOM and NC files
                </p>
                <p className="font-['Geist:Regular',sans-serif] text-[10px] text-[#737373]">
                  2 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A] mb-3">
            Files
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 p-2 bg-[#FAFAFA] rounded">
              <div className="w-8 h-8 bg-[#0A7AFF] rounded flex items-center justify-center text-white text-xs">
                CAD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#0A0A0A] truncate">
                  CAD Drawings
                </p>
                <p className="font-['Geist:Regular',sans-serif] text-[10px] text-[#737373]">
                  3 items • 2 days ago
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-[#E5E5E5] text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
            <Button variant="outline" size="sm" className="flex-1 border-[#E5E5E5] text-xs">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Chatter Section */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A] mb-3">
            Chatter
          </h3>
          
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
            <div className="bg-[#FFCF4B] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white text-[10px]">
                  IH
                </div>
                <span className="font-['Geist:Medium',sans-serif] text-[11px] font-medium text-[#2C2C2C]">
                  Intelligence Hub
                </span>
                <span className="font-['Geist:Regular',sans-serif] text-[10px] text-[#737373] ml-auto">
                  1 hour ago
                </span>
              </div>
              <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#2C2C2C]">
                Material requirements calculated. Ready to proceed with scheduling.
              </p>
            </div>

            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-[#E5E5E5] flex-shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                <AvatarFallback className="text-xs">DM</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-['Geist:Medium',sans-serif] text-[11px] font-medium text-[#0A0A0A]">
                    David Miller
                  </span>
                  <span className="font-['Geist:Regular',sans-serif] text-[10px] text-[#737373]">
                    2 hours ago
                  </span>
                </div>
                <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#0A0A0A]">
                  BOM reviewed and approved. Moving to production planning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-[#E5E5E5]">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="w-4 h-4 text-[#737373]" />
            </Button>
            <Input placeholder="Type a message..." className="flex-1 h-8 text-xs" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Camera className="w-4 h-4 text-[#737373]" />
            </Button>
            <Button size="sm" className="h-8 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] px-3">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
