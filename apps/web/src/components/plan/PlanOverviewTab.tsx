import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Save, Share2, Expand, Send, Upload, Download, Camera, Paperclip, ExternalLink, Pencil, Search, Check, Copy, Link2, FileUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { AIInsightMessage } from '../shared/ai/AIInsightCard';
import { MwDataTable, type MwColumnDef } from '../shared/data/MwDataTable';
import { StatusBadge, type StatusKey } from '../shared/data/StatusBadge';
import { ProgressBar } from '../shared/data/ProgressBar';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { customers as centralCustomers } from '@/services';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../ui/dialog';

interface PlanOverviewTabProps {
  isEditing?: boolean;
  onEditToggle?: () => void;
  /** Switch the parent JobWorkspaceLayout to a sibling tab — wires the
   *  "Expand" buttons in the right rail (Schedule, Intelligence Hub, Files). */
  onSwitchTab?: (tab: 'schedule' | 'intelligence' | 'production' | 'travellers' | 'budget' | 'mirrorview') => void;
}

/** Simple share-link dialog shared by the Products / Budget / Files cards. */
function ShareLinkDialog({
  open, onOpenChange, title, url,
}: { open: boolean; onOpenChange: (v: boolean) => void; title: string; url: string }) {
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
    }
    toast.success('Link copied');
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {title}</DialogTitle>
          <DialogDescription>
            Anyone with this link can view {title.toLowerCase()} for this job.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[var(--neutral-500)]" />
          <Input readOnly value={url} className="h-10 text-xs" />
          <Button onClick={handleCopy} className="h-10">
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** "Create schedule item" modal — creates a one-off entry on the mini calendar.
 *  Submit hands off to the toast for the prototype; production wires to the
 *  schedule store. */
function ScheduleItemDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('10:00');
  const [notes, setNotes] = useState('');
  const reset = () => { setTitle(''); setDate(''); setFrom('09:00'); setTo('10:00'); setNotes(''); };
  const handleCreate = () => {
    if (!title || !date) {
      toast.error('Title and date are required');
      return;
    }
    toast.success(`Scheduled: ${title}`, { description: `${date} · ${from}–${to}` });
    reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create schedule item</DialogTitle>
          <DialogDescription>
            Add a one-off entry to this job's mini schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Order 3rd party powder coating" className="mt-1 h-10" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-10" />
            </div>
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">From</Label>
              <Input type="time" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-10" />
            </div>
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">To</Label>
              <Input type="time" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-10" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-[var(--neutral-500)]">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context or instructions…" className="mt-1 min-h-[80px] text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]">
            <Calendar className="mr-1.5 h-3.5 w-3.5" /> Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** File upload dialog — uses a hidden input plus drop zone visual. */
function FileUploadDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const handleSelect = (selected: FileList | null) => {
    if (!selected) return;
    setFiles(Array.from(selected));
  };
  const handleConfirm = () => {
    if (files.length === 0) {
      toast.error('Pick at least one file first');
      return;
    }
    toast.success(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'}`);
    setFiles([]);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setFiles([]); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Drawings, NC programs, supplier docs, photos — anything that belongs on this job.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-[var(--shape-md)] border-2 border-dashed border-[var(--border)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-50)] p-8 text-sm text-[var(--neutral-500)] hover:border-[var(--mw-yellow-400)] hover:text-foreground"
        >
          <FileUp className="h-6 w-6" />
          <span>Click to browse, or drop files</span>
          {files.length > 0 ? (
            <span className="text-xs text-foreground">{files.map((f) => f.name).join(', ')}</span>
          ) : null}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleSelect(e.target.files)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]">
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Customer combobox — searches the central customer DB instead of a free-text input. */
function CustomerSearch({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (company: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => centralCustomers.map((c) => ({
    id: c.id, company: c.company, contact: c.contact,
  })), []);
  if (disabled) {
    return (
      <Input
        value={value}
        readOnly
        placeholder="Select customer..."
        className="bg-[var(--neutral-100)] border-transparent"
      />
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-[var(--shape-md)] border border-[var(--border)] px-3 text-left text-sm hover:bg-[var(--accent)]"
        >
          <span className={value ? 'text-foreground' : 'text-[var(--neutral-400)]'}>
            {value || 'Search customers…'}
          </span>
          <Search className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search customer database…" />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {options.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.company}
                  onSelect={(v) => { onChange(v); setOpen(false); }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === c.company ? 'opacity-100' : 'opacity-0')} />
                  <div className="flex flex-col">
                    <span className="text-sm">{c.company}</span>
                    <span className="text-xs text-[var(--neutral-500)]">{c.contact}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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

export function PlanOverviewTab({ isEditing: isEditingProp, onEditToggle, onSwitchTab }: PlanOverviewTabProps = {}) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [shareDialog, setShareDialog] = useState<null | 'products' | 'budget' | 'files'>(null);
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const handleDownload = () => {
    // Bundle all files for the job and trigger a browser download. The
    // prototype stub builds a placeholder text manifest; production wires
    // through a server-side zip endpoint.
    const blob = new Blob([
      'CAD Drawings — JOB-2026-0015\n3 items, 2 days ago\n',
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-files.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded file manifest');
  };
  // Local edit toggle for the Job Details card. The parent JobWorkspaceLayout
  // exposes a header-level toggle (isEditingProp) which mirrors this — both
  // drive the same view/edit affordance so the card and header stay in sync.
  const [localEditing, setLocalEditing] = useState(false);
  const isEditing = isEditingProp ?? localEditing;
  const toggleEditing = () => {
    if (onEditToggle) {
      onEditToggle();
    } else {
      setLocalEditing((v) => !v);
    }
    if (isEditing) toast.success('Job details saved');
  };
  const [customer, setCustomer] = useState('');

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
        <span className="text-xs font-medium text-foreground">{row.part}</span>
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
        <span className="text-xs tabular-nums text-foreground">{row.toProduce}</span>
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
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onSwitchTab?.('mirrorview');
            toast.info(`Opening MirrorView for ${row.part}`);
          }}
        >
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className=" text-lg font-medium text-foreground">
              Job Details
            </h2>
            <Button variant="outline" className="border-[var(--border)]" onClick={toggleEditing}>
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Job ID and Stage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Job ID #
                </label>
                <Input
                  value="JOB-2026-0012"
                  readOnly
                  className="bg-[var(--neutral-100)] border-transparent tabular-nums"
                />
              </div>
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Stage
                </label>
                <Select defaultValue="planning" disabled={!isEditing}>
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
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Customer
                </label>
                <CustomerSearch value={customer} onChange={setCustomer} disabled={!isEditing} />
              </div>
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Customer Contact
                </label>
                <Input placeholder="Primary contact name" readOnly={!isEditing} className={!isEditing ? 'bg-[var(--neutral-100)] border-transparent' : ''} />
              </div>
            </div>

            {/* PO and Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Customer PO
                </label>
                <Input placeholder="Purchase order reference" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
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
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Sales Order
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/sell/orders/so-001')}
                  className="w-full flex items-center justify-between h-10 px-3 text-left border border-[var(--border)] rounded-[var(--shape-md)] hover:bg-[var(--accent)] transition-colors"
                >
                  <span className="text-xs font-medium text-[var(--mw-blue)] tabular-nums">
                    SO-2026-0089 · TechCorp
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--neutral-400)] shrink-0" />
                </button>
              </div>
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Opportunity
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/sell/opportunities/opp-001')}
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
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Order Date
                </label>
                <Input type="date" defaultValue="2026-03-15" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Planned Production Date
                </label>
                <Input type="date" defaultValue="2026-04-01" />
              </div>
              <div>
                <label className="block  text-xs font-medium text-foreground mb-2">
                  Expected Delivery Date
                </label>
                <Input type="date" defaultValue="2026-04-15" />
              </div>
            </div>

            {/* Sales Rep */}
            <div>
              <label className="block  text-xs font-medium text-foreground mb-2">
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
              <label className="block  text-xs font-medium text-foreground mb-2">
                Shipping Instructions
              </label>
              <Textarea
                placeholder="Special handling notes, delivery instructions..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block  text-xs font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                placeholder="Job description, scope of work, special requirements..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className=" text-base font-medium text-foreground">
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
            <Button variant="outline" className="border-[var(--border)]" onClick={() => toast.success('Products saved')}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-[var(--border)]" onClick={() => onSwitchTab?.('production')}>
              <Expand className="w-4 h-4 mr-2" />
              Expand
            </Button>
            <Button variant="outline" className="border-[var(--border)]" onClick={() => setShareDialog('products')}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        {/* Budget Section */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className=" text-base font-medium text-foreground">
              Budget
            </h3>
            <p className=" text-xs text-[var(--neutral-500)]">
              Project running costs
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-foreground">
                Materials
              </div>
              <div className=" text-xs tabular-nums text-[var(--neutral-500)]">
                $20,000
              </div>
              <div className=" text-xs tabular-nums text-foreground">
                $500
              </div>
              <div className=" text-xs tabular-nums text-foreground">
                $19,500
              </div>
              <ProgressBar value={500} max={20000} size="sm" />
            </div>

            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-foreground">
                Labour
              </div>
              <div className=" text-xs tabular-nums text-[var(--neutral-500)]">
                $20,000
              </div>
              <div className=" text-xs tabular-nums text-foreground">
                $10,000
              </div>
              <div className=" text-xs tabular-nums text-[var(--mw-amber)]">
                $10,000
              </div>
              <ProgressBar value={10000} max={20000} size="sm" />
            </div>

            <div className="grid grid-cols-5 gap-4 items-center">
              <div className=" text-xs font-medium text-foreground">
                Purchase
              </div>
              <div className=" text-xs tabular-nums text-[var(--neutral-500)]">
                $10,000
              </div>
              <div className=" text-xs tabular-nums text-foreground">
                $3,000
              </div>
              <div className=" text-xs tabular-nums text-foreground">
                $7,000
              </div>
              <ProgressBar value={3000} max={10000} size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[var(--border)]">
            <Button variant="outline" className="border-[var(--border)]" onClick={() => toast.success('Budget saved')}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="border-[var(--border)]" onClick={() => toast.success('Budget sent to finance')}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button variant="outline" className="border-[var(--border)]" onClick={() => setShareDialog('budget')}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>
      </div>

      {/* Right Column - 1/3 width */}
      <div className="space-y-6">
        {/* Schedule Mini-Calendar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className=" text-sm font-medium text-foreground">
              Schedule
            </h3>
            <Calendar className="w-4 h-4 text-[var(--neutral-500)]" />
          </div>
          
          <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] p-3 mb-4">
            <div className="text-center mb-2">
              <span className=" text-xs font-medium text-foreground">
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
                    day === 15 ? 'bg-[var(--mw-yellow-400)] text-primary-foreground font-medium' :
                    day === 8 || day === 22 ? 'bg-[var(--neutral-100)] text-foreground' :
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
              <p className=" text-xs font-medium text-foreground mb-1">
                Order 3rd party powder coating
              </p>
              <p className=" text-xs text-[var(--neutral-500)]">
                Apr 12, 9:00-10:00
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-xs" onClick={() => onSwitchTab?.('schedule')}>
              <Expand className="w-4 h-4 mr-1" />
              Expand
            </Button>
            <Button size="sm" className="flex-1 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] text-xs" onClick={() => setCreateScheduleOpen(true)}>
              <Calendar className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </Card>

        {/* Intelligence Hub Preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className=" text-sm font-medium text-foreground">
              Intelligence Hub
            </h3>
            <Button variant="ghost" size="sm" className="text-xs h-10" onClick={() => onSwitchTab?.('intelligence')}>
              <Expand className="w-4 h-4 mr-1" />
              Expand
            </Button>
          </div>

          <div className="bg-[var(--neutral-100)] rounded-[var(--shape-lg)] aspect-video mb-3 flex items-center justify-center">
            <span className="text-4xl">🔧</span>
          </div>

          <p className=" text-xs font-medium text-foreground mb-2">
            Customer engagement and notes
          </p>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Avatar className="w-6 h-6 border border-[var(--border)] flex-shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                <AvatarFallback className="text-xs">JW</AvatarFallback>
              </Avatar>
              <div>
                <p className=" text-xs text-foreground">
                  Jill Wright uploaded BOM and NC files
                </p>
                <p className=" text-[10px] text-[var(--neutral-500)]">
                  2 hours ago
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Files Section */}
        <Card className="p-6">
          <h3 className=" text-sm font-medium text-foreground mb-3">
            Files
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 p-2 bg-[var(--neutral-100)] rounded">
              <div className="w-8 h-8 bg-[var(--mw-blue)] rounded flex items-center justify-center text-white text-xs">
                CAD
              </div>
              <div className="flex-1 min-w-0">
                <p className=" text-xs font-medium text-foreground truncate">
                  CAD Drawings
                </p>
                <p className=" text-[10px] text-[var(--neutral-500)]">
                  3 items • 2 days ago
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-xs" onClick={() => setUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-xs" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </Card>

        {/* Chatter Section */}
        <Card className="p-6">
          <h3 className=" text-sm font-medium text-foreground mb-3">
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
                  <span className=" text-xs font-medium text-foreground">
                    David Miller
                  </span>
                  <span className=" text-[10px] text-[var(--neutral-500)]">
                    2 hours ago
                  </span>
                </div>
                <p className=" text-xs text-foreground">
                  BOM reviewed and approved. Moving to production planning.
                </p>
              </div>
            </div>
          </div>

          {chatMessages.length > 0 && (
            <div className="space-y-2 mb-3">
              {chatMessages.map((m, i) => (
                <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : '')}>
                  {m.role === 'user' ? (
                    <div className="rounded-lg px-3 py-2 text-xs max-w-[85%] bg-[var(--mw-mirage)] text-white">
                      {m.text}
                    </div>
                  ) : (
                    <div className="max-w-[85%]">
                      <AIInsightMessage timestamp="just now">
                        {m.text}
                      </AIInsightMessage>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => setUploadOpen(true)} title="Attach file">
              <Paperclip className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
            <Input
              placeholder="Ask MirrorWorks Agent..."
              className="flex-1 h-10 text-xs"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(); }}
            />
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => toast.info('Snapshot from camera coming soon')} title="Snapshot">
              <Camera className="w-4 h-4 text-[var(--neutral-500)]" />
            </Button>
            <Button size="sm" className="h-10 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] px-3" onClick={handleChatSubmit}>
              Send
            </Button>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <ShareLinkDialog
        open={shareDialog === 'products'}
        onOpenChange={(v) => !v && setShareDialog(null)}
        title="Products"
        url={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#products` : ''}
      />
      <ShareLinkDialog
        open={shareDialog === 'budget'}
        onOpenChange={(v) => !v && setShareDialog(null)}
        title="Budget"
        url={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#budget` : ''}
      />
      <ScheduleItemDialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen} />
      <FileUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
