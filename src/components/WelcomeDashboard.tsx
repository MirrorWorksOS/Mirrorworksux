/**
 * Welcome Dashboard - Homepage with module overview
 *
 * Uses Animate UI icons for module cards (animateOnHover, size 28px, on yellow bg).
 * Lucide icons for utility elements only (ArrowRight).
 */

import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { staggerItem } from '@/components/shared/motion/motion-variants';
import { PageShell } from '@/components/shared/layout/PageShell';
import { MODULE_ICONS, ICON_SIZES } from '@/lib/icon-config';


type AnimatedIconComponent = React.ComponentType<{
  size?: number;
  animateOnHover?: boolean;
  className?: string;
}>;

const modules: {
  name: string;
  Icon: AnimatedIconComponent;
  path: string;
  description: string;
  count: number;
}[] = [
  {
    name: 'Sell',
    Icon: MODULE_ICONS.sell,
    path: '/sell',
    description: 'CRM, Opportunities, Orders, Invoices',
    count: 8,
  },
  {
    name: 'Plan',
    Icon: MODULE_ICONS.plan,
    path: '/plan',
    description: 'Production Planning, Scheduling, MRP',
    count: 6,
  },
  {
    name: 'Make',
    Icon: MODULE_ICONS.make,
    path: '/make',
    description: 'Manufacturing, Shop Floor, Andon Board',
    count: 3,
  },
  {
    name: 'Ship',
    Icon: MODULE_ICONS.ship,
    path: '/ship',
    description: 'Logistics, Tracking, Fulfilment',
    count: 9,
  },
  {
    name: 'Book',
    Icon: MODULE_ICONS.book,
    path: '/book',
    description: 'Finance, Budgets, Job Costs',
    count: 12,
  },
  {
    name: 'Buy',
    Icon: MODULE_ICONS.buy,
    path: '/buy',
    description: 'Purchasing, Suppliers, Requisitions',
    count: 11,
  },
  {
    name: 'Control',
    Icon: MODULE_ICONS.control,
    path: '/control',
    description: 'Admin, Master Data, Settings',
    count: 8,
  },
  {
    name: 'Design',
    Icon: MODULE_ICONS.design,
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
    <PageShell className="max-w-[1400px] mx-auto">
      {/* Hero Header */}
      <div>
        <h1 className="text-[42px] tracking-tight text-[var(--mw-mirage)] font-bold mb-2">
          Welcome in, Alliance Metal
        </h1>
        <p className="text-[17px] text-muted-foreground">
          MirrorWorks Smart FactoryOS — Complete Manufacturing ERP
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-[var(--shape-lg)] px-5 py-3 shadow-sm"
          >
            <span className="text-2xl font-semibold text-[var(--mw-mirage)] tabular-nums">{stat.value}</span>
            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
          </div>
        ))}
        <Badge className="bg-[var(--mw-yellow-400)]/20 text-[var(--mw-mirage)] border-0 text-xs font-medium px-4 py-2 rounded-full">
          Complete
        </Badge>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((module, idx) => {
          const Icon = module.Icon;
          return (
            <motion.div key={module.name} variants={staggerItem} custom={idx}>
              <Link to={module.path}>
                <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md hover:border-[var(--mw-yellow-400)]/40 transition-all duration-200 group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-[var(--mw-yellow-400)] group-hover:scale-110 transition-transform duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
                      <Icon
                        size={ICON_SIZES.dashboard}
                        animateOnHover
                        className="text-[var(--mw-mirage)]"
                      />
                    </div>
                    <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-600)] border-0 text-xs rounded-full">
                      {module.count} components
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--mw-mirage)] mb-2">
                    {module.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                    {module.description}
                  </p>
                  <div className="flex items-center text-[var(--mw-mirage)] text-sm font-medium group-hover:gap-2 transition-all">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h4 className="text-sm font-semibold text-[var(--mw-mirage)] mb-2">
            Quick Start
          </h4>
          <p className="text-sm text-muted-foreground">
            Explore the modules using the sidebar or click any module card above.
          </p>
        </Card>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h4 className="text-sm font-semibold text-[var(--mw-mirage)] mb-2">
            Design System
          </h4>
          <p className="text-sm text-muted-foreground">
            MW Yellow (#FFCF4B), warm cream backgrounds, generous radii, Roboto with tabular-nums.
          </p>
        </Card>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h4 className="text-sm font-semibold text-[var(--mw-mirage)] mb-2">
            Touch Optimized
          </h4>
          <p className="text-sm text-muted-foreground">
            56px+ touch targets for shop floor, Material 3 principles throughout.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
