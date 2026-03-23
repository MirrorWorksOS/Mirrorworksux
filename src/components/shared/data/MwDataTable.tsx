/**
 * MwDataTable — Design-system-enforced table wrapper
 *
 * Wraps ShadCN Table inside a Card container with consistent header styling,
 * row hover, minimum row height, and an optional filter bar slot.
 */

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface MwColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface MwDataTableProps<T> {
  columns: MwColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  filterBar?: React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  selectedKeys?: Set<string | number>;
  emptyState?: React.ReactNode;
  className?: string;
}

function MwDataTable<T>({
  columns,
  data,
  keyExtractor,
  filterBar,
  onRowClick,
  selectedKeys,
  emptyState,
  className,
}: MwDataTableProps<T>) {
  return (
    <Card variant="flat" className={cn("overflow-hidden p-0", className)}>
      {filterBar && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--neutral-100)]">
          {filterBar}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[var(--neutral-100)]">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-12 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 && emptyState ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-48 text-center">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const key = keyExtractor(row, index);
              const isSelected = selectedKeys?.has(key);

              return (
                <TableRow
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "min-h-[56px] border-b border-[var(--neutral-100)] transition-colors",
                    "hover:bg-[var(--neutral-900)]/[0.04]",
                    onRowClick && "cursor-pointer",
                    isSelected &&
                      "bg-[var(--mw-yellow-50)] border-l-[3px] border-l-[var(--mw-yellow-400)]",
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("px-4 py-3 text-sm", col.className)}
                    >
                      {col.cell(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export { MwDataTable, type MwColumnDef, type MwDataTableProps };
