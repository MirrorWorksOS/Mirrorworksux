import React, { useCallback, useState } from 'react';
import { PlusCircle, Search, Calendar, Tag, User, LayoutGrid, List, GripVertical, Paperclip, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { KanbanBoard } from '@/components/shared/kanban/KanbanBoard';
import { KanbanColumn, type KanbanDragItem } from '@/components/shared/kanban/KanbanColumn';
import { KanbanCard } from '@/components/shared/kanban/KanbanCard';
import { DRAG_HANDLE_STYLE } from '@/components/shared/kanban/drag-styles';
import { NewExpense } from './NewExpense';

const KANBAN_ITEM_TYPE = 'book-expense';

type ExpenseCategory = 'Materials' | 'Utilities' | 'Maintenance' | 'Consumables' | 'Subcontractor';

const categoryStyles: Record<ExpenseCategory, string> = {
  Materials: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Utilities: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Maintenance: 'bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]',
  Consumables: 'bg-[var(--mw-purple-100)] text-[var(--mw-purple)]',
  Subcontractor: 'bg-[var(--neutral-100)] text-[var(--mw-error)]',
};

interface Expense {
  id: string;
  vendor: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  employee: string;
  initials: string;
  receipt?: boolean;
  jobRef?: string;
}

type ExpenseColumnId = 'draft' | 'submitted' | 'approved' | 'paid';

interface ExpenseColumn {
  id: ExpenseColumnId;
  title: string;
  headerColor: string;
  cards: Expense[];
}

function formatColumnTotal(cards: Expense[]): string {
  const sum = cards.reduce((s, c) => s + c.amount, 0);
  return `$${sum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

const INITIAL_COLUMNS: ExpenseColumn[] = [
  {
    id: 'draft',
    title: 'Draft',
    headerColor: 'var(--neutral-500)',
    cards: [
      { id: 'E1', vendor: 'BOC Gas', amount: 340, category: 'Consumables', date: '25 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E2', vendor: 'Workshop Supplies', amount: 450, category: 'Materials', date: '24 Feb', employee: 'Elena R.', initials: 'ER', receipt: true },
      { id: 'E3', vendor: 'Fuel — site delivery', amount: 440, category: 'Consumables', date: '23 Feb', employee: 'Matt Q.', initials: 'MQ' },
    ],
  },
  {
    id: 'submitted',
    title: 'Submitted',
    headerColor: 'var(--mw-info)',
    cards: [
      { id: 'E4', vendor: 'Blackwoods Steel', amount: 2450, category: 'Materials', date: '23 Feb', employee: 'Matt Q.', initials: 'MQ', jobRef: 'JOB-2026-0012', receipt: true },
      { id: 'E5', vendor: 'AGL Energy', amount: 890, category: 'Utilities', date: '22 Feb', employee: 'Office', initials: 'OF' },
      { id: 'E6', vendor: 'Kemppi Service', amount: 1200, category: 'Maintenance', date: '21 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E7', vendor: 'BOC Gas', amount: 1350, category: 'Consumables', date: '20 Feb', employee: 'Elena R.', initials: 'ER' },
    ],
  },
  {
    id: 'approved',
    title: 'Approved',
    headerColor: 'var(--mw-success)',
    cards: [
      { id: 'E8', vendor: 'OneSteel', amount: 4200, category: 'Materials', date: '19 Feb', employee: 'Matt Q.', initials: 'MQ', jobRef: 'JOB-2026-0010' },
      { id: 'E9', vendor: 'Dulux Powder Coats', amount: 1890, category: 'Subcontractor', date: '18 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E10', vendor: 'Telstra', amount: 220, category: 'Utilities', date: '17 Feb', employee: 'Office', initials: 'OF' },
      { id: 'E11', vendor: 'Lincoln Electric', amount: 2800, category: 'Consumables', date: '16 Feb', employee: 'Elena R.', initials: 'ER' },
      { id: 'E12', vendor: 'Welder Repair Co', amount: 1540, category: 'Maintenance', date: '15 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E13', vendor: 'Freight Corp', amount: 1800, category: 'Subcontractor', date: '14 Feb', employee: 'Matt Q.', initials: 'MQ' },
    ],
  },
  {
    id: 'paid',
    title: 'Paid',
    headerColor: 'var(--mw-mirage)',
    cards: [
      { id: 'E14', vendor: 'Steel & Tube', amount: 8500, category: 'Materials', date: '13 Feb', employee: 'Matt Q.', initials: 'MQ', receipt: true },
      { id: 'E15', vendor: 'BOC Gas', amount: 560, category: 'Consumables', date: '12 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E16', vendor: 'AGL Energy', amount: 920, category: 'Utilities', date: '11 Feb', employee: 'Office', initials: 'OF' },
    ],
  },
];

const ExpenseCardBody = ({ expense }: { expense: Expense }) => (
  <div className="group">
    <div className="flex items-start gap-2">
      <GripVertical className={cn('w-4 h-4 shrink-0 mt-0.5', DRAG_HANDLE_STYLE)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--mw-mirage)] truncate font-medium">{expense.vendor}</span>
          <span className="text-sm shrink-0 tabular-nums font-medium">
            ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={cn("rounded-full text-xs px-2 py-0 border-0", categoryStyles[expense.category])}>
            {expense.category}
          </Badge>
          <span className="text-xs text-[var(--neutral-500)]">{expense.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {expense.receipt && (
              <span className="flex items-center gap-1 text-xs text-[var(--neutral-400)]">
                <Paperclip className="w-4 h-4" /> 1 receipt
              </span>
            )}
            {expense.jobRef && (
              <span className="text-xs text-[var(--neutral-500)] ml-1 tabular-nums">{expense.jobRef}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar className="w-5 h-5 text-[8px]"><AvatarFallback className="bg-[var(--neutral-100)] text-[var(--neutral-600)]">{expense.initials}</AvatarFallback></Avatar>
            <span className="text-xs text-[var(--neutral-600)]">{expense.employee}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function ExpenseKanban({ onNewExpense }: { onNewExpense?: () => void }) {
  const [columnState, setColumnState] = useState<ExpenseColumn[]>(INITIAL_COLUMNS);
  const [showNewExpense, setShowNewExpense] = useState(false);

  const handleDrop = useCallback((item: KanbanDragItem, targetColumnId: string) => {
    setColumnState((prev) => {
      let moved: Expense | undefined;
      const without = prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => {
          if (c.id === item.id) {
            moved = c;
            return false;
          }
          return true;
        }),
      }));
      if (!moved) return prev;
      return without.map((col) =>
        col.id === targetColumnId ? { ...col, cards: [...col.cards, moved!] } : col,
      );
    });
  }, []);

  const handleNewExpenseClick = () => {
    if (onNewExpense) {
      onNewExpense();
    } else {
      setShowNewExpense(true);
    }
  };

  return (
    <div className="relative p-6 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Expenses</h1>
        <div className="flex items-center gap-3">
          <div className="flex border border-[var(--border)] rounded overflow-hidden">
            <button type="button" className="p-2 bg-[var(--mw-yellow-400)]"><LayoutGrid className="w-4 h-4 text-[var(--mw-mirage)]" /></button>
            <button type="button" className="p-2 hover:bg-[var(--neutral-100)]"><List className="w-4 h-4 text-[var(--neutral-500)]" /></button>
          </div>
          <Button className="h-10 gap-2 rounded-full bg-[var(--mw-yellow-400)] px-5 text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-600)]" onClick={handleNewExpenseClick}>
            <PlusCircle className="w-5 h-5" /> New Expense
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
          <Input placeholder="Search expenses..." className="pl-9 h-10 bg-white border-[var(--border)] rounded text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Calendar className="w-4 h-4" /> Date Range</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Tag className="w-4 h-4" /> Category</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><User className="w-4 h-4" /> Employee</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex flex-col min-h-0">
        <KanbanBoard className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-4 gap-4">
          {columnState.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={col.cards.length}
              accept={KANBAN_ITEM_TYPE}
              onDrop={handleDrop}
              headerColor={col.headerColor}
              className="min-w-[280px] max-w-[360px] w-[320px] flex-shrink-0"
            >
              <div className="flex items-center justify-end px-0.5 pb-2 shrink-0">
                <span className="text-xs text-[var(--neutral-500)] tabular-nums">{formatColumnTotal(col.cards)}</span>
              </div>
              {col.cards.map((card) => (
                <KanbanCard key={card.id} id={card.id} type={KANBAN_ITEM_TYPE} className="p-0">
                  <div className="p-4">
                    <ExpenseCardBody expense={card} />
                  </div>
                </KanbanCard>
              ))}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </div>

      {/* NewExpense slide-over panel */}
      {showNewExpense && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 z-40"
            onClick={() => setShowNewExpense(false)}
          />
          {/* Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-white border-l border-[var(--border)] shadow-xl z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => setShowNewExpense(false)}
                className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--neutral-500)]" />
              </button>
            </div>
            <NewExpense onBack={() => setShowNewExpense(false)} />
          </div>
        </>
      )}
    </div>
  );
}
