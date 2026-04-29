/**
 * MwDataTable — Design-system-enforced table wrapper
 *
 * Wraps ShadCN Table inside a Card container with consistent header styling,
 * gradient row hover, checkbox selection, bulk action toolbar, and tooltips.
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ChevronRight, Download, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MwColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  /** Tooltip shown when hovering the column header */
  tooltip?: string;
}

interface MwDataTableProps<T> {
  columns: MwColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  filterBar?: React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  emptyState?: React.ReactNode;
  className?: string;
  /** Alternating row background (odd rows) for dense financial tables */
  striped?: boolean;

  /* ---- Selection ---- */
  /** Enable built-in checkbox column with select-all */
  selectable?: boolean;
  /** Controlled selection state */
  selectedKeys?: Set<string | number>;
  /** Called when the selection changes (controlled or uncontrolled) */
  onSelectionChange?: (keys: Set<string | number>) => void;
  /**
   * Custom bulk-action renderer.  Receives selected count + a clear helper.
   * When omitted, default Export / Delete buttons are shown.
   */
  bulkActions?: (
    selectedCount: number,
    clearSelection: () => void,
  ) => React.ReactNode;
  /** Called when the default "Export" bulk action is clicked */
  onExport?: (selectedKeys: Set<string | number>) => void;
  /** Called when the default "Delete" bulk action is clicked */
  onDelete?: (selectedKeys: Set<string | number>) => void;
  /** Called when the default "Import" bulk action is clicked */
  onImport?: () => void;

  /* ---- Expandable rows ---- */
  /**
   * Enable per-row expansion. Renders a leading chevron column that
   * toggles a sub-row containing `renderExpanded(row)` content. Sub-rows
   * span the full width of the table.
   */
  expandable?: {
    /** Render the expanded content for a given row. Returns React nodes
     *  that will be placed inside a single full-width TableCell. */
    renderExpanded: (row: T, index: number) => React.ReactNode;
    /** Hide the chevron for rows that have no expanded content (default false). */
    isExpandable?: (row: T, index: number) => boolean;
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function MwDataTable<T>({
  columns,
  data,
  keyExtractor,
  filterBar,
  onRowClick,
  emptyState,
  className,
  striped,
  selectable,
  selectedKeys: controlledKeys,
  onSelectionChange,
  bulkActions,
  onExport,
  onDelete,
  onImport,
  expandable,
}: MwDataTableProps<T>) {
  /* Internal selection state (uncontrolled mode) */
  const [internalKeys, setInternalKeys] = React.useState<
    Set<string | number>
  >(new Set());

  /* Internal expanded-row state */
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string | number>>(
    new Set(),
  );
  const toggleExpanded = (key: string | number) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selected = controlledKeys ?? internalKeys;
  const setSelected = React.useCallback(
    (next: Set<string | number>) => {
      onSelectionChange ? onSelectionChange(next) : setInternalKeys(next);
    },
    [onSelectionChange],
  );

  const allSelected = data.length > 0 && selected.size === data.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(
      allSelected
        ? new Set()
        : new Set(data.map((row, i) => keyExtractor(row, i))),
    );
  };

  const toggleRow = (key: string | number) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  const totalCols = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  /* ---- Render ---- */
  return (
    <Card variant="flat" className={cn("overflow-hidden p-0", className)}>
      {/* ---- Bulk action bar (visible when items selected) ---- */}
      {selectable && selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--mw-yellow-50)] border-b border-[var(--mw-yellow-200)] transition-all duration-200 ease-[var(--ease-standard)]">
          <Checkbox
            checked={allSelected ? true : "indeterminate"}
            onCheckedChange={toggleAll}
            className="w-[18px] h-[18px]"
          />
          <span className="text-sm font-medium text-[var(--neutral-700)] tabular-nums">
            {selected.size} selected
          </span>

          <div className="flex items-center gap-1.5 ml-auto">
            {bulkActions ? (
              bulkActions(selected.size, clearSelection)
            ) : (
              <>
                {onExport && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-1.5 text-[var(--neutral-600)]"
                        onClick={() => onExport(selected)}
                      >
                        <Download className="w-4 h-4" strokeWidth={1.5} />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export selected rows</TooltipContent>
                  </Tooltip>
                )}
                {onImport && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-1.5 text-[var(--neutral-600)]"
                        onClick={onImport}
                      >
                        <Upload className="w-4 h-4" strokeWidth={1.5} />
                        Import
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Import data</TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-1.5 text-[var(--mw-error)] hover:bg-[var(--mw-error-50)]"
                        onClick={() => onDelete(selected)}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete selected rows</TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-[var(--neutral-400)]"
                  onClick={clearSelection}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear selection</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* ---- Filter bar (hidden when bulk bar active) ---- */}
      {filterBar && selected.size === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--neutral-100)]">
          {filterBar}
        </div>
      )}

      {/* ---- Table ---- */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[var(--neutral-100)]">
            {selectable && (
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAll}
                  className="w-[18px] h-[18px]"
                />
              </TableHead>
            )}
            {expandable && <TableHead className="w-8" />}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-12 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.headerClassName,
                )}
              >
                {col.tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help border-b border-dashed border-[var(--neutral-300)]">
                        {col.header}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{col.tooltip}</TooltipContent>
                  </Tooltip>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 && emptyState ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={totalCols} className="h-48 text-center">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const key = keyExtractor(row, index);
              const isSelected = selected.has(key);
              const isExpanded = expandedKeys.has(key);
              const canExpand =
                expandable !== undefined &&
                (expandable.isExpandable ? expandable.isExpandable(row, index) : true);
              const handleRowClick = canExpand
                ? () => toggleExpanded(key)
                : onRowClick
                  ? () => onRowClick(row, index)
                  : undefined;

              return (
                <React.Fragment key={key}>
                  <TableRow
                    onClick={handleRowClick}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "group min-h-[56px] border-b border-[var(--neutral-100)]",
                      /* Gradient hover with easing */
                      "transition-all duration-200 ease-[var(--ease-standard)]",
                      "hover:bg-gradient-to-r hover:from-[var(--mw-yellow-50)] hover:to-[var(--mw-yellow-50)]/0",
                      "hover:shadow-[inset_3px_0_0_var(--mw-yellow-400)]",
                      handleRowClick && "cursor-pointer",
                      striped && index % 2 === 1 && "bg-[var(--neutral-50)]",
                      isSelected &&
                        "bg-[var(--mw-yellow-50)] shadow-[inset_3px_0_0_var(--mw-yellow-400)]",
                    )}
                  >
                    {selectable && (
                      <TableCell className="w-12 px-4 py-3">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(key)}
                            className="w-[18px] h-[18px]"
                          />
                        </div>
                      </TableCell>
                    )}
                    {expandable && (
                      <TableCell className="w-8 px-2 py-3">
                        {canExpand && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-[var(--neutral-400)] transition-transform",
                              isExpanded && "rotate-90",
                            )}
                            strokeWidth={1.5}
                          />
                        )}
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn("px-4 py-3 text-sm", col.className)}
                      >
                        {col.cell(row, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandable && isExpanded && canExpand && (
                    <TableRow className="hover:bg-transparent bg-[var(--neutral-50)] border-b border-[var(--neutral-100)]">
                      <TableCell
                        colSpan={totalCols}
                        className="p-0"
                      >
                        {expandable.renderExpanded(row, index)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export { MwDataTable, type MwColumnDef, type MwDataTableProps };
