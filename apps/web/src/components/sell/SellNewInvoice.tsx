/**
 * Sell — New Invoice (prototype wizard)
 * Save draft → /sell/invoices/8 · Issue → /sell/invoices/9
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GateBanner } from "@/components/workflow/GateBanner";
import * as mock from "@/services/mock";
import {
  GateFailure,
  MILESTONE_EVENT_LABELS,
  milestoneInvoiceAmount,
  milestonesForTerm,
  paymentTermForSalesOrder,
  workflowService,
} from "@/services/workflowService";
import type { GateFailureDetail, PaymentMilestoneEvent } from "@/types/entities";

const CUSTOMERS = [
  "TechCorp Industries",
  "Pacific Fabrication",
  "Sydney Rail Corp",
  "Hunter Steel Co",
  "BHP Contractors",
  "Kemppi Australia",
] as const;

const TAX_RATE = 0.1;

interface LineRow {
  id: string;
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
}

function newRow(): LineRow {
  return {
    id: `li-${Date.now()}`,
    item: "",
    description: "",
    qty: 1,
    unitPrice: 0,
  };
}

export function SellNewInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Optional context from launches: Order → Invoice, Quote → Invoice, Customer → Invoice.
  const linkedCustomer = searchParams.get('customer') ?? searchParams.get('customerId') ?? '';
  const linkedOrderId  = searchParams.get('orderId') ?? '';
  const linkedQuoteId  = searchParams.get('quoteId') ?? '';

  // ── D5: milestone pre-link — /sell/invoices/new?soId=…&milestone=…[&shipmentId=…]
  // Raised through gate G4 (`raiseInvoiceForMilestone`); the free-form
  // ad-hoc path below stays untouched when these params are absent.
  const milestoneLink = useMemo(() => {
    const soId = searchParams.get('soId');
    const event = searchParams.get('milestone') as PaymentMilestoneEvent | null;
    if (!soId || !event) return undefined;
    const so = mock.salesOrders.find((s) => s.id === soId);
    if (!so) return undefined;
    const term = paymentTermForSalesOrder(so);
    const milestone = milestonesForTerm(term).find((m) => m.event === event);
    if (!milestone) return undefined;
    const shipmentId = searchParams.get('shipmentId') ?? undefined;
    const shipment = shipmentId
      ? mock.shipments.find((s) => s.id === shipmentId)
      : undefined;
    return {
      so,
      term,
      milestone,
      shipment,
      amount: milestoneInvoiceAmount(so, milestone, shipment),
    };
  }, [searchParams]);

  const [gateFailures, setGateFailures] = useState<GateFailureDetail[]>([]);

  const [customer, setCustomer] = useState<string>(
    milestoneLink?.so.customerName ?? linkedCustomer,
  );
  const [poReference, setPoReference] = useState(
    milestoneLink?.so.orderNumber ?? (linkedOrderId || linkedQuoteId),
  );
  const [issueDate, setIssueDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (milestoneLink?.term?.days ?? 30));
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>(() =>
    milestoneLink
      ? [
          {
            id: `li-${Date.now()}`,
            item: "MILESTONE",
            description: `${MILESTONE_EVENT_LABELS[milestoneLink.milestone.event]} milestone (${milestoneLink.milestone.pct}%) — ${milestoneLink.so.orderNumber}${milestoneLink.shipment ? ` · ${milestoneLink.shipment.shipmentNumber}` : ''}`,
            qty: 1,
            unitPrice: milestoneLink.amount,
          },
        ]
      : [newRow(), newRow()],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((s, r) => s + Math.max(0, r.qty) * Math.max(0, r.unitPrice), 0),
    [lines],
  );
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const canSubmit = customer && lines.some((r) => r.item.trim() && r.unitPrice > 0);

  const updateLine = (id: string, patch: Partial<LineRow>) => {
    setLines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const addLine = () => setLines((prev) => [...prev, newRow()]);

  const handleSaveDraft = () => {
    if (!canSubmit) {
      toast.error("Select a customer and add at least one line with item and price.");
      return;
    }
    toast.success("Draft saved.");
    navigate("/sell/invoices/inv-008");
  };

  const handleIssue = async () => {
    if (!canSubmit) {
      toast.error("Select a customer and add at least one line with item and price.");
      return;
    }
    // Milestone-linked invoices go through gate G4 (decision D5).
    if (milestoneLink) {
      try {
        const invoice = await workflowService.raiseInvoiceForMilestone({
          salesOrderId: milestoneLink.so.id,
          event: milestoneLink.milestone.event,
          shipmentId: milestoneLink.shipment?.id,
        });
        setGateFailures([]);
        toast.success(
          `Invoice ${invoice.invoiceNumber} raised — ${MILESTONE_EVENT_LABELS[invoice.milestoneEvent!]} (${invoice.milestonePct}%).`,
        );
        navigate("/sell/invoices");
      } catch (e) {
        if (e instanceof GateFailure) {
          setGateFailures(e.details);
        } else {
          toast.error(e instanceof Error ? e.message : String(e));
        }
      }
      return;
    }
    toast.success("Invoice issued and sent to accounts contact.");
    navigate("/sell/invoices/inv-009");
  };

  return (
    <PageShell>
      <PageHeader
        title="New invoice"
        subtitle="Create a sales invoice with line items and GST"
        actions={
          <Button variant="outline" className="h-10 border-[var(--border)]" asChild>
            <Link to="/sell/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to invoices
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 px-6 pb-6">
        {milestoneLink && (
          <Card className="border-[var(--mw-yellow-400)] p-4">
            <p className="text-sm font-medium text-foreground">
              Linked to {milestoneLink.so.orderNumber} —{' '}
              {MILESTONE_EVENT_LABELS[milestoneLink.milestone.event]} milestone (
              {milestoneLink.milestone.pct}%)
              {milestoneLink.shipment ? ` · ${milestoneLink.shipment.shipmentNumber}` : ''}
            </p>
            <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
              {milestoneLink.term?.label ?? 'Default terms'} · net{' '}
              {milestoneLink.term?.days ?? 30} days. Issuing runs gate G4 — the
              milestone event must have occurred and not be invoiced already.
            </p>
          </Card>
        )}

        {gateFailures.length > 0 && (
          <GateBanner failures={gateFailures} title="G4 · Ship → Book blocked" />
        )}

        <Card className="p-6">
          <h2 className="text-base font-medium text-foreground mb-4">
            Header
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger className="mt-1 h-12 border-[var(--border)]">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">
                Customer PO reference
              </Label>
              <Input
                className="mt-1 h-12 border-[var(--border)]"
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                placeholder="PO number"
              />
            </div>
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">Issue date</Label>
              <Input
                type="date"
                className="mt-1 h-12 border-[var(--border)] tabular-nums"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-[var(--neutral-500)]">Due date</Label>
              <Input
                type="date"
                className="mt-1 h-12 border-[var(--border)] tabular-nums"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">
              Line items
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-[var(--border)]"
              onClick={addLine}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add line
            </Button>
          </div>
          <MwDataTable<LineRow>
            columns={[
              {
                key: "item",
                header: "Item code",
                cell: (row) => (
                  <Input
                    className="h-9 border-[var(--border)]"
                    value={row.item}
                    onChange={(e) => updateLine(row.id, { item: e.target.value })}
                    placeholder="PROD-001"
                  />
                ),
              },
              {
                key: "description",
                header: "Description",
                cell: (row) => (
                  <Input
                    className="h-9 border-[var(--border)]"
                    value={row.description}
                    onChange={(e) => updateLine(row.id, { description: e.target.value })}
                    placeholder="Description"
                  />
                ),
              },
              {
                key: "qty",
                header: "Qty",
                headerClassName: "w-24 text-right",
                className: "w-24",
                cell: (row) => (
                  <Input
                    type="number"
                    min={0}
                    className="h-9 border-[var(--border)] text-right tabular-nums"
                    value={row.qty}
                    onChange={(e) =>
                      updateLine(row.id, { qty: Number(e.target.value) || 0 })
                    }
                  />
                ),
              },
              {
                key: "unitPrice",
                header: "Unit price",
                headerClassName: "w-32 text-right",
                className: "w-32",
                cell: (row) => (
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className="h-9 border-[var(--border)] text-right tabular-nums"
                    value={row.unitPrice || ""}
                    onChange={(e) =>
                      updateLine(row.id, { unitPrice: Number(e.target.value) || 0 })
                    }
                  />
                ),
              },
              {
                key: "total",
                header: "Line total",
                headerClassName: "w-32 text-right",
                className: "w-32 text-right text-sm font-medium tabular-nums text-foreground",
                cell: (row) => {
                  const lineTotal =
                    Math.round(Math.max(0, row.qty) * Math.max(0, row.unitPrice) * 100) / 100;
                  return `$${lineTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`;
                },
              },
              {
                key: "remove",
                header: "",
                headerClassName: "w-12",
                className: "w-12",
                cell: (row) => (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[var(--neutral-500)]"
                    onClick={() => removeLine(row.id)}
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ),
              },
            ]}
            data={lines}
            keyExtractor={(row) => row.id}
          />

          <div className="mt-6 flex flex-col items-end gap-2 border-t border-[var(--border)] pt-4">
            <div className="flex w-full max-w-xs justify-between text-sm text-[var(--neutral-600)]">
              <span>Subtotal</span>
              <span className="tabular-nums">
                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-sm text-[var(--neutral-600)]">
              <span>GST (10%)</span>
              <span className="tabular-nums">
                ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-base font-medium text-foreground">
              <span>Total</span>
              <span className="tabular-nums">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Label className="text-xs text-[var(--neutral-500)]">Notes</Label>
          <Textarea
            className="mt-1 min-h-[88px] border-[var(--border)]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, remittance instructions…"
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="h-12 min-h-[48px] border-[var(--border)]"
            onClick={handleSaveDraft}
            disabled={!canSubmit}
          >
            Save draft
          </Button>
          <Button
            className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={handleIssue}
            disabled={!canSubmit}
          >
            Issue invoice
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
