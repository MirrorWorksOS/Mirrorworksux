/**
 * Book Credit Notes — AR credits owed back to customers (decisions
 * D8/D13): VO descopes beyond the uninvoiced remainder and RMA
 * credits. List (number, customer, amount, status, linked SO/VO/
 * return, Xero sync badge) + simple detail view with an "Issue"
 * action. Visual patterns follow BookInvoices.
 *
 * Credit notes are raised at runtime (approveVariation /
 * raiseCreditNote) into the in-memory mock collection, so the list
 * reads `mock.creditNotes` live rather than a module-load snapshot.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FileText, Receipt, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import type { CreditNote } from '@/types/entities';
import * as mock from '@/services/mock';
import { workflowService } from '@/services/workflowService';

import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { staggerContainer } from '@/components/shared/motion/motion-variants';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn as cx } from '../ui/utils';

const STATUS_TONE: Record<CreditNote['status'], string> = {
  draft: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  issued: 'border-0 bg-[var(--mw-info)]/15 text-[var(--mw-info)]',
  applied: 'border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]',
  void: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-400)] line-through',
};

const XERO_TONE: Record<NonNullable<CreditNote['xeroSyncStatus']>, string> = {
  pending: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  synced: 'border-0 bg-[var(--mw-success)]/15 text-[var(--mw-success)]',
  error: 'border-0 bg-[var(--mw-error)]/15 text-[var(--mw-error)]',
};

const XERO_LABEL: Record<NonNullable<CreditNote['xeroSyncStatus']>, string> = {
  pending: 'Xero · pending',
  synced: 'Xero · synced',
  error: 'Xero · error',
};

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function customerName(customerId: string): string {
  return (
    mock.customers.find((c) => c.id === customerId)?.company ??
    (mock.stockPseudoCustomer.id === customerId ? mock.stockPseudoCustomer.company : customerId)
  );
}

/** Linked-document summary: SO number / VO number / return id. */
function linkedRefs(cn: CreditNote): string[] {
  const refs: string[] = [];
  if (cn.salesOrderId) {
    const so = mock.salesOrders.find((s) => s.id === cn.salesOrderId);
    refs.push(so?.orderNumber ?? cn.salesOrderId);
  }
  if (cn.variationOrderId) {
    const vo = mock.variationOrders.find((v) => v.id === cn.variationOrderId);
    refs.push(vo?.voNumber ?? cn.variationOrderId);
  }
  if (cn.returnId) refs.push(cn.returnId);
  return refs;
}

export function BookCreditNotes() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState('');
  // Mock collections mutate in place — bump to recompute after Issue.
  const [version, setVersion] = useState(0);

  const creditNotes = useMemo(
    () => mock.creditNotes.slice().reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const selected = id ? creditNotes.find((c) => c.id === id) : undefined;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return creditNotes;
    return creditNotes.filter((cn) =>
      [cn.creditNoteNumber, customerName(cn.customerId), cn.reason, ...linkedRefs(cn)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [creditNotes, search]);

  const issue = async (cn: CreditNote) => {
    try {
      const issued = await workflowService.issueCreditNote(cn.id);
      toast.success(`${issued.creditNoteNumber} issued — synced to Xero.`);
      setVersion((v) => v + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to issue credit note.');
    }
  };

  const columns: MwColumnDef<CreditNote>[] = [
    {
      key: 'creditNoteNumber',
      header: 'Credit Note #',
      cell: (cn) => (
        <div className="flex flex-col">
          <span className="text-xs text-foreground font-medium tabular-nums">{cn.creditNoteNumber}</span>
          {linkedRefs(cn).length > 0 && (
            <span className="font-normal text-xs text-[var(--neutral-500)] tabular-nums">
              {linkedRefs(cn).join(' · ')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (cn) => {
        const name = customerName(cn.customerId);
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-[var(--border)]">
              <AvatarFallback className="text-xs">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-xs text-foreground">{name}</span>
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (cn) => (
        <span className="text-xs text-foreground font-medium tabular-nums">{money(cn.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (cn) => (
        <Badge className={cx(STATUS_TONE[cn.status])}>{cn.status}</Badge>
      ),
    },
    {
      key: 'xero',
      header: 'Xero sync',
      cell: (cn) =>
        cn.xeroSyncStatus ? (
          <Badge className={cx(XERO_TONE[cn.xeroSyncStatus])}>{XERO_LABEL[cn.xeroSyncStatus]}</Badge>
        ) : (
          <span className="text-xs text-[var(--neutral-400)]">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (cn) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={cn.status !== 'draft'}
          onClick={(e) => {
            e.stopPropagation();
            void issue(cn);
          }}
        >
          <Send className="h-3 w-3" /> Issue
        </Button>
      ),
    },
  ];

  return (
    <PageShell className="p-6 space-y-6">
      <PageHeader
        title="Credit Notes"
        subtitle={`${filtered.length} of ${creditNotes.length} credit notes — money owed back to customers (VO descopes, RMA credits)`}
      />

      {selected && (
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[var(--neutral-500)]" />
                <span className="font-semibold">{selected.creditNoteNumber}</span>
                <Badge className={cx(STATUS_TONE[selected.status])}>{selected.status}</Badge>
                {selected.xeroSyncStatus && (
                  <Badge className={cx(XERO_TONE[selected.xeroSyncStatus])}>
                    {XERO_LABEL[selected.xeroSyncStatus]}
                  </Badge>
                )}
              </div>
              <div className="mt-2 grid gap-1 text-sm">
                <div>
                  <span className="text-[var(--neutral-500)]">Customer:</span>{' '}
                  {customerName(selected.customerId)}
                </div>
                <div>
                  <span className="text-[var(--neutral-500)]">Amount:</span>{' '}
                  <span className="font-medium tabular-nums">{money(selected.amount)}</span>
                </div>
                {linkedRefs(selected).length > 0 && (
                  <div>
                    <span className="text-[var(--neutral-500)]">Linked:</span>{' '}
                    {linkedRefs(selected).join(' · ')}
                  </div>
                )}
                {selected.issuedAt && (
                  <div>
                    <span className="text-[var(--neutral-500)]">Issued:</span>{' '}
                    {new Date(selected.issuedAt).toLocaleString()}
                  </div>
                )}
                <div className="text-[var(--neutral-500)]">{selected.reason}</div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {selected.status === 'draft' && (
                <Button size="sm" className="gap-1" onClick={() => void issue(selected)}>
                  <Send className="h-3.5 w-3.5" /> Issue
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => navigate('/book/credit-notes')}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search credit notes…"
          className="h-10 max-w-sm rounded-full"
        />
      </div>

      <motion.div initial="initial" animate="animate" variants={staggerContainer}>
        <MwDataTable
          columns={columns}
          data={filtered}
          keyExtractor={(cn) => cn.id}
          striped
          onRowClick={(cn) => navigate(`/book/credit-notes/${cn.id}`)}
          emptyState={
            <EmptyState
              variant="compact"
              icon={FileText}
              title="No credit notes"
              description="Credit notes appear here when a VO descope exceeds the uninvoiced remainder or an RMA owes a credit."
            />
          }
        />
      </motion.div>
    </PageShell>
  );
}
