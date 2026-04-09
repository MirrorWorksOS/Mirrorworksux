/**
 * Sell Customer Detail - Full contact record page
 * Follows PlanJobDetail tab pattern with 65/35 two-column overview
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, MoreVertical, Mail, Phone, MapPin, Globe, Building2, Users, FileText, Clock, Plus, ChevronDown, ChevronUp, ExternalLink, MessageSquare, PhoneCall, Send, Upload, Trash2, Pencil, Archive } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { PageShell } from '@/components/shared/layout/PageShell';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { FinancialTable, type FinancialColumn } from '@/components/shared/data/FinancialTable';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { customers, opportunities, quotes, salesOrders, sellInvoices, sellActivities, employees } from '@/services/mock';
import { AIFeed } from '@/components/shared/ai/AIFeed';

// ============================================================
// Mock Data — built from centralised @/services/mock exports
// ============================================================

/** Map an employee id to a display name (fallback to id). */
const empName = (empId: string) => employees.find(e => e.id === empId)?.name ?? empId;

/** Capitalise the first letter and title-case status strings for display. */
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

/** Format an ISO date string (yyyy-mm-dd) to "dd Mon yyyy". */
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Format an ISO datetime to a relative-time string. */
const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

/**
 * Build the mockCustomers Record from centralised data.
 * Each entry is shaped exactly as the rendering code expects.
 */
const mockCustomers: Record<string, any> = {};

customers.forEach((c, idx) => {
  // Derive related records for this customer
  const custOpps = opportunities.filter(o => o.customerId === c.id);
  const custQuotes = quotes.filter(q => q.customerId === c.id);
  const custOrders = salesOrders.filter(so => so.customerId === c.id);
  const custInvoices = sellInvoices.filter(inv => inv.customerId === c.id);
  const custActivities = sellActivities.filter(a => a.customerId === c.id);

  // Compute financial aggregates from centralised invoices
  const lifetimeRevenue = c.totalRevenue;
  const outstanding = custInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  // Use the centralised customer id as the key so routes match navigation
  const key = c.id;

  mockCustomers[key] = {
    id: key,
    company: c.company,
    abn: '51 824 753 556', // placeholder — not in centralised Customer type
    industry: 'Manufacturing',
    website: `https://${c.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.au`,
    annualRevenue: c.totalRevenue * 10,
    employeeCount: 50 + idx * 15,
    accountOwner: 'Sarah Chen',
    status: c.status,
    types: idx === 3 ? ['Customer', 'Vendor'] : ['Customer'],
    primaryContact: {
      name: c.contact,
      title: 'Account Contact',
      email: c.email,
      phone: c.phone,
      mobile: c.phone, // re-use phone as mobile placeholder
      preferred: 'email',
    },
    address: {
      street: c.address,
      city: c.city,
      state: c.state,
      postcode: c.postcode,
      country: 'Australia',
    },
    additionalContacts: [] as any[],
    financial: {
      lifetimeRevenue,
      outstanding,
      avgPaymentTerms: 'Net 30',
      creditLimit: 50000,
      paymentRating: outstanding > 10000 ? 'amber' : 'green',
    },
    tags: ['Fabrication'],
    source: 'Direct',
    notes: c.notes,

    // Related records bridged to the shapes the rendering code expects
    opportunities: custOpps.map(o => ({
      id: o.id.toUpperCase(),
      name: o.title,
      stage: titleCase(o.stage),
      value: o.value,
      closeDate: fmtDate(o.expectedClose),
    })),

    recentQuotes: custQuotes.map(q => ({
      ref: q.ref,
      date: fmtDate(q.date),
      value: q.value,
      status: titleCase(q.status),
    })),

    recentOrders: custOrders.map(so => ({
      ref: so.orderNumber,
      date: fmtDate(so.date),
      value: so.total,
      status: titleCase(so.status),
    })),

    activity: custActivities.map(a => ({
      type: a.type,
      desc: a.description,
      time: a.dueDate ? relativeTime(a.dueDate) : '',
      user: empName(a.assignedTo),
    })),

    invoices: custInvoices.map(inv => ({
      ref: inv.invoiceNumber,
      date: fmtDate(inv.date),
      amount: inv.amount,
      status: titleCase(inv.status),
      due: fmtDate(inv.dueDate),
    })),

    documents: [
      { name: `${c.company.replace(/\s+/g, '_')}_Purchase_Order.pdf`, category: 'Purchase orders', uploadedBy: c.contact, date: fmtDate(c.createdAt), size: '245 KB' },
    ],
  };
});

// Primary key is now c.id (e.g. "cust-001") — no dual-keying needed

// ============================================================
// Helpers
// ============================================================

const accountStatusVariant = (s: string) => {
  switch (s) {
    case 'active': return 'success' as const;
    case 'prospect': return 'info' as const;
    case 'inactive': return 'neutral' as const;
    case 'on-hold': return 'warning' as const;
    default: return 'neutral' as const;
  }
};

const typeStyle = (t: string) => {
  switch (t) {
    case 'Customer': return 'bg-[var(--neutral-100)] text-foreground';
    case 'Vendor': return 'bg-[var(--neutral-100)] text-foreground';
    case 'Subcontractor': return 'bg-[var(--mw-yellow-400)]/20 text-foreground';
    default: return 'bg-[var(--neutral-100)] text-[var(--neutral-500)]';
  }
};

const recordStatusVariant = (s: string) => {
  switch (s) {
    case 'Sent': case 'Proposal': return 'info' as const;
    case 'Accepted': case 'Paid': case 'Completed': return 'success' as const;
    case 'Declined': case 'Overdue': return 'error' as const;
    case 'In Progress': return 'accent' as const;
    case 'Negotiation': return 'warning' as const;
    case 'Draft': return 'neutral' as const;
    default: return 'neutral' as const;
  }
};

const activityIcon = (type: string) => {
  switch (type) {
    case 'email': return <Mail className="w-4 h-4" />;
    case 'call': return <PhoneCall className="w-4 h-4" />;
    case 'note': return <MessageSquare className="w-4 h-4" />;
    case 'order': return <FileText className="w-4 h-4" />;
    case 'meeting': return <Users className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const fmt = (n: number) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ============================================================
// Main Component
// ============================================================

type Tab = 'overview' | 'sales' | 'accounting' | 'contacts' | 'documents' | 'activity';

export function SellCustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [additionalContactsOpen, setAdditionalContactsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const customer = mockCustomers[id || 'cust-001'] || mockCustomers['cust-001'];

  const allContacts = [
    { name: customer.primaryContact.name, role: customer.primaryContact.title, email: customer.primaryContact.email, phone: customer.primaryContact.phone, isPrimary: true },
    ...customer.additionalContacts.map((c: any) => ({ name: c.name, role: c.role, email: c.email, phone: c.phone, isPrimary: false })),
  ];

  const opportunityColumns: MwColumnDef<any>[] = [
    { key: 'id', header: 'ID', tooltip: 'Opportunity reference', cell: (opp) => <span className="text-xs font-medium tabular-nums">{opp.id}</span> },
    { key: 'name', header: 'Name', cell: (opp) => <span className="font-medium">{opp.name}</span> },
    { key: 'stage', header: 'Stage', cell: (opp) => <StatusBadge variant={recordStatusVariant(opp.stage)}>{opp.stage}</StatusBadge> },
    { key: 'value', header: 'Value', tooltip: 'Estimated opportunity value', headerClassName: 'text-right', className: 'text-right tabular-nums font-medium', cell: (opp) => fmt(opp.value) },
    { key: 'closeDate', header: 'Expected close', tooltip: 'Target close date', cell: (opp) => <span className="text-[var(--neutral-500)]">{opp.closeDate}</span> },
  ];

  const quoteOrderColumns: MwColumnDef<any>[] = [
    { key: 'ref', header: 'Reference', tooltip: 'Quote or order reference number', cell: (row) => <span className="text-xs font-medium tabular-nums">{row.ref}</span> },
    { key: 'date', header: 'Date', cell: (row) => <span className="text-[var(--neutral-500)]">{row.date}</span> },
    { key: 'value', header: 'Value', tooltip: 'Total value incl. tax', headerClassName: 'text-right', className: 'text-right tabular-nums font-medium', cell: (row) => fmt(row.value) },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge variant={recordStatusVariant(row.status)}>{row.status}</StatusBadge> },
  ];

  const invoiceColumns: FinancialColumn<any>[] = [
    { key: 'ref', header: 'Invoice #', accessor: (inv) => inv.ref, format: 'text' },
    { key: 'date', header: 'Date', accessor: (inv) => inv.date, format: 'text' },
    { key: 'amount', header: 'Amount', accessor: (inv) => inv.amount, format: 'currency' },
    { key: 'status', header: 'Status', accessor: (inv) => inv.status, format: 'text', align: 'left' },
    { key: 'due', header: 'Due date', accessor: (inv) => inv.due, format: 'text' },
  ];

  const contactColumns: MwColumnDef<any>[] = [
    { key: 'name', header: 'Name', cell: (c) => <span className="font-medium text-foreground">{c.name}</span> },
    { key: 'role', header: 'Role', tooltip: 'Contact role at company', cell: (c) => <span className="text-[var(--neutral-500)]">{c.role}</span> },
    { key: 'email', header: 'Email', cell: (c) => <a href={`mailto:${c.email}`} className="text-foreground hover:underline">{c.email}</a> },
    { key: 'phone', header: 'Phone', cell: (c) => <span className="text-[var(--neutral-500)]">{c.phone}</span> },
    { key: 'primary', header: 'Primary', tooltip: 'Primary contact for this account', headerClassName: 'text-center', className: 'text-center', cell: (c) => c.isPrimary ? <span className="w-2 h-2 bg-[var(--mw-mirage)] rounded-full inline-block" /> : '—' },
  ];

  const documentColumns: MwColumnDef<any>[] = [
    { key: 'name', header: 'Filename', cell: (doc) => <span className="flex items-center gap-2 font-medium"><FileText className="w-4 h-4 text-[var(--neutral-500)]" /> {doc.name}</span> },
    { key: 'category', header: 'Category', tooltip: 'Document classification', cell: (doc) => <span className="text-[var(--neutral-500)]">{doc.category}</span> },
    { key: 'uploadedBy', header: 'Uploaded by', cell: (doc) => <span className="text-[var(--neutral-500)]">{doc.uploadedBy}</span> },
    { key: 'date', header: 'Date', cell: (doc) => <span className="text-[var(--neutral-500)]">{doc.date}</span> },
    { key: 'size', header: 'Size', tooltip: 'File size', headerClassName: 'text-right', className: 'text-right tabular-nums', cell: (doc) => <span className="text-[var(--neutral-500)]">{doc.size}</span> },
  ];

  const tabs: { key: Tab; label: string; count?: number; icon?: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'sales', label: 'Sales', count: customer.opportunities.length + customer.recentQuotes.length },
    { key: 'accounting', label: 'Accounting', count: customer.invoices.length },
    { key: 'contacts', label: 'Contacts', count: 1 + customer.additionalContacts.length },
    { key: 'documents', label: 'Documents', count: customer.documents.length },
    { key: 'activity', label: 'Activity', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <PageShell className="p-0 space-y-0 min-h-screen bg-[var(--neutral-100)] flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/sell/crm')} className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[var(--mw-mirage)] text-white text-sm font-medium">
              {customer.company.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-medium text-foreground">
              {customer.company}
            </h1>
            {customer.types.map((t: string) => (
              <Badge key={t} className={cn('rounded text-xs px-2 py-0.5 border-0', typeStyle(t))}>{t}</Badge>
            ))}
            <StatusBadge variant={accountStatusVariant(customer.status)}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </StatusBadge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground font-medium" onClick={() => navigate('/sell/quotes/new')}>
              New quote
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-[var(--neutral-100)] rounded transition-colors">
                  <MoreVertical className="w-5 h-5 text-[var(--neutral-500)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setArchiveOpen(true)}><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteOpen(true)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
              <AlertDialogContent className="rounded-[var(--shape-lg)]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive {customer.company}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This customer will be hidden from active lists. You can restore them later from the archive.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent className="rounded-[var(--shape-lg)]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {customer.company}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All quotes, orders, and activity history associated with this customer will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="overflow-x-auto">
          <TabsList className="h-auto min-h-11 flex-wrap justify-start gap-1 rounded-xl p-1 w-fit">
            {tabs.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-2 px-3 sm:px-4">
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge variant="secondary" className="border-0 bg-[var(--neutral-200)] px-1.5 py-0 text-xs font-medium text-[var(--neutral-800)] tabular-nums">
                    {tab.count}
                  </Badge>
                )}
                {tab.icon}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Info */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h2 className="text-lg font-medium text-foreground mb-6">Company information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Company name" value={customer.company} />
                  <Field label="ABN" value={customer.abn} mono />
                  <Field label="Industry" value={customer.industry} />
                  <Field label="Website" value={customer.website} link />
                  <Field label="Annual revenue" value={fmt(customer.annualRevenue)} mono />
                  <Field label="Employees" value={String(customer.employeeCount)} />
                  <Field label="Account owner" value={customer.accountOwner} />
                  <Field label="Source" value={customer.source} />
                </div>
              </Card>

              {/* Primary Contact */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h2 className="text-lg font-medium text-foreground mb-6">Primary contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Name" value={customer.primaryContact.name} />
                  <Field label="Job title" value={customer.primaryContact.title} />
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Email</span>
                    <a href={`mailto:${customer.primaryContact.email}`} className="text-sm text-foreground hover:underline flex items-center gap-1.5">
                      <Mail className="w-4 h-4" /> {customer.primaryContact.email}
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Phone</span>
                    <a href={`tel:${customer.primaryContact.phone}`} className="text-sm text-foreground hover:underline flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> {customer.primaryContact.phone}
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Mobile</span>
                    <a href={`tel:${customer.primaryContact.mobile}`} className="text-sm text-foreground hover:underline flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> {customer.primaryContact.mobile}
                    </a>
                  </div>
                  <Field label="Preferred contact" value={customer.primaryContact.preferred} />
                </div>
              </Card>

              {/* Address */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-foreground">Address</h2>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${customer.address.street}, ${customer.address.city} ${customer.address.state} ${customer.address.postcode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4" /> Open in maps
                  </a>
                </div>
                <div className="text-sm text-foreground leading-relaxed">
                  <p>{customer.address.street}</p>
                  <p>{customer.address.city}, {customer.address.state} {customer.address.postcode}</p>
                  <p>{customer.address.country}</p>
                </div>
              </Card>

              {/* Additional Contacts */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <button
                  onClick={() => setAdditionalContactsOpen(!additionalContactsOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <h2 className="text-lg font-medium text-foreground">
                    Additional contacts (<span className="tabular-nums">{customer.additionalContacts.length}</span>)
                  </h2>
                  {additionalContactsOpen ? <ChevronUp className="w-5 h-5 text-[var(--neutral-500)]" /> : <ChevronDown className="w-5 h-5 text-[var(--neutral-500)]" />}
                </button>
                {additionalContactsOpen && (
                  <div className="mt-4 space-y-3">
                    {customer.additionalContacts.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-[var(--neutral-100)] rounded-lg">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-[var(--border)] text-[var(--neutral-500)] text-xs font-medium">
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-[var(--neutral-500)]">{c.role}</p>
                        </div>
                        <a href={`mailto:${c.email}`} className="text-xs text-foreground hover:underline">{c.email}</a>
                        <span className="text-xs text-[var(--neutral-500)]">{c.phone}</span>
                      </div>
                    ))}
                    <button className="text-xs text-foreground hover:underline flex items-center gap-1 mt-2">
                      <Plus className="w-4 h-4" /> Add contact
                    </button>
                  </div>
                )}
              </Card>

              {/* Financial Summary */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h2 className="text-lg font-medium text-foreground mb-6">Financial summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Lifetime revenue</span>
                    <p className="text-xl font-medium tabular-nums text-foreground">{fmt(customer.financial.lifetimeRevenue)}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Outstanding</span>
                    <p className="text-xl font-medium tabular-nums text-foreground">{fmt(customer.financial.outstanding)}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Payment terms</span>
                    <p className="text-base font-medium text-foreground">{customer.financial.avgPaymentTerms}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">Credit limit</span>
                    <p className="text-base font-medium tabular-nums text-foreground">{fmt(customer.financial.creditLimit)}</p>
                  </div>
                </div>
              </Card>

              {/* Tags & Notes */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">Tags & notes</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {customer.tags.map((tag: string) => (
                    <Badge key={tag} variant="softAccent" className="rounded text-xs px-2 py-0.5">{tag}</Badge>
                  ))}
                  <button className="text-xs text-foreground hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add tag
                  </button>
                </div>
                <div className="bg-[var(--neutral-100)] rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">{customer.notes}</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-2">Last updated 2 days ago by Jill Wright</p>
                </div>
              </Card>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Activity Timeline */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-foreground">Recent activity</h3>
                  <button className="text-xs text-foreground hover:underline">View all</button>
                </div>
                <div className="space-y-4">
                  {customer.activity.slice(0, 5).map((a: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] flex items-center justify-center flex-shrink-0 text-[var(--neutral-500)]">
                        {activityIcon(a.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-foreground leading-snug">{a.desc}</p>
                        <p className="text-xs text-[var(--neutral-500)] mt-0.5">{a.time} · {a.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-[var(--border)] text-xs">
                  <Plus className="w-4 h-4 mr-1.5" /> Log activity
                </Button>
              </Card>

              {/* Active Opportunities */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-foreground">Active opportunities</h3>
                  <button className="text-xs text-foreground hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>
                <div className="space-y-3">
                  {customer.opportunities.map((opp: any) => (
                    <div key={opp.id} className="p-3 bg-[var(--neutral-100)] rounded-lg hover:bg-[var(--neutral-100)] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium tabular-nums text-foreground">{opp.id}</span>
                        <StatusBadge variant={recordStatusVariant(opp.stage)}>{opp.stage}</StatusBadge>
                      </div>
                      <p className="text-xs font-medium text-foreground mb-1">{opp.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs tabular-nums text-foreground">{fmt(opp.value)}</span>
                        <span className="text-xs text-[var(--neutral-500)]">{opp.closeDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Quotes & Orders */}
              <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
                <h3 className="text-base font-medium text-foreground mb-4">Recent quotes & orders</h3>
                <div className="space-y-2">
                  {[...customer.recentQuotes.slice(0, 3), ...customer.recentOrders.slice(0, 2)].map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div>
                        <span className="text-xs font-medium tabular-nums text-foreground">{item.ref}</span>
                        <p className="text-xs text-[var(--neutral-500)]">{item.date}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs tabular-nums text-foreground">{fmt(item.value)}</span>
                        <StatusBadge variant={recordStatusVariant(item.status)} className="text-[10px] px-1.5 py-0">{item.status}</StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-xs text-foreground hover:underline mt-3">View all →</button>
              </Card>

              {/* Agent insights */}
              <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-4">
                <AIFeed module="sell" initialCount={2} />
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Quotes & orders</h2>
              <Button className="h-10 px-5 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground font-medium" onClick={() => navigate('/sell/quotes/new')}>
                New quote
              </Button>
            </div>

            {/* Active Opportunities */}
            <MwDataTable<any>
              columns={opportunityColumns}
              data={customer.opportunities}
              keyExtractor={(opp: any) => opp.id}
              filterBar={<h3 className="text-base font-medium text-foreground">Active opportunities</h3>}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            />

            {/* Quotes */}
            <MwDataTable<any>
              columns={quoteOrderColumns}
              data={customer.recentQuotes}
              keyExtractor={(q: any) => q.ref}
              filterBar={<h3 className="text-base font-medium text-foreground">Quotes</h3>}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            />

            {/* Sales Orders */}
            <MwDataTable<any>
              columns={quoteOrderColumns}
              data={customer.recentOrders}
              keyExtractor={(o: any) => o.ref}
              filterBar={<h3 className="text-base font-medium text-foreground">Sales orders</h3>}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            />
          </div>
        )}

        {/* Accounting Tab */}
        {activeTab === 'accounting' && (
          <div className="p-6 space-y-6">
            {/* AR Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiStatCard label="Lifetime revenue" value={fmt(customer.financial.lifetimeRevenue)} layout="compact" />
              <KpiStatCard label="Outstanding" value={fmt(customer.financial.outstanding)} layout="compact" />
              <KpiStatCard label="Credit limit" value={fmt(customer.financial.creditLimit)} layout="compact" />
              <KpiStatCard label="Payment terms" value={customer.financial.avgPaymentTerms} layout="compact" />
            </div>

            {/* Invoices */}
            <div>
              <h3 className="text-base font-medium text-foreground mb-3">Invoices</h3>
              <FinancialTable<any>
                columns={invoiceColumns}
                data={customer.invoices}
                keyExtractor={(inv: any) => inv.ref}
              />
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">All contacts at {customer.company}</h2>
              <Button variant="outline" className="border-[var(--border)]"><Plus className="w-4 h-4 mr-2" /> Add contact</Button>
            </div>
            <MwDataTable<any>
              columns={contactColumns}
              data={allContacts}
              keyExtractor={(c: any, i: number) => `contact-${i}`}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            />
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Documents</h2>
              <Button variant="outline" className="border-[var(--border)]"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
            </div>
            {/* Drop zone */}
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center bg-[var(--neutral-100)]">
              <Upload className="w-8 h-8 text-[var(--neutral-500)] mx-auto mb-2" />
              <p className="text-sm text-[var(--neutral-500)]">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">PDF, DXF, DWG, STEP, images up to 25 MB</p>
            </div>
            <MwDataTable<any>
              columns={documentColumns}
              data={customer.documents}
              keyExtractor={(doc: any, i: number) => `doc-${i}`}
              selectable
              onExport={(keys) => toast.success(`Exporting ${keys.size} items…`)}
              onDelete={(keys) => toast.success(`Deleting ${keys.size} items…`)}
            />
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Activity log</h2>
              <Button variant="outline" className="border-[var(--border)]"><Plus className="w-4 h-4 mr-2" /> Log activity</Button>
            </div>
            {/* Filter chips */}
            <div className="flex gap-2">
              {['All', 'Emails', 'Calls', 'Meetings', 'Notes', 'System'].map((f) => (
                <button key={f} className={cn(
                  "px-3 py-1.5 rounded-full text-xs transition-colors",
                  f === 'All' ? 'bg-[var(--mw-mirage)] text-white' : 'bg-[var(--neutral-100)] text-[var(--neutral-500)] hover:bg-[var(--border)]'
                )}>{f}</button>
              ))}
            </div>
            <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
              <div className="space-y-6">
                {customer.activity.map((a: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--neutral-100)] flex items-center justify-center flex-shrink-0 text-[var(--neutral-500)]">
                      {activityIcon(a.type)}
                    </div>
                    <div className="flex-1 min-w-0 pb-6 border-b border-[var(--border)] last:border-0">
                      <p className="text-sm text-foreground leading-relaxed">{a.desc}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[var(--neutral-500)]">{a.time}</span>
                        <span className="text-xs text-[var(--neutral-500)]">· {a.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ============================================================
// Helper Components
// ============================================================

function Field({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: boolean }) {
  return (
    <div>
      <span className="block text-xs font-medium text-[var(--neutral-500)] mb-1">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:underline flex items-center gap-1">
          <Globe className="w-4 h-4" /> {value.replace('https://', '')}
        </a>
      ) : (
        <p className={cn('text-sm text-foreground', mono && 'tabular-nums')}>{value}</p>
      )}
    </div>
  );
}
