import React, { useState } from 'react';
import { PlusCircle, Search, Calendar, Tag, User, LayoutGrid, List, GripVertical, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';

type ExpenseCategory = 'Materials' | 'Utilities' | 'Maintenance' | 'Consumables' | 'Subcontractor';

const categoryStyles: Record<ExpenseCategory, string> = {
  Materials: 'bg-[var(--warm-200)] text-[#1A2732]',
  Utilities: 'bg-[var(--warm-200)] text-[#1A2732]',
  Maintenance: 'bg-[#FFF4CC] text-[#805900]',
  Consumables: 'bg-[#F3E8FF] text-[#7C3AED]',
  Subcontractor: 'bg-[var(--warm-200)] text-[#DE350B]',
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

const columns = [
  {
    title: 'Draft', headerBg: 'bg-[#F5F5F5] text-[#737373]', total: '$1,230',
    cards: [
      { id: 'E1', vendor: 'BOC Gas', amount: 340, category: 'Consumables' as ExpenseCategory, date: '25 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E2', vendor: 'Workshop Supplies', amount: 450, category: 'Materials' as ExpenseCategory, date: '24 Feb', employee: 'Elena R.', initials: 'ER', receipt: true },
      { id: 'E3', vendor: 'Fuel — site delivery', amount: 440, category: 'Consumables' as ExpenseCategory, date: '23 Feb', employee: 'Matt Q.', initials: 'MQ' },
    ],
  },
  {
    title: 'Submitted', headerBg: 'bg-[var(--warm-200)] text-[#1A2732]', total: '$5,890',
    cards: [
      { id: 'E4', vendor: 'Blackwoods Steel', amount: 2450, category: 'Materials' as ExpenseCategory, date: '23 Feb', employee: 'Matt Q.', initials: 'MQ', jobRef: 'JOB-2026-0012', receipt: true },
      { id: 'E5', vendor: 'AGL Energy', amount: 890, category: 'Utilities' as ExpenseCategory, date: '22 Feb', employee: 'Office', initials: 'OF' },
      { id: 'E6', vendor: 'Kemppi Service', amount: 1200, category: 'Maintenance' as ExpenseCategory, date: '21 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E7', vendor: 'BOC Gas', amount: 1350, category: 'Consumables' as ExpenseCategory, date: '20 Feb', employee: 'Elena R.', initials: 'ER' },
    ],
  },
  {
    title: 'Approved', headerBg: 'bg-[var(--warm-200)] text-[#1A2732]', total: '$12,450',
    cards: [
      { id: 'E8', vendor: 'OneSteel', amount: 4200, category: 'Materials' as ExpenseCategory, date: '19 Feb', employee: 'Matt Q.', initials: 'MQ', jobRef: 'JOB-2026-0010' },
      { id: 'E9', vendor: 'Dulux Powder Coats', amount: 1890, category: 'Subcontractor' as ExpenseCategory, date: '18 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E10', vendor: 'Telstra', amount: 220, category: 'Utilities' as ExpenseCategory, date: '17 Feb', employee: 'Office', initials: 'OF' },
      { id: 'E11', vendor: 'Lincoln Electric', amount: 2800, category: 'Consumables' as ExpenseCategory, date: '16 Feb', employee: 'Elena R.', initials: 'ER' },
      { id: 'E12', vendor: 'Welder Repair Co', amount: 1540, category: 'Maintenance' as ExpenseCategory, date: '15 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E13', vendor: 'Freight Corp', amount: 1800, category: 'Subcontractor' as ExpenseCategory, date: '14 Feb', employee: 'Matt Q.', initials: 'MQ' },
    ],
  },
  {
    title: 'Paid', headerBg: 'bg-[#1A2732] text-white', total: '$23,670',
    cards: [
      { id: 'E14', vendor: 'Steel & Tube', amount: 8500, category: 'Materials' as ExpenseCategory, date: '13 Feb', employee: 'Matt Q.', initials: 'MQ', receipt: true },
      { id: 'E15', vendor: 'BOC Gas', amount: 560, category: 'Consumables' as ExpenseCategory, date: '12 Feb', employee: 'David M.', initials: 'DM' },
      { id: 'E16', vendor: 'AGL Energy', amount: 920, category: 'Utilities' as ExpenseCategory, date: '11 Feb', employee: 'Office', initials: 'OF' },
    ],
  },
];

const ExpenseCard = ({ expense }: { expense: Expense }) => (
  <div className="bg-white rounded-lg border border-[var(--border)] p-4 hover:border-[#FFCF4B] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all cursor-grab active:cursor-grabbing group">
    <div className="flex items-start gap-2">
      <GripVertical className="w-4 h-4 text-[#D4D4D4] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#1A2732] truncate" style={{ fontWeight: 500 }}>{expense.vendor}</span>
          <span className="text-sm shrink-0" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>
            ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={cn("rounded-full text-[11px] px-2 py-0 border-0", categoryStyles[expense.category])}>
            {expense.category}
          </Badge>
          <span className="text-xs text-[#737373]">{expense.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {expense.receipt && (
              <span className="flex items-center gap-1 text-[11px] text-[#A3A3A3]">
                <Paperclip className="w-3 h-3" /> 1 receipt
              </span>
            )}
            {expense.jobRef && (
              <span className="text-[11px] text-[#737373] ml-1" style={{ fontFamily: 'Roboto Mono, monospace' }}>{expense.jobRef}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar className="w-5 h-5 text-[8px]"><AvatarFallback className="bg-[#F5F5F5] text-[#525252]">{expense.initials}</AvatarFallback></Avatar>
            <span className="text-xs text-[#525252]">{expense.employee}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function ExpenseKanban({ onNewExpense }: { onNewExpense?: () => void }) {
  return (
    <div className="p-6 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Expenses</h1>
        <div className="flex items-center gap-3">
          <div className="flex border border-[var(--border)] rounded overflow-hidden">
            <button className="p-2 bg-[#FFCF4B]"><LayoutGrid className="w-4 h-4 text-[#1A2732]" /></button>
            <button className="p-2 hover:bg-[#F5F5F5]"><List className="w-4 h-4 text-[#737373]" /></button>
          </div>
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded gap-2" onClick={onNewExpense}>
            <PlusCircle className="w-5 h-5" /> New Expense
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input placeholder="Search expenses..." className="pl-9 h-10 bg-white border-[var(--border)] rounded text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Calendar className="w-4 h-4" /> Date Range</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><Tag className="w-4 h-4" /> Category</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[var(--border)]"><User className="w-4 h-4" /> Employee</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden min-h-0 pb-4">
        {columns.map(col => (
          <div key={col.title} className="flex-1 min-w-[280px] max-w-[360px] bg-[#F5F5F5] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Badge className={cn("rounded-full text-xs px-3 py-1 border-0", col.headerBg)}>{col.title}</Badge>
                <Badge className="rounded-full text-xs px-2 py-0.5 bg-[#F5F5F5] text-[#737373] border-0">{col.cards.length}</Badge>
              </div>
              <span className="text-xs text-[#737373]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{col.total}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {col.cards.map(card => (
                <ExpenseCard key={card.id} expense={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
