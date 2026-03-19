import React, { useState } from 'react';
import { BookDashboard } from './BookDashboard';
import { BookInvoices } from './BookInvoices';

type BookTab = 'dashboard' | 'invoices' | 'expenses' | 'purchases' | 'job-costs' | 'budgets' | 'stock-valuation' | 'reports' | 'settings';

export function Book() {
  const [activeTab, setActiveTab] = useState<BookTab>('dashboard');

  return (
    <div className="h-full">
      {activeTab === 'dashboard' && <BookDashboard />}
      {activeTab === 'invoices' && <BookInvoices />}
      {activeTab === 'expenses' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#737373]">Expenses view coming soon...</p>
        </div>
      )}
      {activeTab === 'purchases' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#737373]">Purchases view coming soon...</p>
        </div>
      )}
      {activeTab === 'job-costs' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#737373]">Job Costs view coming soon...</p>
        </div>
      )}
    </div>
  );
}
