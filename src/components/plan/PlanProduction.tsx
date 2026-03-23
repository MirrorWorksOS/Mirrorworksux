import React, { useState } from 'react';
import { 
  ChevronDown,
  Plus,
  Download,
  Share2,
  Eye,
  Rotate3D,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Move,
  RotateCcw,
  Box
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import mirrorViewImage from "figma:asset/cab19a31e625cf953e80c989d5be48a8aab5b08c.png";

// --- Types ---

interface Product {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  status: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

interface Activity {
  operation: string;
  workStation: string;
  operator: string;
  priority: number;
  completedQty: number;
  totalQty: number;
  timeEstimate: string;
}

// --- Mock Data ---

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sliding brace',
    partNumber: 'SB-001',
    quantity: 4,
    status: 'In Progress',
    priority: 'high',
    dueDate: '2026-03-25'
  },
  {
    id: '2',
    name: 'Angle 50x50',
    partNumber: 'A50-001',
    quantity: 8,
    status: 'Pending',
    priority: 'medium',
    dueDate: '2026-03-26'
  },
  {
    id: '3',
    name: 'Manifold bracket',
    partNumber: 'MB-003',
    quantity: 2,
    status: 'Completed',
    priority: 'low',
    dueDate: '2026-03-24'
  }
];

const ACTIVITIES: Activity[] = [
  { operation: 'Laser Cut', workStation: 'Amada Ensis', operator: 'Elena Rodriguez', priority: 1, completedQty: 45, totalQty: 100, timeEstimate: '2.5h' },
  { operation: 'Bend', workStation: 'TruBend 5000', operator: 'Unassigned', priority: 2, completedQty: 0, totalQty: 100, timeEstimate: '3h' },
  { operation: 'Weld Assembly', workStation: 'Weld Station A', operator: 'David Miller', priority: 3, completedQty: 0, totalQty: 50, timeEstimate: '4h' },
  { operation: 'Quality Inspection', workStation: 'QC Station', operator: 'Sarah Chen', priority: 4, completedQty: 0, totalQty: 50, timeEstimate: '1h' },
  { operation: 'Powder Coating', workStation: 'Paint Booth', operator: 'Unassigned', priority: 5, completedQty: 0, totalQty: 50, timeEstimate: '2h' }
];

// --- Components ---

const ProductRow = ({ product }: { product: Product }) => {
  const priorityColors = {
    high: 'bg-[var(--mw-error)]',
    medium: 'bg-[var(--mw-yellow-400)]',
    low: 'bg-[var(--mw-green)]'
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] hover:bg-[var(--accent)] transition-colors items-center">
      <div className="col-span-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${priorityColors[product.priority]}`} />
          <div>
            <p className=" text-sm font-semibold text-[var(--mw-mirage)]">
              {product.name}
            </p>
            <p className=" text-xs text-[var(--neutral-500)]">
              {product.partNumber}
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <span className="inline-flex items-center justify-center h-6 px-3 bg-[var(--neutral-100)] rounded-full tabular-nums text-xs font-medium text-[var(--mw-mirage)]">
          {product.quantity} units
        </span>
      </div>
      <div className="col-span-2 text-center">
        <span className=" text-sm text-[var(--mw-mirage)]">
          {product.status}
        </span>
      </div>
      <div className="col-span-2 text-center">
        <span className=" text-sm text-[var(--neutral-500)]">
          {new Date(product.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--neutral-100)] transition-colors">
          <Eye className="w-4 h-4 text-[var(--neutral-500)]" />
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--neutral-100)] transition-colors">
          <ChevronDown className="w-4 h-4 text-[var(--neutral-500)]" />
        </button>
      </div>
    </div>
  );
};

const MirrorView3D = () => {
  const [activeTab, setActiveTab] = useState('sliding-brace');

  const parts = [
    { id: 'sliding-brace', name: 'Sliding brace' },
    { id: 'angle-50x50', name: 'Angle 50x50' },
    { id: 'manifold-bracket', name: 'Manifold bracket' }
  ];

  return (
    <div className="bg-white rounded-[10px] border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="pt-6 px-6 pb-4">
        <h2 className=" text-2xl font-semibold text-[var(--mw-mirage)] tracking-[-0.4px] mb-1">
          MirrorView
        </h2>
        <p className=" text-sm text-[var(--neutral-500)]">
          3D part visualisation
        </p>
      </div>

      {/* Part Tabs */}
      <div className="px-6 pb-4">
        <div className="bg-[var(--neutral-100)] rounded-[10px] p-1 inline-flex gap-1 w-full">
          {parts.map((part) => (
            <button
              key={part.id}
              onClick={() => setActiveTab(part.id)}
              className={`
                flex-1 h-8 rounded-[8px]  text-sm font-medium
                transition-all
                ${activeTab === part.id
                  ? 'bg-white text-[var(--mw-mirage)] shadow-sm'
                  : 'text-[var(--neutral-500)] hover:text-[var(--mw-mirage)]'
                }
              `}
            >
              {part.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="px-6 pb-6">
        <div className="relative bg-[var(--neutral-100)] rounded-[10px] overflow-hidden aspect-[16/10]">
          {/* 3D Model Image */}
          <img
            src={mirrorViewImage}
            alt="3D Model View"
            className="w-full h-full object-contain"
          />

          {/* Viewer Controls Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <Rotate3D className="w-4 h-4 text-[var(--mw-mirage)]" />
            </button>
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <ZoomIn className="w-4 h-4 text-[var(--mw-mirage)]" />
            </button>
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <ZoomOut className="w-4 h-4 text-[var(--mw-mirage)]" />
            </button>
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <Maximize2 className="w-4 h-4 text-[var(--mw-mirage)]" />
            </button>
          </div>

          {/* View Controls Bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-[10px] px-4 py-2 flex items-center gap-4 shadow-sm">
            <button className="flex items-center gap-2 text-[var(--mw-mirage)] hover:text-[var(--neutral-500)] transition-colors">
              <Box className="w-4 h-4" />
              <span className=" text-xs font-medium">Home</span>
            </button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <button className="flex items-center gap-2 text-[var(--mw-mirage)] hover:text-[var(--neutral-500)] transition-colors">
              <Grid3x3 className="w-4 h-4" />
              <span className=" text-xs font-medium">Top</span>
            </button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <button className="flex items-center gap-2 text-[var(--mw-mirage)] hover:text-[var(--neutral-500)] transition-colors">
              <Move className="w-4 h-4" />
              <span className=" text-xs font-medium">Explode</span>
            </button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <button className="flex items-center gap-2 text-[var(--mw-mirage)] hover:text-[var(--neutral-500)] transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className=" text-xs font-medium">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivitiesTable = () => {
  return (
    <div className="bg-white rounded-[10px] border border-[var(--border)] overflow-hidden mt-6">
      {/* Header */}
      <div className="pt-6 px-6 pb-4">
        <h2 className=" text-2xl font-semibold text-[var(--mw-mirage)] tracking-[-0.4px] mb-1">
          Instructions & Activities
        </h2>
        <p className=" text-sm text-[var(--neutral-500)]">
          Manufacturing instructions
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--neutral-100)] border-y border-[var(--border)]">
            <div className="col-span-3  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Operation
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Work Station
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Operator
            </div>
            <div className="col-span-1  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-center">
              Priority
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-center">
              Progress
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-right">
              Time Estimate
            </div>
          </div>

          {/* Table Rows */}
          {ACTIVITIES.map((activity, index) => {
            const progress = (activity.completedQty / activity.totalQty) * 100;
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] hover:bg-[var(--accent)] transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className=" text-sm font-semibold text-[var(--mw-mirage)]">
                    {activity.operation}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className=" text-sm text-[var(--mw-mirage)]">
                    {activity.workStation}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className=" text-sm text-[var(--neutral-500)]">
                    {activity.operator}
                  </p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--neutral-100)] rounded-full tabular-nums text-xs font-bold text-[var(--mw-mirage)]">
                    {activity.priority}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--mw-yellow-400)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-xs font-medium text-[var(--mw-mirage)]">
                      {activity.completedQty}/{activity.totalQty}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="tabular-nums text-sm font-medium text-[var(--mw-mirage)]">
                    {activity.timeEstimate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export function PlanProduction() {
  return (
    <div className="min-h-screen bg-[var(--neutral-100)] p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className=" text-[20px] font-semibold text-[var(--mw-mirage)]">
                Job Name
              </h1>
              <span className="inline-flex items-center h-6 px-2 bg-[var(--neutral-100)] rounded-[8px]  text-xs font-semibold text-[var(--neutral-900)]">
                New
              </span>
              <span className="inline-flex items-center h-6 px-2 bg-[var(--mw-error-600)] rounded-[8px]  text-xs font-semibold text-white">
                Urgent
              </span>
            </div>
            <p className=" text-sm text-[var(--neutral-500)]">
              Manufacturing job details and production tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 flex items-center gap-2 bg-[var(--neutral-100)] rounded-[8px]  text-sm font-medium text-[var(--neutral-900)] hover:bg-[var(--border)] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="h-9 px-4 flex items-center gap-2 bg-[var(--neutral-100)] rounded-[8px]  text-sm font-medium text-[var(--neutral-900)] hover:bg-[var(--border)] transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-[10px] border border-[var(--border)] overflow-hidden mb-6">
          {/* Header */}
          <div className="pt-6 px-6 pb-4">
            <h2 className=" text-2xl font-semibold text-[var(--mw-mirage)] tracking-[-0.4px] mb-1">
              Products
            </h2>
            <p className=" text-sm text-[var(--neutral-500)]">
              Components and assemblies in this job
            </p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--neutral-100)] border-y border-[var(--border)]">
            <div className="col-span-4  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Product
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-center">
              Quantity
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-center">
              Status
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-center">
              Due Date
            </div>
            <div className="col-span-2  text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider text-right">
              Actions
            </div>
          </div>

          {/* Table Rows */}
          {PRODUCTS.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>

        {/* MirrorView 3D Viewer */}
        <MirrorView3D />

        {/* Activities Table */}
        <ActivitiesTable />
      </div>
    </div>
  );
}
