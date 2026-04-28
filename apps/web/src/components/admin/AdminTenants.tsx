import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type TierName } from '@/lib/subscription';

interface MockTenant {
  id: string;
  name: string;
  tier: TierName;
  users: number;
  renewalDate: string;
  status: 'active' | 'trialing' | 'overdue' | 'suspended';
}

const MOCK_TENANTS: MockTenant[] = [
  { id: 't-alliance-metal', name: 'Alliance Metal Fabrication', tier: 'Run', users: 8, renewalDate: '2025-10-03', status: 'active' },
  { id: 't-harbour-weld', name: 'Harbour Welding Co.', tier: 'Operate', users: 27, renewalDate: '2026-06-14', status: 'active' },
  { id: 't-apex-sheet', name: 'Apex Sheet Metal', tier: 'Enterprise', users: 54, renewalDate: '2026-08-22', status: 'active' },
  { id: 't-southlands', name: 'Southlands Fabrication', tier: 'Trial', users: 2, renewalDate: '—', status: 'trialing' },
  { id: 't-pioneer', name: 'Pioneer Steelworks', tier: 'Make', users: 14, renewalDate: '2025-12-01', status: 'overdue' },
  { id: 't-brightline', name: 'Brightline Engineering', tier: 'Operate', users: 31, renewalDate: '2026-01-18', status: 'suspended' },
];

const STATUS_META: Record<MockTenant['status'], { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  trialing: { label: 'Trial', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  overdue: { label: 'Payment overdue', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  suspended: { label: 'Suspended', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

const TIER_ORDER: TierName[] = ['Trial', 'Make', 'Run', 'Operate', 'Enterprise'];

export function AdminTenants() {
  const [tenants, setTenants] = useState<MockTenant[]>(MOCK_TENANTS);
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TierName | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenants.filter(t => {
      if (tierFilter !== 'all' && t.tier !== tierFilter) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    });
  }, [tenants, query, tierFilter]);

  const handleTierChange = (tenantId: string, next: TierName) => {
    setTenants(prev => prev.map(t => (t.id === tenantId ? { ...t, tier: next } : t)));
    toast.success(`Tenant moved to ${next} (mock — not persisted).`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tenants</h1>
        <p className="mt-1 text-sm text-slate-400">All MirrorWorks workspaces. Force-change a tier to unblock a customer or downgrade after cancellation.</p>
      </div>

      <Card className="bg-slate-900 p-6 text-slate-100">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or id…"
            className="w-80 bg-slate-950 text-slate-100"
          />
          <Select value={tierFilter} onValueChange={v => setTierFilter(v as TierName | 'all')}>
            <SelectTrigger className="w-44 bg-slate-950 text-slate-100">
              <SelectValue placeholder="All tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              {TIER_ORDER.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-slate-400">
            {filtered.length} of {tenants.length} tenants
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400">Tenant</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Users</TableHead>
              <TableHead className="text-slate-400">Renewal</TableHead>
              <TableHead className="text-slate-400">Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => {
              const status = STATUS_META[t.status];
              return (
                <TableRow key={t.id} className="border-slate-800">
                  <TableCell>
                    <div className="font-medium text-slate-100">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-slate-200">
                    {t.users}
                  </TableCell>
                  <TableCell className="text-slate-300">{t.renewalDate}</TableCell>
                  <TableCell>
                    <Select value={t.tier} onValueChange={v => handleTierChange(t.id, v as TierName)}>
                      <SelectTrigger className="w-36 bg-slate-950 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIER_ORDER.map(tier => <SelectItem key={tier} value={tier}>{tier}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-500">No tenants match the current filter.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
