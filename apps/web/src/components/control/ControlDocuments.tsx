/**
 * ControlDocuments — Document management with revision timeline.
 * Data table with expandable revision history per document.
 */
import { useState, useEffect } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

import { controlService } from "@/services";
import type { ControlDocument } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { StatusBadge } from "@/components/shared/data/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    controlService.getDocuments().then(setDocuments);
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Documents"
        subtitle="Document control and revision management"
        breadcrumbs={[
          { label: "Control", href: "/control" },
          { label: "Documents" },
        ]}
        actions={
          <Badge variant="outline" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            {documents.length} documents
          </Badge>
        }
      />

      <motion.div variants={staggerItem}>
        <Card variant="flat" className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Revision</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const isExpanded = expandedId === doc.id;
                return (
                  <>
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer hover:bg-[var(--neutral-50)]"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : doc.id)
                      }
                    >
                      <TableCell>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-[var(--neutral-400)] transition-transform",
                            isExpanded && "rotate-90",
                          )}
                          strokeWidth={1.5}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {doc.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {docTypeLabel(doc.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {doc.revisionNumber}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={doc.status as "draft" | "approved"}
                          withDot
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {doc.lastUpdated}
                      </TableCell>
                      <TableCell className="text-sm">
                        {doc.owner}
                      </TableCell>
                    </TableRow>

                    {/* Revision timeline */}
                    {isExpanded && (
                      <TableRow
                        key={`${doc.id}-revisions`}
                        className="bg-[var(--neutral-50)]"
                      >
                        <TableCell />
                        <TableCell colSpan={6}>
                          <div className="py-2">
                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--neutral-500)]">
                              Revision History
                            </p>
                            <div className="relative border-l-2 border-[var(--neutral-200)] pl-4">
                              {doc.revisions.map((rev, i) => (
                                <div
                                  key={rev.revision + rev.date}
                                  className={cn(
                                    "relative pb-4 last:pb-0",
                                  )}
                                >
                                  {/* Timeline dot */}
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
                                        <span className="text-xs text-[var(--neutral-400)]">
                                          &middot;
                                        </span>
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
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </PageShell>
  );
}
