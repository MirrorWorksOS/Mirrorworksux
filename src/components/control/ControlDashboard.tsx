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
    <ModuleDashboard title="System Control" tabs={controlTabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-blue-100)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[var(--mw-blue)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Total Users</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{systemHealth.totalUsers}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-2">{systemHealth.activeUsers} active</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-[var(--mw-yellow-400)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Products</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{systemHealth.totalProducts}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-amber-100)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Settings className="w-5 h-5 text-[var(--mw-amber)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Machines</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{systemHealth.totalMachines}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-[var(--mw-yellow-400)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Suppliers</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-mirage)]">{systemHealth.totalSuppliers}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--mw-error-100)] rounded-[var(--shape-md)] flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[var(--mw-error)]" />
              </div>
              <Badge className="bg-[var(--mw-error-100)] text-[var(--mw-error)] border-0">{systemHealth.openIssues}</Badge>
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">Open Issues</h3>
            <p className=" text-2xl font-semibold text-[var(--mw-error)]">{systemHealth.openIssues}</p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="w-10 h-10 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-[var(--mw-yellow-400)]" />
            </div>
            <h3 className="text-xs text-[var(--neutral-500)] mb-1">System Status</h3>
            <Badge className="bg-[var(--mw-mirage)] text-[var(--mw-yellow-400)] border-0 text-base px-3 py-1">Healthy</Badge>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-[var(--mw-yellow-400)] border-2 border-[var(--neutral-800)] rounded-[var(--shape-lg)] p-6">
        <h3 className="text-base font-semibold text-[var(--neutral-800)] mb-2">Admin Control Panel</h3>
        <p className="text-sm text-[var(--neutral-800)]">Manage system-wide settings, master data, and user permissions from this module.</p>
      </Card>
      </motion.div>
    </ModuleDashboard>
  );
}
