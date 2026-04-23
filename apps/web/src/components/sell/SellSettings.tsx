/**
 * Sell Settings — Implements ARCH 00 group-based permissions model
 * Panels: General, Leads & Pipeline, Quoting, Payments, Activities, Analytics, Integrations, Access & Permissions
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Settings, Target, FileText, CreditCard, Calendar, BarChart3, Plug, Lock, Plus, Trash2, Mail, Phone, UserCircle2 } from 'lucide-react';
import {
  usePortalPreferences,
  usePortalPreferencesAdmin,
  defaultPortalPreferences,
  type PortalPreferences,
} from './portalPreferences';
import { customers } from '@/services';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import {
  ModuleSettingsLayout,
  SectionLabel,
  SaveRow,
  type PermissionKey,
  type PermissionGroup,
  type SettingsPanel,
} from '../shared/settings/ModuleSettingsLayout';

// ── Permission keys for Sell module (from ARCH 00 §4.3) ──
const sellPermissionKeys: PermissionKey[] = [
  { key: 'documents.scope', label: 'Document visibility', description: 'Own records only, or all org records', type: 'scope' },
  { key: 'crm.access', label: 'CRM access', description: 'View and manage contacts', type: 'boolean' },
  { key: 'pipeline.visibility', label: 'Pipeline visibility', description: 'See own deals or all deals', type: 'scope' },
  { key: 'quotes.create', label: 'Create quotes', description: 'Create and edit quotes/estimates', type: 'boolean' },
  { key: 'invoices.create', label: 'Create invoices', description: 'Generate and send invoices', type: 'boolean' },
  { key: 'pricing.edit', label: 'Edit pricing', description: 'Change product prices and margins', type: 'boolean' },
  { key: 'portal.access', label: 'Customer portal preview', description: 'Preview the read-only customer portal', type: 'boolean' },
  { key: 'portal.configure', label: 'Configure portal', description: 'Toggle which portal sections customers see', type: 'boolean' },
  { key: 'portal.invitations.send', label: 'Send portal invitations', description: 'Invite customer contacts to the portal', type: 'boolean' },
  { key: 'portal.invitations.revoke', label: 'Revoke portal access', description: 'Revoke a portal contact and invalidate pending invitations', type: 'boolean' },
  { key: 'portal.customers.impersonate', label: 'Impersonate customer', description: 'View the portal as a specific customer would see it', type: 'boolean' },
  { key: 'portal.subscriptions.view', label: 'View customer subscriptions', description: 'See the plan card and usage in the portal', type: 'boolean' },
  { key: 'portal.subscriptions.modify', label: 'Modify customer subscriptions', description: 'Change tier, billing cycle, payment method', type: 'boolean' },
  { key: 'portal.subscriptions.cancel', label: 'Cancel customer subscriptions', description: 'Request cancel (still gated on plan.closable)', type: 'boolean' },
  { key: 'portal.markup.create', label: 'Create 3D markups', description: 'Add new review pins to a quote model', type: 'boolean' },
  { key: 'portal.markup.resolve', label: 'Resolve 3D markups', description: 'Mark markups as resolved or won\u2019t fix', type: 'boolean' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean' },
  { key: 'reports.access', label: 'Reports access', description: 'View analytics and reports', type: 'boolean' },
];

// ── Default groups (from ARCH 00 §4.3) ──
const sellDefaultGroups: PermissionGroup[] = [
  {
    name: 'Sales',
    description: 'Account managers, sales reps, business development',
    isDefault: true,
    members: [
      { name: 'Dave Li', email: 'dave@alliancemetal.com.au', initials: 'DL' },
      { name: 'Tom Burke', email: 'tom@alliancemetal.com.au', initials: 'TB' },
    ],
    permissions: {
      'documents.scope': 'all', 'crm.access': 'true', 'pipeline.visibility': 'all',
      'quotes.create': 'true', 'invoices.create': 'false', 'pricing.edit': 'false',
      'portal.access': 'true', 'portal.configure': 'false',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Estimating',
    description: 'Estimators, cost engineers, technical sales support',
    isDefault: true,
    members: [
      { name: 'Emma Wilson', email: 'emma@alliancemetal.com.au', initials: 'EW' },
    ],
    permissions: {
      'documents.scope': 'own', 'crm.access': 'true', 'pipeline.visibility': 'own',
      'quotes.create': 'true', 'invoices.create': 'false', 'pricing.edit': 'true',
      'portal.access': 'true', 'portal.configure': 'false',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Customer Service',
    description: 'Order entry, customer queries, quote follow-up',
    isDefault: true,
    members: [
      { name: 'Sarah Chen', email: 'sarah@alliancemetal.com.au', initials: 'SC' },
    ],
    permissions: {
      'documents.scope': 'all', 'crm.access': 'true', 'pipeline.visibility': 'all',
      'quotes.create': 'false', 'invoices.create': 'false', 'pricing.edit': 'false',
      'portal.access': 'true', 'portal.configure': 'true',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
];

// ── General Panel ──
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
              <Input defaultValue="Alliance Metal Pty Ltd" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] bg-[var(--neutral-100)] pr-10" readOnly />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-1">Change in Control &rarr; Organisation settings</p>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default currency</Label>
            <Select defaultValue="aud">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-[var(--shape-md)]"><SelectValue /></SelectTrigger>
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
              <Input defaultValue="10" type="number" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] w-24" />
              <span className="text-sm text-[var(--neutral-500)]">% (GST)</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Sell module preferences</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Show pipeline value in opportunity list', checked: true },
            { label: 'Auto-convert won opportunities to orders', checked: false },
            { label: 'Require approval for quotes over $50,000', checked: true },
            { label: 'Enable AI deal scoring', checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-foreground">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Leads & Pipeline Panel ──
function PipelinePanel() {
  const stages = [
    { name: 'New', probability: 10, color: 'var(--neutral-500)' },
    { name: 'Qualified', probability: 25, color: 'var(--mw-info)' },
    { name: 'Proposal', probability: 50, color: 'var(--mw-info)' },
    { name: 'Negotiation', probability: 75, color: 'var(--mw-warning)' },
    { name: 'Won', probability: 100, color: 'var(--mw-success)' },
    { name: 'Lost', probability: 0, color: 'var(--mw-error)' },
  ];

  const sources = ['Website enquiry', 'Trade show', 'Referral', 'Cold outreach', 'Repeat customer', 'LinkedIn'];

  return (
    <div className="space-y-8 max-w-[720px]">
      <SaveRow />
      <div>
        <SectionLabel>Pipeline stages</SectionLabel>
        <div className="space-y-2">
          {stages.map(s => (
            <div key={s.name} className="flex items-center gap-4 bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3 hover:bg-[var(--neutral-100)] transition-colors">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-sm text-foreground font-medium">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--neutral-500)]">Probability</span>
                <Input defaultValue={`${s.probability}`} type="number" className="w-20 h-8 text-sm border-[var(--border)] text-right  rounded-lg" />
                <span className="text-sm text-[var(--neutral-500)]">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Lead sources</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {sources.map(s => (
            <div key={s} className="flex items-center gap-1.5 bg-card border border-[var(--border)] rounded-full px-3 py-1.5">
              <span className="text-sm text-foreground">{s}</span>
              <button className="text-[var(--neutral-400)] hover:text-[var(--mw-error)] transition-colors" onClick={() => toast('Lead source removed')}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-1 border border-dashed border-[var(--border)] rounded-full px-3 py-1.5 text-sm text-[var(--neutral-500)] hover:border-[var(--neutral-400)] transition-colors" onClick={() => toast('Add lead source coming soon')}>
            <Plus className="w-4 h-4" /> Add source
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Scoring rules</SectionLabel>
        <div className="space-y-3">
          {[
            { rule: 'Company size > 50 employees', points: '+15' },
            { rule: 'Value > $50,000', points: '+20' },
            { rule: 'Source is Referral', points: '+10' },
            { rule: 'No activity for 14+ days', points: '-10' },
          ].map(r => (
            <div key={r.rule} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-foreground">{r.rule}</span>
              <span className={cn('text-sm  font-medium', r.points.startsWith('+') ? 'text-foreground' : 'text-[var(--mw-error)]')}>
                {r.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Quoting Panel ──
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
              <Input defaultValue="Q-2026-" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] w-32" />
              <span className="text-xs text-[var(--neutral-500)] ">Preview: Q-2026-0047</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Next number</Label>
            <Input defaultValue="48" type="number" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] w-32" />
          </div>
        </div>
      </div>
      <div>
        <SectionLabel>Quote defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Expiry period</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="30" type="number" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] w-24" />
              <span className="text-sm text-[var(--neutral-500)]">days</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default margin target</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="20" type="number" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] w-24" />
              <span className="text-sm text-[var(--neutral-500)]">%</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default payment terms</Label>
            <Select defaultValue="net30">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-[var(--shape-md)]"><SelectValue /></SelectTrigger>
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
            { label: 'Require approval for quotes over', value: '50000', suffix: '$' },
            { label: 'Require approval for discounts over', value: '10', suffix: '%' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{r.label}</span>
              <div className="flex items-center gap-2">
                <Input defaultValue={r.value} type="number" className="h-10 border-[var(--border)] rounded-lg w-24 text-right " />
                <span className="text-sm text-[var(--neutral-500)]">{r.suffix}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)]">
            <div>
              <span className="text-sm text-foreground">Notify manager on quote submission</span>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">Send email when estimator submits a quote for review</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payments Panel ──
function PaymentsPanel() {
  const integrations = [
    { name: 'Stripe', description: 'Online card payments and direct debit', bgColor: '#635BFF', connected: true, accountId: 'acct_1N3xVb2eZvKYlo2C' },
    { name: 'PayPal', description: 'PayPal and pay later options', bgColor: '#003087', connected: false, accountId: '' },
    { name: 'Tyro', description: 'EFTPOS and in-person payments (Australia)', bgColor: '#E02020', connected: false, accountId: '' },
    { name: 'Xero', description: 'Sync invoices and payments to Xero', bgColor: '#13B5EA', connected: true, accountId: 'xero-org-8821' },
  ];

  return (
    <div className="space-y-6 max-w-[640px]">
      <div className="space-y-4">
        {integrations.map(integ => (
          <Card key={integ.name} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[var(--shape-md)] flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: integ.bgColor }}>
                  {integ.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{integ.name}</h3>
                    {integ.connected && (
                      <Badge className="bg-[var(--neutral-100)] text-foreground border-0 text-xs rounded-full px-2 py-0.5">Connected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{integ.description}</p>
                  {integ.connected && integ.accountId && (
                    <p className="text-xs text-[var(--neutral-500)]  mt-1">{integ.accountId}</p>
                  )}
                </div>
              </div>
              <Button
                variant={integ.connected ? 'outline' : 'default'}
                size="sm"
                className={cn(
                  'h-9 text-xs',
                  integ.connected
                    ? 'border-[var(--border)] text-[var(--neutral-500)]'
                    : 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground border-0'
                )}
                onClick={() => toast(integ.connected ? `Opening ${integ.name} configuration\u2026` : `Connecting to ${integ.name}\u2026`)}
              >
                {integ.connected ? 'Configure' : 'Connect'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Card className="bg-[var(--neutral-100)] border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Bank account (EFT)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">BSB</Label>
            <Input defaultValue="062-000" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] " />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Account number</Label>
            <Input defaultValue="12345678" type="password" className="h-12 border-[var(--border)] rounded-[var(--shape-md)] " />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground" onClick={() => toast.success('Bank details saved')}>Save bank details</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Activities Panel ──
function ActivitiesPanel() {
  const activityTypes = [
    { name: 'Phone call', icon: Phone, enabled: true },
    { name: 'Email', icon: Mail, enabled: true },
    { name: 'Meeting', icon: Calendar, enabled: true },
    { name: 'Site visit', icon: Target, enabled: true },
    { name: 'Quote sent', icon: FileText, enabled: true },
    { name: 'Demo', icon: Settings, enabled: false },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Activity types</SectionLabel>
        <div className="space-y-2">
          {activityTypes.map(a => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="flex items-center justify-between bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-foreground" />
                  <span className="text-sm text-foreground font-medium">{a.name}</span>
                </div>
                <Switch defaultChecked={a.enabled} />
              </div>
            );
          })}
          <button className="w-full flex items-center gap-2 border border-dashed border-[var(--border)] rounded-[var(--shape-md)] p-3 text-sm text-[var(--neutral-500)] hover:border-[var(--neutral-400)] transition-colors" onClick={() => toast('Add activity type coming soon')}>
            <Plus className="w-4 h-4" /> Add activity type
          </button>
        </div>
      </div>
      <div>
        <SectionLabel>Notifications</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Email me when an activity is overdue', checked: true },
            { label: 'Daily digest of upcoming activities', checked: true },
            { label: 'Notify team when opportunity stage changes', checked: false },
            { label: 'Reminder 1 day before activity due date', checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-foreground">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Analytics Panel ──
function AnalyticsPanel() {
  const widgets = [
    { label: 'Pipeline value by stage', enabled: true },
    { label: 'Win rate trend', enabled: true },
    { label: 'Revenue forecast', enabled: true },
    { label: 'Activities by rep', enabled: false },
    { label: 'Quote conversion rate', enabled: true },
    { label: 'Average deal size', enabled: false },
    { label: 'Lead source breakdown', enabled: true },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Dashboard widgets</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">Choose which widgets appear on the Sell dashboard.</p>
        <div className="space-y-2">
          {widgets.map(w => (
            <div key={w.label} className="flex items-center justify-between bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3">
              <span className="text-sm text-foreground">{w.label}</span>
              <Switch defaultChecked={w.enabled} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Reporting period</SectionLabel>
        <div>
          <Label className="text-sm mb-2 block font-medium">Default date range</Label>
          <Select defaultValue="month">
            <SelectTrigger className="h-12 border-[var(--border)] rounded-[var(--shape-md)]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This financial year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <SectionLabel>Export</SectionLabel>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Pipeline CSV exported')}>Export pipeline CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Activities CSV exported')}>Export activities CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Integrations Panel ──
function IntegrationsPanel() {
  return (
    <div className="space-y-4 max-w-[640px]">
      {[
        { name: 'Xero', description: 'Accounting integration — sync invoices and payments', connected: true, colour: '#13B5EA' },
        { name: 'Stripe', description: 'Payment processing for online quotes', connected: true, colour: '#635BFF' },
        { name: 'HubSpot', description: 'CRM data sync', connected: false, colour: '#FF7A59' },
        { name: 'Zapier', description: 'Connect Sell to 5,000+ apps via Zapier webhooks', connected: false, colour: '#FF4A00' },
        { name: 'Google Cal', description: 'Sync activities to Google Calendar', connected: false, colour: '#4285F4' },
        { name: 'Slack', description: 'Post won/lost deal notifications to Slack', connected: false, colour: '#4A154B' },
      ].map(integ => (
        <Card key={integ.name} className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[var(--shape-md)] flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: integ.colour }}>
                {integ.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{integ.name}</h3>
                  {integ.connected && (
                    <Badge className="bg-[var(--neutral-100)] text-foreground border-0 text-xs rounded-full px-2 py-0.5">Connected</Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">{integ.description}</p>
              </div>
            </div>
            <Button
              variant={integ.connected ? 'outline' : 'default'}
              size="sm"
              className={cn(
                'h-9 text-xs',
                integ.connected
                  ? 'border-[var(--border)] text-[var(--neutral-500)]'
                  : 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground border-0'
              )}
              onClick={() => toast(integ.connected ? `Opening ${integ.name} configuration\u2026` : `Connecting to ${integ.name}\u2026`)}
            >
              {integ.connected ? 'Configure' : 'Connect'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Portal Panel ──
function PortalPanel() {
  // v2 schema: tenant-level defaults + per-customer overrides.
  const { tenant, perCustomer, updateTenant, resetCustomer } =
    usePortalPreferencesAdmin();
  // Keep the local hook for a simple "preview" flow so existing tests that
  // use usePortalPreferences() still import successfully.
  const [, update] = usePortalPreferences(null);
  // Whatever the caller passes to `update` must hit the tenant layer (null id).
  void update;

  const toggles: Array<{
    key: keyof PortalPreferences;
    label: string;
    description: string;
  }> = [
    {
      key: 'showShipping',
      label: 'Shipping status',
      description:
        'Show the shipment-by-stage chart and in-flight shipment list. Pulled from Ship module.',
    },
    {
      key: 'showQuotes',
      label: 'Quotes section',
      description:
        'Surface open quotes in the portal so customers can accept or decline online. Disable to keep quote acceptance manual.',
    },
    {
      key: 'allowInvoiceDownload',
      label: 'Invoice PDF download',
      description:
        'Allow customers to download PDF copies of their invoices. When off, customers can view invoice details but not download.',
    },
    {
      key: 'allowDeliveryNoteDownload',
      label: 'Delivery note download',
      description:
        'Allow customers to download signed delivery notes and POD from the shipping panel.',
    },
    {
      key: 'allowOnlinePayment',
      label: 'Online payment link',
      description:
        'Show a "Pay online" button on unpaid invoices that opens a hosted payment session.',
    },
    {
      key: 'showMarkup',
      label: '3D model review',
      description:
        'Surface threaded markups on the 3D model of each quote so customers can flag regions for the engineer.',
    },
    {
      key: 'showSubscriptionUsage',
      label: 'Show subscription usage',
      description:
        'Render the usage meters (seats, docs, storage) on the subscription card. Turn off if your customers should not see these numbers.',
    },
    {
      key: 'allowProfileEdit',
      label: 'Self-service profile edit',
      description:
        'Let customers edit their shipping address and contact details from the portal header.',
    },
    {
      key: 'showActivities',
      label: 'Activity feed',
      description:
        'Show the most recent calls, emails, and meetings related to this customer. Off by default because activity notes may be internal.',
    },
  ];

  const prefs = tenant;
  const customerOverrideIds = Object.keys(perCustomer);

  return (
    <div className="space-y-8 max-w-[720px]">
      <SaveRow />

      <div>
        <SectionLabel>Portal visibility</SectionLabel>
        <p className="text-xs text-[var(--neutral-500)] mb-4">
          The customer portal is always read-only. Orders, invoices, and shipping
          are never editable by customers — these toggles only control which
          sections they can see. Preview what the customer sees in{' '}
          <a
            href="/sell/portal"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Sell → Customer Portal
          </a>
          .
        </p>
        <div className="space-y-4">
          {toggles.map((t) => (
            <div
              key={t.key}
              className="flex items-start justify-between gap-6 py-3 border-b border-[var(--neutral-100)] last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                  {t.description}
                </p>
              </div>
              <Switch
                checked={prefs[t.key]}
                onCheckedChange={(v) => updateTenant({ [t.key]: v })}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Per-customer overrides</SectionLabel>
        <p className="text-xs text-[var(--neutral-500)] mb-4">
          Tenant defaults above apply to every customer. If a customer has
          opted-in or opted-out of a specific section, it shows up here. Reset
          to inherit the tenant default again.
        </p>
        {customerOverrideIds.length === 0 ? (
          <div className="rounded-[var(--shape-lg)] border border-dashed border-[var(--border)] bg-[var(--neutral-50)] px-4 py-6 text-center text-xs text-[var(--neutral-500)]">
            No customer-specific overrides yet. Change a toggle from the{' '}
            <a
              href="/sell/portal"
              className="text-foreground underline-offset-2 hover:underline"
            >
              portal preview
            </a>{' '}
            with a specific customer selected to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {customerOverrideIds.map((cid) => {
              const cust = customers.find((c) => c.id === cid);
              const override = perCustomer[cid];
              const diffs = Object.entries(override ?? {}).map(([k, v]) => {
                const key = k as keyof PortalPreferences;
                const def = defaultPortalPreferences[key];
                return { key, override: v as boolean, def: def as boolean };
              });
              return (
                <div
                  key={cid}
                  className="flex items-start justify-between gap-4 rounded-[var(--shape-lg)] border border-[var(--border)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {cust?.company ?? cid}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                      {diffs.length} override{diffs.length === 1 ? '' : 's'}:
                      <span className="ml-1 text-[var(--neutral-700)]">
                        {diffs
                          .map(
                            (d) =>
                              `${String(d.key)}=${d.override ? 'on' : 'off'}`,
                          )
                          .join(' · ')}
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetCustomer(cid)}
                  >
                    Reset to default
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <SectionLabel>Access</SectionLabel>
        <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-4 text-sm">
          <p className="font-medium text-foreground">
            Who can preview and configure the portal
          </p>
          <p className="text-xs text-[var(--neutral-500)] mt-1">
            The portal surface is controlled by several group permissions in{' '}
            <span className="font-mono text-[var(--neutral-700)]">
              sell.portal.*
            </span>
            :
          </p>
          <ul className="mt-3 space-y-2 text-xs text-[var(--neutral-600)]">
            <li>
              <Badge variant="outline" className="mr-2 font-mono">
                portal.access
              </Badge>
              Preview the portal as a customer sees it.
            </li>
            <li>
              <Badge variant="outline" className="mr-2 font-mono">
                portal.configure
              </Badge>
              Change the toggles above — controls what customers see.
            </li>
            <li>
              <Badge variant="outline" className="mr-2 font-mono">
                portal.invitations.send / revoke
              </Badge>
              Invite or remove portal contacts from the Customer detail page.
            </li>
            <li>
              <Badge variant="outline" className="mr-2 font-mono">
                portal.subscriptions.*
              </Badge>
              View, modify, or cancel a customer's plan from the portal.
            </li>
            <li>
              <Badge variant="outline" className="mr-2 font-mono">
                portal.markup.*
              </Badge>
              Create, reply to, or resolve 3D-model markups on quotes.
            </li>
          </ul>
          <p className="text-xs text-[var(--neutral-500)] mt-3">
            Assign these in{' '}
            <a
              href="/sell/settings?panel=access"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Access & Permissions
            </a>{' '}
            or review org-wide access in{' '}
            <a
              href="/control/groups"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Control → Groups
            </a>
            .
          </p>
        </div>
      </div>

      <div>
        <SectionLabel>Customer sign-in</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">
              Portal URL
            </Label>
            <Input
              defaultValue="https://portal.alliancemetal.com.au/"
              className="h-12 border-[var(--border)] rounded-[var(--shape-md)] font-mono text-sm"
              readOnly
            />
            <p className="text-xs text-[var(--neutral-500)] mt-1">
              Customers sign in using email magic-links. No passwords are stored.
            </p>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)]">
            <div>
              <p className="text-sm font-medium text-foreground">
                Require customer contact to be verified
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                Only contacts flagged as verified can sign in to the portal.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">
                Email customers when a quote is ready
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                Sends a portal link whenever a quote transitions to Sent.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'pipeline', label: 'Leads & Pipeline', icon: Target, component: PipelinePanel },
  { key: 'quoting', label: 'Quoting', icon: FileText, component: QuotingPanel },
  { key: 'payments', label: 'Payments', icon: CreditCard, component: PaymentsPanel },
  { key: 'activities', label: 'Activities', icon: Calendar, component: ActivitiesPanel },
  { key: 'portal', label: 'Portal', icon: UserCircle2, component: PortalPanel },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, component: AnalyticsPanel },
  { key: 'integrations', label: 'Integrations', icon: Plug, component: IntegrationsPanel },
];

export function SellSettings() {
  return (
    <ModuleSettingsLayout
      title="Sell Settings"
      moduleName="Sell"
      panels={settingsPanels}
      permissionKeys={sellPermissionKeys}
      defaultGroups={sellDefaultGroups}
    />
  );
}
