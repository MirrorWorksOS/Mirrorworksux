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
    high: 'bg-[#EF4444]',
    medium: 'bg-[#FFCF4B]',
    low: 'bg-[#4CAF50]'
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors items-center">
      <div className="col-span-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${priorityColors[product.priority]}`} />
          <div>
            <p className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
              {product.name}
            </p>
            <p className="font-['Geist:Regular',sans-serif] text-[12px] text-[#737373]">
              {product.partNumber}
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <span className="inline-flex items-center justify-center h-6 px-3 bg-[#F5F5F5] rounded-full font-['Roboto_Mono:Medium',sans-serif] text-[11px] font-medium text-[#0A0A0A]">
          {product.quantity} units
        </span>
      </div>
      <div className="col-span-2 text-center">
        <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#0A0A0A]">
          {product.status}
        </span>
      </div>
      <div className="col-span-2 text-center">
        <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
          {new Date(product.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors">
          <Eye className="w-4 h-4 text-[#737373]" />
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors">
          <ChevronDown className="w-4 h-4 text-[#737373]" />
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
    <div className="bg-white rounded-[10px] border border-[#E5E5E5] overflow-hidden">
      {/* Header */}
      <div className="pt-6 px-6 pb-4">
        <h2 className="font-['Geist:SemiBold',sans-serif] text-[24px] font-semibold text-[#0A0A0A] tracking-[-0.4px] mb-1">
          MirrorView
        </h2>
        <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
          3D part visualisation
        </p>
      </div>

      {/* Part Tabs */}
      <div className="px-6 pb-4">
        <div className="bg-[#F5F5F5] rounded-[10px] p-1 inline-flex gap-1 w-full">
          {parts.map((part) => (
            <button
              key={part.id}
              onClick={() => setActiveTab(part.id)}
              className={`
                flex-1 h-8 rounded-[8px] font-['Geist:Medium',sans-serif] text-[14px] font-medium
                transition-all
                ${activeTab === part.id
                  ? 'bg-white text-[#0A0A0A] shadow-sm'
                  : 'text-[#737373] hover:text-[#0A0A0A]'
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
        <div className="relative bg-[#F5F5F5] rounded-[10px] overflow-hidden aspect-[16/10]">
          {/* 3D Model Image */}
          <img
            src={mirrorViewImage}
            alt="3D Model View"
            className="w-full h-full object-contain"
          />

          {/* Viewer Controls Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <Rotate3D className="w-4 h-4 text-[#0A0A0A]" />
            </button>
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <ZoomIn className="w-4 h-4 text-[#0A0A0A]" />
            </button>
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <ZoomOut className="w-4 h-4 text-[#0A0A0A]" />
            </button>
            <button className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <Maximize2 className="w-4 h-4 text-[#0A0A0A]" />
            </button>
          </div>

          {/* View Controls Bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-[10px] px-4 py-2 flex items-center gap-4 shadow-sm">
            <button className="flex items-center gap-2 text-[#0A0A0A] hover:text-[#737373] transition-colors">
              <Box className="w-4 h-4" />
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium">Home</span>
            </button>
            <div className="w-px h-4 bg-[#E5E5E5]" />
            <button className="flex items-center gap-2 text-[#0A0A0A] hover:text-[#737373] transition-colors">
              <Grid3x3 className="w-4 h-4" />
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium">Top</span>
            </button>
            <div className="w-px h-4 bg-[#E5E5E5]" />
            <button className="flex items-center gap-2 text-[#0A0A0A] hover:text-[#737373] transition-colors">
              <Move className="w-4 h-4" />
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium">Explode</span>
            </button>
            <div className="w-px h-4 bg-[#E5E5E5]" />
            <button className="flex items-center gap-2 text-[#0A0A0A] hover:text-[#737373] transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivitiesTable = () => {
  return (
    <div className="bg-white rounded-[10px] border border-[#E5E5E5] overflow-hidden mt-6">
      {/* Header */}
      <div className="pt-6 px-6 pb-4">
        <h2 className="font-['Geist:SemiBold',sans-serif] text-[24px] font-semibold text-[#0A0A0A] tracking-[-0.4px] mb-1">
          Instructions & Activities
        </h2>
        <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
          Manufacturing instructions
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#FAFAFA] border-y border-[#E5E5E5]">
            <div className="col-span-3 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider">
              Operation
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider">
              Work Station
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider">
              Operator
            </div>
            <div className="col-span-1 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-center">
              Priority
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-center">
              Progress
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-right">
              Time Estimate
            </div>
          </div>

          {/* Table Rows */}
          {ACTIVITIES.map((activity, index) => {
            const progress = (activity.completedQty / activity.totalQty) * 100;
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">
                    {activity.operation}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#0A0A0A]">
                    {activity.workStation}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
                    {activity.operator}
                  </p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#F5F5F5] rounded-full font-['Roboto_Mono:Bold',sans-serif] text-[11px] font-bold text-[#0A0A0A]">
                    {activity.priority}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFCF4B]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-['Roboto_Mono:Medium',sans-serif] text-[11px] font-medium text-[#0A0A0A]">
                      {activity.completedQty}/{activity.totalQty}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-['Roboto_Mono:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A]">
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
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-['Geist:SemiBold',sans-serif] text-[20px] font-semibold text-[#0A0A0A]">
                Job Name
              </h1>
              <span className="inline-flex items-center h-6 px-2 bg-[#F5F5F5] rounded-[8px] font-['Geist:SemiBold',sans-serif] text-[12px] font-semibold text-[#171717]">
                New
              </span>
              <span className="inline-flex items-center h-6 px-2 bg-[#DC2626] rounded-[8px] font-['Geist:SemiBold',sans-serif] text-[12px] font-semibold text-white">
                Urgent
              </span>
            </div>
            <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
              Manufacturing job details and production tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 flex items-center gap-2 bg-[#F5F5F5] rounded-[8px] font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#171717] hover:bg-[#E5E5E5] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="h-9 px-4 flex items-center gap-2 bg-[#F5F5F5] rounded-[8px] font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#171717] hover:bg-[#E5E5E5] transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-[10px] border border-[#E5E5E5] overflow-hidden mb-6">
          {/* Header */}
          <div className="pt-6 px-6 pb-4">
            <h2 className="font-['Geist:SemiBold',sans-serif] text-[24px] font-semibold text-[#0A0A0A] tracking-[-0.4px] mb-1">
              Products
            </h2>
            <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
              Components and assemblies in this job
            </p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#FAFAFA] border-y border-[#E5E5E5]">
            <div className="col-span-4 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider">
              Product
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-center">
              Quantity
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-center">
              Status
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-center">
              Due Date
            </div>
            <div className="col-span-2 font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider text-right">
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
