/**
 * ControlEmptyStates — Developer showcase of all empty state illustrations.
 *
 * This page lives under Control so Sharjeel can pick up the mapping
 * of illustrations → real data-empty conditions per module.
 *
 * Each card previews the illustrated EmptyState with its module-specific
 * SVG artwork from src/art/empty-states/.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  Target,
  Factory,
  ClipboardList,
  BookOpen,
  Receipt,
  ShoppingCart,
  Truck,
  Plus,
  Upload,
  Info,
} from 'lucide-react';

// ── Illustration registry ────────────────────────────────────────────────
// Maps each available SVG to its module context.
// When the backend provides real empty-state detection, Sharjeel will
// wire these into the actual list/table components.

interface EmptyStateConfig {
  module: string;
  screen: string;
  illustration: string;
  title: string;
  description: string;
  createLabel: string;
  icon: React.ElementType;
  hasImport?: boolean;
}

const EMPTY_STATES: EmptyStateConfig[] = [
  {
    module: 'Sell',
    screen: 'CRM',
    illustration: '/src/art/empty-states/sell/CRM.svg',
    title: "There's no one here... yet.",
    description: 'Time to add some people, create or import.',
    createLabel: 'Create customer',
    icon: Users,
    hasImport: true,
  },
  {
    module: 'Sell',
    screen: 'Quotes',
    illustration: '/src/art/empty-states/sell/Quote.svg',
    title: 'No quotes created yet',
    description: 'Create your first quote to send to a customer.',
    createLabel: 'Create quote',
    icon: FileText,
  },
  {
    module: 'Sell',
    screen: 'Opportunities',
    illustration: '/src/art/empty-states/sell/Opportuinity.svg',
    title: 'No opportunities in the pipeline',
    description: 'Start tracking deals by creating your first opportunity.',
    createLabel: 'Create opportunity',
    icon: Target,
    hasImport: true,
  },
  {
    module: 'Make',
    screen: 'Dashboard',
    illustration: '/src/art/empty-states/make/Make.svg',
    title: 'Nothing on the shop floor yet',
    description: 'Set up your first manufacturing order to get started.',
    createLabel: 'Create MO',
    icon: Factory,
  },
  {
    module: 'Make',
    screen: 'Manufacturing Orders',
    illustration: '/src/art/empty-states/make/MO.svg',
    title: 'No manufacturing orders',
    description: 'Create a manufacturing order to begin production.',
    createLabel: 'New MO',
    icon: ClipboardList,
    hasImport: true,
  },
  {
    module: 'Book',
    screen: 'Dashboard',
    illustration: '/src/art/empty-states/book/Book.svg',
    title: 'Your books are empty',
    description: 'Start by creating an invoice or recording an expense.',
    createLabel: 'Create invoice',
    icon: BookOpen,
  },
  {
    module: 'Book',
    screen: 'Invoices',
    illustration: '/src/art/empty-states/book/Invoices.svg',
    title: 'No invoices yet',
    description: 'Create your first invoice to start tracking revenue.',
    createLabel: 'New invoice',
    icon: Receipt,
    hasImport: true,
  },
  {
    module: 'Buy',
    screen: 'Dashboard',
    illustration: '/src/art/empty-states/buy/Buy.svg',
    title: 'No purchase orders',
    description: 'Create a purchase order to start procurement.',
    createLabel: 'New PO',
    icon: ShoppingCart,
    hasImport: true,
  },
  {
    module: 'Ship',
    screen: 'Dashboard',
    illustration: '/src/art/empty-states/ship/Ship.svg',
    title: 'Nothing to ship',
    description: 'Shipments will appear here when orders are ready to dispatch.',
    createLabel: 'New shipment',
    icon: Truck,
  },
];

export function ControlEmptyStates() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = EMPTY_STATES[selectedIdx];

  return (
    <PageShell>
      <PageHeader
        title="Empty State Showcase"
        subtitle="Developer reference — preview all illustrated empty states for Sharjeel to map to real data conditions"
      />

      <div className="px-8 pb-8">
        {/* Info callout */}
        <div className="flex items-start gap-3 bg-[var(--neutral-100)] border border-[var(--border)] rounded-[var(--shape-lg)] p-4 mb-6">
          <Info className="w-5 h-5 text-[var(--neutral-500)] mt-0.5 shrink-0" />
          <div className="text-sm text-[var(--neutral-600)]">
            <p className="font-medium text-[var(--mw-mirage)] mb-1">Implementation Notes</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>These empty states should display when a module has <strong>zero records</strong> (no customers, no orders, etc.).</li>
              <li>Currently, demo data is always shown. Wire the <code className="text-xs bg-white px-1 py-0.5 rounded border border-[var(--border)]">EmptyState</code> component with <code className="text-xs bg-white px-1 py-0.5 rounded border border-[var(--border)]">variant="illustrated"</code> when the data array is empty.</li>
              <li>SVG artwork lives in <code className="text-xs bg-white px-1 py-0.5 rounded border border-[var(--border)]">src/art/empty-states/</code>. Plan and Control modules need artwork designed.</li>
              <li>The "Import" button navigates to <code className="text-xs bg-white px-1 py-0.5 rounded border border-[var(--border)]">/control/mirrorworks-bridge</code> (MirrorWorks Bridge).</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: state selector */}
          <div className="col-span-4">
            <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] p-4">
              <h3 className="text-sm font-medium text-[var(--mw-mirage)] mb-3">Available Empty States</h3>
              <div className="space-y-1">
                {EMPTY_STATES.map((es, i) => (
                  <button
                    key={`${es.module}-${es.screen}`}
                    onClick={() => setSelectedIdx(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                      i === selectedIdx
                        ? 'bg-[var(--accent)] text-[var(--mw-mirage)] font-medium'
                        : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-mirage)]'
                    }`}
                  >
                    <es.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{es.module} &rsaquo; {es.screen}</span>
                    <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-[10px] rounded-full px-2 shrink-0">
                      {es.module}
                    </Badge>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <h4 className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-2">Missing Artwork</h4>
                <div className="space-y-1">
                  {['Plan', 'Control'].map(mod => (
                    <div key={mod} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--neutral-400)]">
                      <div className="w-4 h-4 rounded border border-dashed border-[var(--neutral-300)]" />
                      <span>{mod} — needs design</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: live preview */}
          <div className="col-span-8">
            <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--neutral-50)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--neutral-200)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--neutral-200)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--neutral-200)]" />
                </div>
                <span className="text-xs text-[var(--neutral-500)]">
                  {selected.module} / {selected.screen} — Empty State Preview
                </span>
                <div className="w-16" />
              </div>

              {/* Preview body */}
              <div className="min-h-[500px] flex">
                <EmptyState
                  variant="illustrated"
                  illustration={selected.illustration}
                  title={selected.title}
                  description={selected.description}
                  actions={[
                    {
                      label: selected.createLabel,
                      onClick: () => toast(`${selected.createLabel} form would open here`),
                      icon: Plus,
                    },
                    ...(selected.hasImport
                      ? [
                          {
                            label: 'Import',
                            onClick: () => navigate('/control/mirrorworks-bridge'),
                            icon: Upload,
                            variant: 'outline' as const,
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </Card>

            {/* Usage snippet */}
            <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] p-4 mt-4">
              <h4 className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-2">Usage</h4>
              <pre className="text-xs bg-[var(--neutral-50)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto text-[var(--mw-mirage)]">
{`<EmptyState
  variant="illustrated"
  illustration="${selected.illustration}"
  title="${selected.title}"
  description="${selected.description}"
  actions={[
    { label: "${selected.createLabel}", onClick: handleCreate, icon: Plus },${selected.hasImport ? `\n    { label: "Import", onClick: handleImport, icon: Upload, variant: "outline" },` : ''}
  ]}
/>`}
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
