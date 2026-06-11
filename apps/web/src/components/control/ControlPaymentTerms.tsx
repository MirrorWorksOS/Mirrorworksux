/**
 * ControlPaymentTerms — Reusable payment-term templates applied to
 * customers, quotes, orders and invoices. Local state only; mutations
 * are not persisted to a backend.
 */

import { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner';

import { paymentTerms as seedPaymentTerms } from '@/services';
import { MILESTONE_EVENT_LABELS, milestonesForTerm } from '@/services/workflowService';
import type { PaymentMilestoneEvent, PaymentTerm } from '@/types/entities';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EditField, EditTextarea } from '@/components/shared/forms/EditField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/components/ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccessGate } from '@/components/shared/access/AccessGate';

/** Editable milestone row — pct kept as string while typing. */
interface DraftMilestone {
  event: PaymentMilestoneEvent;
  pct: string;
}

interface DraftTerm {
  id?: string;
  label: string;
  days: string;
  depositPct: string;
  isDefault: boolean;
  notes: string;
  /** D5 milestone schedule rows — must sum to 100 when present. */
  milestones: DraftMilestone[];
}

const EMPTY_DRAFT: DraftTerm = {
  label: '',
  days: '30',
  depositPct: '',
  isDefault: false,
  notes: '',
  milestones: [],
};

const MILESTONE_EVENT_OPTIONS: PaymentMilestoneEvent[] = [
  'order_confirmed',
  'dispatch',
  'delivery',
  'completion',
];

const milestoneSum = (rows: DraftMilestone[]) =>
  rows.reduce((s, r) => s + (Number(r.pct) || 0), 0);

export function ControlPaymentTerms() {
  return (
    <AccessGate
      role="admin"
      label="Payment terms"
      asPage
      pageTitle="Payment terms"
    >
      <ControlPaymentTermsInner />
    </AccessGate>
  );
}

function ControlPaymentTermsInner() {
  const [terms, setTerms] = useState<PaymentTerm[]>(() => [...seedPaymentTerms]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTerm>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openNew = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (term: PaymentTerm) => {
    setDraft({
      id: term.id,
      label: term.label,
      days: String(term.days),
      depositPct: term.depositPct != null ? String(term.depositPct) : '',
      isDefault: term.isDefault ?? false,
      notes: term.notes ?? '',
      milestones: (term.milestones ?? []).map((m) => ({
        event: m.event,
        pct: String(m.pct),
      })),
    });
    setEditingId(term.id);
    setDialogOpen(true);
  };

  // ── Milestone schedule editing (decision D5) ─────────────────────
  const addMilestoneRow = () =>
    setDraft((d) => ({
      ...d,
      milestones: [
        ...d.milestones,
        // Sensible default: first row mirrors the default schedule.
        { event: d.milestones.length === 0 ? 'dispatch' : 'completion', pct: '' },
      ],
    }));

  const updateMilestoneRow = (index: number, patch: Partial<DraftMilestone>) =>
    setDraft((d) => ({
      ...d,
      milestones: d.milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));

  const removeMilestoneRow = (index: number) =>
    setDraft((d) => ({
      ...d,
      milestones: d.milestones.filter((_, i) => i !== index),
    }));

  /** One-click migration of a legacy deposit into explicit milestone rows. */
  const convertDeposit = () => {
    const schedule = milestonesForTerm({
      id: draft.id ?? 'draft',
      label: draft.label,
      days: Number(draft.days) || 0,
      depositPct: Number(draft.depositPct) || undefined,
    });
    setDraft((d) => ({
      ...d,
      depositPct: '',
      milestones: schedule.map((m) => ({ event: m.event, pct: String(m.pct) })),
    }));
    toast.success('Deposit converted to a milestone schedule');
  };

  const handleSave = () => {
    if (!draft.label.trim()) {
      toast.error('Label is required');
      return;
    }
    const days = Number(draft.days);
    if (Number.isNaN(days) || days < 0) {
      toast.error('Days must be a non-negative number');
      return;
    }
    const depositPct = draft.depositPct.trim() === '' ? undefined : Number(draft.depositPct);

    // Blocking validation: an explicit milestone schedule must sum to 100.
    let milestones: PaymentTerm['milestones'];
    if (draft.milestones.length > 0) {
      if (draft.milestones.some((m) => !(Number(m.pct) > 0))) {
        toast.error('Every milestone needs a percentage greater than 0');
        return;
      }
      const sum = milestoneSum(draft.milestones);
      if (sum !== 100) {
        toast.error(`Milestones must sum to 100% — currently ${sum}%`);
        return;
      }
      milestones = draft.milestones.map((m) => ({
        event: m.event,
        pct: Number(m.pct),
      }));
    }

    const upsert: PaymentTerm = {
      id: editingId ?? `pt-${Date.now()}`,
      label: draft.label.trim(),
      days,
      depositPct,
      milestones,
      isDefault: draft.isDefault || undefined,
      notes: draft.notes.trim() || undefined,
    };

    setTerms((prev) => {
      const next = editingId
        ? prev.map((t) => (t.id === editingId ? upsert : t))
        : [...prev, upsert];
      // If this row was just marked default, demote every other row
      if (upsert.isDefault) {
        return next.map((t) => (t.id === upsert.id ? t : { ...t, isDefault: false }));
      }
      return next;
    });
    toast.success(editingId ? 'Payment term updated' : 'Payment term created');
    setDialogOpen(false);
  };

  const handleDelete = (term: PaymentTerm) => {
    setTerms((prev) => prev.filter((t) => t.id !== term.id));
    toast.success(`Deleted "${term.label}"`);
  };

  const columns: MwColumnDef<PaymentTerm>[] = [
    {
      key: 'label',
      header: 'Label',
      cell: (t) => <span className="font-medium text-foreground">{t.label}</span>,
    },
    {
      key: 'days',
      header: 'Days',
      headerClassName: 'w-24',
      className: 'tabular-nums',
      cell: (t) => t.days,
    },
    {
      key: 'depositPct',
      header: 'Deposit %',
      headerClassName: 'w-28',
      className: 'tabular-nums',
      cell: (t) => (t.depositPct != null ? `${t.depositPct}%` : '—'),
    },
    {
      key: 'milestones',
      header: 'Milestone schedule',
      cell: (t) => {
        const explicit = t.milestones && t.milestones.length > 0;
        const schedule = milestonesForTerm(t);
        return (
          <span
            className={cn(
              'text-xs tabular-nums',
              explicit ? 'text-foreground' : 'text-[var(--neutral-400)]',
            )}
            title={
              explicit
                ? 'Explicit milestone schedule'
                : t.depositPct != null
                  ? 'Derived from the legacy deposit — edit to convert'
                  : 'Default schedule (no explicit milestones)'
            }
          >
            {schedule
              .map((m) => `${MILESTONE_EVENT_LABELS[m.event]} ${m.pct}%`)
              .join(' → ')}
            {!explicit && (t.depositPct != null ? ' (legacy deposit)' : ' (default)')}
          </span>
        );
      },
    },
    {
      key: 'isDefault',
      header: 'Default',
      headerClassName: 'w-24',
      cell: (t) =>
        t.isDefault ? (
          <Badge className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
            Default
          </Badge>
        ) : (
          <span className="text-xs text-[var(--neutral-400)]">—</span>
        ),
    },
    {
      key: 'notes',
      header: 'Notes',
      cell: (t) => (
        <span className="text-sm text-[var(--neutral-500)]">{t.notes ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-12',
      cell: (t) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
              aria-label="Row actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(t)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[var(--mw-error)] focus:text-[var(--mw-error)]"
              onClick={() => handleDelete(t)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Payment terms"
        subtitle="Reusable payment-term templates applied to customers, quotes, orders and invoices."
        actions={
          <Button
            className="h-12 bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={openNew}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add term
          </Button>
        }
      />

      <Card className="p-0">
        <MwDataTable<PaymentTerm>
          columns={columns}
          data={terms}
          keyExtractor={(t) => t.id}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit payment term' : 'New payment term'}</DialogTitle>
            <DialogDescription>
              Used as the default option on customer records, quotes, orders and invoices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <EditField
              label="Label"
              value={draft.label}
              onChange={(v) => setDraft((d) => ({ ...d, label: v }))}
              placeholder="Net 30"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <EditField
                label="Days"
                value={draft.days}
                onChange={(v) => setDraft((d) => ({ ...d, days: v }))}
                placeholder="30"
                type="number"
                mono
              />
              <EditField
                label="Deposit %"
                value={draft.depositPct}
                onChange={(v) => setDraft((d) => ({ ...d, depositPct: v }))}
                placeholder="optional"
                type="number"
                mono
              />
            </div>
            {/* ── D5: milestone schedule editor ───────────────────── */}
            <div className="space-y-2 rounded-md border border-[var(--border)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Milestone schedule</p>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Invoice a percentage of the order total at each event.
                    Rows must sum to 100%. Leave empty to bill 100% on dispatch.
                  </p>
                </div>
                {draft.milestones.length > 0 && (
                  <span
                    className={cn(
                      'shrink-0 text-xs font-medium tabular-nums',
                      milestoneSum(draft.milestones) === 100
                        ? 'text-[var(--mw-success)]'
                        : 'text-[var(--mw-error)]',
                    )}
                  >
                    {milestoneSum(draft.milestones)}% of 100%
                  </span>
                )}
              </div>

              {draft.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={m.event}
                    onValueChange={(v) =>
                      updateMilestoneRow(i, { event: v as PaymentMilestoneEvent })
                    }
                  >
                    <SelectTrigger className="h-10 flex-1 border-[var(--border)]">
                      <SelectValue placeholder="Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {MILESTONE_EVENT_OPTIONS.map((event) => (
                        <SelectItem key={event} value={event}>
                          {MILESTONE_EVENT_LABELS[event]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative w-24">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="h-10 w-full rounded-md border border-[var(--border)] bg-background px-3 pr-7 text-right text-sm tabular-nums text-foreground"
                      value={m.pct}
                      placeholder="0"
                      aria-label={`Milestone ${i + 1} percent`}
                      onChange={(e) => updateMilestoneRow(i, { pct: e.target.value })}
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">
                      %
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-[var(--neutral-500)]"
                    onClick={() => removeMilestoneRow(i)}
                    aria-label={`Remove milestone ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-[var(--border)]"
                  onClick={addMilestoneRow}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add milestone
                </Button>
                {draft.depositPct.trim() !== '' && draft.milestones.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 border-[var(--border)]"
                    onClick={convertDeposit}
                    title="Migrate the legacy deposit into explicit milestones: deposit on order confirmed, remainder on completion"
                  >
                    <ArrowDownUp className="mr-1.5 h-3.5 w-3.5" />
                    Convert {draft.depositPct}% deposit to milestones
                  </Button>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={draft.isDefault}
                onCheckedChange={(v) =>
                  setDraft((d) => ({ ...d, isDefault: Boolean(v) }))
                }
              />
              Make this the default term
            </label>
            <EditTextarea
              label="Notes"
              value={draft.notes}
              onChange={(v) => setDraft((d) => ({ ...d, notes: v }))}
              placeholder="When should this term be used?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={handleSave}
            >
              {editingId ? 'Save changes' : 'Create term'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
