/**
 * BuyAgreementDetail — Full-page blanket purchase agreement detail.
 * Route: /buy/agreements/:id and /buy/agreements/new (isNew mode).
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, FileText, TrendingUp, Calendar, Receipt } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { toast } from 'sonner';
import { purchaseOrders } from '@/services';
import { AGREEMENTS, type BuyAgreement } from './BuyAgreements';

const AGREEMENT_BY_ID = Object.fromEntries(AGREEMENTS.map((a) => [a.id, a]));

const createBlankAgreement = (): BuyAgreement => ({
  id: `new-${Date.now()}`,
  agreementNumber: '',
  supplier: '',
  category: '',
  startDate: '',
  endDate: '',
  value: 0,
  used: 0,
  committed: 0,
  status: 'active',
  contact: '',
  phone: '',
  terms: 'Net 30',
  discount: '0%',
});

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const STATUS_VARIANT: Record<BuyAgreement['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  active: 'success',
  'near-limit': 'warning',
  exhausted: 'error',
  expired: 'neutral',
};

const DEFAULT_TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'spend', label: 'Spend' },
  { id: 'linked-pos', label: 'Linked POs' },
  { id: 'documents', label: 'Documents' },
];

export function BuyAgreementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isNew = !id || id === 'new';
  const agreement = isNew
    ? createBlankAgreement()
    : (id ? AGREEMENT_BY_ID[id] : undefined);

  // PO linkage is best-effort: match by supplier name on the existing PO mock.
  const linkedPOs = useMemo(
    () => (agreement
      ? purchaseOrders.filter((po) =>
          po.supplierName?.toLowerCase() === agreement.supplier.toLowerCase(),
        )
      : []),
    [agreement],
  );

  const tabConfig = useMemo(() => {
    return DEFAULT_TABS.map((t) => {
      if (t.id === 'linked-pos') return { ...t, count: linkedPOs.length };
      return t;
    });
  }, [linkedPOs]);

  if (!agreement) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/buy/agreements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to agreements
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Agreement not found. Open one from the agreements list.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    // TODO(backend): isNew ? agreements.create(agreement) : agreements.update(agreement.id, agreement)
    if (isNew) {
      toast.success('Agreement created');
      navigate(`/buy/agreements/${agreement.id}`, { replace: true });
    } else {
      toast.success('Agreement saved');
    }
  };

  const remaining = agreement.value - agreement.used - agreement.committed;
  const utilisationPct = agreement.value > 0
    ? Math.round(((agreement.used + agreement.committed) / agreement.value) * 100)
    : 0;

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiStatCard label="Contract Value" value={fmtCurrency(agreement.value)} icon={FileText} />
              <KpiStatCard label="Spent YTD" value={fmtCurrency(agreement.used)} icon={TrendingUp} />
              <KpiStatCard label="Committed" value={fmtCurrency(agreement.committed)} icon={Receipt} />
              <KpiStatCard label="Remaining" value={fmtCurrency(Math.max(0, remaining))} icon={Calendar} />
            </div>

            <Card className="p-6 space-y-5">
              <h3 className="text-sm font-medium text-foreground">Agreement Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Agreement #', value: agreement.agreementNumber || '—' },
                  { label: 'Supplier', value: agreement.supplier || '—' },
                  { label: 'Category', value: agreement.category || '—' },
                  { label: 'Period', value: agreement.startDate || agreement.endDate
                    ? `${agreement.startDate || '—'} – ${agreement.endDate || '—'}`
                    : '—' },
                  { label: 'Payment Terms', value: agreement.terms },
                  { label: 'Discount', value: agreement.discount },
                  { label: 'Primary Contact', value: agreement.contact || '—' },
                  { label: 'Phone', value: agreement.phone || '—' },
                ].map((f) => (
                  <div key={f.label}>
                    <Label className="text-xs text-[var(--neutral-500)]">{f.label}</Label>
                    {isNew ? (
                      <Input
                        readOnly
                        defaultValue={f.value}
                        className="mt-1 h-10 border-[var(--border)] bg-[var(--neutral-50)]"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
                    )}
                  </div>
                ))}
              </div>
              {isNew && (
                <p className="text-xs text-[var(--neutral-500)]">
                  Editing of agreement fields will be available once persistence is wired.
                </p>
              )}
            </Card>
          </div>
        );

      case 'spend':
        return (
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Spend utilisation</h3>
              <span className="text-xs tabular-nums text-[var(--neutral-500)]">
                {utilisationPct}% utilised
              </span>
            </div>
            <div className="h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--mw-yellow-400)]"
                style={{ width: `${Math.min(100, utilisationPct)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs text-[var(--neutral-500)] mb-0.5">Spent</p>
                <p className="font-medium tabular-nums">{fmtCurrency(agreement.used)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--neutral-500)] mb-0.5">Committed</p>
                <p className="font-medium tabular-nums text-[var(--mw-amber)]">
                  {fmtCurrency(agreement.committed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--neutral-500)] mb-0.5">Remaining</p>
                <p className="font-medium tabular-nums">
                  {fmtCurrency(Math.max(0, remaining))}
                </p>
              </div>
            </div>
          </Card>
        );

      case 'linked-pos':
        return (
          <MwDataTable<typeof linkedPOs[number]>
            columns={[
              {
                key: 'po',
                header: 'PO #',
                headerClassName: 'text-xs',
                className: 'text-xs font-medium tabular-nums',
                cell: (po) => (
                  <Link to={`/buy/orders/${po.id}`} className="text-[var(--mw-blue)] hover:underline">
                    {po.poNumber}
                  </Link>
                ),
              },
              {
                key: 'date',
                header: 'Date',
                headerClassName: 'text-xs',
                className: 'text-xs tabular-nums text-[var(--neutral-500)]',
                cell: (po) => new Date(po.date).toLocaleDateString('en-AU'),
              },
              {
                key: 'status',
                header: 'Status',
                headerClassName: 'text-xs',
                cell: (po) => (
                  <StatusBadge status={po.status === 'acknowledged' ? 'approved' : po.status === 'partial' ? 'in_progress' : po.status}>
                    {po.status}
                  </StatusBadge>
                ),
              },
              {
                key: 'total',
                header: 'Total',
                headerClassName: 'text-xs text-right',
                className: 'text-xs text-right tabular-nums font-medium',
                cell: (po) => fmtCurrency(po.total),
              },
            ]}
            data={linkedPOs}
            keyExtractor={(po) => po.id}
            emptyState={
              <div className="text-center text-xs text-[var(--neutral-500)] py-8">
                No purchase orders linked to this agreement yet.
              </div>
            }
          />
        );

      case 'documents':
        return (
          <Card className="p-6">
            <p className="text-sm text-[var(--neutral-500)]">
              Document attachments will appear here once uploaded.
              {/* TODO(backend): agreements.documents.list(agreement.id) */}
            </p>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: 'Buy', href: '/buy' },
        { label: 'Agreements', href: '/buy/agreements' },
        { label: isNew ? 'New' : agreement.agreementNumber || agreement.supplier },
      ]}
      title={isNew ? 'New Agreement' : agreement.supplier}
      subtitle={
        isNew ? (
          <span className="text-sm text-[var(--neutral-500)]">
            Capture agreement details and click Save to create.
          </span>
        ) : (
          <span className="text-sm text-[var(--neutral-500)]">
            {agreement.agreementNumber} &middot; {agreement.category} &middot; {agreement.startDate} – {agreement.endDate}
          </span>
        )
      }
      metaRow={
        isNew ? null : (
          <div className="flex items-center gap-2">
            <StatusBadge variant={STATUS_VARIANT[agreement.status]}>
              {agreement.status === 'near-limit' ? 'Near limit' :
                agreement.status === 'exhausted' ? 'Exhausted' :
                agreement.status === 'expired' ? 'Expired' : 'Active'}
            </StatusBadge>
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
              {agreement.terms}
            </Badge>
            <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] text-xs">
              {agreement.discount} discount
            </Badge>
          </div>
        )
      }
      headerActions={
        <>
          <Button variant="outline" className="border-[var(--border)]" asChild>
            <Link to="/buy/agreements">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleSave}
          >
            {isNew ? 'Save' : 'Save changes'}
          </Button>
        </>
      }
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}
