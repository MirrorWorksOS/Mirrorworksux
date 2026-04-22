/**
 * PortalQuoteDetail — Full quote detail view within the customer portal.
 * Shows line items, delivery estimate, revision history, chat, and actions.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, X, MessageSquare, Download, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { StatusBadge, type StatusKey } from '@/components/shared/data/StatusBadge';
import { PortalQuoteChat } from '@/components/sell/PortalQuoteChat';
import { PortalRevisionTracker } from '@/components/sell/PortalRevisionTracker';
import { toast } from 'sonner';
import type { Quote } from '@/types/entities';

interface PortalQuoteDetailProps {
  quote: Quote;
  onBack: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const fmtCurrency = (v: number) => v.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const quoteStatusMap: Record<string, StatusKey> = {
  draft: 'draft',
  sent: 'pending',
  accepted: 'approved',
  declined: 'rejected',
  expired: 'overdue',
  revision_requested: 'pending',
};

// ── Status Timeline ─────────────────────────────────────────────────

function StatusTimeline({ quote }: { quote: Quote }) {
  const steps = [
    { label: 'Quote created', date: quote.date, done: true },
    { label: 'Sent to customer', date: quote.date, done: quote.status !== 'draft' },
    {
      label: 'Viewed by customer',
      date: quote.viewEvents?.[0]?.viewedAt,
      done: (quote.viewEvents?.length ?? 0) > 0,
    },
    {
      label: quote.status === 'accepted' ? 'Accepted' : quote.status === 'declined' ? 'Declined' : 'Awaiting decision',
      date: quote.acceptedAt,
      done: quote.status === 'accepted' || quote.status === 'declined',
    },
  ];

  return (
    <Card className="p-5 space-y-3">
      <h4 className="text-sm font-medium text-foreground">Status</h4>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 relative">
            {i < steps.length - 1 && (
              <div className="absolute left-[9px] top-5 bottom-0 w-px bg-[var(--border)]" />
            )}
            <div className="shrink-0 mt-0.5 z-10">
              {step.done ? (
                <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--mw-green)]">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              ) : (
                <div className="h-[18px] w-[18px] rounded-full border-2 border-[var(--neutral-300)] bg-card" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-xs font-medium text-foreground">{step.label}</p>
              {step.date && step.done && (
                <p className="text-[10px] text-[var(--neutral-500)]">{fmtDate(step.date)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function PortalQuoteDetail({ quote, onBack, onAccept, onDecline }: PortalQuoteDetailProps) {
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const subtotal = quote.lineItems.reduce((s, li) => s + li.total, 0);
  const currentVersion = quote.revisions?.length ?? 1;
  const isActionable = quote.status === 'sent' || quote.status === 'draft';

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) return;
    toast.success("Revision requested. We'll be in touch within 24 hours.");
    setRevisionDialogOpen(false);
    setRevisionNotes('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-[var(--neutral-100)] rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium font-mono text-foreground">{quote.ref}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">v{currentVersion}</Badge>
              <StatusBadge status={quoteStatusMap[quote.status] ?? 'pending'}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
              </StatusBadge>
            </div>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">
              Issued {fmtDate(quote.date)} · Expires {fmtDate(quote.expiryDate)}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info('Downloading PDF...')}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items */}
          {(() => {
            type QuoteLineItem = (typeof quote.lineItems)[number];
            const columns: MwColumnDef<QuoteLineItem>[] = [
              {
                key: 'description',
                header: 'Description',
                cell: (li) => <span className="text-foreground">{li.description}</span>,
              },
              {
                key: 'qty',
                header: 'Qty',
                headerClassName: 'text-right',
                cell: (li) => <span className="tabular-nums">{li.qty}</span>,
                className: 'text-right',
              },
              {
                key: 'unitPrice',
                header: 'Unit Price',
                headerClassName: 'text-right',
                cell: (li) => <span className="tabular-nums">{fmtCurrency(li.unitPrice)}</span>,
                className: 'text-right',
              },
              {
                key: 'total',
                header: 'Total',
                headerClassName: 'text-right',
                cell: (li) => <span className="font-medium tabular-nums">{fmtCurrency(li.total)}</span>,
                className: 'text-right',
              },
            ];
            return (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Line Items</h4>
                <MwDataTable<QuoteLineItem>
                  columns={columns}
                  data={quote.lineItems}
                  keyExtractor={(_, i) => i}
                  striped
                />
                <div className="flex justify-end">
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between gap-8 text-sm">
                      <span className="text-[var(--neutral-500)]">Subtotal</span>
                      <span className="tabular-nums font-medium">{fmtCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-8 text-sm">
                      <span className="text-[var(--neutral-500)]">GST (10%)</span>
                      <span className="tabular-nums">{fmtCurrency(subtotal * 0.1)}</span>
                    </div>
                    <div className="flex justify-between gap-8 text-base font-medium pt-1 border-t border-[var(--border)]">
                      <span>Total (inc. GST)</span>
                      <span className="tabular-nums">{fmtCurrency(subtotal * 1.1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Delivery estimate */}
          <Card className="p-4 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-[var(--mw-yellow-500)]" />
            <div>
              <p className="text-sm font-medium text-foreground">Estimated delivery: May 12, 2026</p>
              <p className="text-xs text-[var(--neutral-500)]">Based on current shop capacity and material lead times</p>
            </div>
          </Card>

          {/* Uploaded files */}
          {quote.uploadedFiles && quote.uploadedFiles.length > 0 && (
            <Card className="p-5 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Attachments</h4>
              <div className="space-y-2">
                {quote.uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--neutral-50)]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--neutral-400)]" />
                      <span className="text-xs font-medium text-foreground">{f.name}</span>
                      <span className="text-[10px] text-[var(--neutral-400)]">{f.sizeKb}KB</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7" onClick={() => toast.info(`Downloading ${f.name}`)}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Chat */}
          <PortalQuoteChat messages={quote.messages} quoteId={quote.id} />
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          {isActionable && (
            <Card className="p-5 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Actions</h4>
              <Button
                className="w-full bg-[var(--mw-green)] hover:bg-[var(--mw-green)]/90 text-white"
                onClick={() => onAccept(quote.id)}
              >
                <Check className="w-4 h-4 mr-1.5" /> Accept Quote
              </Button>
              <Button
                variant="outline"
                className="w-full border-[var(--border)]"
                onClick={() => setRevisionDialogOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" /> Request Revision
              </Button>
              <Button
                variant="outline"
                className="w-full border-[var(--border)] text-[var(--mw-error)]"
                onClick={() => onDecline(quote.id)}
              >
                <X className="w-4 h-4 mr-1.5" /> Decline
              </Button>
            </Card>
          )}

          {/* Status Timeline */}
          <StatusTimeline quote={quote} />

          {/* Revision History */}
          <PortalRevisionTracker revisions={quote.revisions} />
        </div>
      </div>

      {/* Revision Request Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a revision</DialogTitle>
            <DialogDescription>
              Tell us what you'd like changed. We'll update the quote and notify you.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={revisionNotes}
            onChange={e => setRevisionNotes(e.target.value)}
            placeholder="Describe the changes you'd like..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={handleRequestRevision}
              disabled={!revisionNotes.trim()}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
