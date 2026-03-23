import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";

export interface FinancialColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor: (row: T) => string | number;
  format?: "currency" | "percentage" | "number" | "text";
  align?: "left" | "right";
  className?: string;
}

export interface FinancialTableProps<T> {
  columns: FinancialColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  totals?: Record<string, number>;
  className?: string;
}

function formatFinancialValue(
  raw: string | number,
  format: FinancialColumn<unknown>["format"],
): string {
  if (format === "currency") {
    const n = typeof raw === "number" ? raw : Number(raw);
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(n);
  }
  if (format === "percentage") {
    const n = typeof raw === "number" ? raw : Number(raw);
    return `${n.toFixed(1)}%`;
  }
  if (format === "number") {
    const n = typeof raw === "number" ? raw : Number(raw);
    return new Intl.NumberFormat("en-AU", { maximumFractionDigits: 2 }).format(n);
  }
  return String(raw);
}

function isFinancialFormat(
  format: FinancialColumn<unknown>["format"],
): boolean {
  return format === "currency" || format === "percentage" || format === "number";
}

export function FinancialTable<T>({
  columns,
  data,
  keyExtractor,
  totals,
  className,
}: FinancialTableProps<T>) {
  const mwColumns: MwColumnDef<T>[] = columns.map((col) => {
    const alignRight =
      col.align === "right" ||
      (col.align === undefined && isFinancialFormat(col.format));

    return {
      key: col.key,
      header: col.header,
      className: cn(
        alignRight && "text-right tabular-nums",
        !alignRight && col.format && isFinancialFormat(col.format) && "tabular-nums",
        col.className,
      ),
      headerClassName: alignRight ? "text-right" : undefined,
      cell: (row: T) => {
        const raw = col.accessor(row);
        const formatted = formatFinancialValue(raw, col.format);
        return <span className={cn(alignRight && "tabular-nums")}>{formatted}</span>;
      },
    };
  });

  return (
    <div className={cn("flex flex-col", className)}>
      <MwDataTable
        columns={mwColumns}
        data={data}
        keyExtractor={keyExtractor}
        className={totals ? "rounded-b-none border-b-0" : undefined}
      />
      {totals ? (
        <Card
          variant="flat"
          className="overflow-hidden p-0 rounded-t-none -mt-px border-t-2 border-t-[var(--neutral-200)] rounded-b-[var(--shape-lg)]"
        >
          <Table>
            <TableBody>
              <TableRow className="hover:bg-transparent border-b-0 font-semibold">
                {columns.map((col, index) => {
                  const alignRight =
                    col.align === "right" ||
                    (col.align === undefined && isFinancialFormat(col.format));
                  const totalVal = totals[col.key];
                  if (totalVal !== undefined) {
                    return (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-sm tabular-nums",
                          alignRight && "text-right",
                          col.className,
                        )}
                      >
                        {formatFinancialValue(totalVal, col.format)}
                      </TableCell>
                    );
                  }
                  if (index === 0) {
                    return (
                      <TableCell key={col.key} className="px-4 py-3 text-sm">
                        Total
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell
                      key={col.key}
                      className={cn("px-4 py-3 text-sm", col.className)}
                    >
                      —
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      ) : null}
    </div>
  );
}
