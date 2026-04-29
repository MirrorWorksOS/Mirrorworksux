/**
 * ShipCarrierRates — Rate comparison panel for Australian carriers.
 * Sortable table by price or estimated days.
 */
import { useState, useEffect, useMemo } from "react";
import { ArrowUpDown, Truck, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";

import { shipService } from "@/services";
import type { CarrierRate } from "@/types/entities";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";

type SortField = "priceAud" | "estimatedDays";

export function ShipCarrierRates() {
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [sortField, setSortField] = useState<SortField>("priceAud");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    shipService.getCarrierRates().then(setRates);
  }, []);

  const sorted = useMemo(() => {
    return [...rates].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortAsc ? diff : -diff;
    });
  }, [rates, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortIcon = (field: SortField) => (
    <ArrowUpDown
      className={`ml-1 inline h-3.5 w-3.5 ${sortField === field ? "text-foreground" : "text-[var(--neutral-400)]"}`}
      strokeWidth={1.5}
    />
  );

  return (
    <PageShell>
      <PageHeader
        title="Carrier Rates"
        subtitle="Compare shipping rates across Australian carriers"
        breadcrumbs={[
          { label: "Ship", href: "/ship" },
          { label: "Carrier Rates" },
        ]}
        actions={
          <Button variant="outline" size="sm">
            <Truck className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Request Quote
          </Button>
        }
      />

      <motion.div variants={staggerItem}>
        <MwDataTable<CarrierRate>
          columns={[
            {
              key: "carrier",
              header: "Carrier",
              className: "font-medium",
              cell: (rate) => rate.carrierName,
            },
            {
              key: "service",
              header: "Service",
              cell: (rate) => <Badge variant="outline">{rate.service}</Badge>,
            },
            {
              key: "days",
              header: (
                <button
                  type="button"
                  className="inline-flex items-center hover:text-foreground"
                  onClick={() => handleSort("estimatedDays")}
                >
                  Est. Days
                  {sortIcon("estimatedDays")}
                </button>
              ),
              className: "font-mono",
              cell: (rate) => rate.estimatedDays,
            },
            {
              key: "price",
              header: (
                <button
                  type="button"
                  className="inline-flex items-center hover:text-foreground"
                  onClick={() => handleSort("priceAud")}
                >
                  Price (AUD)
                  {sortIcon("priceAud")}
                </button>
              ),
              headerClassName: "text-right",
              className: "text-right font-mono",
              cell: (rate) => `$${rate.priceAud.toFixed(2)}`,
            },
            {
              key: "pickup",
              header: "Pickup Available",
              headerClassName: "text-center",
              className: "text-center",
              cell: (rate) =>
                rate.pickupAvailable ? (
                  <CheckCircle2
                    className="mx-auto h-4 w-4 text-[var(--mw-success)]"
                    strokeWidth={1.5}
                  />
                ) : (
                  <XCircle
                    className="mx-auto h-4 w-4 text-[var(--neutral-400)]"
                    strokeWidth={1.5}
                  />
                ),
            },
          ]}
          data={sorted}
          keyExtractor={(rate) => rate.id}
        />
      </motion.div>
    </PageShell>
  );
}
