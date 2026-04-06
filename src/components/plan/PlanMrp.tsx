/**
 * PlanMrp — MRP demand cascade tree view.
 *
 * Expandable tree: Sales Order -> Job -> Manufacturing Order -> Purchase Order.
 * Each node shows ref number, qty, status badge, and date.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  Briefcase,
  Factory,
  Truck,
  Network,
} from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { planService } from "@/services/planService";
import type { MrpNode } from "@/types/entities";
import type { MrpNodeStatus } from "@/types/common";
import type { LucideIcon } from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────────── */

const NODE_ICONS: Record<MrpNode["type"], LucideIcon> = {
  sales_order: ShoppingCart,
  job: Briefcase,
  manufacturing_order: Factory,
  purchase_order: Truck,
};

const NODE_LABELS: Record<MrpNode["type"], string> = {
  sales_order: "Sales Order",
  job: "Job",
  manufacturing_order: "Manufacturing Order",
  purchase_order: "Purchase Order",
};

const STATUS_VARIANTS: Record<MrpNodeStatus, { label: string; className: string }> = {
  fulfilled: { label: "Fulfilled", className: "bg-[var(--chart-scale-high)] text-white" },
  partial: { label: "Partial", className: "bg-[var(--chart-scale-mid)] text-white" },
  pending: { label: "Pending", className: "bg-[var(--neutral-400)] text-white" },
  shortage: { label: "Shortage", className: "bg-destructive text-white" },
};

/* ── tree node ───────────────────────────────────────────────────── */

function MrpTreeNode({ node, depth = 0 }: { node: MrpNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = NODE_ICONS[node.type];
  const statusInfo = STATUS_VARIANTS[node.status];

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--neutral-50)]"
        style={{ paddingLeft: depth * 24 + 12 }}
      >
        {/* expand/collapse */}
        <span className="flex h-5 w-5 items-center justify-center">
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
            ) : (
              <ChevronRight className="h-4 w-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
            )
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-300)]" />
          )}
        </span>

        {/* icon */}
        <Icon className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />

        {/* type label */}
        <span className="text-xs text-muted-foreground">{NODE_LABELS[node.type]}</span>

        {/* ref number */}
        <span className="font-mono text-sm font-medium text-foreground">{node.refNumber}</span>

        {/* description */}
        <span className="hidden text-sm text-muted-foreground sm:inline">
          &mdash; {node.description}
        </span>

        {/* spacer */}
        <span className="flex-1" />

        {/* qty */}
        <span className="font-mono text-xs text-[var(--neutral-500)]">
          Qty: {node.qty}
        </span>

        {/* date */}
        <span className="hidden font-mono text-xs text-[var(--neutral-500)] sm:inline">
          {node.date}
        </span>

        {/* status */}
        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
      </button>

      {/* children */}
      {hasChildren && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {node.children!.map((child) => (
            <MrpTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ── helpers to count nodes ──────────────────────────────────────── */

function countNodes(nodes: MrpNode[]): number {
  let count = 0;
  for (const n of nodes) {
    count++;
    if (n.children) count += countNodes(n.children);
  }
  return count;
}

function countByType(nodes: MrpNode[], type: MrpNode["type"]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === type) count++;
    if (n.children) count += countByType(n.children, type);
  }
  return count;
}

/* ── component ───────────────────────────────────────────────────── */

export function PlanMrp() {
  const [tree, setTree] = useState<MrpNode[]>([]);

  useEffect(() => {
    planService.getMrpTree().then(setTree);
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="MRP Demand Cascade"
        subtitle="Material Requirements Planning demand tree"
        breadcrumbs={[
          { label: "Plan", href: "/plan" },
          { label: "MRP" },
        ]}
      />

      {/* KPIs */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Total Nodes"
            value={countNodes(tree)}
            icon={Network}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Sales Orders"
            value={countByType(tree, "sales_order")}
            icon={ShoppingCart}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Jobs"
            value={countByType(tree, "job")}
            icon={Briefcase}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Purchase Orders"
            value={countByType(tree, "purchase_order")}
            icon={Truck}
          />
        </motion.div>
      </motion.div>

      {/* Tree */}
      <motion.div variants={staggerItem} initial="initial" animate="animate">
        <Card variant="flat" className="p-6">
          <div className="space-y-0.5">
            {tree.map((node) => (
              <MrpTreeNode key={node.id} node={node} />
            ))}
          </div>

          {tree.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No MRP data available.
            </div>
          )}
        </Card>
      </motion.div>
    </PageShell>
  );
}
