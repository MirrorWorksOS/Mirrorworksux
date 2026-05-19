/**
 * ControlCustomerPortal — Global customer-portal settings and per-customer
 * portal-access toggles. Mutations are local state only.
 */

import { useMemo, useState } from 'react';
import { Globe, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { customers as seedCustomers } from '@/services';
import type { Customer } from '@/types/entities';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { EditSelect } from '@/components/shared/forms/EditField';
import { AccessGate } from '@/components/shared/access/AccessGate';

const LANDING_TAB_OPTIONS: { value: string; label: string }[] = [
  { value: 'quotes', label: 'Quotes' },
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'activity', label: 'Activity' },
];

function formatLastLogin(customer: Customer): string {
  const stamps = (customer.contacts ?? [])
    .map((c) => c.lastLoginAt)
    .filter((s): s is string => Boolean(s))
    .sort()
    .reverse();
  if (stamps.length === 0) return '—';
  const date = new Date(stamps[0]);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ControlCustomerPortal() {
  return (
    <AccessGate
      role="admin"
      feature="customer_portal"
      label="Customer portal"
      asPage
      pageTitle="Customer portal"
    >
      <ControlCustomerPortalInner />
    </AccessGate>
  );
}

function ControlCustomerPortalInner() {
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [landingTab, setLandingTab] = useState<string>('quotes');
  const [rows, setRows] = useState<Customer[]>(() => [...seedCustomers]);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoName, setLogoName] = useState('Alliance Metal portal mark');

  const total = rows.length;
  const enabledCount = useMemo(() => rows.filter((c) => c.portalAccess).length, [rows]);

  const toggleRow = (id: string, value: boolean) => {
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, portalAccess: value } : c)));
    toast.success(value ? 'Portal access enabled' : 'Portal access revoked');
  };

  const columns: MwColumnDef<Customer>[] = [
    {
      key: 'company',
      header: 'Company',
      cell: (c) => (
        <div>
          <div className="font-medium text-foreground">{c.company}</div>
          <div className="text-xs text-[var(--neutral-500)]">{c.contact}</div>
        </div>
      ),
    },
    {
      key: 'portalAccess',
      header: 'Portal access',
      headerClassName: 'w-36',
      cell: (c) => (
        <Switch
          checked={Boolean(c.portalAccess)}
          onCheckedChange={(v) => toggleRow(c.id, Boolean(v))}
          aria-label={`Portal access for ${c.company}`}
        />
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      headerClassName: 'w-40',
      className: 'tabular-nums',
      cell: (c) => (
        <span className="text-sm text-[var(--neutral-600)]">{formatLastLogin(c)}</span>
      ),
    },
    {
      key: 'contacts',
      header: 'Contacts',
      headerClassName: 'w-28',
      className: 'tabular-nums',
      cell: (c) => (c.contacts?.length ?? 0),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Customer portal"
        subtitle="Global portal settings and per-customer access. Brand the portal, choose a default landing tab, and control who can log in."
      />

      {/* ── Global settings ──────────────────────────────────────── */}
      <Card className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Global settings</h2>
            <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
              Apply to every customer with portal access enabled.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-[var(--shape-md)] border border-[var(--border)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-yellow-100)] text-[var(--mw-yellow-900)]">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Enable customer portal</p>
                <p className="text-xs text-[var(--neutral-500)]">
                  Turn the portal on or off across the workspace.
                </p>
              </div>
            </div>
            <Switch
              checked={portalEnabled}
              onCheckedChange={(v) => {
                setPortalEnabled(Boolean(v));
                toast.success(
                  v ? 'Customer portal enabled' : 'Customer portal disabled',
                );
              }}
              aria-label="Toggle customer portal"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <EditSelect
              label="Default landing tab"
              value={landingTab}
              onChange={(v) => {
                setLandingTab(v);
                toast.success('Landing tab updated');
              }}
              options={LANDING_TAB_OPTIONS}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
                Brand logo
              </label>
              <Button
                variant="outline"
                className="h-10 w-full justify-start gap-2"
                onClick={() => setLogoDialogOpen(true)}
              >
                <Upload className="h-4 w-4" /> Upload logo
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Per-customer access ──────────────────────────────────── */}
      <Card className="p-0">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-base font-medium text-foreground">Customer access</h2>
            <p className="text-xs text-[var(--neutral-500)]">
              {enabledCount} of {total} customers have portal access.
            </p>
          </div>
        </div>
        <MwDataTable<Customer>
          columns={columns}
          data={rows}
          keyExtractor={(c) => c.id}
        />
      </Card>

      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Portal logo</DialogTitle>
            <DialogDescription>
              Upload or register the brand mark shown in the customer portal header and login screen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-[var(--shape-lg)] border border-dashed border-[var(--border)] bg-[var(--neutral-100)] p-6 text-center">
              <Upload className="mx-auto h-6 w-6 text-[var(--neutral-500)]" />
              <p className="mt-2 text-sm font-medium text-foreground">Drop SVG, PNG, or JPG here</p>
              <p className="mt-1 text-xs text-[var(--neutral-500)]">Recommended 480x160, transparent background.</p>
            </div>
            <div>
              <Label htmlFor="portal-logo-name">Asset name</Label>
              <Input
                id="portal-logo-name"
                value={logoName}
                onChange={(event) => setLogoName(event.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={() => {
                setLogoDialogOpen(false);
                toast.success('Portal logo saved', {
                  description: `${logoName || 'Logo'} is ready for portal previews.`,
                });
              }}
            >
              Save logo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
