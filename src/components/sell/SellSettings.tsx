/**
 * Sell Settings — 8 panels with real form controls
 * Following BookSettings as the reference template.
 * Panels: General, Teams, Leads & Pipeline, Quoting, Payments, Activities, Analytics, Integrations
 */
import React, { useState } from 'react';
import { Settings, Users, Target, FileText, CreditCard, Calendar, BarChart3, Plug, Lock, Plus, Trash2, Mail, Phone } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

type SettingsPanel = 'general' | 'teams' | 'pipeline' | 'quoting' | 'payments' | 'activities' | 'analytics' | 'integrations';

const panels: { key: SettingsPanel; label: string; icon: any }[] = [
  { key: 'general',      label: 'General',          icon: Settings },
  { key: 'teams',        label: 'Teams',             icon: Users },
  { key: 'pipeline',     label: 'Leads & Pipeline',  icon: Target },
  { key: 'quoting',      label: 'Quoting',           icon: FileText },
  { key: 'payments',     label: 'Payments',          icon: CreditCard },
  { key: 'activities',   label: 'Activities',        icon: Calendar },
  { key: 'analytics',    label: 'Analytics',         icon: BarChart3 },
  { key: 'integrations', label: 'Integrations',      icon: Plug },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-wider text-[#737373] font-medium mb-2 uppercase">{children}</div>
      <Separator className="mb-4" />
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" className="text-[#737373] text-sm h-10">Discard</Button>
      <Button className="h-10 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] rounded">Save changes</Button>
    </div>
  );
}

// ── General Panel ──────────────────────────────────────────
function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Organisation defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Company name</Label>
            <div className="relative">
              <Input defaultValue="Alliance Metal Pty Ltd" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] pr-10" readOnly />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            </div>
            <p className="text-xs text-[#737373] mt-1">Change in Control → Organisation settings</p>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default currency</Label>
            <Select defaultValue="aud">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aud">AUD — Australian Dollar</SelectItem>
                <SelectItem value="usd">USD — US Dollar</SelectItem>
                <SelectItem value="nzd">NZD — New Zealand Dollar</SelectItem>
                <SelectItem value="sgd">SGD — Singapore Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default tax rate</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="10" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
              <span className="text-sm text-[#737373]">% (GST)</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Sell module preferences</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Show pipeline value in opportunity list',    checked: true },
            { label: 'Auto-convert won opportunities to orders',   checked: false },
            { label: 'Require approval for quotes over $50,000',   checked: true },
            { label: 'Enable AI deal scoring',                     checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Teams Panel ────────────────────────────────────────────
function TeamsPanel() {
  const members = [
    { name: 'Sarah Chen',     email: 'sarah@alliancemetal.com.au',    role: 'Admin',     initials: 'SC', active: true },
    { name: 'Mike Tremblay',  email: 'mike@alliancemetal.com.au',     role: 'Manager',   initials: 'MT', active: true },
    { name: 'Emma Wilson',    email: 'emma@alliancemetal.com.au',     role: 'Estimator', initials: 'EW', active: true },
    { name: 'Dave Li',        email: 'dave@alliancemetal.com.au',     role: 'Sales Rep', initials: 'DL', active: true },
    { name: 'Tom Burke',      email: 'tom@alliancemetal.com.au',      role: 'Sales Rep', initials: 'TB', active: false },
  ];

  const roleColours: Record<string, { bg: string; text: string }> = {
    Admin:     { bg: 'bg-[#FEE2E2]',  text: 'text-[#EF4444]' },
    Manager:   { bg: 'bg-[#DBEAFE]',  text: 'text-[#0A7AFF]' },
    Estimator: { bg: 'bg-[#FFEDD5]',  text: 'text-[#FF8B00]' },
    'Sales Rep':{ bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]' },
  };

  return (
    <div className="space-y-6 max-w-[720px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[#0A0A0A]">Team members</h3>
          <p className="text-sm text-[#737373] mt-0.5">{members.filter(m => m.active).length} active members</p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2">
          <Plus className="w-4 h-4" /> Invite member
        </Button>
      </div>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              {['MEMBER', 'EMAIL', 'ROLE', 'STATUS', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => {
              const rc = roleColours[m.role] ?? { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]' };
              return (
                <tr key={m.email} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors">
                  <td className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-xs font-medium">
                        {m.initials}
                      </div>
                      <span className="text-sm text-[#0A0A0A] font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 text-sm text-[#737373]">{m.email}</td>
                  <td className="px-4">
                    <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', rc.bg, rc.text)}>{m.role}</Badge>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', m.active ? 'bg-[#36B37E]' : 'bg-[#E5E5E5]')} />
                      <span className="text-xs text-[#737373]">{m.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-[#737373] hover:text-[#0A0A0A]">Edit</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-6">
        <h4 className="text-[14px] font-semibold text-[#0A0A0A] mb-4">Invite new member</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label className="text-sm mb-2 block font-medium">Email address</Label>
            <Input placeholder="name@alliancemetal.com.au" className="h-12 border-[#E5E5E5] rounded" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Role</Label>
            <Select defaultValue="sales">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="estimator">Estimator</SelectItem>
                <SelectItem value="sales">Sales Rep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full h-12 bg-[#0A0A0A] hover:bg-[#2C2C2C] text-white">
              <Mail className="w-4 h-4 mr-2" /> Send invite
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Leads & Pipeline Panel ─────────────────────────────────
function PipelinePanel() {
  const stages = [
    { name: 'New',          probability: 10, color: '#737373' },
    { name: 'Qualified',    probability: 25, color: '#0A7AFF' },
    { name: 'Proposal',     probability: 50, color: '#7C3AED' },
    { name: 'Negotiation',  probability: 75, color: '#FF8B00' },
    { name: 'Won',          probability: 100, color: '#36B37E' },
    { name: 'Lost',         probability: 0,   color: '#EF4444' },
  ];

  const sources = ['Website enquiry', 'Trade show', 'Referral', 'Cold outreach', 'Repeat customer', 'LinkedIn'];

  return (
    <div className="space-y-8 max-w-[720px]">
      <SaveRow />
      <div>
        <SectionLabel>Pipeline stages</SectionLabel>
        <div className="space-y-2">
          {stages.map(s => (
            <div key={s.name} className="flex items-center gap-4 bg-white border border-[#E5E5E5] rounded-lg p-3 hover:bg-[#FAFAFA] transition-colors">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-sm text-[#0A0A0A] font-medium">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737373]">Probability</span>
                <Input defaultValue={`${s.probability}`} type="number" className="w-20 h-8 text-sm border-[#E5E5E5] text-right font-['Roboto_Mono',monospace]" />
                <span className="text-sm text-[#737373]">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Lead sources</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {sources.map(s => (
            <div key={s} className="flex items-center gap-1.5 bg-white border border-[#E5E5E5] rounded-full px-3 py-1.5">
              <span className="text-sm text-[#0A0A0A]">{s}</span>
              <button className="text-[#A3A3A3] hover:text-[#EF4444] transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-1 border border-dashed border-[#E5E5E5] rounded-full px-3 py-1.5 text-sm text-[#737373] hover:border-[#A3A3A3] transition-colors">
            <Plus className="w-3 h-3" /> Add source
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Scoring rules</SectionLabel>
        <div className="space-y-3">
          {[
            { rule: 'Company size > 50 employees',        points: '+15' },
            { rule: 'Value > $50,000',                     points: '+20' },
            { rule: 'Source is Referral',                  points: '+10' },
            { rule: 'No activity for 14+ days',            points: '-10' },
          ].map(r => (
            <div key={r.rule} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{r.rule}</span>
              <span className={cn("text-sm font-['Roboto_Mono',monospace] font-semibold", r.points.startsWith('+') ? 'text-[#36B37E]' : 'text-[#EF4444]')}>
                {r.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Quoting Panel ──────────────────────────────────────────
function QuotingPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Quote numbering</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Quote prefix</Label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="MW-Q-" className="h-12 border-[#E5E5E5] rounded w-32" />
              <span className="text-xs text-[#737373] font-['Roboto_Mono',monospace]">Preview: MW-Q-0047</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Next number</Label>
            <Input defaultValue="48" type="number" className="h-12 border-[#E5E5E5] rounded w-32" />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Quote defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Expiry period</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="30" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
              <span className="text-sm text-[#737373]">days</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default margin target</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="20" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
              <span className="text-sm text-[#737373]">%</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default payment terms</Label>
            <Select defaultValue="net30">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Approval workflows</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Require approval for quotes over',     type: 'input', value: '50000', suffix: '$', prefix: '' },
            { label: 'Require approval for discounts over',  type: 'input', value: '10',    suffix: '%', prefix: '' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-[#0A0A0A]">{r.label}</span>
              <div className="flex items-center gap-2">
                <Input defaultValue={r.value} type="number" className="h-10 border-[#E5E5E5] rounded w-24 text-right font-['Roboto_Mono',monospace]" />
                <span className="text-sm text-[#737373]">{r.suffix}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
            <div>
              <span className="text-sm text-[#0A0A0A]">Notify manager on quote submission</span>
              <p className="text-xs text-[#737373] mt-0.5">Send email when estimator submits a quote for review</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payments Panel ─────────────────────────────────────────
function PaymentsPanel() {
  const integrations = [
    {
      name: 'Stripe',
      description: 'Online card payments and direct debit',
      logo: '🔵',
      bgColor: '#635BFF',
      connected: true,
      accountId: 'acct_1N3xVb2eZvKYlo2C',
    },
    {
      name: 'PayPal',
      description: 'PayPal and pay later options',
      logo: '💛',
      bgColor: '#003087',
      connected: false,
      accountId: '',
    },
    {
      name: 'Tyro',
      description: 'EFTPOS and in-person payments (Australia)',
      logo: '🔴',
      bgColor: '#E02020',
      connected: false,
      accountId: '',
    },
    {
      name: 'Xero',
      description: 'Sync invoices and payments to Xero',
      logo: '🟦',
      bgColor: '#13B5EA',
      connected: true,
      accountId: 'xero-org-8821',
    },
  ];

  return (
    <div className="space-y-6 max-w-[640px]">
      <div className="space-y-4">
        {integrations.map(integ => (
          <Card key={integ.name} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: integ.bgColor }}
                >
                  {integ.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#0A0A0A]">{integ.name}</h3>
                    {integ.connected && (
                      <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0 text-xs rounded-full px-2 py-0.5">Connected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#737373] mt-0.5">{integ.description}</p>
                  {integ.connected && integ.accountId && (
                    <p className="text-xs text-[#737373] font-['Roboto_Mono',monospace] mt-1">{integ.accountId}</p>
                  )}
                </div>
              </div>
              <Button
                variant={integ.connected ? 'outline' : 'default'}
                size="sm"
                className={cn(
                  'h-9 text-xs',
                  integ.connected
                    ? 'border-[#E5E5E5] text-[#737373]'
                    : 'bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] border-0'
                )}
              >
                {integ.connected ? 'Configure' : 'Connect'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-5">
        <h4 className="text-[14px] font-semibold text-[#0A0A0A] mb-3">Bank account (EFT)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">BSB</Label>
            <Input defaultValue="062-000" className="h-12 border-[#E5E5E5] rounded font-['Roboto_Mono',monospace]" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Account number</Label>
            <Input defaultValue="12345678" type="password" className="h-12 border-[#E5E5E5] rounded font-['Roboto_Mono',monospace]" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732]">Save bank details</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Activities Panel ───────────────────────────────────────
function ActivitiesPanel() {
  const activityTypes = [
    { name: 'Phone call',    icon: '📞', colour: '#0A7AFF', enabled: true },
    { name: 'Email',         icon: '✉️',  colour: '#36B37E', enabled: true },
    { name: 'Meeting',       icon: '🤝',  colour: '#7C3AED', enabled: true },
    { name: 'Site visit',    icon: '🏭',  colour: '#FF8B00', enabled: true },
    { name: 'Quote sent',    icon: '📄',  colour: '#FFCF4B', enabled: true },
    { name: 'Demo',          icon: '💻',  colour: '#EF4444', enabled: false },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Activity types</SectionLabel>
        <div className="space-y-2">
          {activityTypes.map(a => (
            <div key={a.name} className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-base">{a.icon}</span>
                <span className="text-sm text-[#0A0A0A] font-medium">{a.name}</span>
              </div>
              <Switch defaultChecked={a.enabled} />
            </div>
          ))}
          <button className="w-full flex items-center gap-2 border border-dashed border-[#E5E5E5] rounded-lg p-3 text-sm text-[#737373] hover:border-[#A3A3A3] transition-colors">
            <Plus className="w-4 h-4" /> Add activity type
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Notifications</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Email me when an activity is overdue',          checked: true },
            { label: 'Daily digest of upcoming activities',            checked: true },
            { label: 'Notify team when opportunity stage changes',    checked: false },
            { label: 'Reminder 1 day before activity due date',       checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Auto-log settings</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-log outbound emails as activities', checked: true },
            { label: 'Auto-log quote sends as activities',     checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Analytics Panel ────────────────────────────────────────
function AnalyticsPanel() {
  const widgets = [
    { label: 'Pipeline value by stage',  enabled: true },
    { label: 'Win rate trend',           enabled: true },
    { label: 'Revenue forecast',         enabled: true },
    { label: 'Activities by rep',        enabled: false },
    { label: 'Quote conversion rate',    enabled: true },
    { label: 'Average deal size',        enabled: false },
    { label: 'Lead source breakdown',    enabled: true },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Dashboard widgets</SectionLabel>
        <p className="text-sm text-[#737373] mb-4">Choose which widgets appear on the Sell dashboard.</p>
        <div className="space-y-2">
          {widgets.map(w => (
            <div key={w.label} className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg p-3">
              <span className="text-sm text-[#0A0A0A]">{w.label}</span>
              <Switch defaultChecked={w.enabled} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Reporting period</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default date range</Label>
            <Select defaultValue="month">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This financial year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Export</SectionLabel>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[#E5E5E5] gap-2">Export pipeline CSV</Button>
          <Button variant="outline" className="border-[#E5E5E5] gap-2">Export activities CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Integrations Panel ─────────────────────────────────────
function IntegrationsPanel() {
  return (
    <div className="space-y-4 max-w-[640px]">
      {[
        { name: 'Xero',      description: 'Accounting integration — sync invoices and payments', connected: true,  colour: '#13B5EA' },
        { name: 'Stripe',    description: 'Payment processing for online quotes',                connected: true,  colour: '#635BFF' },
        { name: 'HubSpot',   description: 'CRM data sync',                                       connected: false, colour: '#FF7A59' },
        { name: 'Zapier',    description: 'Connect Sell to 5,000+ apps via Zapier webhooks',     connected: false, colour: '#FF4A00' },
        { name: 'Google Cal','description': 'Sync activities to Google Calendar',                connected: false, colour: '#4285F4' },
        { name: 'Slack',     description: 'Post won/lost deal notifications to Slack',           connected: false, colour: '#4A154B' },
      ].map(integ => (
        <Card key={integ.name} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: integ.colour }}
              >
                {integ.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">{integ.name}</h3>
                  {integ.connected && (
                    <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0 text-xs rounded-full px-2 py-0.5">Connected</Badge>
                  )}
                </div>
                <p className="text-xs text-[#737373] mt-0.5">{integ.description}</p>
              </div>
            </div>
            <Button
              variant={integ.connected ? 'outline' : 'default'}
              size="sm"
              className={cn(
                'h-9 text-xs',
                integ.connected
                  ? 'border-[#E5E5E5] text-[#737373]'
                  : 'bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] border-0'
              )}
            >
              {integ.connected ? 'Configure' : 'Connect'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────
const PANEL_MAP: Record<SettingsPanel, () => JSX.Element> = {
  general:      GeneralPanel,
  teams:        TeamsPanel,
  pipeline:     PipelinePanel,
  quoting:      QuotingPanel,
  payments:     PaymentsPanel,
  activities:   ActivitiesPanel,
  analytics:    AnalyticsPanel,
  integrations: IntegrationsPanel,
};

export function SellSettings() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>('general');
  const PanelComponent = PANEL_MAP[activePanel];

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[32px] tracking-tight text-[#0A0A0A] mb-6">Sell Settings</h1>

        <div className="flex gap-6">
          {/* Left Navigation */}
          <div className="w-56 flex-shrink-0">
            <Card className="bg-white border border-[#E5E5E5] rounded-lg p-3 h-fit">
              <nav className="space-y-0.5">
                {panels.map(panel => {
                  const Icon = panel.icon;
                  return (
                    <button
                      key={panel.key}
                      onClick={() => setActivePanel(panel.key)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                        activePanel === panel.key
                          ? 'bg-[#FFFBF0] text-[#0A0A0A] font-medium'
                          : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {panel.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="flex-1 min-w-0">
            <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
              <PanelComponent />
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}