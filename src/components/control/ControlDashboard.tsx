/**
 * Control Dashboard - Admin overview with system health
 */

import React, { useState } from 'react';
import { Users, Database, Settings, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';

const systemHealth = {
  totalUsers: 24,
  activeUsers: 18,
  totalProducts: 156,
  totalMachines: 12,
  totalSuppliers: 28,
  openIssues: 3,
  systemStatus: 'healthy' as const,
};

const controlTabs = [{ key: 'overview', label: 'Overview' }];

export function ControlDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ModuleDashboard
      title="System Control"
      tabs={controlTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="control"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Total Users"
            value={systemHealth.totalUsers}
            icon={Users}
            iconSurface="key"
            hint={`${systemHealth.activeUsers} active`}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Products"
            value={systemHealth.totalProducts}
            icon={Database}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Machines"
            value={systemHealth.totalMachines}
            icon={Settings}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Suppliers"
            value={systemHealth.totalSuppliers}
            icon={Shield}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard
            label="Open Issues"
            value={systemHealth.openIssues}
            icon={AlertCircle}
            valueClassName="text-[var(--mw-error)]"
            trailing={
              <Badge className="border-0 bg-[var(--mw-error-100)] text-[var(--mw-error)]">
                {systemHealth.openIssues}
              </Badge>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <KpiStatCard label="System Status" value="Healthy" icon={Shield} />
        </motion.div>
      </div>

      <Card className="border border-[var(--neutral-200)] bg-[var(--neutral-50)] rounded-[var(--shape-lg)] p-6 shadow-xs border-l-4 border-l-[var(--mw-yellow-400)]">
        <h3 className="text-base font-medium text-[var(--neutral-900)] mb-2">Admin Control Panel</h3>
        <p className="text-sm text-[var(--neutral-600)]">Manage system-wide settings, master data, and user permissions from this module.</p>
      </Card>
      </motion.div>
    </ModuleDashboard>
  );
}
