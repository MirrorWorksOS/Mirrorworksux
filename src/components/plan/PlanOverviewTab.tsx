import React from 'react';
import { Calendar, Save, Share2, Expand, Send, Upload, Download, Camera, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { AIInsightMessage } from '../shared/ai/AIInsightCard';

export function PlanOverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Column - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        {/* Job Metadata Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className=" text-lg font-semibold text-[var(--mw-mirage)]">
              Job Details
            </h2>
            <Button variant="outline" className="border-[var(--border)]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <div className="space-y-4">
            {/* Job ID and Stage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Job ID #
                </label>
                <Input
                  value="MW-001"
                  readOnly
                  className="bg-[var(--neutral-100)] border-transparent tabular-nums"
                />
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
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
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Customer
                </label>
                <Input placeholder="Select customer..." />
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Customer Contact
                </label>
                <Input placeholder="Primary contact name" />
              </div>
            </div>

            {/* PO and Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Customer PO
                </label>
                <Input placeholder="Purchase order reference" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Tags
                </label>
                <div className="flex gap-2">
                  <Badge className="bg-[var(--mw-error)] text-white">Urgent</Badge>
                  <Badge className="bg-[var(--mw-yellow-400)] text-white">Priority</Badge>
                </div>
              </div>
            </div>

            {/* Sales Order and Opportunity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Sales Order
                </label>
                <Input placeholder="e.g., GGPC-001" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Opportunity
                </label>
                <Input placeholder="Linked opportunity" />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Order Date
                </label>
                <Input type="date" defaultValue="2026-03-15" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Planned Production Date
                </label>
                <Input type="date" defaultValue="2026-04-01" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Expected Delivery Date
                </label>
                <Input type="date" defaultValue="2026-04-15" />
              </div>
            </div>

            {/* Sales Rep */}
            <div>
              <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
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
              <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                Shipping Instructions
              </label>
              <Textarea
                placeholder="Special handling notes, delivery instructions..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
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
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="mb-4">
            <h3 className=" text-base font-semibold text-[var(--mw-mirage)]">
              Products
            </h3>
            <p className=" text-xs text-[var(--neutral-500)]">
              Materials sold
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left pb-3  text-xs font-medium text-[var(--mw-mirage)]">Part</th>
                  <th className="text-left pb-3  text-xs font-medium text-[var(--mw-mirage)]">To Produce</th>
                  <th className="text-left pb-3  text-xs font-medium text-[var(--mw-mirage)]">Inventory</th>
                  <th className="text-left pb-3  text-xs font-medium text-[var(--mw-mirage)]">UoM</th>
                  <th className="text-left pb-3  text-xs font-medium text-[var(--mw-mirage)]">Status</th>
                  <th className="text-left pb-3  text-xs font-medium text-[var(--mw-mirage)]">Responsible</th>
                  <th className="text-center pb-3  text-xs font-medium text-[var(--mw-mirage)]">CAD</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3  text-xs text-[var(--mw-mirage)]">Manifold Bracket</td>
                  <td className="py-3  text-xs text-[var(--mw-mirage)]">800</td>
                  <td className="py-3  text-xs text-[var(--neutral-500)]">0</td>
                  <td className="py-3  text-xs text-[var(--neutral-500)]">Units</td>
                  <td className="py-3">
                    <Badge className="bg-[var(--mw-yellow-400)] text-white text-xs">Produced</Badge>
                  </td>
                  <td className="py-3">
                    <Avatar className="w-6 h-6 border border-[var(--border)]">
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
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3  text-xs text-[var(--mw-mirage)]">Angle B</td>
                  <td className="py-3  text-xs text-[var(--mw-mirage)]">5,000</td>
                  <td className="py-3  text-xs text-[var(--neutral-500)]">2,550</td>
                  <td className="py-3  text-xs text-[var(--neutral-500)]">Units</td>
                  <td className="py-3">
                    <Badge className="bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] text-xs">In Progress</Badge>
                  </td>
                  <td className="py-3">
                    <Avatar className="w-6 h-6 border border-[var(--border)]">
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
                  <td className="py-3  text-xs text-[var(--mw-mirage)]">Sliding Brace</td>
                  <td className="py-3  text-xs text-[var(--mw-mirage)]">10,000</td>
                  <td className="py-3  text-xs text-[var(--neutral-500)]">500</td>
                  <td className="py-3  text-xs text-[var(--neutral-500)]">Units</td>
                  <td className="py-3">
                    <Badge className="bg-[var(--mw-blue)] text-white text-xs">Scheduled</Badge>
                  </td>
                  <td className="py-3">
                    <Avatar className="w-6 h-6 border border-[var(--border)]">
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

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
            <Button variant="outline" className="border-[var(--border)]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-[var(--border)]">
              <Expand className="w-4 h-4 mr-2" />
              Expand
            </Button>
            <Button variant="outline" className="border-[var(--border)]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="mb-4">
            <h3 className=" text-base font-semibold text-[var(--mw-mirage)]">
              Budget
            </h3>
            <p className=" text-xs text-[var(--neutral-500)]">
              Project running costs
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-[var(--mw-mirage)]">
                Materials
              </div>
              <div className=" text-xs text-[var(--neutral-500)]">
                $20,000
              </div>
              <div className=" text-xs text-[var(--mw-mirage)]">
                $500
              </div>
              <div className=" text-xs text-[var(--mw-mirage)]">
                $19,500
              </div>
              <div className="relative h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[var(--mw-yellow-400)]" style={{ width: '2.5%' }} />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-[var(--mw-mirage)]">
                Labour
              </div>
              <div className=" text-xs text-[var(--neutral-500)]">
                $20,000
              </div>
              <div className=" text-xs text-[var(--mw-mirage)]">
                $10,000
              </div>
              <div className=" text-xs text-[var(--mw-amber)]">
                $10,000
              </div>
              <div className="relative h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[var(--mw-amber)]" style={{ width: '50%' }} />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-[var(--mw-mirage)]">
                Purchase
              </div>
              <div className=" text-xs text-[var(--neutral-500)]">
                $10,000
              </div>
              <div className=" text-xs text-[var(--mw-mirage)]">
                $3,000
              </div>
              <div className=" text-xs text-[var(--mw-mirage)]">
                $7,000
              </div>
              <div className="relative h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[var(--mw-yellow-400)]" style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[var(--border)]">
            <Button variant="outline" className="border-[var(--border)]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-[var(--border)]">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button variant="outline" className="border-[var(--border)]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - 1/3 width */}
      <div className="space-y-6">
        {/* Schedule Mini-Calendar */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className=" text-sm font-semibold text-[var(--mw-mirage)]">
              Schedule
            </h3>
            <Calendar className="w-4 h-4 text-[var(--neutral-500)]" />
          </div>
          
          <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-3 mb-4">
            <div className="text-center mb-2">
              <span className=" text-xs font-medium text-[var(--mw-mirage)]">
                April 2026
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className=" text-xs text-[var(--neutral-500)]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                <div
                  key={day}
                  className={cn(
                    'text-xs p-1 rounded',
                    day === 15 ? 'bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] font-medium' :
                    day === 8 || day === 22 ? 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]' :
                    'text-[var(--neutral-500)]'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2 bg-[var(--neutral-100)] rounded">
              <p className=" text-xs font-medium text-[var(--mw-mirage)] mb-1">
                Order 3rd party powder coating
              </p>
              <p className=" text-xs text-[var(--neutral-500)]">
                Apr 12, 9:00-10:00
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-xs">
              <Expand className="w-4 h-4 mr-1" />
              Expand
            </Button>
            <Button size="sm" className="flex-1 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] text-xs">
              <Calendar className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </div>

        {/* Intelligence Hub Preview */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className=" text-sm font-semibold text-[var(--mw-mirage)]">
              Intelligence Hub
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              <Expand className="w-4 h-4 mr-1" />
              Expand
            </Button>
          </div>

          <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] aspect-video mb-3 flex items-center justify-center">
            <span className="text-4xl">🔧</span>
          </div>

          <p className=" text-xs font-medium text-[var(--mw-mirage)] mb-2">
            Customer engagement and notes
          </p>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-[var(--border)] flex-shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                <AvatarFallback className="text-xs">JW</AvatarFallback>
              </Avatar>
              <div>
                <p className=" text-xs text-[var(--mw-mirage)]">
                  Jill Wright uploaded BOM and NC files
                </p>
                <p className=" text-[10px] text-[var(--neutral-500)]">
                  2 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-4">
          <h3 className=" text-sm font-semibold text-[var(--mw-mirage)] mb-3">
            Files
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 p-2 bg-[var(--neutral-100)] rounded">
              <div className="w-8 h-8 bg-[var(--mw-blue)] rounded flex items-center justify-center text-white text-xs">
                CAD
              </div>
              <div className="flex-1 min-w-0">
                <p className=" text-xs font-medium text-[var(--mw-mirage)] truncate">
                  CAD Drawings
                </p>
                <p className=" text-[10px] text-[var(--neutral-500)]">
                  3 items • 2 days ago
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-xs">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-xs">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Chatter Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-4">
          <h3 className=" text-sm font-semibold text-[var(--mw-mirage)] mb-3">
            Chatter
          </h3>
          
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
            <AIInsightMessage timestamp="1 hour ago">
              Material requirements calculated. Ready to proceed with scheduling.
            </AIInsightMessage>

            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-[var(--border)] flex-shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                <AvatarFallback className="text-xs">DM</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className=" text-xs font-medium text-[var(--mw-mirage)]">
                    David Miller
                  </span>
                  <span className=" text-[10px] text-[var(--neutral-500)]">
                    2 hours ago
                  </span>
                </div>
                <p className=" text-xs text-[var(--mw-mirage)]">
                  BOM reviewed and approved. Moving to production planning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
            <Input placeholder="Type a message..." className="flex-1 h-8 text-xs" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Camera className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
            <Button size="sm" className="h-8 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] px-3">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}