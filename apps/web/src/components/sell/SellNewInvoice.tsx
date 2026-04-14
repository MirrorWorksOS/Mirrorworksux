/**
 * Sell — New Invoice (prototype wizard)
 * Save draft → /sell/invoices/8 · Issue → /sell/invoices/9
 */

import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const [customer, setCustomer] = useState<string>("");
  const [poReference, setPoReference] = useState("");
  const [issueDate, setIssueDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([newRow(), newRow()]);

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

  const handleIssue = () => {
    if (!canSubmit) {
      toast.error("Select a customer and add at least one line with item and price.");
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
        <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
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

        <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
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
          <div className="overflow-x-auto rounded-[var(--shape-md)] border border-[var(--border)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--neutral-50)]">
                  <TableHead className="text-xs uppercase tracking-wider text-[var(--neutral-500)]">
                    Item code
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-[var(--neutral-500)]">
                    Description
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-[var(--neutral-500)] w-24 text-right tabular-nums">
                    Qty
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-[var(--neutral-500)] w-32 text-right tabular-nums">
                    Unit price
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-[var(--neutral-500)] w-32 text-right tabular-nums">
                    Line total
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((row) => {
                  const lineTotal =
                    Math.round(Math.max(0, row.qty) * Math.max(0, row.unitPrice) * 100) /
                    100;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          className="h-9 border-[var(--border)]"
                          value={row.item}
                          onChange={(e) =>
                            updateLine(row.id, { item: e.target.value })
                          }
                          placeholder="PROD-001"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-9 border-[var(--border)]"
                          value={row.description}
                          onChange={(e) =>
                            updateLine(row.id, { description: e.target.value })
                          }
                          placeholder="Description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-9 border-[var(--border)] text-right tabular-nums"
                          value={row.qty}
                          onChange={(e) =>
                            updateLine(row.id, {
                              qty: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          className="h-9 border-[var(--border)] text-right tabular-nums"
                          value={row.unitPrice || ""}
                          onChange={(e) =>
                            updateLine(row.id, {
                              unitPrice: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                        ${lineTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

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

        <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
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
