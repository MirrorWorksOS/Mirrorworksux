/**
 * ControlPaymentTerms — Reusable payment-term templates applied to
 * customers, quotes, orders and invoices. Local state only; mutations
 * are not persisted to a backend.
 */

import { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { paymentTerms as seedPaymentTerms } from '@/services';
import type { PaymentTerm } from '@/types/entities';

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
import { AccessGate } from '@/components/shared/access/AccessGate';

interface DraftTerm {
  id?: string;
  label: string;
  days: string;
  depositPct: string;
  isDefault: boolean;
  notes: string;
}

const EMPTY_DRAFT: DraftTerm = {
  label: '',
  days: '30',
  depositPct: '',
  isDefault: false,
  notes: '',
};

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
    });
    setEditingId(term.id);
    setDialogOpen(true);
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

    const upsert: PaymentTerm = {
      id: editingId ?? `pt-${Date.now()}`,
      label: draft.label.trim(),
      days,
      depositPct,
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
