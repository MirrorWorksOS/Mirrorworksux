/**
 * Sell Customer Detail - Full contact record page
 * Follows PlanJobDetail tab pattern with 65/35 two-column overview
 */

import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Mail, Phone, MapPin, Globe, Building2, Users, FileText, Clock, Plus, Sparkles, ChevronDown, ChevronUp, ExternalLink, MessageSquare, PhoneCall, Send, Upload, Trash2, Pencil, Archive } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

// ============================================================
// Mock Data
// ============================================================

const mockCustomers: Record<string, any> = {
  '1': {
    id: '1', company: 'TechCorp Industries', abn: '51 824 753 556', industry: 'Automotive',
    website: 'https://techcorp.com.au', annualRevenue: 2400000, employeeCount: 85,
    accountOwner: 'Jill Wright', status: 'active', types: ['Customer'],
    primaryContact: { name: 'Sarah Chen', title: 'Procurement Manager', email: 'sarah@techcorp.com', phone: '+61 2 9876 5432', mobile: '+61 412 345 678', preferred: 'email' },
    address: { street: '42 Industrial Drive', city: 'Roseberry', state: 'NSW', postcode: '2018', country: 'Australia' },
    additionalContacts: [
      { name: 'Tom Harris', role: 'Engineering Lead', email: 'tom@techcorp.com', phone: '+61 2 9876 5433' },
      { name: 'Priya Patel', role: 'Accounts Payable', email: 'priya@techcorp.com', phone: '+61 2 9876 5434' },
    ],
    financial: { lifetimeRevenue: 245000, outstanding: 18500, avgPaymentTerms: 'Net 30', creditLimit: 50000, paymentRating: 'green' },
    tags: ['Tier 1', 'Automotive', 'Repeat buyer'],
    source: 'Referral',
    notes: 'Key account — supplies chassis components for their EV line. Sarah prefers email for quotes, phone for urgent changes.',
    opportunities: [
      { id: 'OPP-042', name: 'EV Battery Enclosures x200', stage: 'Proposal', value: 48000, closeDate: '15 Apr 2026' },
      { id: 'OPP-039', name: 'Mounting Bracket Redesign', stage: 'Negotiation', value: 12500, closeDate: '28 Mar 2026' },
    ],
    recentQuotes: [
      { ref: 'MW-Q-0055', date: '12 Mar 2026', value: 48000, status: 'Sent' },
      { ref: 'MW-Q-0048', date: '28 Feb 2026', value: 12500, status: 'Accepted' },
      { ref: 'MW-Q-0041', date: '15 Feb 2026', value: 8200, status: 'Declined' },
    ],
    recentOrders: [
      { ref: 'SO-0089', date: '01 Mar 2026', value: 24500, status: 'In Progress' },
      { ref: 'SO-0072', date: '10 Feb 2026', value: 18200, status: 'Completed' },
    ],
    activity: [
      { type: 'email', desc: 'Quote MW-Q-0055 sent to Sarah Chen', time: '2 hours ago', user: 'Jill Wright' },
      { type: 'call', desc: 'Discussed EV enclosure specs — confirmed 3mm 5052 aluminium', time: '1 day ago', user: 'Jill Wright' },
      { type: 'note', desc: 'Customer requested expedited delivery for next order', time: '3 days ago', user: 'Mark Stevens' },
      { type: 'order', desc: 'Sales order SO-0089 created ($24,500.00)', time: '5 days ago', user: 'Jill Wright' },
      { type: 'email', desc: 'Quote MW-Q-0048 accepted by Sarah Chen', time: '1 week ago', user: 'System' },
      { type: 'meeting', desc: 'Site visit — reviewed production capacity for Q2', time: '2 weeks ago', user: 'Jill Wright' },
    ],
    invoices: [
      { ref: 'INV-2026-0047', date: '01 Mar 2026', amount: 24500, status: 'Sent', due: '31 Mar 2026' },
      { ref: 'INV-2026-0032', date: '10 Feb 2026', amount: 18200, status: 'Paid', due: '12 Mar 2026' },
      { ref: 'INV-2026-0018', date: '15 Jan 2026', amount: 9800, status: 'Paid', due: '14 Feb 2026' },
    ],
    documents: [
      { name: 'TechCorp_Purchase_Order_2026.pdf', category: 'Purchase orders', uploadedBy: 'Sarah Chen', date: '12 Mar 2026', size: '245 KB' },
      { name: 'EV_Enclosure_Drawing_v3.dxf', category: 'Drawings/CAD files', uploadedBy: 'Tom Harris', date: '10 Mar 2026', size: '1.2 MB' },
      { name: 'Material_Spec_5052_Aluminium.pdf', category: 'Specifications', uploadedBy: 'Jill Wright', date: '28 Feb 2026', size: '89 KB' },
    ],
  },
};

// Fill remaining IDs with variants of the first
['2','3','4','5','6'].forEach((id, i) => {
  const names = [
    { company: 'Pacific Fabrication', contact: 'Mike Thompson', email: 'mike@pacificfab.com.au' },
    { company: 'Hunter Steel Co', contact: 'Emma Wilson', email: 'emma@huntersteel.com.au' },
    { company: 'BHP Contractors', contact: 'David Lee', email: 'david@bhpcontractors.com' },
    { company: 'Sydney Rail Corp', contact: 'Jessica Brown', email: 'jbrown@sydneyrail.gov.au' },
    { company: 'Kemppi Australia', contact: 'Tom Anderson', email: 'tom@kemppi.com.au' },
  ];
  mockCustomers[id] = {
    ...mockCustomers['1'],
    id,
    company: names[i].company,
    primaryContact: { ...mockCustomers['1'].primaryContact, name: names[i].contact, email: names[i].email },
    status: id === '5' ? 'prospect' : 'active',
    types: id === '4' ? ['Customer', 'Vendor'] : ['Customer'],
  };
});

// ============================================================
// Helpers
// ============================================================

const statusStyle = (s: string) => {
  switch (s) {
    case 'active': return 'bg-[#E3FCEF] text-[#36B37E]';
    case 'prospect': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'inactive': return 'bg-[#F5F5F5] text-[#737373]';
    case 'on-hold': return 'bg-[#FFEDD5] text-[#FF8B00]';
    default: return 'bg-[#F5F5F5] text-[#737373]';
  }
};

const typeStyle = (t: string) => {
  switch (t) {
    case 'Customer': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'Vendor': return 'bg-[#E3FCEF] text-[#36B37E]';
    case 'Subcontractor': return 'bg-[#FFEDD5] text-[#FF8B00]';
    default: return 'bg-[#F5F5F5] text-[#737373]';
  }
};

const badgeStatus = (s: string) => {
  switch (s) {
    case 'Sent': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'Accepted': case 'Paid': case 'Completed': return 'bg-[#E3FCEF] text-[#36B37E]';
    case 'Declined': case 'Overdue': return 'bg-[#FEE2E2] text-[#EF4444]';
    case 'Draft': return 'bg-[#F5F5F5] text-[#737373]';
    case 'In Progress': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'Proposal': return 'bg-[#DBEAFE] text-[#0A7AFF]';
    case 'Negotiation': return 'bg-[#FFFBF0] text-[#FF8B00]';
    default: return 'bg-[#F5F5F5] text-[#737373]';
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

  const customer = mockCustomers[id || '1'] || mockCustomers['1'];

  const tabs: { key: Tab; label: string; count?: number; icon?: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'sales', label: 'Sales', count: customer.opportunities.length + customer.recentQuotes.length },
    { key: 'accounting', label: 'Accounting', count: customer.invoices.length },
    { key: 'contacts', label: 'Contacts', count: 1 + customer.additionalContacts.length },
    { key: 'documents', label: 'Documents', count: customer.documents.length },
    { key: 'activity', label: 'Activity', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/sell/crm')} className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#0A0A0A]" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#0052CC] text-white text-sm font-medium">
              {customer.company.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-['Geist:SemiBold',sans-serif] text-[20px] font-semibold text-[#0A0A0A]">
              {customer.company}
            </h1>
            {customer.types.map((t: string) => (
              <Badge key={t} className={cn('rounded text-xs px-2 py-0.5 border-0', typeStyle(t))}>{t}</Badge>
            ))}
            <Badge className={cn('rounded text-xs px-2 py-0.5 border-0 capitalize', statusStyle(customer.status))}>
              {customer.status}
            </Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] font-medium rounded" onClick={() => navigate('/sell/quotes/new')}>
              New quote
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-[#F5F5F5] rounded transition-colors">
                  <MoreVertical className="w-5 h-5 text-[#737373]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-[#EF4444]"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 font-['Geist:Regular',sans-serif] text-[14px] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === tab.key ? 'bg-[#F5F5F5] text-[#0A0A0A] font-medium' : 'text-[#737373] hover:bg-[#FAFAFA]'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="flex items-center justify-center min-w-[20px] h-5 bg-[#0A0A0A] text-white text-[11px] rounded-full font-medium px-1.5">
                  {tab.count}
                </span>
              )}
              {tab.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Info */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A] mb-6">Company information</h2>
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
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A] mb-6">Primary contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Name" value={customer.primaryContact.name} />
                  <Field label="Job title" value={customer.primaryContact.title} />
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Email</span>
                    <a href={`mailto:${customer.primaryContact.email}`} className="text-[14px] text-[#0A7AFF] hover:underline flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {customer.primaryContact.email}
                    </a>
                  </div>
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Phone</span>
                    <a href={`tel:${customer.primaryContact.phone}`} className="text-[14px] text-[#0A7AFF] hover:underline flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {customer.primaryContact.phone}
                    </a>
                  </div>
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Mobile</span>
                    <a href={`tel:${customer.primaryContact.mobile}`} className="text-[14px] text-[#0A7AFF] hover:underline flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {customer.primaryContact.mobile}
                    </a>
                  </div>
                  <Field label="Preferred contact" value={customer.primaryContact.preferred} />
                </div>
              </Card>

              {/* Address */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">Address</h2>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${customer.address.street}, ${customer.address.city} ${customer.address.state} ${customer.address.postcode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#0A7AFF] hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4" /> Open in maps
                  </a>
                </div>
                <div className="text-[14px] text-[#0A0A0A] leading-relaxed">
                  <p>{customer.address.street}</p>
                  <p>{customer.address.city}, {customer.address.state} {customer.address.postcode}</p>
                  <p>{customer.address.country}</p>
                </div>
              </Card>

              {/* Additional Contacts */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <button
                  onClick={() => setAdditionalContactsOpen(!additionalContactsOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">
                    Additional contacts ({customer.additionalContacts.length})
                  </h2>
                  {additionalContactsOpen ? <ChevronUp className="w-5 h-5 text-[#737373]" /> : <ChevronDown className="w-5 h-5 text-[#737373]" />}
                </button>
                {additionalContactsOpen && (
                  <div className="mt-4 space-y-3">
                    {customer.additionalContacts.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-[#FAFAFA] rounded-lg">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-[#E5E5E5] text-[#737373] text-xs font-medium">
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[#0A0A0A]">{c.name}</p>
                          <p className="text-[12px] text-[#737373]">{c.role}</p>
                        </div>
                        <a href={`mailto:${c.email}`} className="text-[12px] text-[#0A7AFF] hover:underline">{c.email}</a>
                        <span className="text-[12px] text-[#737373]">{c.phone}</span>
                      </div>
                    ))}
                    <button className="text-[13px] text-[#0A7AFF] hover:underline flex items-center gap-1 mt-2">
                      <Plus className="w-3.5 h-3.5" /> Add contact
                    </button>
                  </div>
                )}
              </Card>

              {/* Financial Summary */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A] mb-6">Financial summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Lifetime revenue</span>
                    <p className="font-['Roboto_Mono',monospace] text-[20px] font-semibold text-[#0A0A0A]">{fmt(customer.financial.lifetimeRevenue)}</p>
                  </div>
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Outstanding</span>
                    <p className="font-['Roboto_Mono',monospace] text-[20px] font-semibold text-[#FF8B00]">{fmt(customer.financial.outstanding)}</p>
                  </div>
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Payment terms</span>
                    <p className="text-[16px] font-medium text-[#0A0A0A]">{customer.financial.avgPaymentTerms}</p>
                  </div>
                  <div>
                    <span className="block text-[13px] font-medium text-[#737373] mb-1">Credit limit</span>
                    <p className="font-['Roboto_Mono',monospace] text-[16px] font-medium text-[#0A0A0A]">{fmt(customer.financial.creditLimit)}</p>
                  </div>
                </div>
              </Card>

              {/* Tags & Notes */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A] mb-4">Tags & notes</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {customer.tags.map((tag: string) => (
                    <Badge key={tag} className="bg-[#FFFBF0] text-[#2C2C2C] border border-[#FFCF4B] rounded text-xs px-2 py-0.5">{tag}</Badge>
                  ))}
                  <button className="text-[12px] text-[#0A7AFF] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add tag
                  </button>
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <p className="text-[14px] text-[#0A0A0A] leading-relaxed">{customer.notes}</p>
                  <p className="text-[12px] text-[#737373] mt-2">Last updated 2 days ago by Jill Wright</p>
                </div>
              </Card>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Activity Timeline */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">Recent activity</h3>
                  <button className="text-[12px] text-[#0A7AFF] hover:underline">View all</button>
                </div>
                <div className="space-y-4">
                  {customer.activity.slice(0, 5).map((a: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 text-[#737373]">
                        {activityIcon(a.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-[#0A0A0A] leading-snug">{a.desc}</p>
                        <p className="text-[11px] text-[#737373] mt-0.5">{a.time} · {a.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-[#E5E5E5] text-[13px]">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Log activity
                </Button>
              </Card>

              {/* Active Opportunities */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">Active opportunities</h3>
                  <button className="text-[12px] text-[#0A7AFF] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
                <div className="space-y-3">
                  {customer.opportunities.map((opp: any) => (
                    <div key={opp.id} className="p-3 bg-[#FAFAFA] rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['JetBrains_Mono',monospace] text-[12px] font-bold text-[#0A0A0A]">{opp.id}</span>
                        <Badge className={cn('rounded text-xs px-2 py-0.5 border-0', badgeStatus(opp.stage))}>{opp.stage}</Badge>
                      </div>
                      <p className="text-[13px] font-medium text-[#0A0A0A] mb-1">{opp.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-['Roboto_Mono',monospace] text-[13px] text-[#0A0A0A]">{fmt(opp.value)}</span>
                        <span className="text-[11px] text-[#737373]">{opp.closeDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Quotes & Orders */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-4">Recent quotes & orders</h3>
                <div className="space-y-2">
                  {[...customer.recentQuotes.slice(0, 3), ...customer.recentOrders.slice(0, 2)].map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
                      <div>
                        <span className="font-['JetBrains_Mono',monospace] text-[12px] font-bold text-[#0A0A0A]">{item.ref}</span>
                        <p className="text-[11px] text-[#737373]">{item.date}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-['Roboto_Mono',monospace] text-[12px] text-[#0A0A0A]">{fmt(item.value)}</span>
                        <Badge className={cn('rounded text-[10px] px-1.5 py-0 border-0', badgeStatus(item.status))}>{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-[12px] text-[#0A7AFF] hover:underline mt-3">View all →</button>
              </Card>

              {/* Intelligence Hub */}
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#FFCF4B]" />
                  <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A]">Intelligence Hub</h3>
                </div>
                <p className="text-[13px] text-[#737373] leading-relaxed">
                  TechCorp's order frequency has increased 40% this quarter. Consider offering volume pricing on 5052 aluminium enclosures to lock in Q2 demand.
                </p>
                <p className="text-[11px] text-[#737373] mt-2">Updated 3 hours ago</p>
              </Card>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">Quotes & orders</h2>
              <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] font-medium rounded" onClick={() => navigate('/sell/quotes/new')}>
                New quote
              </Button>
            </div>

            {/* Active Opportunities */}
            <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5]">
                <h3 className="font-['Geist:Medium',sans-serif] text-[16px] font-medium text-[#0A0A0A]">Active opportunities</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Stage</th>
                    <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Expected close</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.opportunities.map((opp: any) => (
                    <tr key={opp.id} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors">
                      <td className="px-6 font-['JetBrains_Mono',monospace] text-[13px] font-bold text-[#0A0A0A]">{opp.id}</td>
                      <td className="px-6 text-[14px] text-[#0A0A0A]">{opp.name}</td>
                      <td className="px-6"><Badge className={cn('rounded text-xs px-2 py-0.5 border-0', badgeStatus(opp.stage))}>{opp.stage}</Badge></td>
                      <td className="px-6 text-right font-['Roboto_Mono',monospace] text-[14px]">{fmt(opp.value)}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{opp.closeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Quotes */}
            <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5]">
                <h3 className="font-['Geist:Medium',sans-serif] text-[16px] font-medium text-[#0A0A0A]">Quotes</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentQuotes.map((q: any) => (
                    <tr key={q.ref} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors">
                      <td className="px-6 font-['JetBrains_Mono',monospace] text-[13px] font-bold text-[#0A0A0A]">{q.ref}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{q.date}</td>
                      <td className="px-6 text-right font-['Roboto_Mono',monospace] text-[14px]">{fmt(q.value)}</td>
                      <td className="px-6"><Badge className={cn('rounded text-xs px-2 py-0.5 border-0', badgeStatus(q.status))}>{q.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Sales Orders */}
            <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5]">
                <h3 className="font-['Geist:Medium',sans-serif] text-[16px] font-medium text-[#0A0A0A]">Sales orders</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentOrders.map((o: any) => (
                    <tr key={o.ref} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors">
                      <td className="px-6 font-['JetBrains_Mono',monospace] text-[13px] font-bold text-[#0A0A0A]">{o.ref}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{o.date}</td>
                      <td className="px-6 text-right font-['Roboto_Mono',monospace] text-[14px]">{fmt(o.value)}</td>
                      <td className="px-6"><Badge className={cn('rounded text-xs px-2 py-0.5 border-0', badgeStatus(o.status))}>{o.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Accounting Tab */}
        {activeTab === 'accounting' && (
          <div className="p-6 space-y-6">
            {/* AR Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Lifetime revenue', value: fmt(customer.financial.lifetimeRevenue), color: 'text-[#0A0A0A]' },
                { label: 'Outstanding', value: fmt(customer.financial.outstanding), color: 'text-[#FF8B00]' },
                { label: 'Credit limit', value: fmt(customer.financial.creditLimit), color: 'text-[#0A0A0A]' },
                { label: 'Payment terms', value: customer.financial.avgPaymentTerms, color: 'text-[#0A0A0A]', noMono: true },
              ].map((kpi) => (
                <Card key={kpi.label} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                  <span className="block text-[13px] font-medium text-[#737373] mb-2">{kpi.label}</span>
                  <p className={cn('text-[24px] font-semibold', kpi.color, !kpi.noMono && "font-['Roboto_Mono',monospace]")}>{kpi.value}</p>
                </Card>
              ))}
            </div>

            {/* Invoices */}
            <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5]">
                <h3 className="font-['Geist:Medium',sans-serif] text-[16px] font-medium text-[#0A0A0A]">Invoices</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Due date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.invoices.map((inv: any) => (
                    <tr key={inv.ref} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors">
                      <td className="px-6 font-['JetBrains_Mono',monospace] text-[13px] font-bold text-[#0A0A0A]">{inv.ref}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{inv.date}</td>
                      <td className="px-6 text-right font-['Roboto_Mono',monospace] text-[14px]">{fmt(inv.amount)}</td>
                      <td className="px-6"><Badge className={cn('rounded text-xs px-2 py-0.5 border-0', badgeStatus(inv.status))}>{inv.status}</Badge></td>
                      <td className="px-6 text-[14px] text-[#737373]">{inv.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">All contacts at {customer.company}</h2>
              <Button variant="outline" className="border-[#E5E5E5]"><Plus className="w-4 h-4 mr-2" /> Add contact</Button>
            </div>
            <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Phone</th>
                    <th className="px-6 py-3 text-center text-xs tracking-wider text-[#737373] font-medium uppercase">Primary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors">
                    <td className="px-6 text-[14px] font-medium text-[#0A0A0A]">{customer.primaryContact.name}</td>
                    <td className="px-6 text-[14px] text-[#737373]">{customer.primaryContact.title}</td>
                    <td className="px-6"><a href={`mailto:${customer.primaryContact.email}`} className="text-[14px] text-[#0A7AFF] hover:underline">{customer.primaryContact.email}</a></td>
                    <td className="px-6 text-[14px] text-[#737373]">{customer.primaryContact.phone}</td>
                    <td className="px-6 text-center"><span className="w-2 h-2 bg-[#36B37E] rounded-full inline-block" /></td>
                  </tr>
                  {customer.additionalContacts.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors">
                      <td className="px-6 text-[14px] font-medium text-[#0A0A0A]">{c.name}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{c.role}</td>
                      <td className="px-6"><a href={`mailto:${c.email}`} className="text-[14px] text-[#0A7AFF] hover:underline">{c.email}</a></td>
                      <td className="px-6 text-[14px] text-[#737373]">{c.phone}</td>
                      <td className="px-6 text-center">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">Documents</h2>
              <Button variant="outline" className="border-[#E5E5E5]"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
            </div>
            {/* Drop zone */}
            <div className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-8 text-center bg-[#FAFAFA]">
              <Upload className="w-8 h-8 text-[#737373] mx-auto mb-2" />
              <p className="text-[14px] text-[#737373]">Drag and drop files here, or click to browse</p>
              <p className="text-[12px] text-[#737373] mt-1">PDF, DXF, DWG, STEP, images up to 25 MB</p>
            </div>
            <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Filename</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Uploaded by</th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider text-[#737373] font-medium uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs tracking-wider text-[#737373] font-medium uppercase">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.documents.map((doc: any, i: number) => (
                    <tr key={i} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors cursor-pointer">
                      <td className="px-6 text-[14px] text-[#0A7AFF] hover:underline flex items-center gap-2 h-14">
                        <FileText className="w-4 h-4 text-[#737373]" /> {doc.name}
                      </td>
                      <td className="px-6 text-[14px] text-[#737373]">{doc.category}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{doc.uploadedBy}</td>
                      <td className="px-6 text-[14px] text-[#737373]">{doc.date}</td>
                      <td className="px-6 text-[14px] text-[#737373] text-right">{doc.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">Activity log</h2>
              <Button variant="outline" className="border-[#E5E5E5]"><Plus className="w-4 h-4 mr-2" /> Log activity</Button>
            </div>
            {/* Filter chips */}
            <div className="flex gap-2">
              {['All', 'Emails', 'Calls', 'Meetings', 'Notes', 'System'].map((f) => (
                <button key={f} className={cn(
                  "px-3 py-1.5 rounded-full text-[13px] transition-colors",
                  f === 'All' ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5]'
                )}>{f}</button>
              ))}
            </div>
            <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
              <div className="space-y-6">
                {customer.activity.map((a: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 text-[#737373]">
                      {activityIcon(a.type)}
                    </div>
                    <div className="flex-1 min-w-0 pb-6 border-b border-[#F5F5F5] last:border-0">
                      <p className="text-[14px] text-[#0A0A0A] leading-relaxed">{a.desc}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[12px] text-[#737373]">{a.time}</span>
                        <span className="text-[12px] text-[#737373]">· {a.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Helper Components
// ============================================================

function Field({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: boolean }) {
  return (
    <div>
      <span className="block text-[13px] font-medium text-[#737373] mb-1">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#0A7AFF] hover:underline flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" /> {value.replace('https://', '')}
        </a>
      ) : (
        <p className={cn('text-[14px] text-[#0A0A0A]', mono && "font-['Roboto_Mono',monospace]")}>{value}</p>
      )}
    </div>
  );
}
