/**
 * BomGenerator — AI-powered BOM generation from uploaded files.
 *
 * Mock file upload area, AI-generated BOM table with confidence badges,
 * and Accept/Edit actions per row.
 */

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Upload,
  FileText,
  Check,
  Pencil,
  RotateCw,
} from "lucide-react";

import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { planService } from "@/services/planService";
import type { BomGeneratorLine } from "@/types/entities";

/* ── helpers ─────────────────────────────────────────────────────── */

function confidenceBadge(pct: number) {
  if (pct >= 90)
    return (
      <Badge className="bg-[var(--chart-scale-high)] text-white">{pct}%</Badge>
    );
  if (pct >= 70)
    return (
      <Badge className="bg-[var(--chart-scale-mid)] text-white">{pct}%</Badge>
    );
  return (
    <Badge variant="destructive">{pct}%</Badge>
  );
}

/* ── component ───────────────────────────────────────────────────── */

export function BomGenerator() {
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<BomGeneratorLine[]>([]);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const handleUpload = useCallback(() => {
    setLoading(true);
    setUploaded(false);
    /* Simulate AI processing delay */
    setTimeout(() => {
      planService.getBomGeneratorLines().then((data) => {
        setLines(data);
        setLoading(false);
        setUploaded(true);
        setAccepted(new Set());
      });
    }, 1500);
  }, []);

  const toggleAccept = (id: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--mw-yellow-400)]" strokeWidth={1.5} />
        <h3 className="text-base font-medium text-foreground">AI BOM Generator</h3>
      </div>

      {/* Upload area */}
      {!uploaded && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <button
            type="button"
            onClick={handleUpload}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--neutral-300)] bg-[var(--neutral-50)] px-6 py-10 transition-colors hover:border-[var(--neutral-400)] hover:bg-[var(--neutral-100)]"
          >
            <Upload className="h-8 w-8 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Upload drawing or spec
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DXF, image, or CSV — AI will extract a BOM
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                <FileText className="mr-1 h-3 w-3" strokeWidth={1.5} />
                PDF
              </Badge>
              <Badge variant="outline">DXF</Badge>
              <Badge variant="outline">CSV</Badge>
              <Badge variant="outline">Image</Badge>
            </div>
          </button>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <RotateCw className="mb-3 h-8 w-8 animate-spin text-[var(--chart-scale-mid)]" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            AI is analysing the uploaded document...
          </p>
        </div>
      )}

      {/* Results table */}
      {uploaded && lines.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <motion.div variants={staggerItem}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <Sparkles className="mr-1 inline h-4 w-4 text-[var(--mw-yellow-400)]" strokeWidth={1.5} />
                {lines.length} lines extracted &middot;{" "}
                {accepted.size} accepted
              </p>
              <Button variant="outline" size="sm" onClick={handleUpload}>
                <Upload className="mr-1 h-3 w-3" strokeWidth={1.5} />
                Re-upload
              </Button>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow
                    key={line.id}
                    className={accepted.has(line.id) ? "bg-[var(--chart-scale-high)]/5" : ""}
                  >
                    <TableCell className="font-mono text-xs">{line.partNumber}</TableCell>
                    <TableCell className="text-sm">{line.description}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{line.material}</TableCell>
                    <TableCell className="text-right font-mono">{line.qty}</TableCell>
                    <TableCell className="text-sm">{line.operation}</TableCell>
                    <TableCell className="text-center">
                      {confidenceBadge(line.confidencePercent)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant={accepted.has(line.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAccept(line.id)}
                        >
                          <Check className="mr-1 h-3 w-3" strokeWidth={1.5} />
                          {accepted.has(line.id) ? "Accepted" : "Accept"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-3 w-3" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </motion.div>
      )}
    </Card>
  );
}
