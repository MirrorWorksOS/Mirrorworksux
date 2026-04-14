/**
 * DXF Upload Panel — simulates DXF file upload and analysis.
 * Shows a dropzone and mock analysis results after a 1-second delay.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileType, Scissors, DollarSign, Grid3X3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import type { DxfAnalysisResult } from "@/types/entities";

const mockAnalysis: DxfAnalysisResult = {
  fileName: "bracket-assembly.dxf",
  materialYieldPercent: 87,
  estimatedCutMinutes: 24,
  sheetUtilizationPercent: 82,
  materialCostAud: 145.5,
  partsPerSheet: 12,
  sheetDimensions: { widthMm: 2400, heightMm: 1200 },
};

function SheetUtilisationSvg({ percent }: { percent: number }) {
  const cols = 6;
  const rows = 4;
  const total = cols * rows;
  const filled = Math.round((percent / 100) * total);

  return (
    <svg viewBox="0 0 120 80" className="w-full max-w-[180px]" aria-label={`Sheet utilisation: ${percent}%`}>
      <rect x={0} y={0} width={120} height={80} rx={4} fill="var(--neutral-100)" stroke="var(--neutral-300)" strokeWidth={1} />
      {Array.from({ length: total }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const isFilled = i < filled;
        return (
          <rect
            key={i}
            x={4 + col * 19}
            y={4 + row * 18}
            width={16}
            height={15}
            rx={2}
            fill={isFilled ? "var(--chart-scale-high)" : "var(--neutral-200)"}
            opacity={isFilled ? 0.85 : 0.4}
          />
        );
      })}
    </svg>
  );
}

interface AnalysisStatProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function AnalysisStat({ icon: Icon, label, value }: AnalysisStatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--neutral-100)]">
        <Icon className="h-4 w-4 text-[var(--neutral-600)]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs text-[var(--neutral-500)]">{label}</p>
        <p className="text-sm font-medium text-foreground font-mono">{value}</p>
      </div>
    </div>
  );
}

export function DxfUploadPanel() {
  const [state, setState] = useState<"idle" | "uploading" | "complete">("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysis, setAnalysis] = useState<DxfAnalysisResult | null>(null);

  const handleUpload = useCallback(() => {
    setState("uploading");
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setState("complete");
    }, 1000);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleUpload();
    },
    [handleUpload],
  );

  const handleReset = useCallback(() => {
    setState("idle");
    setAnalysis(null);
  }, []);

  return (
    <motion.div variants={staggerItem}>
      <Card variant="flat" className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-foreground">DXF File Analysis</h3>
          <p className="text-sm text-muted-foreground">Upload a DXF to estimate nesting, cut time, and cost</p>
        </div>

        {/* Dropzone */}
        {state !== "complete" && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]"
                : "border-[var(--neutral-300)] bg-[var(--neutral-50)]"
            }`}
          >
            {state === "uploading" ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--neutral-300)] border-t-[var(--mw-mirage)]" />
                <p className="text-sm text-[var(--neutral-600)]">Analysing file...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--neutral-400)]" strokeWidth={1.5} />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--neutral-700)]">
                    Drop <span className="font-mono">.dxf</span> file here
                  </p>
                  <p className="text-xs text-[var(--neutral-500)]">or click to browse</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleUpload}>
                  Select File
                </Button>
              </>
            )}
          </div>
        )}

        {/* Analysis results */}
        <AnimatePresence>
          {state === "complete" && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 rounded-lg bg-[var(--mw-success-light)] px-3 py-2">
                <FileType className="h-4 w-4 text-[var(--mw-success)]" strokeWidth={1.5} />
                <span className="text-sm font-medium text-[var(--mw-success)]">
                  {analysis.fileName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AnalysisStat
                  icon={Grid3X3}
                  label="Material Yield"
                  value={`${analysis.materialYieldPercent}%`}
                />
                <AnalysisStat
                  icon={Scissors}
                  label="Est. Cut Time"
                  value={`${analysis.estimatedCutMinutes} min`}
                />
                <AnalysisStat
                  icon={DollarSign}
                  label="Material Cost"
                  value={`$${analysis.materialCostAud.toFixed(2)}`}
                />
                <AnalysisStat
                  icon={Grid3X3}
                  label="Parts per Sheet"
                  value={`${analysis.partsPerSheet}`}
                />
              </div>

              {/* Sheet utilisation visualisation */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--neutral-500)]">
                  Sheet Utilisation ({analysis.sheetUtilizationPercent}%)
                </p>
                <div className="flex items-center gap-4">
                  <SheetUtilisationSvg percent={analysis.sheetUtilizationPercent} />
                  <div className="text-xs text-[var(--neutral-500)]">
                    <p className="font-mono">
                      {analysis.sheetDimensions.widthMm} x {analysis.sheetDimensions.heightMm} mm
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                Upload Another
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
