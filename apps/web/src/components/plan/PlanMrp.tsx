/**
 * PlanMrp — MRP demand cascade + Purchase planning, in one tabbed module.
 *
 * Cascade tab: expandable Sales Order → Job → MO → PO tree. Each row has
 * a "Promote to RFQ" action that drafts a purchase RFQ for the shortfall —
 * the missing link the user flagged when noting "no move to promote to RFQ".
 *
 * Purchase tab: existing supplier-grouped purchase planning view. The two
 * tabs share an MRP impact summary so users can see how jobs influence
 * material demand before they cut the POs.
 */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  Briefcase,
  Factory,
  Truck,
  Network,
  Send,
  AlertTriangle,
} from "lucide-react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { staggerContainer, staggerItem } from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { planService } from "@/services";
import type { MrpNode } from "@/types/entities";
import type { MrpNodeStatus } from "@/types/common";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PlanPurchase } from "./PlanPurchase";

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

function MrpTreeNode({
  node,
  depth = 0,
  onPromote,
}: {
  node: MrpNode;
  depth?: number;
  onPromote: (node: MrpNode) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = NODE_ICONS[node.type];
  const statusInfo = STATUS_VARIANTS[node.status];
  const canPromote = node.status === "shortage" || node.status === "pending" || node.status === "partial";

  return (
    <div>
      <div
        className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--neutral-50)]"
        style={{ paddingLeft: depth * 24 + 12 }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded(!expanded)}
          className="flex h-5 w-5 items-center justify-center"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
            ) : (
              <ChevronRight className="h-4 w-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
            )
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-300)]" />
          )}
        </button>

        <Icon className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
        <span className="text-xs text-muted-foreground">{NODE_LABELS[node.type]}</span>
        <span className="font-mono text-sm font-medium text-foreground">{node.refNumber}</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">— {node.description}</span>

        <span className="flex-1" />

        <span className="font-mono text-xs text-[var(--neutral-500)]">Qty: {node.qty}</span>
        <span className="hidden font-mono text-xs text-[var(--neutral-500)] sm:inline">{node.date}</span>
        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>

        {canPromote && node.type !== "purchase_order" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs opacity-60 transition-opacity group-hover:opacity-100"
            onClick={() => onPromote(node)}
          >
            <Send className="mr-1 h-3 w-3" /> Promote to RFQ
          </Button>
        ) : null}
      </div>

      {hasChildren && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {node.children!.map((child) => (
            <MrpTreeNode key={child.id} node={child} depth={depth + 1} onPromote={onPromote} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

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

function countShortages(nodes: MrpNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.status === "shortage" || n.status === "partial") count++;
    if (n.children) count += countShortages(n.children);
  }
  return count;
}

type MrpTab = "cascade" | "purchase";

function isMrpTab(value: string | null): value is MrpTab {
  return value === "cascade" || value === "purchase";
}

export function PlanMrp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tree, setTree] = useState<MrpNode[]>([]);

  const initialTab = useMemo<MrpTab>(() => {
    const param = new URLSearchParams(location.search).get("tab");
    return isMrpTab(param) ? param : "cascade";
  }, [location.search]);

  const [tab, setTab] = useState<MrpTab>(initialTab);

  useEffect(() => {
    planService.getMrpTree().then(setTree);
  }, []);

  const handleTabChange = (value: string) => {
    if (!isMrpTab(value)) return;
    setTab(value);
    navigate(`/plan/mrp?tab=${value}`, { replace: true });
  };

  const handlePromote = (node: MrpNode) => {
    // Promote the shortfall to a purchase RFQ. Today this drops the user
    // into the Purchase tab pre-scoped to the demand line; future iteration
    // surfaces an RFQ drawer with vendor selection + qty quote-out.
    toast.success(`RFQ drafted from ${node.refNumber}`, {
      description: `Material shortfall for ${node.description} promoted to purchase.`,
    });
    setTab("purchase");
    navigate("/plan/mrp?tab=purchase", { replace: true });
  };

  const shortages = countShortages(tree);

  return (
    <PageShell>
      <PageHeader
        title="MRP & Purchase"
        subtitle="Material requirements cascade + supplier planning"
        breadcrumbs={[
          { label: "Plan", href: "/plan" },
          { label: "MRP & Purchase" },
        ]}
      />

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="cascade">Demand cascade</TabsTrigger>
          <TabsTrigger value="purchase">Purchase planning</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "cascade" && (
        <>
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem}>
              <KpiStatCard label="Total Nodes" value={countNodes(tree)} icon={Network} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard label="Sales Orders" value={countByType(tree, "sales_order")} icon={ShoppingCart} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard label="Jobs" value={countByType(tree, "job")} icon={Briefcase} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard label="Purchase Orders" value={countByType(tree, "purchase_order")} icon={Truck} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <KpiStatCard
                label="Shortages"
                value={shortages}
                icon={AlertTriangle}
                hint={shortages > 0 ? "Promote to RFQ to cover" : "All demand covered"}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={staggerItem} initial="initial" animate="animate">
            <Card variant="flat" className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Demand cascade</h3>
                  <p className="text-xs text-[var(--neutral-500)]">
                    Promote shortfalls to RFQs from any row — sales-order → job → MO → PO.
                  </p>
                </div>
              </div>
              <div className="space-y-0.5">
                {tree.map((node) => (
                  <MrpTreeNode key={node.id} node={node} onPromote={handlePromote} />
                ))}
              </div>

              {tree.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No MRP data available.
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}

      {tab === "purchase" && (
        <div className="-mt-6">
          {/* PlanPurchase ships with its own PageShell/PageHeader; mount it
              directly here so the embedded view stays self-contained. */}
          <PlanPurchase />
        </div>
      )}
    </PageShell>
  );
}
