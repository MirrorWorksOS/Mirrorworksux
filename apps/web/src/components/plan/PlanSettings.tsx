/**
 * Plan Settings — Implements ARCH 00 group-based permissions model
 * Panels: General, Products, Reports, Access & Permissions
 */
import { useState } from 'react';
import { Settings, Package, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import {
  ModuleSettingsLayout,
  SectionLabel,
  SaveRow,
  type PermissionKey,
  type PermissionGroup,
  type SettingsPanel,
} from '@/components/shared/settings/ModuleSettingsLayout';
import { SettingsRow } from '@/components/shared/settings/SettingsRow';

// ── Permission keys for Plan module (from ARCH 00 §4.4) ──
const planPermissionKeys: PermissionKey[] = [
  { key: 'documents.scope', label: 'Document visibility', description: 'Own records only, or all org records', type: 'scope', group: 'Common' },
  { key: 'schedule.edit', label: 'Edit schedule', description: 'Edit production schedule and Gantt chart', type: 'boolean', group: 'Plan controls' },
  { key: 'budget.visibility', label: 'Budget visibility', description: 'View job budgets and cost breakdowns', type: 'boolean', group: 'Plan controls' },
  { key: 'bom.edit', label: 'Edit BOMs', description: 'Edit bills of materials', type: 'boolean', group: 'Plan controls' },
  { key: 'intelligence_hub.access', label: 'Intelligence hub', description: 'Access intelligence hub analytics', type: 'boolean', group: 'Plan controls' },
  { key: 'traveller.release', label: 'Release travellers', description: 'Issue travellers from Plan into Make (high-trust action)', type: 'boolean', group: 'Traveller controls' },
  { key: 'traveller.exception_release', label: 'Exception release', description: 'Reserved for guarded exception release paths', type: 'boolean', group: 'Traveller controls' },
  { key: 'traveller.view_all', label: 'View all travellers', description: 'View released travellers across jobs and work centres', type: 'boolean', group: 'Traveller controls' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean', group: 'Administration' },
  { key: 'reports.access', label: 'Reports access', description: 'View analytics and reports', type: 'boolean', group: 'Administration' },
];

// ── Default groups (from ARCH 00 §4.4) ──
const planDefaultGroups: PermissionGroup[] = [
  {
    name: 'Scheduling',
    description: 'Production schedulers, planners',
    isDefault: true,
    members: [
      { name: 'Mark Thompson', email: 'mark@alliancemetal.com.au', initials: 'MT' },
    ],
    permissions: {
      'documents.scope': 'all', 'schedule.edit': 'true', 'budget.visibility': 'true',
      'bom.edit': 'false', 'intelligence_hub.access': 'true',
      'traveller.release': 'true', 'traveller.exception_release': 'false', 'traveller.view_all': 'true',
      'settings.access': 'false', 'reports.access': 'true',
    },
  },
  {
    name: 'Engineering',
    description: 'Design engineers, BOM maintainers',
    isDefault: true,
    members: [
      { name: 'James Wu', email: 'james@alliancemetal.com.au', initials: 'JW' },
    ],
    permissions: {
      'documents.scope': 'all', 'schedule.edit': 'false', 'budget.visibility': 'false',
      'bom.edit': 'true', 'intelligence_hub.access': 'true',
      'traveller.release': 'false', 'traveller.exception_release': 'false', 'traveller.view_all': 'true',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Costing',
    description: 'Cost analysts',
    isDefault: true,
    members: [
      { name: 'Lisa Park', email: 'lisa@alliancemetal.com.au', initials: 'LP' },
    ],
    permissions: {
      'documents.scope': 'all', 'schedule.edit': 'false', 'budget.visibility': 'true',
      'bom.edit': 'false', 'intelligence_hub.access': 'false',
      'traveller.release': 'false', 'traveller.exception_release': 'false', 'traveller.view_all': 'false',
      'settings.access': 'false', 'reports.access': 'true',
    },
  },
  {
    name: 'Office / Production Control',
    description: 'Production coordinators and office staff with release authority',
    isDefault: true,
    members: [
      { name: 'Emma Wilson', email: 'emma@alliancemetal.com.au', initials: 'EW' },
      { name: 'Sarah Chen', email: 'sarah@alliancemetal.com.au', initials: 'SC' },
    ],
    permissions: {
      'documents.scope': 'all', 'schedule.edit': 'false', 'budget.visibility': 'true',
      'bom.edit': 'false', 'intelligence_hub.access': 'true',
      'traveller.release': 'true', 'traveller.exception_release': 'false', 'traveller.view_all': 'true',
      'settings.access': 'false', 'reports.access': 'true',
    },
  },
];

// ── General Panel ──
function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Scheduling defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default schedule view</Label>
            <Select defaultValue="gantt">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gantt">Gantt chart</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="list">List view</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Planning horizon</Label>
            <div className="flex items-center gap-4">
              <Input defaultValue="12" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">weeks</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default lead time buffer</Label>
            <div className="flex items-center gap-4">
              <Input defaultValue="2" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">days</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Capacity settings</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Working hours per day</Label>
            <div className="flex items-center gap-4">
              <Input defaultValue="8" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">hours</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Working days per week</Label>
            <Select defaultValue="5">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 days (Mon–Fri)</SelectItem>
                <SelectItem value="5.5">5.5 days (Mon–Sat AM)</SelectItem>
                <SelectItem value="6">6 days (Mon–Sat)</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {[
            { label: 'Auto-level resource overloads', checked: true },
            { label: 'Show capacity warnings on schedule', checked: true },
            { label: 'Allow overtime scheduling', checked: false },
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

// ── Products Panel ──
function ProductsPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>BOM preferences</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default BOM structure</Label>
            <Select defaultValue="multilevel">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat (single-level)</SelectItem>
                <SelectItem value="multilevel">Multi-level (nested)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Unit of measure default</Label>
            <Select defaultValue="metric">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (mm, kg, L)</SelectItem>
                <SelectItem value="imperial">Imperial (in, lb, gal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {[
            { label: 'Auto-calculate scrap allowance on BOMs', checked: true },
            { label: 'Require approval for BOM revisions', checked: true },
            { label: 'Enable phantom BOMs', checked: false },
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

// ── Reports Panel ──
function ReportsPanel() {
  const widgets = [
    { label: 'Schedule adherence', enabled: true },
    { label: 'Capacity utilisation', enabled: true },
    { label: 'Budget vs actual by job', enabled: true },
    { label: 'Material lead-time tracker', enabled: false },
    { label: 'BOM cost rollup', enabled: true },
    { label: 'Intelligence hub insights', enabled: false },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Analytics widgets</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">Choose which widgets appear on the Plan dashboard.</p>
        <div className="space-y-2">
          {widgets.map(w => (
            <SettingsRow key={w.label}>
              <span className="text-sm text-foreground">{w.label}</span>
              <Switch defaultChecked={w.enabled} />
            </SettingsRow>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Reporting period</SectionLabel>
        <div>
          <Label className="text-sm mb-2 block font-medium">Default date range</Label>
          <Select defaultValue="month">
            <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
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
        <div className="flex gap-4">
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Exporting CSV...')}>Export schedule CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Exporting CSV...')}>Export BOM report CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'products', label: 'Products', icon: Package, component: ProductsPanel },
  { key: 'reports', label: 'Reports', icon: BarChart3, component: ReportsPanel },
];

export function PlanSettings() {
  return (
    <ModuleSettingsLayout
      title="Plan Settings"
      moduleName="Plan"
      panels={settingsPanels}
      permissionKeys={planPermissionKeys}
      defaultGroups={planDefaultGroups}
    />
  );
}
