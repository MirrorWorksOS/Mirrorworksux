/**
 * BatchTraceability — Lot tracking tree view (card/panel).
 *
 * Raw material lot -> WIP batch -> Finished goods lot.
 * Each node: lot number, qty, date, status badge. Expand/collapse.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, ChevronDown, Layers, Package, Box } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { makeService } from "@/services/makeService";
import type { BatchLot } from "@/types/entities";
import type { BatchStatus } from "@/types/common";

/* ------------------------------------------------------------------ */
/* Status badge config                                                 */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<BatchStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-[var(--chart-scale-mid)]/15 text-[var(--chart-scale-mid)] border-[var(--chart-scale-mid)]/30",
  },
  quarantine: {
    label: "Quarantine",
    className: "bg-[var(--mw-red,#dc2626)]/15 text-[var(--mw-red,#dc2626)] border-[var(--mw-red,#dc2626)]/30",
  },
  released: {
    label: "Released",
    className: "bg-[var(--chart-scale-high)]/15 text-[var(--chart-scale-high)] border-[var(--chart-scale-high)]/30",
  },
  consumed: {
    label: "Consumed",
    className: "bg-[var(--neutral-300)] text-[var(--neutral-600)] border-[var(--neutral-300)]",
  },
};

const TYPE_ICON: Record<BatchLot["type"], typeof Layers> = {
  raw_material: Package,
  wip: Layers,
  finished_goods: Box,
};

const TYPE_LABEL: Record<BatchLot["type"], string> = {
  raw_material: "Raw Material",
  wip: "WIP",
  finished_goods: "Finished Goods",
};

/* ------------------------------------------------------------------ */
/* Tree Node                                                           */
/* ------------------------------------------------------------------ */

function LotNode({ lot, depth = 0 }: { lot: BatchLot; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = lot.children && lot.children.length > 0;
  const statusCfg = STATUS_CONFIG[lot.status];
  const Icon = TYPE_ICON[lot.type];

  return (
    <div className={cn(depth > 0 && "ml-6 border-l border-[var(--neutral-200)] pl-4")}>
      <motion.div variants={staggerItem} initial="initial" animate="animate">
        <div className="flex items-start gap-3 py-2">
          {/* Expand toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 shrink-0",
              !hasChildren && "invisible",
            )}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            )}
          </Button>

          {/* Icon */}
          <Icon
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--neutral-500)]"
            strokeWidth={1.5}
          />

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-medium text-foreground">
                {lot.lotNumber}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {TYPE_LABEL[lot.type]}
              </Badge>
              <Badge variant="outline" className={statusCfg.className}>
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{lot.material}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-mono">Qty: {lot.qty}</span>
              <span>{lot.date}</span>
              {lot.supplierName && <span>{lot.supplierName}</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {lot.children!.map((child) => (
            <LotNode key={child.id} lot={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function BatchTraceability() {
  const [lots, setLots] = useState<BatchLot[]>([]);

  useEffect(() => {
    makeService.getBatchLots().then(setLots);
  }, []);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <Card variant="flat" className="p-6">
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-[var(--neutral-500)]" strokeWidth={1.5} />
            <h3 className="text-base font-medium text-foreground">
              Batch Traceability
            </h3>
          </div>
        </motion.div>

        <div className="space-y-1">
          {lots.map((lot) => (
            <LotNode key={lot.id} lot={lot} />
          ))}
        </div>

        {lots.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No batch/lot records found.
          </p>
        )}
      </Card>
    </motion.div>
  );
}
