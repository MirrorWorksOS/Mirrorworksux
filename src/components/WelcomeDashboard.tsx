/**
 * Welcome Dashboard - Homepage with module overview
 * Updated: warm cream palette, large display heading, metric pills, rounded cards
 */

import React from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Clock,
  Box,
  Package,
  BookOpen,
  Settings,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { designSystem } from '../lib/design-system';

const { animationVariants, colors } = designSystem;

const modules: { name: string; Icon: LucideIcon; path: string; description: string; count: number }[] = [
  {
    name: 'Sell',
    Icon: TrendingUp,
    path: '/sell',
    description: 'CRM, Opportunities, Orders, Invoices',
    count: 8,
  },
  {
    name: 'Plan',
    Icon: Clock,
    path: '/plan',
    description: 'Production Planning, Scheduling, MRP',
    count: 6,
  },
  {
    name: 'Make',
    Icon: Box,
    path: '/make',
    description: 'Manufacturing, Shop Floor, Andon Board',
    count: 3,
  },
  {
    name: 'Ship',
    Icon: Package,
    path: '/ship',
    description: 'Logistics, Tracking, Fulfilment',
    count: 9,
  },
  {
    name: 'Book',
    Icon: BookOpen,
    path: '/book',
    description: 'Finance, Budgets, Job Costs',
    count: 12,
  },
  {
    name: 'Buy',
    Icon: ShoppingCart,
    path: '/buy',
    description: 'Purchasing, Suppliers, Requisitions',
    count: 11,
  },
  {
    name: 'Control',
    Icon: Settings,
    path: '/control',
    description: 'Admin, Master Data, Settings',
    count: 8,
  },
  {
    name: 'Design',
    Icon: Pencil,
    path: '/design',
    description: 'Factory Layout, Process Builder',
    count: 4,
  },
];

const stats = [
  { label: 'Modules', value: '8', trend: null },
  { label: 'Components', value: '50', trend: null },
  { label: 'Progress', value: '100%', trend: null },
];

export function WelcomeDashboard() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-8 max-w-[1400px] mx-auto"
    >
      {/* Hero Header — large display text matching reference */}
      <div className="mb-8">
        <h1 className="text-[42px] tracking-tight text-[#1A2732] font-bold mb-2">
          Welcome in, Alliance Metal
        </h1>
        <p className="text-[17px] text-[#737373]">
          MirrorWorks Smart FactoryOS — Complete Manufacturing ERP
        </p>
      </div>

      {/* Stats Row — pill-style metric cards like reference */}
      <div className="flex items-center gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-2xl px-5 py-3 shadow-sm"
          >
            <span className=" text-[24px] font-semibold text-[#1A2732]">{stat.value}</span>
            <span className="text-[13px] text-[#737373] font-medium">{stat.label}</span>
          </div>
        ))}
        <Badge className="bg-[#FFCF4B]/20 text-[#1A2732] border-0 text-[13px] font-medium px-4 py-2 rounded-full">
          Complete
        </Badge>
      </div>

      {/* Module Grid — rounded cards with warm hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((module, idx) => {
          const Icon = module.Icon;
          return (
            <motion.div key={module.name} variants={animationVariants.listItem} custom={idx}>
              <Link to={module.path}>
                <Card className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md hover:border-[#FFCF4B]/40 transition-all duration-200 group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: colors.yellow }}
                    >
                      <Icon className="w-6 h-6 text-[#1A2732]" />
                    </div>
                    <Badge className="bg-[#F5F5F5] text-[#525252] border-0 text-xs rounded-full">
                      {module.count} components
                    </Badge>
                  </div>
                  <h3 className="text-[18px] font-semibold text-[#1A2732] mb-2">
                    {module.name}
                  </h3>
                  <p className="text-sm text-[#737373] mb-4 min-h-[40px]">
                    {module.description}
                  </p>
                  <div className="flex items-center text-[#1A2732] text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-0 transition-all" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links — warm cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h4 className="text-[14px] font-semibold text-[#1A2732] mb-2">
            Quick Start
          </h4>
          <p className="text-sm text-[#737373]">
            Explore the modules using the sidebar or click any module card above.
          </p>
        </Card>
        <Card className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h4 className="text-[14px] font-semibold text-[#1A2732] mb-2">
            Design System
          </h4>
          <p className="text-sm text-[#737373]">
            MW Yellow (#FFCF4B), warm cream backgrounds, generous radii, Roboto Mono for numbers.
          </p>
        </Card>
        <Card className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h4 className="text-[14px] font-semibold text-[#1A2732] mb-2">
            Touch Optimized
          </h4>
          <p className="text-sm text-[#737373]">
            56px+ touch targets for shop floor, Material 3 principles throughout.
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
