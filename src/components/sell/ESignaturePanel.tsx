/**
 * ESignaturePanel — quote acceptance panel with mock signature capture,
 * acceptance metadata, and status badge.
 */

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Pen, CheckCircle2, Clock, Globe, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/data/StatusBadge";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import type { Quote } from "@/types/entities";

type SignatureState = "pending" | "signing" | "accepted";

interface ESignaturePanelProps {
  quote: Quote;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function SignatureCapture({
  onSign,
  isSigning,
}: {
  onSign: () => void;
  isSigning: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--neutral-300)] bg-[var(--neutral-50)]">
        {isSigning ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--neutral-300)] border-t-[var(--mw-mirage)]" />
            <p className="text-sm text-[var(--neutral-500)]">Capturing signature...</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Pen className="h-6 w-6 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <p className="text-sm text-[var(--neutral-500)]">Sign here</p>
          </div>
        )}
      </div>
      <Button
        onClick={onSign}
        disabled={isSigning}
        className="w-full"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
        Accept &amp; Sign Quote
      </Button>
    </div>
  );
}

function AcceptanceDetails({
  acceptedAt,
  acceptedBy,
}: {
  acceptedAt: string;
  acceptedBy: string;
}) {
  const formattedDate = new Date(acceptedAt).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-3">
      {/* Mock signature render */}
      <div className="flex min-h-[80px] items-center justify-center rounded-xl border border-[var(--neutral-200)] bg-[var(--neutral-50)]">
        <span className="font-serif text-2xl italic text-[var(--neutral-600)]">
          {acceptedBy}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
          <span className="text-[var(--neutral-500)]">Accepted:</span>
          <span className="font-mono text-foreground">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
          <span className="text-[var(--neutral-500)]">IP Address:</span>
          <span className="font-mono text-foreground">203.45.122.87</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
          <span className="text-[var(--neutral-500)]">Signed PDF:</span>
          <Button variant="link" size="sm" className="h-auto p-0 text-sm">
            View Document
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ESignaturePanel({ quote }: ESignaturePanelProps) {
  const alreadyAccepted = Boolean(quote.acceptedAt);
  const [state, setState] = useState<SignatureState>(
    alreadyAccepted ? "accepted" : "pending",
  );
  const [acceptedAt, setAcceptedAt] = useState(quote.acceptedAt ?? "");
  const [acceptedBy, setAcceptedBy] = useState(quote.acceptedBy ?? "");

  const handleSign = useCallback(() => {
    setState("signing");
    setTimeout(() => {
      const now = new Date().toISOString();
      setAcceptedAt(now);
      setAcceptedBy(quote.customerName);
      setState("accepted");
    }, 1500);
  }, [quote.customerName]);

  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat" className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-medium text-foreground">E-Signature</h3>
            <p className="text-sm text-muted-foreground">
              Quote <span className="font-mono">{quote.ref}</span> &mdash;{" "}
              {formatCurrency(quote.value)}
            </p>
          </div>
          {state === "accepted" ? (
            <StatusBadge status="approved" withDot>Accepted</StatusBadge>
          ) : state === "signing" ? (
            <StatusBadge status="pending" withDot>Signing</StatusBadge>
          ) : (
            <Badge variant="outline">Awaiting Signature</Badge>
          )}
        </div>

        {state === "accepted" ? (
          <AcceptanceDetails acceptedAt={acceptedAt} acceptedBy={acceptedBy} />
        ) : (
          <SignatureCapture onSign={handleSign} isSigning={state === "signing"} />
        )}
      </Card>
    </motion.div>
  );
}
