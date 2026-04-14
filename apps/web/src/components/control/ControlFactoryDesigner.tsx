/**
 * Factory Designer — interactive 2D factory layout canvas (ARCH 00 / Control).
 *
 * SVG-based canvas with drag-and-drop element placement, grid snapping,
 * zoom controls, properties panel, and undo/redo history.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Layout, ZoomIn, ZoomOut, Undo2, Redo2, Save, Upload, Download,
  Grid3x3, Magnet, Trash2, RotateCw, Copy,
  // Machine icons
  Cog, Zap, ArrowDownUp, CircleDot, Flame, Disc3,
  // Zone icons
  Factory, Warehouse, Truck, Building2, FlaskConical, Wrench,
  // Infrastructure icons
  Square, DoorOpen, MoveHorizontal, ArrowRightLeft, ArrowRight, LayoutGrid,
  // People icons
  User, Shield,
  // Text & Shape icons
  Type, Circle, Triangle, RectangleHorizontal,
  // Misc
  ChevronRight, GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/animate-ui/primitives/animate/tooltip';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetPortal,
  SheetOverlay,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/animate-ui/primitives/radix/sheet';
import { PanelRight } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Cog as AnimatedCog } from '@/components/animate-ui/icons/cog';
import { readStorageValue, writeStorageValue } from '@/lib/platform/storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ElementCategory = 'machines' | 'zones' | 'infrastructure' | 'people' | 'text-shapes';
type MachineStatus = 'Active' | 'Maintenance' | 'Idle';

interface FactoryElement {
  id: string;
  type: string;
  category: ElementCategory;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  // Machine-specific
  status?: MachineStatus;
  operator?: string;
  // Text-specific
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  // Shape-specific
  fillOpacity?: number;
  strokeWidth?: number;
  cornerRadius?: number;
}

interface PaletteItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: ElementCategory;
  defaultWidth: number;
  defaultHeight: number;
  defaultColor: string;
}

interface HistoryState {
  elements: FactoryElement[];
  selectedId: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 20;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1000;

const PALETTE_ITEMS: Record<ElementCategory, PaletteItem[]> = {
  machines: [
    { type: 'cnc', label: 'CNC Machine', icon: <Cog className="w-4 h-4" />, category: 'machines', defaultWidth: 120, defaultHeight: 80, defaultColor: 'var(--neutral-400)' },
    { type: 'laser', label: 'Laser Cutter', icon: <Zap className="w-4 h-4" />, category: 'machines', defaultWidth: 140, defaultHeight: 80, defaultColor: 'var(--neutral-400)' },
    { type: 'press', label: 'Press Brake', icon: <ArrowDownUp className="w-4 h-4" />, category: 'machines', defaultWidth: 100, defaultHeight: 80, defaultColor: 'var(--neutral-400)' },
    { type: 'lathe', label: 'Lathe', icon: <CircleDot className="w-4 h-4" />, category: 'machines', defaultWidth: 100, defaultHeight: 60, defaultColor: 'var(--neutral-400)' },
    { type: 'welder', label: 'Welder', icon: <Flame className="w-4 h-4" />, category: 'machines', defaultWidth: 80, defaultHeight: 80, defaultColor: 'var(--neutral-400)' },
    { type: 'grinder', label: 'Grinder', icon: <Disc3 className="w-4 h-4" />, category: 'machines', defaultWidth: 80, defaultHeight: 60, defaultColor: 'var(--neutral-400)' },
  ],
  zones: [
    { type: 'production', label: 'Production', icon: <Factory className="w-4 h-4" />, category: 'zones', defaultWidth: 300, defaultHeight: 200, defaultColor: 'var(--mw-blue)' },
    { type: 'storage', label: 'Storage', icon: <Warehouse className="w-4 h-4" />, category: 'zones', defaultWidth: 200, defaultHeight: 150, defaultColor: 'var(--mw-amber)' },
    { type: 'loading-dock', label: 'Loading Dock', icon: <Truck className="w-4 h-4" />, category: 'zones', defaultWidth: 200, defaultHeight: 100, defaultColor: 'var(--mw-success)' },
    { type: 'office', label: 'Office', icon: <Building2 className="w-4 h-4" />, category: 'zones', defaultWidth: 150, defaultHeight: 120, defaultColor: 'var(--mw-purple)' },
    { type: 'quality-lab', label: 'Quality Lab', icon: <FlaskConical className="w-4 h-4" />, category: 'zones', defaultWidth: 160, defaultHeight: 120, defaultColor: 'var(--mw-info)' },
    { type: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" />, category: 'zones', defaultWidth: 140, defaultHeight: 100, defaultColor: 'var(--mw-error)' },
  ],
  infrastructure: [
    { type: 'wall', label: 'Wall', icon: <Square className="w-4 h-4" />, category: 'infrastructure', defaultWidth: 200, defaultHeight: 10, defaultColor: 'var(--neutral-600)' },
    { type: 'door', label: 'Door', icon: <DoorOpen className="w-4 h-4" />, category: 'infrastructure', defaultWidth: 60, defaultHeight: 10, defaultColor: 'var(--neutral-500)' },
    { type: 'aisle', label: 'Aisle', icon: <MoveHorizontal className="w-4 h-4" />, category: 'infrastructure', defaultWidth: 200, defaultHeight: 40, defaultColor: 'var(--neutral-300)' },
    { type: 'conveyor', label: 'Conveyor', icon: <ArrowRightLeft className="w-4 h-4" />, category: 'infrastructure', defaultWidth: 200, defaultHeight: 30, defaultColor: 'var(--neutral-500)' },
    { type: 'floor', label: 'Floor', icon: <LayoutGrid className="w-4 h-4" />, category: 'infrastructure', defaultWidth: 400, defaultHeight: 400, defaultColor: 'var(--neutral-400)' },
  ],
  people: [
    { type: 'operator', label: 'Operator Station', icon: <User className="w-4 h-4" />, category: 'people', defaultWidth: 40, defaultHeight: 40, defaultColor: 'var(--mw-blue)' },
    { type: 'supervisor', label: 'Supervisor Station', icon: <Shield className="w-4 h-4" />, category: 'people', defaultWidth: 40, defaultHeight: 40, defaultColor: 'var(--mw-amber)' },
  ],
  'text-shapes': [
    { type: 'text', label: 'Text Label', icon: <Type className="w-4 h-4" />, category: 'text-shapes', defaultWidth: 120, defaultHeight: 40, defaultColor: 'var(--neutral-900)' },
    { type: 'rectangle', label: 'Rectangle', icon: <RectangleHorizontal className="w-4 h-4" />, category: 'text-shapes', defaultWidth: 120, defaultHeight: 80, defaultColor: 'var(--neutral-300)' },
    { type: 'circle-shape', label: 'Circle', icon: <Circle className="w-4 h-4" />, category: 'text-shapes', defaultWidth: 80, defaultHeight: 80, defaultColor: 'var(--neutral-300)' },
    { type: 'triangle-shape', label: 'Triangle', icon: <Triangle className="w-4 h-4" />, category: 'text-shapes', defaultWidth: 100, defaultHeight: 80, defaultColor: 'var(--neutral-300)' },
  ],
};

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  machines: 'Machines',
  zones: 'Zones',
  infrastructure: 'Infra',
  people: 'People',
  'text-shapes': 'Text',
};

const OPERATORS = ['Unassigned', 'John Smith', 'Sarah Lee', 'Mike Chen', 'Emma Davis', 'Tom Wilson'];

// ---------------------------------------------------------------------------
// Mock factory layout
// ---------------------------------------------------------------------------

function createMockLayout(): FactoryElement[] {
  return [
    { id: 'zone-raw', type: 'storage', category: 'zones', name: 'Raw Material Storage', x: 40, y: 40, width: 240, height: 180, color: 'var(--mw-amber)', rotation: 0 },
    { id: 'zone-finished', type: 'storage', category: 'zones', name: 'Finished Goods', x: 1300, y: 40, width: 260, height: 200, color: 'var(--mw-success)', rotation: 0 },
    { id: 'zone-loading', type: 'loading-dock', category: 'zones', name: 'Loading Dock', x: 1300, y: 800, width: 260, height: 160, color: 'var(--mw-success)', rotation: 0 },
    { id: 'zone-qc', type: 'quality-lab', category: 'zones', name: 'Quality Lab', x: 1040, y: 40, width: 200, height: 160, color: 'var(--mw-info)', rotation: 0 },
    { id: 'cnc-1', type: 'cnc', category: 'machines', name: 'CNC Machine #1', x: 400, y: 100, width: 120, height: 80, color: 'var(--neutral-400)', rotation: 0, status: 'Active', operator: 'John Smith' },
    { id: 'cnc-2', type: 'cnc', category: 'machines', name: 'CNC Machine #2', x: 400, y: 240, width: 120, height: 80, color: 'var(--neutral-400)', rotation: 0, status: 'Active', operator: 'Sarah Lee' },
    { id: 'laser-1', type: 'laser', category: 'machines', name: 'Laser Cutter #1', x: 600, y: 100, width: 140, height: 80, color: 'var(--neutral-400)', rotation: 0, status: 'Active', operator: 'Mike Chen' },
    { id: 'press-1', type: 'press', category: 'machines', name: 'Press Brake #1', x: 600, y: 240, width: 100, height: 80, color: 'var(--neutral-400)', rotation: 0, status: 'Maintenance' },
    { id: 'op-1', type: 'operator', category: 'people', name: 'Station A', x: 380, y: 200, width: 40, height: 40, color: 'var(--mw-blue)', rotation: 0 },
    { id: 'op-2', type: 'operator', category: 'people', name: 'Station B', x: 560, y: 200, width: 40, height: 40, color: 'var(--mw-blue)', rotation: 0 },
    { id: 'op-3', type: 'operator', category: 'people', name: 'Station C', x: 740, y: 200, width: 40, height: 40, color: 'var(--mw-blue)', rotation: 0 },
  ];
}

// ---------------------------------------------------------------------------
// Helper: snap to grid
// ---------------------------------------------------------------------------

function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

let nextId = 100;
function generateId(): string {
  return `el-${Date.now()}-${nextId++}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ControlFactoryDesigner() {
  // Canvas state
  const [elements, setElements] = useState<FactoryElement[]>(createMockLayout);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ElementCategory>('machines');
  const [propertiesInSheet, setPropertiesInSheet] = useState(false);
  const navigate = useNavigate();

  const handleSendToProcessBuilder = useCallback(() => {
    if (elements.length === 0) {
      toast.error('No elements to send — add elements to the canvas first');
      return;
    }
    writeStorageValue('mw-factory-to-process', JSON.stringify(elements), 'session');
    toast.success('Factory layout sent to Process Builder');
    navigate('/control/process-builder?from=factory');
  }, [elements, navigate]);

  // Canvas panning
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Drag state
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Undo/Redo
  const [history, setHistory] = useState<HistoryState[]>([{ elements: createMockLayout(), selectedId: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId) ?? null,
    [elements, selectedId],
  );

  // ------------------------------------------------------------------
  // History helpers
  // ------------------------------------------------------------------

  const pushHistory = useCallback((newElements: FactoryElement[], newSelectedId: string | null) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, { elements: newElements, selectedId: newSelectedId }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const state = history[newIndex];
    setElements(state.elements);
    setSelectedId(state.selectedId);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const state = history[newIndex];
    setElements(state.elements);
    setSelectedId(state.selectedId);
  }, [history, historyIndex]);

  // ------------------------------------------------------------------
  // Element updates
  // ------------------------------------------------------------------

  const updateElement = useCallback((id: string, updates: Partial<FactoryElement>) => {
    setElements((prev) => {
      const next = prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
      pushHistory(next, selectedId);
      return next;
    });
  }, [pushHistory, selectedId]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== selectedId);
      pushHistory(next, null);
      return next;
    });
    setSelectedId(null);
  }, [selectedId, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const newEl: FactoryElement = {
      ...selectedElement,
      id: generateId(),
      name: `${selectedElement.name} (copy)`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    setElements((prev) => {
      const next = [...prev, newEl];
      pushHistory(next, newEl.id);
      return next;
    });
    setSelectedId(newEl.id);
  }, [selectedElement, pushHistory]);

  // ------------------------------------------------------------------
  // SVG coordinate helpers
  // ------------------------------------------------------------------

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const container = canvasContainerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // ------------------------------------------------------------------
  // Canvas drag (element move)
  // ------------------------------------------------------------------

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on middle-click or if we clicked the background
    if (e.button === 1 || (e.button === 0 && (e.target as SVGElement).getAttribute('data-canvas-bg') === 'true')) {
      if (e.button === 0 && (e.target as SVGElement).getAttribute('data-canvas-bg') === 'true') {
        setSelectedId(null);
      }
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      e.preventDefault();
    }
  }, [pan]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
      return;
    }

    if (dragging) {
      const pos = clientToSvg(e.clientX, e.clientY);
      let newX = pos.x - dragging.offsetX;
      let newY = pos.y - dragging.offsetY;
      if (snapEnabled) {
        newX = snapToGrid(newX, GRID_SIZE);
        newY = snapToGrid(newY, GRID_SIZE);
      }
      // Clamp to canvas
      newX = Math.max(0, Math.min(CANVAS_WIDTH - 20, newX));
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - 20, newY));
      setElements((prev) =>
        prev.map((el) => (el.id === dragging.id ? { ...el, x: newX, y: newY } : el)),
      );
    }
  }, [isPanning, dragging, clientToSvg, snapEnabled]);

  const handleCanvasMouseUp = useCallback(() => {
    if (dragging) {
      // Push history after drag completes
      setElements((prev) => {
        pushHistory(prev, selectedId);
        return prev;
      });
    }
    setIsPanning(false);
    setDragging(null);
  }, [dragging, pushHistory, selectedId]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, el: FactoryElement) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const pos = clientToSvg(e.clientX, e.clientY);
    setSelectedId(el.id);
    setDragging({ id: el.id, offsetX: pos.x - el.x, offsetY: pos.y - el.y });
  }, [clientToSvg]);

  // ------------------------------------------------------------------
  // Drop from palette
  // ------------------------------------------------------------------

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/factory-element');
    if (!data) return;
    const paletteItem: PaletteItem = JSON.parse(data);
    const pos = clientToSvg(e.clientX, e.clientY);
    let x = pos.x - paletteItem.defaultWidth / 2;
    let y = pos.y - paletteItem.defaultHeight / 2;
    if (snapEnabled) {
      x = snapToGrid(x, GRID_SIZE);
      y = snapToGrid(y, GRID_SIZE);
    }

    const newEl: FactoryElement = {
      id: generateId(),
      type: paletteItem.type,
      category: paletteItem.category,
      name: paletteItem.label,
      x,
      y,
      width: paletteItem.defaultWidth,
      height: paletteItem.defaultHeight,
      color: paletteItem.defaultColor,
      rotation: 0,
      ...(paletteItem.category === 'machines' ? { status: 'Idle' as MachineStatus, operator: 'Unassigned' } : {}),
      ...(paletteItem.type === 'text' ? { text: 'Label', fontSize: 14, fontWeight: 400, textAlign: 'left' as const } : {}),
      ...(paletteItem.category === 'text-shapes' && paletteItem.type !== 'text' ? { fillOpacity: 0.15, strokeWidth: 1.5, cornerRadius: 4 } : {}),
    };

    setElements((prev) => {
      const next = [...prev, newEl];
      pushHistory(next, newEl.id);
      return next;
    });
    setSelectedId(newEl.id);
  }, [clientToSvg, snapEnabled, pushHistory]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // ------------------------------------------------------------------
  // Zoom
  // ------------------------------------------------------------------

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
    }
  }, []);

  // ------------------------------------------------------------------
  // Keyboard
  // ------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteSelected();
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) || (e.key === 'y' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey) && selectedId) {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteSelected, undo, redo, duplicateSelected]);

  // ------------------------------------------------------------------
  // Save / Load / Export
  // ------------------------------------------------------------------

  const handleSave = useCallback(() => {
    const data = JSON.stringify({ elements, zoom, pan });
    writeStorageValue('mw-factory-layout', data);
    toast.success('Layout saved to local storage');
  }, [elements, zoom, pan]);

  const handleLoad = useCallback(() => {
    const raw = readStorageValue('mw-factory-layout');
    if (!raw) {
      toast.error('No saved layout found');
      return;
    }
    try {
      const data = JSON.parse(raw);
      setElements(data.elements);
      if (data.zoom) setZoom(data.zoom);
      if (data.pan) setPan(data.pan);
      pushHistory(data.elements, null);
      setSelectedId(null);
      toast.success('Layout loaded');
    } catch {
      toast.error('Failed to load layout');
    }
  }, [pushHistory]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ elements }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'factory-layout.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Layout exported');
  }, [elements]);

  // ------------------------------------------------------------------
  // Sorted elements: zones first (background), then others on top
  // ------------------------------------------------------------------

  const sortedElements = useMemo(() => {
    const categoryOrder: Record<ElementCategory, number> = { zones: 0, infrastructure: 1, 'text-shapes': 2, machines: 3, people: 4 };
    const paintOrder = (el: FactoryElement): number => {
      if (el.type === 'floor') return -1;
      return categoryOrder[el.category];
    };
    return [...elements].sort((a, b) => paintOrder(a) - paintOrder(b) || a.id.localeCompare(b.id));
  }, [elements]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* TOP TOOLBAR */}
      <TooltipProvider>
      <div className="flex h-12 items-center gap-2 border-b border-[var(--border)] bg-white px-3 dark:bg-neutral-800">
        <AnimatedCog className="h-4 w-4 text-[var(--mw-yellow-600)]" />
        <h1 className="mr-2 text-sm font-semibold text-foreground">Factory Designer</h1>
        <div className="h-5 w-px bg-[var(--border)]" />

        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleSave}><Save className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Save layout</TooltipContent>
        </Tooltip>
        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleLoad}><Upload className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Load layout</TooltipContent>
        </Tooltip>
        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleExport}><Download className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Export JSON</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-[var(--border)]" />

        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}><Undo2 className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Undo (Cmd+Z)</TooltipContent>
        </Tooltip>
        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo2 className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Redo (Cmd+Shift+Z)</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-[var(--border)]" />

        {selectedId && (
          <>
            <Tooltip sideOffset={6}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={duplicateSelected}><Copy className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Duplicate (Cmd+D)</TooltipContent>
            </Tooltip>
            <Tooltip sideOffset={6}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={deleteSelected}><Trash2 className="h-4 w-4 text-[var(--mw-error)]" /></Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Delete</TooltipContent>
            </Tooltip>
            <div className="h-5 w-px bg-[var(--border)]" />
          </>
        )}

        <div className="flex items-center gap-1.5">
          <Grid3x3 className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
          <span className="text-xs text-[var(--neutral-500)]">Grid</span>
          <Switch checked={showGrid} onCheckedChange={setShowGrid} />
        </div>

        <div className="flex items-center gap-1.5">
          <Magnet className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
          <span className="text-xs text-[var(--neutral-500)]">Snap</span>
          <Switch checked={snapEnabled} onCheckedChange={setSnapEnabled} />
        </div>

        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={handleSendToProcessBuilder}
              className="h-8 gap-1.5 bg-[var(--mw-mirage)] hover:bg-[var(--mw-mirage)]/90 text-white text-xs"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Send to Process Builder
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">
            Export layout as reference layer in Process Builder
          </TooltipContent>
        </Tooltip>

        <Tooltip sideOffset={6}>
          <TooltipTrigger asChild>
            <Button
              variant={propertiesInSheet ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPropertiesInSheet(p => !p)}
              className={propertiesInSheet ? 'h-8 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[#2C2C2C]' : 'h-8'}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">
            {propertiesInSheet ? 'Dock properties' : 'Undock properties'}
          </TooltipContent>
        </Tooltip>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip sideOffset={6}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={zoomOut}><ZoomOut className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Zoom out</TooltipContent>
          </Tooltip>
          <span className="min-w-[3rem] text-center text-xs tabular-nums text-foreground">{Math.round(zoom * 100)}%</span>
          <Tooltip sideOffset={6}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={zoomIn}><ZoomIn className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-md bg-[var(--mw-mirage)] px-2.5 py-1 text-xs text-white shadow-[var(--elevation-3)]">Zoom in</TooltipContent>
          </Tooltip>
        </div>
      </div>
      </TooltipProvider>

      {/* MAIN LAYOUT */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* LEFT SIDEBAR — Element Palette */}
        <ResizablePanel defaultSize={16} minSize={12} maxSize={25}>
          <div className="flex h-full flex-col border-r border-[var(--border)] bg-white dark:bg-neutral-800">
            <div className="border-b border-[var(--border)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Elements</p>
            </div>

            {/* Category tabs */}
            <div className="border-b border-[var(--border)] p-2">
              <ToggleGroup
                type="single"
                value={activeCategory}
                onValueChange={(val) => val && setActiveCategory(val as ElementCategory)}
                className="w-full flex-wrap"
                variant="outline"
              >
                {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((cat) => (
                  <ToggleGroupItem
                    key={cat}
                    value={cat}
                    className="flex-1 text-[10px] px-1.5 h-7 data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]"
                  >
                    {CATEGORY_LABELS[cat]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Draggable items */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {PALETTE_ITEMS[activeCategory].map((item) => (
                  <PaletteItemCard key={item.type} item={item} />
                ))}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* CENTER — SVG Canvas */}
        <ResizablePanel defaultSize={62}>
          <div
            ref={canvasContainerRef}
            className="relative h-full overflow-hidden bg-neutral-50 dark:bg-neutral-900"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onWheel={handleWheel}
            style={{ cursor: isPanning ? 'grabbing' : dragging ? 'move' : 'default' }}
          >
            <svg
              ref={svgRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
              className="select-none"
            >
              {/* Definitions */}
              <defs>
                {/* Grid pattern */}
                <pattern id="grid-dots" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="1" className="fill-neutral-300 dark:fill-neutral-600" />
                </pattern>
                {/* MD3 Elevation filters */}
                <filter id="fd-elevation-1" x="-10%" y="-10%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.08" />
                </filter>
                <filter id="fd-elevation-2" x="-10%" y="-10%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
                </filter>
                <filter id="selection-glow" x="-15%" y="-15%" width="140%" height="150%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--mw-yellow-400)" floodOpacity="0.6" />
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Canvas background */}
              <rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="fill-neutral-50 dark:fill-neutral-900"
                data-canvas-bg="true"
                rx={8}
              />

              {/* Grid */}
              {showGrid && (
                <rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill="url(#grid-dots)"
                  data-canvas-bg="true"
                  rx={8}
                />
              )}

              {/* Canvas border */}
              <rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill="none"
                className="stroke-neutral-200 dark:stroke-neutral-700"
                strokeWidth={2}
                rx={8}
                pointerEvents="none"
              />

              {/* Elements */}
              {sortedElements.map((el) => (
                <CanvasElement
                  key={el.id}
                  element={el}
                  isSelected={el.id === selectedId}
                  onMouseDown={handleElementMouseDown}
                />
              ))}
            </svg>

            {/* Drop hint overlay */}
            {elements.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Layout className="mx-auto mb-3 h-12 w-12 text-[var(--neutral-400)]" />
                  <p className="text-sm font-medium text-[var(--neutral-500)]">Drag elements from the palette to get started</p>
                </div>
              </div>
            )}

            {/* Floating bottom editing toolbar */}
            <AnimatePresence>
              {selectedElement && selectedElement.category === 'text-shapes' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 shadow-[var(--elevation-3)] dark:bg-neutral-800"
                >
                  {selectedElement.type === 'text' ? (
                    <>
                      <ToggleGroup
                        type="single"
                        value={String(selectedElement.fontSize || 14)}
                        onValueChange={(val) => val && updateElement(selectedElement.id, { fontSize: Number(val) })}
                        className="gap-0.5"
                      >
                        <ToggleGroupItem value="11" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">S</ToggleGroupItem>
                        <ToggleGroupItem value="14" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">M</ToggleGroupItem>
                        <ToggleGroupItem value="18" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">L</ToggleGroupItem>
                        <ToggleGroupItem value="24" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">XL</ToggleGroupItem>
                      </ToggleGroup>
                      <div className="h-4 w-px bg-[var(--border)]" />
                      <ToggleGroup
                        type="single"
                        value={String(selectedElement.fontWeight || 400)}
                        onValueChange={(val) => val && updateElement(selectedElement.id, { fontWeight: Number(val) })}
                        className="gap-0.5"
                      >
                        <ToggleGroupItem value="300" className="h-7 px-2 text-[10px] rounded-full font-light data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Light</ToggleGroupItem>
                        <ToggleGroupItem value="400" className="h-7 px-2 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Regular</ToggleGroupItem>
                        <ToggleGroupItem value="500" className="h-7 px-2 text-[10px] rounded-full font-medium data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Medium</ToggleGroupItem>
                        <ToggleGroupItem value="700" className="h-7 px-2 text-[10px] rounded-full font-bold data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">Bold</ToggleGroupItem>
                      </ToggleGroup>
                      <div className="h-4 w-px bg-[var(--border)]" />
                      <ToggleGroup
                        type="single"
                        value={selectedElement.textAlign || 'left'}
                        onValueChange={(val) => val && updateElement(selectedElement.id, { textAlign: val as 'left' | 'center' | 'right' })}
                        className="gap-0.5"
                      >
                        <ToggleGroupItem value="left" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">L</ToggleGroupItem>
                        <ToggleGroupItem value="center" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">C</ToggleGroupItem>
                        <ToggleGroupItem value="right" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">R</ToggleGroupItem>
                      </ToggleGroup>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-medium text-[var(--neutral-500)]">Fill</span>
                      <ToggleGroup
                        type="single"
                        value={String(Math.round((selectedElement.fillOpacity ?? 0.15) * 100))}
                        onValueChange={(val) => val && updateElement(selectedElement.id, { fillOpacity: Number(val) / 100 })}
                        className="gap-0.5"
                      >
                        <ToggleGroupItem value="0" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">0%</ToggleGroupItem>
                        <ToggleGroupItem value="25" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">25%</ToggleGroupItem>
                        <ToggleGroupItem value="50" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">50%</ToggleGroupItem>
                        <ToggleGroupItem value="100" className="h-7 w-9 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">100%</ToggleGroupItem>
                      </ToggleGroup>
                      <div className="h-4 w-px bg-[var(--border)]" />
                      <span className="text-[10px] font-medium text-[var(--neutral-500)]">Stroke</span>
                      <ToggleGroup
                        type="single"
                        value={String(selectedElement.strokeWidth ?? 1.5)}
                        onValueChange={(val) => val && updateElement(selectedElement.id, { strokeWidth: Number(val) })}
                        className="gap-0.5"
                      >
                        <ToggleGroupItem value="0" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">None</ToggleGroupItem>
                        <ToggleGroupItem value="1" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">1</ToggleGroupItem>
                        <ToggleGroupItem value="2" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">2</ToggleGroupItem>
                        <ToggleGroupItem value="4" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">4</ToggleGroupItem>
                      </ToggleGroup>
                      <div className="h-4 w-px bg-[var(--border)]" />
                      <span className="text-[10px] font-medium text-[var(--neutral-500)]">Radius</span>
                      <ToggleGroup
                        type="single"
                        value={String(selectedElement.cornerRadius ?? 4)}
                        onValueChange={(val) => val && updateElement(selectedElement.id, { cornerRadius: Number(val) })}
                        className="gap-0.5"
                      >
                        <ToggleGroupItem value="0" className="h-7 w-8 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">None</ToggleGroupItem>
                        <ToggleGroupItem value="4" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">SM</ToggleGroupItem>
                        <ToggleGroupItem value="8" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">MD</ToggleGroupItem>
                        <ToggleGroupItem value="16" className="h-7 w-7 text-[10px] rounded-full data-[state=on]:bg-[var(--mw-yellow-400)] data-[state=on]:text-[#2C2C2C]">LG</ToggleGroupItem>
                      </ToggleGroup>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ResizablePanel>

        {!propertiesInSheet && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={22} minSize={16} maxSize={30}>
              <div className="flex h-full flex-col border-l border-[var(--border)] bg-white dark:bg-neutral-800">
                <div className="border-b border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Properties</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {selectedElement ? (
                    <PropertiesPanel
                      element={selectedElement}
                      onUpdate={(updates) => updateElement(selectedElement.id, updates)}
                      onDelete={deleteSelected}
                      onDuplicate={duplicateSelected}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <ChevronRight className="mx-auto mb-2 h-8 w-8 text-[var(--neutral-300)] dark:text-neutral-600" />
                      <p className="text-sm text-[var(--neutral-500)]">Select an element to view properties</p>
                      <p className="mt-1 text-xs text-[var(--neutral-400)]">{elements.length} elements on canvas</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Sheet mode properties panel */}
      {propertiesInSheet && (
        <Sheet open={!!selectedElement} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
          <SheetPortal>
            <SheetOverlay className="bg-black/20" />
            <SheetContent
              side="right"
              className="w-[320px] bg-white dark:bg-neutral-800 border-l border-[var(--border)] p-0 flex flex-col z-50"
            >
              <SheetHeader className="border-b border-[var(--border)] p-4">
                <SheetTitle className="text-sm font-semibold text-foreground">Properties</SheetTitle>
                <SheetDescription className="text-xs text-[var(--neutral-500)]">Edit the selected element</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedElement && (
                  <PropertiesPanel
                    element={selectedElement}
                    onUpdate={(updates) => updateElement(selectedElement.id, updates)}
                    onDelete={deleteSelected}
                    onDuplicate={duplicateSelected}
                  />
                )}
              </div>
            </SheetContent>
          </SheetPortal>
        </Sheet>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Palette Item Card (draggable)
// ---------------------------------------------------------------------------

function PaletteItemCard({ item }: { item: PaletteItem }) {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Serialize without the React icon node
    const serializable = {
      type: item.type,
      label: item.label,
      category: item.category,
      defaultWidth: item.defaultWidth,
      defaultHeight: item.defaultHeight,
      defaultColor: item.defaultColor,
    };
    e.dataTransfer.setData('application/factory-element', JSON.stringify(serializable));
    e.dataTransfer.effectAllowed = 'copy';
  }, [item]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)] shadow-[var(--elevation-0)] hover:border-[var(--border)] hover:bg-[var(--neutral-100)] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:cursor-grabbing dark:hover:bg-neutral-700"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--neutral-100)] text-[var(--neutral-600)] dark:bg-neutral-700 dark:text-neutral-300">
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{item.label}</p>
        <p className="text-[10px] text-[var(--neutral-500)]">{item.defaultWidth} x {item.defaultHeight}</p>
      </div>
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Canvas Element Renderer
// ---------------------------------------------------------------------------

interface CanvasElementProps {
  element: FactoryElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, el: FactoryElement) => void;
}

function CanvasElement({ element, isSelected, onMouseDown }: CanvasElementProps) {
  const handleMouseDown = useCallback((e: React.MouseEvent) => onMouseDown(e, element), [element, onMouseDown]);

  const transform = element.rotation
    ? `rotate(${element.rotation} ${element.x + element.width / 2} ${element.y + element.height / 2})`
    : undefined;

  if (element.category === 'people') {
    // Render as circle
    const cx = element.x + element.width / 2;
    const cy = element.y + element.height / 2;
    const r = element.width / 2;

    return (
      <g
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
        transform={transform}
      >
        {/* Selection ring */}
        {isSelected && (
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="var(--mw-yellow-400)" strokeWidth={2.5} strokeDasharray="6 3" filter="url(#selection-glow)" />
        )}
        {/* Circle body */}
        <circle cx={cx} cy={cy} r={r} fill={element.color} fillOpacity={0.2} stroke={element.color} strokeWidth={1.5} />
        {/* Icon placeholder */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={14} fill={element.color}>
          <tspan>&#x1F464;</tspan>
        </text>
        {/* Label */}
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} className="fill-foreground" fontWeight={500}>
          {element.name}
        </text>
      </g>
    );
  }

  if (element.category === 'zones') {
    return (
      <g
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
        transform={transform}
      >
        {/* Selection ring */}
        {isSelected && (
          <rect
            x={element.x - 4}
            y={element.y - 4}
            width={element.width + 8}
            height={element.height + 8}
            fill="none"
            stroke="var(--mw-yellow-400)"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            rx={8}
            filter="url(#selection-glow)"
          />
        )}
        {/* Zone rect */}
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={element.color}
          fillOpacity={0.08}
          stroke={element.color}
          strokeWidth={1.5}
          strokeDasharray="8 4"
          rx={6}
        />
        {/* Zone label */}
        <text
          x={element.x + 10}
          y={element.y + 18}
          fontSize={11}
          fontWeight={600}
          fill={element.color}
        >
          {element.name}
        </text>
        <text
          x={element.x + 10}
          y={element.y + 32}
          fontSize={9}
          className="fill-[var(--neutral-500)]"
        >
          {element.width} x {element.height}
        </text>
      </g>
    );
  }

  if (element.category === 'infrastructure') {
    const isFloor = element.type === 'floor';
    return (
      <g
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
        transform={transform}
      >
        {isSelected && (
          <rect
            x={element.x - 3}
            y={element.y - 3}
            width={element.width + 6}
            height={element.height + 6}
            fill="none"
            stroke="var(--mw-yellow-400)"
            strokeWidth={2.5}
            rx={isFloor ? 6 : 2}
            filter="url(#selection-glow)"
          />
        )}
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={isFloor ? element.color : undefined}
          fillOpacity={isFloor ? 0.14 : undefined}
          className={isFloor ? undefined : 'fill-neutral-200 dark:fill-neutral-700'}
          stroke={element.color}
          strokeWidth={isFloor ? 1.5 : 1}
          strokeOpacity={isFloor ? 0.45 : 1}
          rx={isFloor ? 4 : 2}
        />
        {isFloor && (
          <text
            x={element.x + element.width / 2}
            y={element.y + element.height / 2 - 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={element.color}
            fillOpacity={0.85}
          >
            {element.name}
          </text>
        )}
        {isFloor && (
          <text
            x={element.x + element.width / 2}
            y={element.y + element.height / 2 + 10}
            textAnchor="middle"
            fontSize={9}
            className="fill-[var(--neutral-500)]"
          >
            {element.width} x {element.height}
          </text>
        )}
        {!isFloor && element.height > 15 && (
          <text
            x={element.x + element.width / 2}
            y={element.y + element.height / 2 + 3}
            textAnchor="middle"
            fontSize={9}
            className="fill-foreground"
            fontWeight={500}
          >
            {element.name}
          </text>
        )}
      </g>
    );
  }

  if (element.category === 'text-shapes') {
    if (element.type === 'text') {
      return (
        <g onMouseDown={handleMouseDown} style={{ cursor: 'move' }} transform={transform} filter={isSelected ? 'url(#selection-glow)' : 'url(#fd-elevation-1)'}>
          {isSelected && (
            <rect x={element.x - 3} y={element.y - 3} width={element.width + 6} height={element.height + 6} fill="none" stroke="var(--mw-yellow-400)" strokeWidth={2} strokeDasharray="4 2" rx={4} />
          )}
          <rect x={element.x} y={element.y} width={element.width} height={element.height} fill="transparent" rx={4} />
          <text
            x={element.textAlign === 'right' ? element.x + element.width - 6 : element.textAlign === 'center' ? element.x + element.width / 2 : element.x + 6}
            y={element.y + element.height / 2 + (element.fontSize || 14) / 3}
            textAnchor={element.textAlign === 'right' ? 'end' : element.textAlign === 'center' ? 'middle' : 'start'}
            fontSize={element.fontSize || 14}
            fontWeight={element.fontWeight || 400}
            className="fill-foreground"
          >
            {element.text || element.name}
          </text>
        </g>
      );
    }

    if (element.type === 'circle-shape') {
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      const r = Math.min(element.width, element.height) / 2;
      return (
        <g onMouseDown={handleMouseDown} style={{ cursor: 'move' }} transform={transform} filter={isSelected ? 'url(#selection-glow)' : 'url(#fd-elevation-1)'}>
          {isSelected && (
            <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="var(--mw-yellow-400)" strokeWidth={2} strokeDasharray="4 2" />
          )}
          <circle cx={cx} cy={cy} r={r} fill={element.color} fillOpacity={element.fillOpacity ?? 0.15} stroke={element.color} strokeWidth={element.strokeWidth ?? 1.5} rx={element.cornerRadius} />
        </g>
      );
    }

    if (element.type === 'triangle-shape') {
      const x = element.x;
      const y = element.y;
      const w = element.width;
      const h = element.height;
      const points = `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`;
      return (
        <g onMouseDown={handleMouseDown} style={{ cursor: 'move' }} transform={transform} filter={isSelected ? 'url(#selection-glow)' : 'url(#fd-elevation-1)'}>
          {isSelected && (
            <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} fill="none" stroke="var(--mw-yellow-400)" strokeWidth={2} strokeDasharray="4 2" rx={4} />
          )}
          <polygon points={points} fill={element.color} fillOpacity={element.fillOpacity ?? 0.15} stroke={element.color} strokeWidth={element.strokeWidth ?? 1.5} />
        </g>
      );
    }

    return (
      <g onMouseDown={handleMouseDown} style={{ cursor: 'move' }} transform={transform} filter={isSelected ? 'url(#selection-glow)' : 'url(#fd-elevation-1)'}>
        {isSelected && (
          <rect x={element.x - 3} y={element.y - 3} width={element.width + 6} height={element.height + 6} fill="none" stroke="var(--mw-yellow-400)" strokeWidth={2} strokeDasharray="4 2" rx={4} />
        )}
        <rect
          x={element.x} y={element.y} width={element.width} height={element.height}
          fill={element.color} fillOpacity={element.fillOpacity ?? 0.15}
          stroke={element.color} strokeWidth={element.strokeWidth ?? 1.5}
          rx={element.cornerRadius ?? 4}
        />
      </g>
    );
  }

  const statusColor =
    element.status === 'Active' ? 'var(--mw-success)' :
    element.status === 'Maintenance' ? 'var(--mw-error)' :
    'var(--neutral-500)';

  return (
    <g
      onMouseDown={handleMouseDown}
      style={{ cursor: 'move' }}
      transform={transform}
      filter={isSelected ? 'url(#selection-glow)' : 'url(#fd-elevation-1)'}
    >
      {isSelected && (
        <rect
          x={element.x - 4}
          y={element.y - 4}
          width={element.width + 8}
          height={element.height + 8}
          fill="none"
          stroke="var(--mw-yellow-400)"
          strokeWidth={2.5}
          rx={10}
        />
      )}
      <rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        className="fill-neutral-200 dark:fill-neutral-700"
        stroke={isSelected ? 'var(--mw-yellow-400)' : 'var(--border)'}
        strokeWidth={isSelected ? 0 : 1}
        rx={8}
      />
      {/* Status indicator dot */}
      {element.status && (
        <circle cx={element.x + element.width - 10} cy={element.y + 10} r={4} fill={statusColor} />
      )}
      {/* Machine label */}
      <text
        x={element.x + element.width / 2}
        y={element.y + element.height / 2 - 2}
        textAnchor="middle"
        fontSize={10}
        className="fill-foreground"
        fontWeight={600}
      >
        {element.name}
      </text>
      {/* Machine dimensions */}
      <text
        x={element.x + element.width / 2}
        y={element.y + element.height / 2 + 12}
        textAnchor="middle"
        fontSize={8}
        className="fill-[var(--neutral-500)]"
      >
        {element.status ?? element.type}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Properties Panel
// ---------------------------------------------------------------------------

interface PropertiesPanelProps {
  element: FactoryElement;
  onUpdate: (updates: Partial<FactoryElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function PropertiesPanel({ element, onUpdate, onDelete, onDuplicate }: PropertiesPanelProps) {
  return (
    <div className="space-y-4">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-600)] dark:bg-neutral-700 dark:text-neutral-300">
          {element.category}
        </span>
        <span className="text-xs text-[var(--neutral-500)]">{element.type}</span>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--neutral-500)]">Name</Label>
        <Input
          value={element.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--neutral-500)]">X</Label>
          <Input
            type="number"
            value={element.x}
            onChange={(e) => onUpdate({ x: Number(e.target.value) })}
            className="h-8 text-sm tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--neutral-500)]">Y</Label>
          <Input
            type="number"
            value={element.y}
            onChange={(e) => onUpdate({ y: Number(e.target.value) })}
            className="h-8 text-sm tabular-nums"
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--neutral-500)]">Width</Label>
          <Input
            type="number"
            value={element.width}
            onChange={(e) => onUpdate({ width: Math.max(10, Number(e.target.value)) })}
            className="h-8 text-sm tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--neutral-500)]">Height</Label>
          <Input
            type="number"
            value={element.height}
            onChange={(e) => onUpdate({ height: Math.max(10, Number(e.target.value)) })}
            className="h-8 text-sm tabular-nums"
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-[var(--neutral-500)]">Rotation</Label>
          <span className="text-xs tabular-nums text-[var(--neutral-500)]">{element.rotation}deg</span>
        </div>
        <Slider
          value={[element.rotation]}
          min={0}
          max={360}
          step={15}
          onValueChange={([v]) => onUpdate({ rotation: v })}
          className="py-1"
        />
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--neutral-500)]">Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-[var(--border)] bg-transparent"
          />
          <Input
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 flex-1 text-sm tabular-nums"
          />
        </div>
      </div>

      {/* Machine-specific properties */}
      {element.category === 'machines' && (
        <>
          <div className="h-px bg-[var(--border)]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)]">Machine Properties</p>

          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--neutral-500)]">Status</Label>
            <Select
              value={element.status ?? 'Idle'}
              onValueChange={(v) => onUpdate({ status: v as MachineStatus })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--mw-success)]" /> Active
                  </span>
                </SelectItem>
                <SelectItem value="Maintenance">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--mw-error)]" /> Maintenance
                  </span>
                </SelectItem>
                <SelectItem value="Idle">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--neutral-500)]" /> Idle
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--neutral-500)]">Assigned Operator</Label>
            <Select
              value={element.operator ?? 'Unassigned'}
              onValueChange={(v) => onUpdate({ operator: v })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((op) => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="h-px bg-[var(--border)]" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onDuplicate} className="flex-1 text-xs">
          <Copy className="mr-1 h-3.5 w-3.5" /> Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="flex-1 text-xs text-[var(--mw-error)]">
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
