/**
 * Reorder Rules — Automated PO trigger thresholds by material.
 * Route: /buy/reorder-rules
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  RefreshCw,
  Settings2,
  ShieldCheck,
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { cn } from "@/components/ui/utils";
import { buyService } from "@/services";
import type { ReorderRule } from "@/types/entities";

const breadcrumbs = [
  { label: "Buy", href: "/buy" },
  { label: "Reorder Rules" },
];

export function BuyReorderRules() {
  const [rules, setRules] = useState<ReorderRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyService.getReorderRules().then((data) => {
      setRules(data);
      setLoading(false);
    });
  }, []);

  const belowReorder = rules.filter(
    (r) => r.currentStock < r.reorderPoint,
  ).length;
  const autoEnabled = rules.filter((r) => r.autoPoEnabled).length;

  const handleToggle = (id: string, checked: boolean) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, autoPoEnabled: checked } : r,
      ),
    );
    const rule = rules.find((r) => r.id === id);
    toast.success(
      `Auto-PO ${checked ? "enabled" : "disabled"} for ${rule?.material ?? "material"}`,
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
          title="Reorder Rules"
          subtitle="Set min/max stock levels and auto-PO triggers per material"
          breadcrumbs={breadcrumbs}
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Materials Tracked"
              value={rules.length}
              icon={Settings2}
              hint="Active reorder rules"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Below Reorder Point"
              value={belowReorder}
              icon={AlertCircle}
              iconSurface="key"
              hint="Need replenishment"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <KpiStatCard
              label="Auto-PO Enabled"
              value={`${autoEnabled} / ${rules.length}`}
              icon={ShieldCheck}
              hint="Automated purchasing active"
            />
          </motion.div>
        </div>

        {/* Rules Table */}
        <motion.div variants={staggerItem}>
          <Card variant="flat" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Reorder Configuration
              </h3>
              <Badge className="gap-1.5 border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)] dark:border-[var(--neutral-700)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
                <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                {rules.length} rules
              </Badge>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-[var(--neutral-500)]">
                Loading reorder rules...
              </p>
            ) : (
              <MwDataTable<ReorderRule>
                columns={[
                  {
                    key: "material",
                    header: "Material",
                    className: "font-medium text-foreground",
                    cell: (rule) => rule.material,
                  },
                  {
                    key: "grade",
                    header: "Grade",
                    className: "font-mono text-sm text-[var(--neutral-600)]",
                    cell: (rule) => rule.grade,
                  },
                  {
                    key: "min",
                    header: "Min",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums text-[var(--neutral-500)]",
                    cell: (rule) => rule.minStock,
                  },
                  {
                    key: "max",
                    header: "Max",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums text-[var(--neutral-500)]",
                    cell: (rule) => rule.maxStock,
                  },
                  {
                    key: "current",
                    header: "Current Stock",
                    headerClassName: "text-right",
                    cell: (rule) => {
                      const isBelowReorder = rule.currentStock < rule.reorderPoint;
                      return (
                        <span
                          className={cn(
                            "text-right font-mono tabular-nums font-medium",
                            isBelowReorder ? "text-[var(--mw-error)]" : "text-foreground",
                          )}
                        >
                          {rule.currentStock}
                          {isBelowReorder && (
                            <AlertCircle
                              className="ml-1.5 inline h-3.5 w-3.5 text-[var(--mw-error)]"
                              strokeWidth={1.5}
                            />
                          )}
                        </span>
                      );
                    },
                    className: "text-right",
                  },
                  {
                    key: "reorder",
                    header: "Reorder Point",
                    headerClassName: "text-right",
                    className: "text-right font-mono tabular-nums",
                    cell: (rule) => rule.reorderPoint,
                  },
                  {
                    key: "supplier",
                    header: "Preferred Supplier",
                    className: "text-[var(--neutral-600)]",
                    cell: (rule) => rule.preferredSupplierName,
                  },
                  {
                    key: "autoPo",
                    header: "Auto-PO",
                    headerClassName: "text-center",
                    className: "text-center",
                    cell: (rule) => (
                      <div className="flex justify-center">
                        <Switch
                          checked={rule.autoPoEnabled}
                          onCheckedChange={(checked: boolean) =>
                            handleToggle(rule.id, checked)
                          }
                        />
                      </div>
                    ),
                  },
                ]}
                data={rules}
                keyExtractor={(rule) => rule.id}
                className="border-0 shadow-none"
              />
            )}
          </Card>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
