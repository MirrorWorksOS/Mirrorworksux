/**
 * Design Initial Data - Data import wizard
 */

import React, { useState } from 'react';
import { Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

const dataTypes = [
  { key: 'customers', label: 'Customers', icon: Database, imported: 45, total: 45, status: 'complete' },
  { key: 'suppliers', label: 'Suppliers', icon: Database, imported: 28, total: 28, status: 'complete' },
  { key: 'products', label: 'Products', icon: Database, imported: 156, total: 200, status: 'partial' },
  { key: 'machines', label: 'Machines', icon: Database, imported: 0, total: 12, status: 'pending' },
  { key: 'users', label: 'Users', icon: Database, imported: 0, total: 24, status: 'pending' },
];

export function DesignInitialData() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Data Import Wizard</h1>

      <Card className="bg-[#FFCF4B] border-2 border-[#2C2C2C] rounded-2xl p-6">
        <h3 className="text-[16px] font-semibold text-[#2C2C2C] mb-2">
          Step {activeStep} of 3: Import Master Data
        </h3>
        <p className="text-sm text-[#2C2C2C]">
          Import your existing data from CSV, Excel, or connect to external systems
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataTypes.map(type => {
          const Icon = type.icon;
          const progress = type.total > 0 ? (type.imported / type.total) * 100 : 0;

          return (
            <Card key={type.key} className="bg-white border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#0A7AFF]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1A2732]">{type.label}</h3>
                    <p className="text-xs text-[#737373] mt-1">
                      {type.imported} / {type.total} records
                    </p>
                  </div>
                </div>
                {type.status === 'complete' && <CheckCircle2 className="w-5 h-5 text-[#1A2732]" />}
                {type.status === 'pending' && <AlertCircle className="w-5 h-5 text-[#FFCF4B]" />}
              </div>

              <div className="mb-3">
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: type.status === 'complete' ? '#36B37E' : type.status === 'partial' ? '#FACC15' : '#E5E5E5'
                    }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-[var(--border)]"
                disabled={type.status === 'complete'}
              >
                <Upload className="w-4 h-4 mr-2" />
                {type.status === 'complete' ? 'Imported' : 'Import Data'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        <Button variant="outline" className="border-[var(--border)]" disabled={activeStep === 1}>
          ← Previous
        </Button>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(step => (
            <div key={step} className={cn(
              "w-2 h-2 rounded-full transition-colors",
              step === activeStep ? "bg-[#FFCF4B]" : step < activeStep ? "bg-[#1A2732]" : "bg-[var(--border)]"
            )} />
          ))}
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          Next →
        </Button>
      </div>
    </div>
  );
}
