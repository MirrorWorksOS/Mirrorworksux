import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Save, Share2, Expand, Send, Upload, Download, Camera, Paperclip, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { AIInsightMessage } from '../shared/ai/AIInsightCard';
import { MwDataTable, type MwColumnDef } from '../shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '../shared/data/StatusBadge';
import { ProgressBar } from '../shared/data/ProgressBar';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

type ProductRow = {
  id: string;
  part: string;
  route: string;
  toProduce: string;
  inventory: string;
  uom: string;
  status: StatusKey;
  avatarSrc: string;
  avatarFallback: string;
};

const PRODUCT_DATA: ProductRow[] = [
  {
    id: '1',
    part: 'Manifold Bracket',
    route: 'CNC → Bend → Weld',
    toProduce: '800',
    inventory: '0',
    uom: 'pcs',
    status: 'produced',
    avatarSrc: 'https://i.pravatar.cc/150?img=12',
    avatarFallback: 'DM',
  },
  {
    id: '2',
    part: 'Angle B',
    route: 'CNC → Bend',
    toProduce: '5,000',
    inventory: '2,550',
    uom: 'pcs',
    status: 'inProgress',
    avatarSrc: 'https://i.pravatar.cc/150?img=5',
    avatarFallback: 'SC',
  },
  {
    id: '3',
    part: 'Sliding Brace',
    route: 'Shear → Weld → Coat',
    toProduce: '10,000',
    inventory: '500',
    uom: 'meters',
    status: 'scheduled',
    avatarSrc: 'https://i.pravatar.cc/150?img=8',
    avatarFallback: 'MJ',
  },
];

export function PlanOverviewTab() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
  const allSelected = selectedIds.size === PRODUCT_DATA.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(PRODUCT_DATA.map((r) => r.id)));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const productColumns: MwColumnDef<ProductRow>[] = [
    {
      key: 'select',
      header: (
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="h-3.5 w-3.5 cursor-pointer accent-[var(--mw-yellow-400)]"
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleRow(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 cursor-pointer accent-[var(--mw-yellow-400)]"
        />
      ),
      className: 'w-10',
      headerClassName: 'w-10',
    },
    {
      key: 'part',
      header: 'Part',
      cell: (row) => (
        <span className="text-xs font-medium text-[var(--mw-mirage)]">{row.part}</span>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      cell: (row) => (
        <span className="text-xs text-[var(--neutral-500)]">{row.route}</span>
      ),
    },
    {
      key: 'toProduce',
      header: 'To Produce',
      cell: (row) => (
        <span className="text-xs tabular-nums text-[var(--mw-mirage)]">{row.toProduce}</span>
      ),
    },
    {
      key: 'inventory',
      header: 'Inventory',
      cell: (row) => (
        <span className="text-xs tabular-nums text-[var(--neutral-500)]">{row.inventory}</span>
      ),
    },
    {
      key: 'uom',
      header: 'UoM',
      cell: (row) => (
        <span className="text-xs text-[var(--neutral-500)]">{row.uom}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'responsible',
      header: 'Responsible',
      cell: (row) => (
        <Avatar className="w-6 h-6 border border-[var(--border)]">
          <AvatarImage src={row.avatarSrc} />
          <AvatarFallback className="text-xs">{row.avatarFallback}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'cad',
      header: 'CAD',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: () => (
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          📐
        </Button>
      ),
    },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Column - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        {/* Job Metadata Section */}
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className=" text-lg font-medium text-[var(--mw-mirage)]">
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

            {/* Sales Order and Opportunity — linked entities (§4.5); IDs match Sell mocks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Sales Order
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/sell/orders/1')}
                  className="w-full flex items-center justify-between h-10 px-3 text-left border border-[var(--border)] rounded-[var(--shape-md)] hover:bg-[var(--accent)] transition-colors"
                >
                  <span className="text-xs font-medium text-[var(--mw-blue)] tabular-nums">
                    SO-2026-0089 · TechCorp
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--neutral-400)] shrink-0" />
                </button>
              </div>
              <div>
                <label className="block  text-xs font-medium text-[var(--mw-mirage)] mb-2">
                  Opportunity
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/sell/opportunities/1')}
                  className="w-full flex items-center justify-between h-10 px-3 text-left border border-[var(--border)] rounded-[var(--shape-md)] hover:bg-[var(--accent)] transition-colors"
                >
                  <span className="text-xs font-medium text-[var(--mw-blue)] line-clamp-2">
                    Server Rack Fabrication
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--neutral-400)] shrink-0" />
                </button>
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
            <h3 className=" text-base font-medium text-[var(--mw-mirage)]">
              Products
            </h3>
            <p className=" text-xs text-[var(--neutral-500)]">
              Materials sold
            </p>
          </div>

          <MwDataTable
            columns={productColumns}
            data={PRODUCT_DATA}
            keyExtractor={(row) => row.id}
            selectedKeys={selectedIds}
          />

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
            <h3 className=" text-base font-medium text-[var(--mw-mirage)]">
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
              <div className=" text-xs tabular-nums text-[var(--neutral-500)]">
                $20,000
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-mirage)]">
                $500
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-mirage)]">
                $19,500
              </div>
              <ProgressBar value={500} max={20000} size="sm" />
            </div>

            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-[var(--mw-mirage)]">
                Labour
              </div>
              <div className=" text-xs tabular-nums text-[var(--neutral-500)]">
                $20,000
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-mirage)]">
                $10,000
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-amber)]">
                $10,000
              </div>
              <ProgressBar value={10000} max={20000} size="sm" />
            </div>

            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-[var(--mw-mirage)]">
                Purchase
              </div>
              <div className=" text-xs tabular-nums text-[var(--neutral-500)]">
                $10,000
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-mirage)]">
                $3,000
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-mirage)]">
                $7,000
              </div>
              <ProgressBar value={3000} max={10000} size="sm" />
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
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className=" text-sm font-medium text-[var(--mw-mirage)]">
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
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className=" text-sm font-medium text-[var(--mw-mirage)]">
              Intelligence Hub
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-10">
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
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h3 className=" text-sm font-medium text-[var(--mw-mirage)] mb-3">
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
        <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h3 className=" text-sm font-medium text-[var(--mw-mirage)] mb-3">
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

          {chatMessages.length > 0 && (
            <div className="space-y-2 mb-3">
              {chatMessages.map((m, i) => (
                <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : '')}>
                  {m.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--mw-yellow-400)] flex items-center justify-center text-[10px] font-bold shrink-0">AI</div>
                  )}
                  <div className={cn(
                    'rounded-lg px-3 py-2 text-xs max-w-[85%]',
                    m.role === 'user'
                      ? 'bg-[var(--mw-mirage)] text-white'
                      : 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <Paperclip className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
            <Input
              placeholder="Type a message..."
              className="flex-1 h-10 text-xs"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(); }}
            />
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <Camera className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
            <Button size="sm" className="h-10 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] px-3" onClick={handleChatSubmit}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}