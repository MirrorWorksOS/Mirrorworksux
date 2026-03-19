/**
 * Control People - User management + roles matrix
 */

import React from 'react';
import { Users, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const mockUsers = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@alliancemetal.com', role: 'Operator', status: 'active' },
  { id: '2', name: 'Mike Thompson', email: 'mike@alliancemetal.com', role: 'Supervisor', status: 'active' },
  { id: '3', name: 'Emma Wilson', email: 'emma@alliancemetal.com', role: 'Scheduler', status: 'active' },
  { id: '4', name: 'David Lee', email: 'david@alliancemetal.com', role: 'Manager', status: 'active' },
  { id: '5', name: 'Admin User', email: 'admin@alliancemetal.com', role: 'Admin', status: 'active' },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'Admin': return 'bg-[#7C3AED] text-white';
    case 'Manager': return 'bg-[#0052CC] text-white';
    case 'Scheduler': return 'bg-[#36B37E] text-white';
    case 'Supervisor': return 'bg-[#FACC15] text-[#2C2C2C]';
    case 'Operator': return 'bg-[#E5E5E5] text-[#525252]';
    default: return 'bg-[#F5F5F5] text-[#737373]';
  }
};

export function ControlPeople() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Users & Permissions</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">+ New User</Button>
      </div>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">NAME</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">EMAIL</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">ROLE</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, idx) => (
              <tr key={user.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4 text-sm text-[#0A0A0A] font-medium">{user.name}</td>
                <td className="px-4 text-sm text-[#525252]">{user.email}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className={cn("rounded text-xs px-2 py-1 border-0 flex items-center gap-1", getRoleBadge(user.role))}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </Badge>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0 text-xs">Active</Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="bg-[#FFCF4B] border-2 border-[#2C2C2C] rounded-lg p-6">
        <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Role Hierarchy
        </h3>
        <p className="text-sm text-[#2C2C2C]">
          Admin &gt; Manager &gt; Scheduler &gt; Supervisor &gt; Operator
        </p>
      </Card>
    </div>
  );
}
