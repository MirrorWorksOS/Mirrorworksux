/**
 * Ship Settings — Implements ARCH 00 group-based permissions model
 * Panels: General, Carriers, Reports, Access & Permissions
 */
import React, { useState } from 'react';
import { Settings, Truck, BarChart3, Plus, Trash2 } from 'lucide-react';
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

// ── Permission keys for Ship module (from ARCH 00 §4.6) ──
const shipPermissionKeys: PermissionKey[] = [
  { key: 'documents.scope', label: 'Document visibility', description: 'Own records only, or all org records', type: 'scope' },
  { key: 'orders.scope', label: 'Order visibility', description: 'Own fulfilment orders or all orders', type: 'scope' },
  { key: 'manifests.create', label: 'Create manifests', description: 'Create shipping manifests', type: 'boolean' },
  { key: 'carrier.config', label: 'Configure carriers', description: 'Add and configure shipping carriers', type: 'boolean' },
  { key: 'returns.approve', label: 'Approve returns', description: 'Approve return authorisations', type: 'boolean' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean' },
  { key: 'reports.access', label: 'Reports access', description: 'View analytics and reports', type: 'boolean' },
];

// ── Default groups (from ARCH 00 §4.6) ──
const shipDefaultGroups: PermissionGroup[] = [
  {
    name: 'Warehouse',
    description: 'Pick/pack staff, forklift operators',
    isDefault: true,
    members: [
      { name: 'Jake Wilson', email: 'jake@alliancemetal.com.au', initials: 'JW' },
      { name: 'Pete Santos', email: 'pete@alliancemetal.com.au', initials: 'PS' },
    ],
    permissions: {
      'documents.scope': 'own', 'orders.scope': 'own',
      'manifests.create': 'false', 'carrier.config': 'false', 'returns.approve': 'false',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Shipping',
    description: 'Dispatch, logistics planners',
    isDefault: true,
    members: [
      { name: 'Karen Lee', email: 'karen@alliancemetal.com.au', initials: 'KL' },
    ],
    permissions: {
      'documents.scope': 'all', 'orders.scope': 'all',
      'manifests.create': 'true', 'carrier.config': 'false', 'returns.approve': 'false',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Customer Service',
    description: 'Delivery queries, tracking',
    isDefault: true,
    members: [],
    permissions: {
      'documents.scope': 'all', 'orders.scope': 'all',
      'manifests.create': 'false', 'carrier.config': 'false', 'returns.approve': 'false',
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
        <SectionLabel>Warehouse defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default pick method</Label>
            <Select defaultValue="wave">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single order pick</SelectItem>
                <SelectItem value="batch">Batch pick</SelectItem>
                <SelectItem value="wave">Wave pick</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Shipping cut-off time</Label>
            <Input defaultValue="14:00" type="time" className="h-12 border-[var(--border)] rounded-xl w-40" />
          </div>
          {[
            { label: 'Require pick confirmation scan', checked: true },
            { label: 'Auto-generate packing slip on pick complete', checked: true },
            { label: 'Enable bin location tracking', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-[var(--mw-mirage)]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Packaging</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default package type</Label>
            <Select defaultValue="pallet">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="carton">Carton</SelectItem>
                <SelectItem value="pallet">Pallet</SelectItem>
                <SelectItem value="crate">Crate</SelectItem>
                <SelectItem value="stillage">Stillage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Weight unit</Label>
            <Select defaultValue="kg">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lb">Pounds (lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {[
            { label: 'Print shipping labels automatically', checked: true },
            { label: 'Include weight on packing slip', checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-[var(--mw-mirage)]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Carriers Panel ──
function CarriersPanel() {
  const carriers = [
    { name: 'Toll', description: 'National freight and express parcel', connected: true, colour: '#003DA5' },
    { name: 'StarTrack', description: 'Domestic parcel and express courier', connected: true, colour: '#E4002B' },
    { name: 'TNT', description: 'Road express and international freight', connected: false, colour: '#FF6600' },
    { name: 'DHL', description: 'International shipping and express', connected: false, colour: '#FFCC00' },
    { name: 'Customer collect', description: 'Customer arranges own pickup', connected: true, colour: 'var(--neutral-500)' },
  ];

  return (
    <div className="space-y-6 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Carrier management</SectionLabel>
        <div className="space-y-4">
          {carriers.map(c => (
            <Card key={c.name} className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: c.colour }}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--mw-mirage)]">{c.name}</h3>
                      {c.connected && (
                        <Badge className="bg-[var(--neutral-100)] text-[var(--mw-mirage)] border-0 text-xs rounded-full px-2 py-0.5">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--neutral-500)] mt-0.5">{c.description}</p>
                  </div>
                </div>
                <Button
                  variant={c.connected ? 'outline' : 'default'}
                  size="sm"
                  className={cn(
                    'h-9 text-xs rounded-xl',
                    c.connected
                      ? 'border-[var(--border)] text-[var(--neutral-500)]'
                      : 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] border-0'
                  )}
                >
                  {c.connected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Shipping rules</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-select cheapest carrier for orders under $500', checked: true },
            { label: 'Require carrier selection before dispatch', checked: true },
            { label: 'Send tracking notification to customer', checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-[var(--mw-mirage)]">{r.label}</span>
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
    { label: 'Orders shipped today', enabled: true },
    { label: 'On-time delivery rate', enabled: true },
    { label: 'Average pick-to-ship time', enabled: true },
    { label: 'Carrier cost comparison', enabled: false },
    { label: 'Returns by reason', enabled: false },
    { label: 'Backorder ageing', enabled: true },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Dashboard widgets</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">Choose which widgets appear on the Ship dashboard.</p>
        <div className="space-y-2">
          {widgets.map(w => (
            <div key={w.label} className="flex items-center justify-between bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-3">
              <span className="text-sm text-[var(--mw-mirage)]">{w.label}</span>
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
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <SectionLabel>Export</SectionLabel>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl">Export dispatch log CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl">Export returns CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'carriers', label: 'Carriers', icon: Truck, component: CarriersPanel },
  { key: 'reports', label: 'Reports', icon: BarChart3, component: ReportsPanel },
];

export function ShipSettings() {
  return (
    <ModuleSettingsLayout
      title="Ship Settings"
      moduleName="Ship"
      panels={settingsPanels}
      permissionKeys={shipPermissionKeys}
      defaultGroups={shipDefaultGroups}
    />
  );
}
