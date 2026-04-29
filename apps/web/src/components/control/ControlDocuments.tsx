/**
 * ControlDocuments — Document management with revision timeline.
 * Data table with expandable revision history per document.
 */
import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { motion } from "motion/react";

import { controlService } from "@/services";
import type { ControlDocument } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { StatusBadge } from "@/components/shared/data/StatusBadge";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

function docTypeLabel(type: ControlDocument["type"]): string {
  switch (type) {
    case "drawing":
      return "Drawing";
    case "spec":
      return "Specification";
    case "procedure":
      return "Procedure";
    case "certificate":
      return "Certificate";
    case "manual":
      return "Manual";
    default:
      return type;
  }
}

export function ControlDocuments() {
  const [documents, setDocuments] = useState<ControlDocument[]>([]);

  useEffect(() => {
    controlService.getDocuments().then(setDocuments);
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Documents"
        subtitle="Document control and revision management"
        actions={
          <Badge variant="outline" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            {documents.length} documents
          </Badge>
        }
      />

      <motion.div variants={staggerItem}>
        <MwDataTable<ControlDocument>
          columns={[
            { key: "title", header: "Title", className: "font-medium", cell: (doc) => doc.title },
            {
              key: "type",
              header: "Type",
              cell: (doc) => <Badge variant="outline">{docTypeLabel(doc.type)}</Badge>,
            },
            {
              key: "revision",
              header: "Revision",
              className: "font-mono text-sm",
              cell: (doc) => doc.revisionNumber,
            },
            {
              key: "status",
              header: "Status",
              cell: (doc) => (
                <StatusBadge status={doc.status as "draft" | "approved"} withDot />
              ),
            },
            {
              key: "updated",
              header: "Last Updated",
              className: "font-mono text-sm",
              cell: (doc) => doc.lastUpdated,
            },
            { key: "owner", header: "Owner", className: "text-sm", cell: (doc) => doc.owner },
          ]}
          data={documents}
          keyExtractor={(doc) => doc.id}
          expandable={{
            renderExpanded: (doc) => (
              <div className="px-4 py-3">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
                  Revision History
                </p>
                <div className="relative border-l-2 border-[var(--neutral-200)] pl-4">
                  {doc.revisions.map((rev, i) => (
                    <div
                      key={rev.revision + rev.date}
                      className="relative pb-4 last:pb-0"
                    >
                      <div
                        className={cn(
                          "absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white",
                          i === 0
                            ? "bg-[var(--chart-scale-high)]"
                            : "bg-[var(--neutral-300)]",
                        )}
                      />
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium text-foreground">
                              {rev.revision}
                            </span>
                            <span className="text-xs text-[var(--neutral-400)]">·</span>
                            <span className="font-mono text-xs text-[var(--neutral-500)]">
                              {rev.date}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-[var(--neutral-500)]">
                            {rev.description}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--neutral-400)]">
                            by {rev.author}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </motion.div>
    </PageShell>
  );
}
