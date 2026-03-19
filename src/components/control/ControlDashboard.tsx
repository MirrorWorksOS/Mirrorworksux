/**
 * Control Dashboard - Admin overview with system health
 */

import React from 'react';
import { Users, Database, Settings, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

const systemHealth = {
  totalUsers: 24,
  activeUsers: 18,
  totalProducts: 156,
  totalMachines: 12,
  totalSuppliers: 28,
  openIssues: 3,
  systemStatus: 'healthy' as const,
};

export function ControlDashboard() {
  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">System Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-[#0A7AFF]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Total Users</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{systemHealth.totalUsers}</p>
          <p className="text-[12px] text-[#737373] mt-2">{systemHealth.activeUsers} active</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center mb-4">
            <Database className="w-5 h-5 text-[#36B37E]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Products</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{systemHealth.totalProducts}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center mb-4">
            <Settings className="w-5 h-5 text-[#FF8B00]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Machines</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{systemHealth.totalMachines}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#E6F0FF] rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-[#0052CC]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Suppliers</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A]">{systemHealth.totalSuppliers}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <Badge className="bg-[#FEE2E2] text-[#EF4444] border-0">{systemHealth.openIssues}</Badge>
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">Open Issues</h3>
          <p className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#EF4444]">{systemHealth.openIssues}</p>
        </motion.div>

        <motion.div variants={animationVariants.listItem} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <div className="w-10 h-10 bg-[#E3FCEF] rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-[#36B37E]" />
          </div>
          <h3 className="text-[13px] text-[#737373] mb-1">System Status</h3>
          <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0 text-base px-3 py-1">Healthy</Badge>
        </motion.div>
      </div>

      <Card className="bg-[#FFCF4B] border-2 border-[#2C2C2C] rounded-lg p-6">
        <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#2C2C2C] mb-2">Admin Control Panel</h3>
        <p className="text-sm text-[#2C2C2C]">Manage system-wide settings, master data, and user permissions from this module.</p>
      </Card>
    </motion.div>
  );
}
