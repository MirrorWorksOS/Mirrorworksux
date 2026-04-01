/**
 * Plan Job Detail — Production Tab (§4.6)
 *
 * Extended products table with routing info, MirrorView 3D with product tabs
 * and toolbar, Instructions & Activities table with drag handles, and 2D
 * Drawing Viewer.
 */

import React, { useState } from 'react';
import {
  MoreVertical, FileText, Download, Eye, Package, GripVertical,
  Home, Layers, Settings, Printer, Camera, Share2, Maximize2,
  ChevronDown, Upload, Ruler,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

interface Product {
  id: number;
  name: string;
  partNumber: string;
  route: 'Make' | 'Buy' | 'Subcontract';
  toProduce: number;
  inventory: number;
  hasBOM: boolean;
  hasNC: boolean;
  status: 'Produced' | 'In progress' | 'Scheduled';
  workstations: string[];
  operator: { initials: string; name: string };
}

const products: Product[] = [
  {
    id: 1, name: 'Sliding Brace', partNumber: 'SB-440', route: 'Make',
    toProduce: 10000, inventory: 500, hasBOM: true, hasNC: true,
    status: 'Produced', workstations: ['Laser'],
    operator: { initials: 'DM', name: 'D. Miller' },
  },
  {
    id: 2, name: 'Angle 50×50', partNumber: 'AN-50', route: 'Make',
    toProduce: 5000, inventory: 2550, hasBOM: true, hasNC: true,
    status: 'In progress', workstations: ['Turret'],
    operator: { initials: 'SC', name: 'S. Chen' },
  },
  {
    id: 3, name: 'Manifold Bracket', partNumber: 'MB-202', route: 'Make',
    toProduce: 800, inventory: 0, hasBOM: true, hasNC: false,
    status: 'Scheduled', workstations: ['Press Brake'],
    operator: { initials: 'MJ', name: 'M. Johnson' },
  },
];

interface InstructionRow {
  id: number;
  operation: string;
  workCentre: string;
  operator: string;
  minutes: number;
  qc: 'Done' | 'In Progress' | 'Pending';
  instructions: string | null;
}

const instructionData: Record<number, InstructionRow[]> = {
  1: [
    { id: 1, operation: 'Prepare BOM', workCentre: 'Office', operator: 'D. Miller', minutes: 30, qc: 'Done', instructions: null },
    { id: 2, operation: 'Prepare NC files', workCentre: 'CAM Station', operator: 'S. Chen', minutes: 45, qc: 'Done', instructions: 'Nesting_SB440.nc' },
    { id: 3, operation: 'Laser cutting', workCentre: 'Amada Ensis', operator: 'K. Doe', minutes: 120, qc: 'In Progress', instructions: 'Cut_Program_v2.pdf' },
    { id: 4, operation: 'Deburr cut parts', workCentre: 'Bench', operator: 'J. Wright', minutes: 60, qc: 'Pending', instructions: null },
    { id: 5, operation: 'Bend panels', workCentre: 'Press Brake', operator: 'M. Johnson', minutes: 90, qc: 'Pending', instructions: 'Bend_Sequence.pdf' },
    { id: 6, operation: 'Spot welding', workCentre: 'Weld-01', operator: 'T. Park', minutes: 75, qc: 'Pending', instructions: null },
    { id: 7, operation: 'Surface preparation', workCentre: 'Prep Bay', operator: 'J. Wright', minutes: 40, qc: 'Pending', instructions: null },
    { id: 8, operation: 'Powder coat & bake', workCentre: 'Subcontract', operator: 'External', minutes: 480, qc: 'Pending', instructions: 'Colour_Spec_RAL7035.pdf' },
    { id: 9, operation: 'QC final inspection', workCentre: 'QC Bay', operator: 'D. Miller', minutes: 30, qc: 'Pending', instructions: 'QC_Checklist_SB440.pdf' },
  ],
  2: [
    { id: 1, operation: 'Prepare NC files', workCentre: 'CAM Station', operator: 'S. Chen', minutes: 30, qc: 'Done', instructions: 'Nesting_AN50.nc' },
    { id: 2, operation: 'Turret punch parts', workCentre: 'Turret Punch', operator: 'J. Tashjyulov', minutes: 60, qc: 'In Progress', instructions: 'Punch_Program.pdf' },
    { id: 3, operation: 'Bend 50×50 angle', workCentre: 'Press Brake', operator: 'M. Johnson', minutes: 45, qc: 'Pending', instructions: null },
    { id: 4, operation: 'QC inspection', workCentre: 'QC Bay', operator: 'D. Miller', minutes: 20, qc: 'Pending', instructions: null },
  ],
  3: [
    { id: 1, operation: 'Prepare BOM', workCentre: 'Office', operator: 'D. Miller', minutes: 20, qc: 'Pending', instructions: null },
    { id: 2, operation: 'CNC machining', workCentre: 'CNC-01', operator: 'K. Doe', minutes: 90, qc: 'Pending', instructions: null },
    { id: 3, operation: 'Bending', workCentre: 'Press Brake', operator: 'M. Johnson', minutes: 45, qc: 'Pending', instructions: 'Bend_MB202.pdf' },
    { id: 4, operation: 'Welding', workCentre: 'Weld-01', operator: 'T. Park', minutes: 60, qc: 'Pending', instructions: null },
    { id: 5, operation: 'QC inspection', workCentre: 'QC Bay', operator: 'D. Miller', minutes: 20, qc: 'Pending', instructions: null },
  ],
};

const statusColor: Record<string, string> = {
  Produced: 'bg-[var(--mw-green)]/10 text-[var(--mw-green)]',
  'In progress': 'bg-[var(--mw-yellow-400)]/20 text-[var(--neutral-800)]',
  Scheduled: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
};

const qcColor: Record<string, string> = {
  Done: 'bg-[var(--mw-green)]/10 text-[var(--mw-green)]',
  'In Progress': 'bg-[var(--mw-yellow-400)]/20 text-[var(--neutral-800)]',
  Pending: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanProductionTab() {
  const [activeProduct, setActiveProduct] = useState(products[0].id);
  const instructions = instructionData[activeProduct] ?? [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ---- Products Table (§4.6 extended) ---- */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)]">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--mw-mirage)] mb-1">Products</h2>
            <p className="text-sm text-[var(--neutral-500)]">
              {products.length} Products · {products.reduce((s, p) => s + p.toProduce, 0).toLocaleString()} units total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <Eye className="w-4 h-4 mr-1.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 py-3 bg-[var(--neutral-100)] border-b border-[var(--border)]">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
            <div className="col-span-2">Part</div>
            <div className="col-span-1">Route</div>
            <div className="col-span-1">To Produce</div>
            <div className="col-span-1">Inventory</div>
            <div className="col-span-1">BOM</div>
            <div className="col-span-1">NC Files</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Workstation(s)</div>
            <div className="col-span-1">Operator</div>
            <div className="col-span-1 text-right">CAD</div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--border)]">
          {products.map((p) => (
            <div
              key={p.id}
              className={cn(
                'px-6 py-4 hover:bg-[var(--accent)] transition-colors cursor-pointer',
                activeProduct === p.id && 'bg-[var(--accent)]',
              )}
              onClick={() => setActiveProduct(p.id)}
            >
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-2">
                  <p className="text-xs font-medium text-[var(--mw-mirage)]">{p.name}</p>
                  <p className="text-[10px] text-[var(--neutral-500)]">{p.partNumber}</p>
                </div>
                <div className="col-span-1">
                  <Badge variant="outline" className="text-[10px] border-[var(--border)]">{p.route}</Badge>
                </div>
                <div className="col-span-1 text-xs tabular-nums text-[var(--mw-mirage)]">{p.toProduce.toLocaleString()}</div>
                <div className="col-span-1 text-xs tabular-nums text-[var(--neutral-500)]">{p.inventory.toLocaleString()}</div>
                <div className="col-span-1">
                  {p.hasBOM
                    ? <FileText className="w-4 h-4 text-[var(--mw-green)]" />
                    : <span className="text-xs text-[var(--mw-error)]">Missing</span>}
                </div>
                <div className="col-span-1">
                  {p.hasNC
                    ? <FileText className="w-4 h-4 text-[var(--mw-blue)]" />
                    : <span className="text-xs text-[var(--neutral-400)]">—</span>}
                </div>
                <div className="col-span-1">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-[var(--shape-sm)]', statusColor[p.status])}>
                    {p.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex gap-1 flex-wrap">
                    {p.workstations.map((ws) => (
                      <Badge key={ws} variant="outline" className="text-[10px] border-[var(--border)]">{ws}</Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[var(--mw-mirage)] text-white flex items-center justify-center text-[10px] font-medium">
                      {p.operator.initials}
                    </div>
                    <span className="text-[10px] text-[var(--neutral-500)]">{p.operator.name}</span>
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">📐</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- MirrorView 3D (§4.6.2) ---- */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)]">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--mw-mirage)]">MirrorView</h2>
            <p className="text-sm text-[var(--neutral-500)] mt-1">3D part visualisation</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <Maximize2 className="w-4 h-4 mr-1.5" /> Fullscreen
            </Button>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="px-6 border-b border-[var(--border)] flex items-center gap-1">
          {products.map((p) => (
            <button
              key={p.id}
              className={cn(
                'px-4 py-2.5 text-xs font-medium transition-colors relative',
                activeProduct === p.id
                  ? 'text-[var(--mw-mirage)]'
                  : 'text-[var(--neutral-500)] hover:text-[var(--mw-mirage)]',
              )}
              onClick={() => setActiveProduct(p.id)}
            >
              {p.name}
              {activeProduct === p.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mw-yellow-400)]" />
              )}
            </button>
          ))}
        </div>

        {/* Viewer Area */}
        <div className="p-6">
          {/* Toolbar (§4.6.2) */}
          <div className="flex items-center gap-1 mb-3 bg-[var(--neutral-100)] rounded-[var(--shape-sm)] p-1 w-fit">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Home className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Layers className="w-3.5 h-3.5 mr-1" /> Model</Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Settings className="w-3.5 h-3.5 mr-1" /> Properties</Button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Printer className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Camera className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Share2 className="w-3.5 h-3.5" /></Button>
          </div>

          {/* 3D Viewport placeholder — would embed Autodesk APS Viewer SDK */}
          <div className="aspect-video bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center relative overflow-hidden">
            {/* Grid overlay for 3D feel */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="text-center relative z-10">
              <Package className="w-20 h-20 text-[var(--neutral-500)] mx-auto mb-3" />
              <p className="text-sm text-[var(--neutral-400)] font-medium">
                {products.find(p => p.id === activeProduct)?.name}
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">
                Autodesk APS Viewer · Phase 2
              </p>
            </div>
            {/* Corner badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge className="bg-white/10 text-white/80 border-0 text-[10px]">Isometric</Badge>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Badge className="bg-white/10 text-white/80 border-0 text-[10px]">STEP / DWG / Inventor</Badge>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <FileText className="w-4 h-4 mr-1.5" /> BOM
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <Download className="w-4 h-4 mr-1.5" /> CAD File
            </Button>
            <span className="text-xs text-[var(--neutral-500)] ml-auto">Next: {products.find(p => p.id !== activeProduct)?.name ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* ---- Instructions & Activities Table (§4.6.3) ---- */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)]">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--mw-mirage)]">Instructions & Activities</h2>
            <p className="text-sm text-[var(--neutral-500)] mt-1">
              Manufacturing instructions · {instructions.length} operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <ChevronDown className="w-4 h-4 mr-1.5" /> Outline
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <ChevronDown className="w-4 h-4 mr-1.5" /> Columns
            </Button>
          </div>
        </div>

        {/* Product tab bar (mirrors MirrorView) */}
        <div className="px-6 border-b border-[var(--border)] flex items-center gap-1">
          {products.map((p) => (
            <button
              key={p.id}
              className={cn(
                'px-4 py-2.5 text-xs font-medium transition-colors relative',
                activeProduct === p.id
                  ? 'text-[var(--mw-mirage)]'
                  : 'text-[var(--neutral-500)] hover:text-[var(--mw-mirage)]',
              )}
              onClick={() => setActiveProduct(p.id)}
            >
              {p.name}
              {activeProduct === p.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mw-yellow-400)]" />
              )}
            </button>
          ))}
        </div>

        {/* Table Header — spec columns: Operation, Work Centre, Operator, Minutes, QC, Instructions */}
        <div className="px-6 py-3 bg-[var(--neutral-100)] border-b border-[var(--border)]">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
            <div className="col-span-1" /> {/* drag handle */}
            <div className="col-span-3">Operation</div>
            <div className="col-span-2">Work Centre</div>
            <div className="col-span-2">Operator</div>
            <div className="col-span-1">Minutes</div>
            <div className="col-span-1">QC</div>
            <div className="col-span-1">Instructions</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
        </div>

        {/* Instruction Rows */}
        <div className="divide-y divide-[var(--border)]">
          {instructions.map((row) => (
            <div key={row.id} className="px-6 py-3 hover:bg-[var(--accent)] transition-colors group">
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Drag handle */}
                <div className="col-span-1">
                  <GripVertical className="w-4 h-4 text-[var(--neutral-300)] group-hover:text-[var(--neutral-500)] cursor-grab" />
                </div>
                {/* Operation */}
                <div className="col-span-3">
                  <span className="text-xs font-medium text-[var(--mw-mirage)]">{row.operation}</span>
                </div>
                {/* Work Centre */}
                <div className="col-span-2">
                  <Badge variant="outline" className="text-[10px] border-[var(--border)]">{row.workCentre}</Badge>
                </div>
                {/* Operator */}
                <div className="col-span-2">
                  <span className="text-xs text-[var(--neutral-500)]">{row.operator}</span>
                </div>
                {/* Minutes */}
                <div className="col-span-1">
                  <span className="text-xs tabular-nums text-[var(--mw-mirage)]">{row.minutes}</span>
                </div>
                {/* QC */}
                <div className="col-span-1">
                  <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-[var(--shape-sm)]', qcColor[row.qc])}>
                    {row.qc}
                  </span>
                </div>
                {/* Instructions */}
                <div className="col-span-1">
                  {row.instructions ? (
                    <button className="flex items-center gap-1 text-[var(--mw-blue)] hover:underline">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[10px] truncate max-w-[80px]">{row.instructions}</span>
                    </button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-[var(--neutral-400)] px-1.5">
                      <Upload className="w-3 h-3 mr-1" /> Add
                    </Button>
                  )}
                </div>
                {/* Action menu */}
                <div className="col-span-1 text-right">
                  <button className="p-1 hover:bg-[var(--neutral-100)] rounded-[var(--shape-sm)] transition-colors">
                    <MoreVertical className="w-4 h-4 text-[var(--neutral-500)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--neutral-100)] border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-xs text-[var(--neutral-500)]">
            {instructions.length} operations · Total: {instructions.reduce((s, r) => s + r.minutes, 0)} min
          </p>
          <Button size="sm" className="h-8 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)] text-xs">
            + Add Operation
          </Button>
        </div>
      </div>

      {/* ---- 2D Drawing Viewer (§4.6.4) ---- */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)]">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--mw-mirage)]">2D Drawing</h2>
            <p className="text-sm text-[var(--neutral-500)] mt-1">Manufacturing drawing for operator reference</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <Maximize2 className="w-4 h-4 mr-1.5" /> Fullscreen
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--border)]">
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* 2D Viewer placeholder — would embed Autodesk APS 2D Viewer */}
          <div className="aspect-[16/9] bg-[var(--neutral-50)] border border-[var(--border)] rounded-[var(--shape-md)] flex items-center justify-center relative overflow-hidden">
            {/* Drawing paper grid */}
            <div className="absolute inset-4 border border-[var(--neutral-200)] rounded">
              {/* Title block (bottom right) */}
              <div className="absolute bottom-0 right-0 w-48 border-t border-l border-[var(--neutral-200)] p-2">
                <p className="text-[9px] font-medium text-[var(--neutral-400)]">MIRRORWORKS</p>
                <p className="text-[8px] text-[var(--neutral-400)]">{products.find(p => p.id === activeProduct)?.name}</p>
                <p className="text-[8px] text-[var(--neutral-400)]">Part: {products.find(p => p.id === activeProduct)?.partNumber}</p>
                <p className="text-[8px] text-[var(--neutral-400)]">Scale 1:1 · Sheet 1 of 1</p>
              </div>
              {/* Centre placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Ruler className="w-12 h-12 text-[var(--neutral-300)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--neutral-400)] font-medium">2D Technical Drawing</p>
                  <p className="text-[10px] text-[var(--neutral-400)] mt-1">Autodesk APS 2D Viewer · Phase 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
