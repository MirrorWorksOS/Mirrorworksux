/**
 * Make Settings — Implements ARCH 00 group-based permissions model
 * Panels: General, Quality, Reports, Access & Permissions
 */
import React, { useState } from 'react';
import { Settings, CheckCircle2, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import {
  ModuleSettingsLayout,
  SectionLabel,
  SaveRow,
  type PermissionKey,
  type PermissionGroup,
  type SettingsPanel,
} from '@/components/shared/settings/ModuleSettingsLayout';

// ── Permission keys for Make module (from ARCH 00 §4.5) ──
const makePermissionKeys: PermissionKey[] = [
  { key: 'documents.scope', label: 'Document visibility', description: 'Own records only, or all org records', type: 'scope' },
  { key: 'workorders.scope', label: 'Work order visibility', description: 'Own work orders or all work orders', type: 'scope' },
  { key: 'timers.scope', label: 'Time clock visibility', description: 'Own time entries or all entries', type: 'scope' },
  { key: 'qc.record', label: 'Record quality checks', description: 'Record and submit quality inspections', type: 'boolean' },
  { key: 'scrap.report', label: 'Report scrap/waste', description: 'Log scrap and waste events', type: 'boolean' },
  { key: 'andon.manage', label: 'Manage andon alerts', description: 'Create and resolve andon alerts', type: 'boolean' },
  { key: 'maintenance.manage', label: 'Manage maintenance', description: 'Schedule and manage equipment maintenance', type: 'boolean' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean' },
  { key: 'reports.access', label: 'Reports access', description: 'View analytics and reports', type: 'boolean' },
];

// ── Default groups (from ARCH 00 §4.5) ──
const makeDefaultGroups: PermissionGroup[] = [
  {
    name: 'Production',
    description: 'Operators, welders, machinists',
    isDefault: true,
    members: [
      { name: 'Ben Cooper', email: 'ben@alliancemetal.com.au', initials: 'BC' },
      { name: 'Ryan Nguyen', email: 'ryan@alliancemetal.com.au', initials: 'RN' },
    ],
    permissions: {
      'documents.scope': 'own', 'workorders.scope': 'own', 'timers.scope': 'own',
      'qc.record': 'true', 'scrap.report': 'true', 'andon.manage': 'false',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Quality',
    description: 'QA inspectors',
    isDefault: true,
    members: [
      { name: 'Amy Zhang', email: 'amy@alliancemetal.com.au', initials: 'AZ' },
    ],
    permissions: {
      'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'own',
      'qc.record': 'true', 'scrap.report': 'true', 'andon.manage': 'true',
      'settings.access': 'false', 'reports.access': 'true',
    },
  },
  {
    name: 'Maintenance',
    description: 'Equipment technicians',
    isDefault: true,
    members: [
      { name: 'Steve Rogers', email: 'steve@alliancemetal.com.au', initials: 'SR' },
    ],
    permissions: {
      'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'own',
      'qc.record': 'false', 'scrap.report': 'false', 'andon.manage': 'true',
      'maintenance.manage': 'true', 'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Office',
    description: 'Production managers, supervisors',
    isDefault: true,
    members: [],
    permissions: {
      'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'all',
      'qc.record': 'false', 'scrap.report': 'false', 'andon.manage': 'false',
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
        <SectionLabel>Shop floor configuration</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default work order view</Label>
            <Select defaultValue="kanban">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kanban">Kanban board</SelectItem>
                <SelectItem value="list">List view</SelectItem>
                <SelectItem value="schedule">Schedule view</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Work centre timeout</Label>
            <div className="flex items-center gap-4">
              <Input defaultValue="15" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">minutes idle before auto-pause</span>
            </div>
          </div>
          {[
            { label: 'Enable barcode scanning on shop floor', checked: true },
            { label: 'Require operator clock-on before starting work orders', checked: true },
            { label: 'Auto-print job travellers on release', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-foreground">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Shift settings</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Number of shifts</Label>
            <Select defaultValue="2">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 shift</SelectItem>
                <SelectItem value="2">2 shifts</SelectItem>
                <SelectItem value="3">3 shifts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Day shift start</Label>
            <Input defaultValue="06:00" type="time" className="h-12 border-[var(--border)] rounded-xl w-40" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Night shift start</Label>
            <Input defaultValue="14:00" type="time" className="h-12 border-[var(--border)] rounded-xl w-40" />
          </div>
          {[
            { label: 'Enable shift handover notes', checked: true },
            { label: 'Notify supervisor on shift changeover', checked: false },
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

// ── Quality Panel ──
function QualityPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>QC templates</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default inspection type</Label>
            <Select defaultValue="inprocess">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Incoming material</SelectItem>
                <SelectItem value="inprocess">In-process</SelectItem>
                <SelectItem value="final">Final inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Sampling rate</Label>
            <Select defaultValue="aql">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100% inspection</SelectItem>
                <SelectItem value="aql">AQL sampling</SelectItem>
                <SelectItem value="skip">Skip lot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {[
            { label: 'Require photo evidence on non-conformance', checked: true },
            { label: 'Auto-create NCR on failed inspection', checked: true },
            { label: 'Enable statistical process control (SPC)', checked: false },
            { label: 'Block shipment on open NCRs', checked: true },
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
    { label: 'OEE by work centre', enabled: true },
    { label: 'Work order throughput', enabled: true },
    { label: 'Scrap rate trend', enabled: true },
    { label: 'Labour efficiency', enabled: false },
    { label: 'Andon response times', enabled: false },
    { label: 'First-pass yield', enabled: true },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Dashboard widgets</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">Choose which widgets appear on the Make dashboard.</p>
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
          <Select defaultValue="week">
            <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shift">This shift</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <SectionLabel>Export</SectionLabel>
        <div className="flex gap-4">
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Exporting CSV...')}>Export production CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Exporting CSV...')}>Export QC results CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'quality', label: 'Quality', icon: CheckCircle2, component: QualityPanel },
  { key: 'reports', label: 'Reports', icon: BarChart3, component: ReportsPanel },
];

export function MakeSettings() {
  return (
    <ModuleSettingsLayout
      title="Make Settings"
      moduleName="Make"
      panels={settingsPanels}
      permissionKeys={makePermissionKeys}
      defaultGroups={makeDefaultGroups}
    />
  );
}
