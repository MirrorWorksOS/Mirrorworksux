/**
 * MRP Suggestions — Auto-generated PO recommendations based on demand vs stock.
 * Route: /buy/mrp-suggestions
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  DollarSign,
  PackagePlus,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { buyService } from "@/services";
import type { MrpSuggestion } from "@/types/entities";

const breadcrumbs = [
  { label: "Buy", href: "/buy" },
  { label: "MRP Suggestions" },
];

export function BuyMrpSuggestions() {
  const [suggestions, setSuggestions] = useState<MrpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    buyService.getMrpSuggestions().then((data) => {
      setSuggestions(data);
      setLoading(false);
    });
  }, []);

  const totalShortfall = suggestions.reduce((s, r) => s + r.shortfall, 0);
  const estimatedValue = suggestions.reduce(
    (s, r) => s + r.estimatedCostAud,
    0,
  );

  const handleCreatePo = (row: MrpSuggestion) => {
    setCreatedIds((prev) => new Set(prev).add(row.id));
    toast.success(
      `PO created for ${row.material} (${row.grade}) — ${row.suggestedSupplierName}`,
    );
  };

  return (
    <PageShell>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <PageHeader
          title="MRP Suggestions"
          subtitle="Auto-generated purchase recommendations from demand shortfalls"
          breadcrumbs={breadcrumbs}
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Shortfall Items"
              value={suggestions.length}
              icon={AlertTriangle}
              iconSurface="key"
              hint={`${totalShortfall} total units short`}
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Estimated PO Value"
              value={`$${estimatedValue.toLocaleString("en-AU")}`}
              icon={DollarSign}
              hint="Across all suggestions"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="POs Created"
              value={createdIds.size}
              icon={ShoppingCart}
              hint="From this session"
            />
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Suggested Purchase Orders
              </h3>
              <Badge
                className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)]"
              >
                {suggestions.length} items
              </Badge>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-[var(--neutral-500)]">
                Loading MRP suggestions...
              </p>
            ) : (
              <MwDataTable<MrpSuggestion>
                columns={[
                  {
                    key: "material",
                    header: "Material",
                    className: "font-medium text-foreground",
                    cell: (row) => row.material,
                  },
                  {
                    key: "grade",
                    header: "Grade",
                    className: "font-mono text-sm text-[var(--neutral-600)]",
                    cell: (row) => row.grade,
                  },
                  {
                    key: "qtyNeeded",
                    header: "Qty Needed",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums",
                    cell: (row) => row.totalQtyNeeded,
                  },
                  {
                    key: "stock",
                    header: "Current Stock",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums",
                    cell: (row) => row.currentStock,
                  },
                  {
                    key: "shortfall",
                    header: "Shortfall",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums text-[var(--mw-error)]",
                    cell: (row) => row.shortfall,
                  },
                  {
                    key: "supplier",
                    header: "Suggested Supplier",
                    className: "text-[var(--neutral-600)]",
                    cell: (row) => row.suggestedSupplierName,
                  },
                  {
                    key: "cost",
                    header: "Est. Cost (AUD)",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums font-medium",
                    cell: (row) => `$${row.estimatedCostAud.toLocaleString("en-AU")}`,
                  },
                  {
                    key: "action",
                    header: "Action",
                    headerClassName: "text-right",
                    className: "text-right",
                    cell: (row) => {
                      const isCreated = createdIds.has(row.id);
                      return (
                        <Button
                          size="sm"
                          variant={isCreated ? "outline" : "default"}
                          disabled={isCreated}
                          onClick={() => handleCreatePo(row)}
                          className="gap-1.5"
                        >
                          <PackagePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {isCreated ? "Created" : "Create PO"}
                        </Button>
                      );
                    },
                  },
                ]}
                data={suggestions}
                keyExtractor={(row) => row.id}
                className="border-0 shadow-none"
              />
            )}
          </Card>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
