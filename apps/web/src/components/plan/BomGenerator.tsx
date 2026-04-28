/**
 * BomGenerator — AI-powered BOM generation from uploaded files.
 *
 * Mock file upload area, AI-generated BOM table with confidence badges,
 * and Accept/Edit actions per row.
 */

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Upload,
  FileText,
  Check,
  Pencil,
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
import { planService } from "@/services";
import type { BomGeneratorLine } from "@/types/entities";
import { MirrorWorksAgentCard } from "@/components/shared/ai/MirrorWorksAgentCard";

type BomReviewStatus = 'accepted' | 'edited' | 'unresolved' | 'needs_catalog_match';

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
  const [reviewStatus, setReviewStatus] = useState<Record<string, BomReviewStatus>>({});

  const handleUpload = useCallback(() => {
    setLoading(true);
    setUploaded(false);
    /* Simulate AI processing delay */
    setTimeout(() => {
      planService.getBomGeneratorLines().then((data) => {
        setLines(data);
        setLoading(false);
        setUploaded(true);
        setReviewStatus(
          Object.fromEntries(
            data.map((line) => [
              line.id,
              line.confidencePercent >= 90
                ? 'accepted'
                : line.confidencePercent >= 70
                  ? 'unresolved'
                  : 'needs_catalog_match',
            ]),
          ),
        );
      });
    }, 1500);
  }, []);

  const setLineStatus = (id: string, status: BomReviewStatus) => {
    setReviewStatus((prev) => ({ ...prev, [id]: status }));
  };

  const counts = lines.reduce(
    (acc, line) => {
      const status = reviewStatus[line.id];
      if (status) acc[status] += 1;
      return acc;
    },
    { accepted: 0, edited: 0, unresolved: 0, needs_catalog_match: 0 } as Record<BomReviewStatus, number>,
  );

  const statusBadge = (status: BomReviewStatus) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-[var(--mw-green)]/15 text-[var(--mw-green)] border-0">Accepted</Badge>;
      case 'edited':
        return <Badge className="bg-[var(--mw-info)]/15 text-[var(--mw-info)] border-0">Edited</Badge>;
      case 'needs_catalog_match':
        return <Badge className="bg-[var(--mw-warning)]/15 text-[var(--mw-yellow-700)] border-0 dark:text-[var(--mw-yellow-400)]">Needs catalog match</Badge>;
      default:
        return <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-600)] border-0">Unresolved</Badge>;
    }
  };

  return (
    <Card variant="flat" className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--mw-yellow-400)]" strokeWidth={1.5} />
        <h3 className="text-base font-medium text-foreground">MirrorWorks Agent BOM review</h3>
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
                PDF, DXF, image, or CSV — MirrorWorks Agent will extract draft BOM lines
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
        <MirrorWorksAgentCard
          title="Reviewing uploaded drawing"
          suggestion="MirrorWorks Agent is parsing the file, extracting candidate BOM lines, and checking likely catalog matches."
          state="loading"
          statusLabel="Processing"
          statusText="Upload → parse → extract → match"
        />
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
            <MirrorWorksAgentCard
              title="Review extracted BOM"
              suggestion={`MirrorWorks Agent extracted ${lines.length} candidate lines. ${counts.unresolved + counts.needs_catalog_match} line(s) still need review before this BOM is ready.`}
              tone={counts.unresolved + counts.needs_catalog_match > 0 ? 'risk' : 'success'}
              state={counts.unresolved + counts.needs_catalog_match > 0 ? 'needs_review' : 'applied'}
              primaryAction={{
                label: 'Re-upload',
                onClick: handleUpload,
              }}
              detailContent={
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>Accepted: {counts.accepted}</p>
                  <p>Edited: {counts.edited}</p>
                  <p>Unresolved: {counts.unresolved}</p>
                  <p>Needs catalog match: {counts.needs_catalog_match}</p>
                </div>
              }
              evidenceLevel="expandable"
              detailLabel="Review queue"
            />
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow
                    key={line.id}
                    className={reviewStatus[line.id] === 'accepted' ? "bg-[var(--chart-scale-high)]/5" : ""}
                  >
                    <TableCell className="font-mono text-xs">{line.partNumber}</TableCell>
                    <TableCell className="text-sm">{line.description}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{line.material}</TableCell>
                    <TableCell className="text-right font-mono">{line.qty}</TableCell>
                    <TableCell className="text-sm">{line.operation}</TableCell>
                    <TableCell>{statusBadge(reviewStatus[line.id])}</TableCell>
                    <TableCell className="text-center">
                      {confidenceBadge(line.confidencePercent)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant={reviewStatus[line.id] === 'accepted' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLineStatus(line.id, reviewStatus[line.id] === 'accepted' ? 'unresolved' : 'accepted')}
                        >
                          <Check className="mr-1 h-3 w-3" strokeWidth={1.5} />
                          {reviewStatus[line.id] === 'accepted' ? "Accepted" : "Accept"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setLineStatus(line.id, 'edited')}>
                          <Pencil className="h-3 w-3" strokeWidth={1.5} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setLineStatus(line.id, 'needs_catalog_match')}>
                          Match
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
