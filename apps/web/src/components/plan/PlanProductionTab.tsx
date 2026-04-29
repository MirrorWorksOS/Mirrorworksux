/**
 * Plan Job Detail — Production Tab
 *
 * Rebuilt around a single integrated BOM + Routing tree (inspired by Fulcrum Pro
 * and Global Shop Solutions' "Routing BOM" screens). The old three-tab-bars
 * + modal-BOM layout has been collapsed into one view — parts, material inputs,
 * and operations live together so planners stop tab-hopping.
 *
 * The 3D MirrorView and 2D Drawing viewers sit below the tree as visual aids.
 */

import { useMemo, useRef, useState } from 'react';
import {
  Maximize2, Printer, Home, Layers, Settings, Camera, Share2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { GlbViewer, type GlbViewerApi } from '@/components/shared/3d/GlbViewer';
import { MirrorViewToolbar } from '@/components/shared/3d/MirrorViewToolbar';
import { DrawingViewer } from '@/components/shared/3d/DrawingViewer';
import { BomRoutingTree } from './BomRoutingTree';
import { getDifferentialAssembly } from './BomRoutingTree.data';
import { cn } from '../ui/utils';

export function PlanProductionTab() {
  const assembly = useMemo(() => getDifferentialAssembly('plan'), []);
  const [activePartId, setActivePartId] = useState(assembly.parts[0]?.id ?? '');
  const activePart = assembly.parts.find((p) => p.id === activePartId) ?? assembly.parts[0];
  const visualParts = assembly.parts.filter((p) => p.kind === 'make');
  const viewerApiRef = useRef<GlbViewerApi | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ---- Integrated BOM + Routing tree ---- */}
      <BomRoutingTree assembly={assembly} mode="plan" />

      {/* ---- MirrorView 3D — visual reference for the selected made part ---- */}
      <Card>
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">MirrorView</h2>
            <p className="text-sm text-[var(--neutral-500)] mt-1">3D part visualisation</p>
          </div>
          <Button variant="outline" size="sm" className="h-10 text-xs border-[var(--border)]">
            <Maximize2 className="w-4 h-4 mr-1.5" /> Fullscreen
          </Button>
        </div>

        {/* Part selector — drives both 3D and 2D viewers */}
        <div className="px-6 border-b border-[var(--border)] flex items-center gap-1 overflow-x-auto">
          {visualParts.map((p) => (
            <button
              key={p.id}
              className={cn(
                'px-4 py-2.5 text-xs font-medium transition-colors relative whitespace-nowrap',
                activePartId === p.id
                  ? 'text-foreground'
                  : 'text-[var(--neutral-500)] hover:text-foreground',
              )}
              onClick={() => setActivePartId(p.id)}
            >
              {p.name}
              {activePartId === p.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mw-yellow-400)]" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-1 mb-3 bg-[var(--neutral-100)] rounded-[var(--shape-sm)] p-1 w-fit">
            <Button variant="ghost" size="sm" className="h-10 px-2 text-xs" onClick={() => toast('Viewer control activated')}><Home className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="sm" className="h-10 px-2 text-xs" onClick={() => toast('Viewer control activated')}><Layers className="w-3.5 h-3.5 mr-1" /> Model</Button>
            <Button variant="ghost" size="sm" className="h-10 px-2 text-xs" onClick={() => toast('Viewer control activated')}><Settings className="w-3.5 h-3.5 mr-1" /> Properties</Button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <Button variant="ghost" size="sm" className="h-10 px-2 text-xs" onClick={() => toast('Viewer control activated')}><Camera className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="sm" className="h-10 px-2 text-xs" onClick={() => toast('Viewer control activated')}><Share2 className="w-3.5 h-3.5" /></Button>
          </div>

          <div className="aspect-video bg-[var(--neutral-100)] rounded-[var(--shape-md)] relative overflow-hidden">
            <GlbViewer
              src="/models/diff.glb"
              className="w-full h-full"
              background="#f5f5f5"
              modelColor={0x9aa0a8}
              modelMetalness={0.55}
              modelRoughness={0.5}
              shadows
              gridColor={[0xd4d4d4, 0xe5e5e5]}
              gridOpacity={0.6}
              onReady={(api) => {
                viewerApiRef.current = api;
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <Badge className="bg-black/5 text-foreground/60 border-0 text-[10px] dark:bg-white/10 dark:text-white/70">Isometric</Badge>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
              <Badge className="bg-black/5 text-foreground/60 border-0 text-[10px] dark:bg-white/10 dark:text-white/70">GLB · three.js</Badge>
            </div>
            <MirrorViewToolbar
              onReset={() => viewerApiRef.current?.reset()}
              onMode={(mode) => viewerApiRef.current?.setMode(mode)}
              onComment={() => toast('Commenting coming soon')}
            />
          </div>
        </div>
      </Card>

      {/* ---- 2D Drawing Viewer ---- */}
      <Card>
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">2D Drawing</h2>
            <p className="text-sm text-[var(--neutral-500)] mt-1">
              Manufacturing drawing · {activePart?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 text-xs border-[var(--border)]">
              <Maximize2 className="w-4 h-4 mr-1.5" /> Fullscreen
            </Button>
            <Button variant="outline" size="sm" className="h-10 text-xs border-[var(--border)]">
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="aspect-[16/9] bg-white dark:bg-card border border-[var(--border)] rounded-[var(--shape-md)] relative overflow-hidden">
            <DrawingViewer src="/models/diff.glb" className="absolute inset-0" />
            <div className="absolute bottom-3 right-3 w-48 border border-[var(--neutral-200)] bg-white/90 dark:bg-card/90 p-2 pointer-events-none">
              <p className="text-[9px] font-medium text-[var(--neutral-500)]">MIRRORWORKS</p>
              <p className="text-[8px] text-[var(--neutral-500)]">{activePart?.name}</p>
              <p className="text-[8px] text-[var(--neutral-500)]">Part: {activePart?.partNumber}</p>
              <p className="text-[8px] text-[var(--neutral-500)]">Scale 1:1 · Sheet 1 of 1</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
