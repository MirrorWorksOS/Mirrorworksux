/**
 * Welcome Dashboard - Homepage with module overview
 */

import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Kanban } from '@/components/animate-ui/icons/kanban';
import { ChartSpline } from '@/components/animate-ui/icons/chart-spline';
import { List } from '@/components/animate-ui/icons/list';
import { Cog } from '@/components/animate-ui/icons/cog';
import { Forklift } from '@/components/animate-ui/icons/forklift';
import { CircuitBoard } from '@/components/animate-ui/icons/circuit-board';
import { Blocks } from '@/components/animate-ui/icons/blocks';
import { Route } from '@/components/animate-ui/icons/route';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { designSystem } from '../lib/design-system';

const { animationVariants, colors } = designSystem;

/** Manufacturing lifecycle order. Icons: shadcn registry @animate-ui (https://animate-ui.com/docs). */
const modules = [
  {
    name: 'Sell',
    Icon: Kanban,
    path: '/sell',
    description: 'CRM, Opportunities, Orders, Invoices',
    count: 8,
  },
  {
    name: 'Plan',
    Icon: List,
    path: '/plan',
    description: 'Production Planning, Scheduling, MRP',
    count: 6,
  },
  {
    name: 'Make',
    Icon: CircuitBoard,
    path: '/make',
    description: 'Manufacturing, Shop Floor, Andon Board',
    count: 3,
  },
  {
    name: 'Ship',
    Icon: Forklift,
    path: '/ship',
    description: 'Logistics, Tracking, Fulfilment',
    count: 9,
  },
  {
    name: 'Book',
    Icon: ChartSpline,
    path: '/book',
    description: 'Finance, Budgets, Job Costs',
    count: 12,
  },
  {
    name: 'Buy',
    Icon: Blocks,
    path: '/buy',
    description: 'Purchasing, Suppliers, Requisitions',
    count: 11,
  },
  {
    name: 'Control',
    Icon: Cog,
    path: '/control',
    description: 'Admin, Master Data, Settings',
    count: 8,
  },
  {
    name: 'Design',
    Icon: Route,
    path: '/design',
    description: 'Factory Layout, Process Builder',
    count: 4,
  },
];

export function WelcomeDashboard() {
  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      variants={animationVariants.stagger} 
      className="p-8 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[48px] tracking-tight text-[#1A2732] font-bold mb-2">
          Alliance Metal
        </h1>
        <p className="text-[18px] text-[#737373]">
          MirrorWorks Smart FactoryOS - Complete Manufacturing ERP
        </p>
      </div>

      {/* Stats Banner */}
      <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-[#E5E5E5]">
          <div className="pr-6">
            <p className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">Total modules</p>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">8</p>
          </div>
          <div className="px-6">
            <p className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">Total components</p>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">50</p>
          </div>
          <div className="px-6">
            <p className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">Build progress</p>
            <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">100%</p>
          </div>
          <div className="pl-6">
            <p className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#737373] mb-1">Status</p>
            <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0 text-[13px] font-medium px-3 py-1 rounded">Complete</Badge>
          </div>
        </div>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, idx) => {
          const Icon = module.Icon;
          return (
            <motion.div key={module.name} variants={animationVariants.listItem} custom={idx}>
              <Link to={module.path}>
                <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: colors.yellow }}
                    >
                      <Icon className="w-6 h-6 text-[#2C2C2C]" animateOnHover />
                    </div>
                    <Badge className="bg-[#F5F5F5] text-[#525252] border-0 text-xs">
                      {module.count} components
                    </Badge>
                  </div>
                  <h3 className="font-['Geist:SemiBold',sans-serif] text-[20px] font-semibold text-[#0A0A0A] mb-2">
                    {module.name}
                  </h3>
                  <p className="text-sm text-[#737373] mb-4 min-h-[40px]">
                    {module.description}
                  </p>
                  <div className="flex items-center text-[#0052CC] text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-0 transition-all" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <h4 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A] mb-2">
            🚀 Quick Start
          </h4>
          <p className="text-sm text-[#737373]">
            Explore the modules using the sidebar or click any module card above.
          </p>
        </Card>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <h4 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A] mb-2">
            📊 Design System
          </h4>
          <p className="text-sm text-[#737373]">
            MW Yellow (#FFCF4B), Roboto Mono for numbers, sharp corners, clean borders.
          </p>
        </Card>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <h4 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A] mb-2">
            ⚡ Touch Optimized
          </h4>
          <p className="text-sm text-[#737373]">
            80px+ touch targets for gloved hands, Material 3 principles.
          </p>
        </Card>
      </div>
    </motion.div>
  );
}