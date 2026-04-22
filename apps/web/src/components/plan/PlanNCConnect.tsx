/**
 * PlanNCConnect — NC Connect with Smart Nesting (Phase 1).
 *
 * Phase 1 covers:
 *   - NC file upload / management
 *   - G-code preview with line numbers
 *   - File validation checklist
 *   - Machine status cards (static prototype data)
 *
 * Accessed as a tab within PlanJobDetail or standalone via /plan/jobs/:id/nc-connect.
 */

import React, { useState } from 'react';
import {
  Upload,
  FileCode2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Activity,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { IconWell } from '@/components/shared/icons/IconWell';

/* ------------------------------------------------------------------ */
/* Mock G-code                                                        */
/* ------------------------------------------------------------------ */

const GCODE_LINES = [
  '%',
  'O1001 (MOUNTING-BRACKET-ASSEMBLY)',
  'G90 G94 G17',
  'G21 (METRIC)',
  '',
  '(TOOL 1 — 10mm END MILL)',
  'T1 M6',
  'S8000 M3',
  'G54',
  'G0 X0 Y0 Z50.0',
  'G43 H1 Z5.0',
  'G1 Z-2.0 F500',
  'G1 X100.0 F1200',
  'G1 Y50.0',
  'G1 X0',
  'G1 Y0',
  'G0 Z50.0',
  '',
  '(TOOL 2 — 6mm DRILL)',
  'T2 M6',
  'S6000 M3',
  'G0 X25.0 Y25.0',
  'G43 H2 Z5.0',
  'G83 Z-12.0 Q3.0 R1.0 F300',
  'G0 X75.0 Y25.0',
  'G83 Z-12.0 Q3.0 R1.0 F300',
  'G0 Z50.0',
  '',
  'M5',
  'M30',
  '%',
];

/* ------------------------------------------------------------------ */
/* Validation items                                                   */
/* ------------------------------------------------------------------ */

interface ValidationItem {
  label: string;
  status: 'valid' | 'warning' | 'error';
  detail: string;
}

const VALIDATIONS: ValidationItem[] = [
  { label: 'Format', status: 'valid', detail: 'Valid Fanuc G-code' },
  { label: 'Post-processor', status: 'warning', detail: 'Fanuc Generic — verify coolant codes for this machine' },
  { label: 'Tools found', status: 'valid', detail: 'T1 (10mm End Mill), T2 (6mm Drill) found in header' },
  { label: 'Matches work order spec', status: 'valid', detail: 'G54 work offset and dimensions match WO-002' },
  { label: 'Machine envelope', status: 'valid', detail: 'Toolpath fits within 300 × 200 × 100 mm envelope' },
];

const statusIcon = (s: ValidationItem['status']) => {
  switch (s) {
    case 'valid':
      return <CheckCircle2 className="h-4 w-4 text-[var(--mw-green)] shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-[var(--mw-amber)] shrink-0" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-[var(--mw-error)] shrink-0" />;
  }
};

/* ------------------------------------------------------------------ */
/* Machine cards                                                      */
/* ------------------------------------------------------------------ */

interface MachineCard {
  name: string;
  type: string;
  status: 'idle' | 'running' | 'error';
  envelope: string;
  spindle: string;
  tools: string;
  action: string;
}

const MACHINES: MachineCard[] = [
  { name: 'Haas VF-2', type: 'Vertical Machining Centre', status: 'idle', envelope: '762 × 406 × 508 mm', spindle: '8,100 RPM', tools: '20+1 ATC', action: 'View on Machine' },
  { name: 'Doosan DNM 5700', type: 'Vertical Machining Centre', status: 'running', envelope: '1,050 × 570 × 510 mm', spindle: '12,000 RPM', tools: '30 ATC', action: 'Add to Queue' },
  { name: 'Mazak QTN 200', type: 'Turning Centre', status: 'error', envelope: 'Ø300 × 500 mm', spindle: '4,000 RPM', tools: '12 turret', action: 'View Error' },
];

const machineStatusBadge = (s: MachineCard['status']) => {
  switch (s) {
    case 'idle':
      return <Badge className="bg-[var(--mw-blue)]/15 text-[var(--mw-blue)] border-0 text-xs">Idle</Badge>;
    case 'running':
      return <Badge className="bg-[var(--mw-green)]/15 text-[var(--mw-green)] border-0 text-xs">Running</Badge>;
    case 'error':
      return <Badge className="bg-[var(--mw-error)]/15 text-[var(--mw-error)] border-0 text-xs">Error</Badge>;
  }
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanNCConnect({ headerExtras }: { headerExtras?: React.ReactNode } = {}) {
  const [selectedFile, setSelectedFile] = useState<string | null>('mounting-bracket-v3.nc');

  return (
    <PageShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Jobs', href: '/plan/jobs' },
          { label: 'Server Rack Chassis', href: '/plan/jobs' },
          { label: 'NC Connect' },
        ]}
        title="NC Connect"
        subtitle="Upload, validate, and send NC files to machines"
        actions={
          <Button className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]">
            <Upload className="mr-2 h-4 w-4" />
            Upload NC File
          </Button>
        }
      />

      {headerExtras}

      <div className="grid grid-cols-1 gap-6 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        {/* Left column — file management + G-code preview */}
        <div className="space-y-6">
          {/* File upload area */}
          <Card className="border border-dashed border-[var(--neutral-300)] bg-[var(--neutral-50)] p-8 rounded-[var(--shape-lg)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--neutral-200)] flex items-center justify-center mb-3">
                <Upload className="h-5 w-5 text-[var(--neutral-500)]" />
              </div>
              <p className="text-sm font-medium text-[var(--neutral-700)] mb-1">Drop NC files here or click to upload</p>
              <p className="text-xs text-[var(--neutral-500)]">Supports .nc, .gcode, .tap, .ngc formats</p>
            </div>
          </Card>

          {/* Uploaded file */}
          {selectedFile && (
            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <IconWell icon={FileCode2} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedFile}</p>
                    <p className="text-xs text-[var(--neutral-500)]">12.4 KB · Uploaded 2 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4 text-[var(--neutral-500)]" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-[var(--mw-error)]" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* G-code preview */}
          <Card className="border border-[var(--neutral-200)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">G-code Preview</h3>
              <Badge variant="outline" className="border-[var(--border)] text-xs">Fanuc G-code</Badge>
            </div>
            <div className="overflow-auto max-h-[420px] bg-[var(--neutral-900)] p-4">
              <pre className="text-xs leading-relaxed tabular-nums">
                {GCODE_LINES.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 shrink-0 text-right text-[var(--neutral-600)] select-none tabular-nums mr-4">
                      {i + 1}
                    </span>
                    <span className={cn(
                      line.startsWith('(') ? 'text-[var(--mw-green)]' :
                      line.startsWith('G') ? 'text-[var(--mw-yellow-400)]' :
                      line.startsWith('T') || line.startsWith('S') || line.startsWith('M') ? 'text-[var(--mw-blue)]' :
                      line === '%' ? 'text-[var(--neutral-500)]' :
                      'text-[var(--neutral-300)]'
                    )}>
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </Card>
        </div>

        {/* Right column — validation + machines */}
        <div className="space-y-6">
          {/* File validation */}
          <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
            <h3 className="text-sm font-medium text-foreground mb-4">File Validation</h3>
            <ul className="space-y-3">
              {VALIDATIONS.map((v, i) => (
                <li key={i} className="flex items-start gap-3">
                  {statusIcon(v.status)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{v.label}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{v.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            {VALIDATIONS.some((v) => v.status === 'warning') && (
              <div className="mt-4 rounded-[var(--shape-md)] bg-[var(--mw-amber)]/10 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--mw-amber)] shrink-0" />
                  <p className="text-xs text-[var(--neutral-700)]">
                    Post-processor warning — <button className="underline font-medium">View details</button>
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Machine status cards */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Available Machines</h3>
            <div className="space-y-3">
              {MACHINES.map((m) => (
                <Card
                  key={m.name}
                  className={cn(
                    'border bg-card p-4 shadow-xs rounded-[var(--shape-lg)] transition-colors hover:bg-[var(--neutral-50)] cursor-pointer',
                    m.status === 'error' ? 'border-[var(--mw-error)]/30' : 'border-[var(--neutral-200)]',
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-[var(--neutral-500)]" />
                      <span className="text-sm font-medium text-foreground">{m.name}</span>
                    </div>
                    {machineStatusBadge(m.status)}
                  </div>
                  <p className="text-xs text-[var(--neutral-500)] mb-3">{m.type}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-[var(--neutral-500)]">Envelope</p>
                      <p className="font-medium text-[var(--neutral-700)] tabular-nums">{m.envelope}</p>
                    </div>
                    <div>
                      <p className="text-[var(--neutral-500)]">Spindle</p>
                      <p className="font-medium text-[var(--neutral-700)] tabular-nums">{m.spindle}</p>
                    </div>
                    <div>
                      <p className="text-[var(--neutral-500)]">Tools</p>
                      <p className="font-medium text-[var(--neutral-700)]">{m.tools}</p>
                    </div>
                  </div>

                  <Button
                    variant={m.status === 'error' ? 'destructive' : 'outline'}
                    size="sm"
                    className={cn(
                      'w-full h-9 text-xs',
                      m.status !== 'error' && 'border-[var(--border)]',
                    )}
                  >
                    {m.action}
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
