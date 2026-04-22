/**
 * PlanNCConnect — NC Connect with Smart Nesting (Phase 1).
 *
 * Phase 1 covers:
 *   - Uploaded NC file banner with Download / Replace / Delete
 *   - G-code preview with syntax colouring
 *   - File validation summary (pill header + checks + warning callout)
 *   - Connected machines list with match %, progress, and status filter
 *
 * Accessed as a tab within PlanMachineIO or standalone via /plan/nc-connect.
 */

import React, { useMemo, useState } from 'react';
import {
  Upload,
  FileCode2,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Settings,
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
  'O1001 (RING-GEAR-DF-RG-440-OP1)',
  '(T1  D=12. CR=0. - ZMIN=-25. - FLAT END MILL)',
  '(T2  D=6.  CR=0. - ZMIN=-15. - DRILL)',
  'N10 G90 G94 G17 G49 G40 G80',
  'N15 G21',
  'N20 G53 G00 Z0.',
  '(Face Milling)',
  'N25 T1 M06',
  'N30 S3500 M03',
  'N35 G54',
  'N40 M08',
  'N45 G00 X-60. Y-30.',
  'N50 G43 Z15. H01',
  'N55 G00 Z5.',
  'N60 G01 Z-2. F1200.',
  'N65 X180.',
  'N70 G00 Z15.',
  '…',
];

/* ------------------------------------------------------------------ */
/* Connected machines                                                 */
/* ------------------------------------------------------------------ */

type MachineStatus = 'idle' | 'running' | 'error' | 'offline';

interface MachineCard {
  name: string;
  type: string;
  status: MachineStatus;
  envelope: string;
  spindle: string;
  tools: string;
  match: number;
  footer: string;
  action: string;
  running?: { file: string; remaining: string; percent: number };
}

const MACHINES: MachineCard[] = [
  {
    name: 'Haas VF-2',
    type: '3-axis mill',
    status: 'idle',
    envelope: '762 × 406 × 508mm',
    spindle: '8,100 RPM',
    tools: '20 slots',
    match: 95,
    footer: 'Ready for job',
    action: 'View on Machine',
  },
  {
    name: 'Doosan DNM 5700',
    type: '3-axis mill',
    status: 'running',
    envelope: '1050 × 570 × 510mm',
    spindle: '12,000 RPM',
    tools: '30 slots',
    match: 85,
    footer: '2 in queue',
    action: 'Add to Queue',
    running: { file: 'Bracket_v2.nc', remaining: '15m remaining', percent: 62 },
  },
  {
    name: 'Mazak QTN 200',
    type: 'Turning Centre',
    status: 'error',
    envelope: '675mm length',
    spindle: '5,000 RPM',
    tools: '12 slots',
    match: 40,
    footer: 'Ready for job',
    action: 'Unavailable',
  },
  {
    name: 'TRUMPF TruLaser',
    type: 'Fiber Laser',
    status: 'offline',
    envelope: '3000 × 1500mm',
    spindle: 'N/A',
    tools: '1 slots',
    match: 0,
    footer: 'Ready for job',
    action: 'Unavailable',
  },
];

type MachineFilter = 'all' | 'idle' | 'busy' | 'offline';

const machineStatusBadge = (s: MachineStatus) => {
  switch (s) {
    case 'idle':
      return (
        <Badge className="bg-[var(--mw-green)]/10 text-[var(--mw-green)] border-0 text-xs rounded-full px-2 py-0.5">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--mw-green)]" /> Idle
        </Badge>
      );
    case 'running':
      return (
        <Badge className="bg-[var(--mw-blue)]/10 text-[var(--mw-blue)] border-0 text-xs rounded-full px-2 py-0.5">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--mw-blue)]" /> Running
        </Badge>
      );
    case 'error':
      return (
        <Badge className="bg-[var(--mw-error)]/10 text-[var(--mw-error)] border-0 text-xs rounded-full px-2 py-0.5">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--mw-error)]" /> Error
        </Badge>
      );
    case 'offline':
      return (
        <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs rounded-full px-2 py-0.5">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--neutral-400)]" /> Offline
        </Badge>
      );
  }
};

const matchColour = (pct: number) => {
  if (pct >= 90) return 'text-[var(--mw-green)]';
  if (pct >= 70) return 'text-[var(--mw-amber)]';
  return 'text-[var(--mw-error)]';
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanNCConnect({ headerExtras }: { headerExtras?: React.ReactNode } = {}) {
  const [filter, setFilter] = useState<MachineFilter>('all');

  const visibleMachines = useMemo(() => {
    if (filter === 'all') return MACHINES;
    if (filter === 'idle') return MACHINES.filter((m) => m.status === 'idle');
    if (filter === 'busy') return MACHINES.filter((m) => m.status === 'running');
    if (filter === 'offline') return MACHINES.filter((m) => m.status === 'offline' || m.status === 'error');
    return MACHINES;
  }, [filter]);

  return (
    <PageShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Jobs', href: '/plan/jobs' },
          { label: 'Differential Assembly', href: '/plan/jobs' },
          { label: 'NC Connect' },
        ]}
        title="NC Connect"
        subtitle="Upload, validate, and send NC files to machines"
      />

      {headerExtras}

      <div className="px-6 space-y-6">
        {/* File banner */}
        <Card className="border border-[var(--border)] bg-card shadow-xs rounded-[var(--shape-lg)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <IconWell icon={FileCode2} surface="onLight" />
              <div className="min-w-0">
                <h2 className="text-base font-medium text-foreground truncate">
                  NC File: DF-RG-440_op1.nc
                </h2>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                  245 KB · Today, 10:23 AM · by mquigley
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-9 text-xs border-[var(--border)]">
                <Download className="mr-1.5 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs border-[var(--border)]">
                <Upload className="mr-1.5 h-4 w-4" /> Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs border-[var(--mw-error)]/30 text-[var(--mw-error)] hover:bg-[var(--mw-error)]/5 hover:text-[var(--mw-error)]"
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </Card>

        {/* Split: G-code + Validation on left, Connected Machines on right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="space-y-6">
            {/* G-code preview */}
            <Card className="border border-[var(--border)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
              <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">G-code Preview</h3>
                <button className="text-xs font-medium text-[var(--mw-yellow-500)] hover:underline">
                  View full code
                </button>
              </div>
              <div className="overflow-auto max-h-[420px] bg-[var(--mw-mirage)] p-4">
                <pre className="text-xs leading-relaxed tabular-nums">
                  {GCODE_LINES.map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-8 shrink-0 text-right text-[var(--neutral-500)] select-none tabular-nums mr-4">
                        {i + 1}
                      </span>
                      <span
                        className={cn(
                          line.startsWith('(')
                            ? 'text-[var(--mw-green)]'
                            : line.startsWith('N') || line.startsWith('G')
                              ? 'text-[var(--mw-blue)]'
                              : line.startsWith('T') || line.startsWith('S') || line.startsWith('M')
                                ? 'text-[var(--mw-error)]'
                                : line === '%'
                                  ? 'text-[var(--neutral-400)]'
                                  : 'text-[var(--neutral-300)]',
                        )}
                      >
                        {line || ' '}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </Card>

            {/* File validation */}
            <Card className="border border-[var(--border)] bg-card shadow-xs rounded-[var(--shape-lg)] p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">File Validation</h3>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <Badge className="bg-[var(--mw-green)]/10 text-[var(--mw-green)] border-0 text-xs rounded-full px-3 py-1">
                  <CheckCircle2 className="mr-1.5 h-3 w-3" /> Format Valid
                </Badge>
                <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-700)] border-0 text-xs rounded-full px-3 py-1">
                  <Settings className="mr-1.5 h-3 w-3" /> Fanuc Generic
                </Badge>
                <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-700)] border-0 text-xs rounded-full px-3 py-1">
                  <Clock className="mr-1.5 h-3 w-3" /> ~45m Run
                </Badge>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--mw-green)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">12 tools required</p>
                    <p className="text-xs text-[var(--neutral-500)]">Tools T1-T12 found in header</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--mw-green)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Material: AISI 4820</p>
                    <p className="text-xs text-[var(--neutral-500)]">Matches work order spec</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--mw-green)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Ø195mm × 60mm</p>
                    <p className="text-xs text-[var(--neutral-500)]">Fits within machine envelope</p>
                  </div>
                </li>
              </ul>

              <div className="mt-5 rounded-[var(--shape-md)] bg-[var(--mw-amber)]/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--mw-amber)] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-foreground">Post-processor Warning</p>
                    <p className="text-[var(--neutral-600)] mt-0.5">
                      Program uses G43.4 (TCP) which may behave differently on older Haas controllers.
                    </p>
                    <button className="mt-1 font-medium text-foreground underline">View details</button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column — Connected Machines */}
          <div>
            <Card className="border border-[var(--border)] bg-card shadow-xs rounded-[var(--shape-lg)] p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)]">
                    <Cpu className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-foreground">Connected Machines</h3>
                    <p className="text-xs text-[var(--neutral-500)]">{MACHINES.length} Machines</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 border border-[var(--border)] rounded-full p-0.5">
                  {(['all', 'idle', 'busy', 'offline'] as MachineFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full capitalize transition-colors',
                        filter === f
                          ? 'bg-[var(--mw-yellow-400)] text-foreground font-medium'
                          : 'text-[var(--neutral-500)] hover:text-foreground',
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {visibleMachines.map((m) => (
                  <div
                    key={m.name}
                    className={cn(
                      'border rounded-[var(--shape-lg)] p-4 transition-colors',
                      m.status === 'offline'
                        ? 'border-[var(--border)] bg-[var(--neutral-50)]'
                        : 'border-[var(--border)] bg-card',
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <IconWell icon={Cpu} surface="onLight" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{m.name}</span>
                          </div>
                          <p className="text-xs text-[var(--neutral-500)]">{m.type}</p>
                        </div>
                      </div>
                      {machineStatusBadge(m.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--neutral-500)] mb-1">Envelope</p>
                        <p className="font-medium text-foreground tabular-nums">{m.envelope}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--neutral-500)] mb-1">Spindle</p>
                        <p className="font-medium text-foreground tabular-nums">{m.spindle}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--neutral-500)] mb-1">Tools</p>
                        <p className="font-medium text-foreground">{m.tools}</p>
                      </div>
                    </div>

                    {m.running && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-foreground">Running: {m.running.file}</span>
                          <span className="text-[var(--neutral-500)] tabular-nums">{m.running.remaining}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--neutral-100)] overflow-hidden">
                          <div
                            className="h-full bg-foreground"
                            style={{ width: `${m.running.percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn('font-medium tabular-nums', matchColour(m.match))}>
                          {m.match}% Match
                        </span>
                        <span className="text-[var(--neutral-300)]">·</span>
                        <span className="text-[var(--neutral-500)]">{m.footer}</span>
                      </div>
                      {m.status === 'idle' ? (
                        <Button
                          size="sm"
                          className="h-9 text-xs bg-[var(--mw-green)] text-white hover:bg-[var(--mw-green)]/90"
                        >
                          {m.action}
                        </Button>
                      ) : m.status === 'running' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs border-[var(--border)]"
                        >
                          {m.action}
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--neutral-500)]">{m.action}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
