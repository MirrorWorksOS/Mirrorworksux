import type { ActivityEvent, Group, GroupPermissionSet, ModuleKey, User } from './types';

export const moduleLabels: Record<ModuleKey, string> = {
  sell: 'Sell',
  plan: 'Plan',
  make: 'Make',
  ship: 'Ship',
  book: 'Book',
  buy: 'Buy',
  control: 'Control',
};

export const moduleColors: Record<ModuleKey, { bg: string; text: string; dot: string }> = {
  sell: { bg: '#EEF2FF', text: '#4338CA', dot: '#6366F1' },
  plan: { bg: '#FEF9C3', text: '#854D0E', dot: '#CA8A04' },
  make: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  ship: { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  book: { bg: '#FCE7F3', text: '#9D174D', dot: '#EC4899' },
  buy: { bg: '#FFEDD5', text: '#9A3412', dot: '#F97316' },
  control: { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' },
};

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [
      { module: 'make', groups: ['Production', 'Quality'] },
      { module: 'plan', groups: ['Engineering'] },
    ],
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Mike Thompson',
    email: 'mike@alliancemetal.com',
    role: 'lead',
    leadModule: 'make',
    status: 'active',
    modules: [
      { module: 'make', groups: [] },
      { module: 'plan', groups: ['Scheduling'] },
    ],
    lastActive: '15 min ago',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [{ module: 'plan', groups: ['Scheduling', 'Costing'] }],
    lastActive: '1 hour ago',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david@alliancemetal.com',
    role: 'lead',
    leadModule: 'sell',
    status: 'active',
    modules: [{ module: 'sell', groups: [] }],
    lastActive: '30 min ago',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    email: 'priya@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [
      { module: 'book', groups: ['Accounts Receivable'] },
      { module: 'buy', groups: ['Purchasing'] },
    ],
    lastActive: '4 hours ago',
  },
  {
    id: '6',
    name: 'James Murray',
    email: 'james@alliancemetal.com',
    role: 'team',
    status: 'invited',
    modules: [
      { module: 'make', groups: ['Production'] },
      { module: 'ship', groups: ['Warehouse'] },
    ],
    lastActive: 'Never',
  },
  {
    id: '7',
    name: 'Anh Nguyen',
    email: 'anh@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [{ module: 'make', groups: ['Maintenance'] }],
    lastActive: '1 day ago',
  },
  {
    id: '8',
    name: 'Tom Bradshaw',
    email: 'tom@alliancemetal.com',
    role: 'team',
    status: 'deactivated',
    modules: [{ module: 'sell', groups: ['Sales'] }],
    lastActive: '3 weeks ago',
  },
];

const basePermissions: GroupPermissionSet = {
  'documents.scope': 'own',
  'quotes.create': false,
  'orders.create': false,
  'jobs.assign': false,
  'quality.approve': false,
  'maintenance.schedule': false,
  'reports.access': false,
  'settings.access': false,
};

const permissions = (overrides: Partial<GroupPermissionSet>): GroupPermissionSet => ({
  ...basePermissions,
  ...overrides,
});

export const mockGroups: Group[] = [
  { id: 'g-sell-sales', module: 'sell', name: 'Sales', description: 'Quotes and order pipeline', isDefault: true, members: ['4', '8', '2'], permissions: permissions({ 'documents.scope': 'all', 'quotes.create': true, 'orders.create': true, 'reports.access': true }) },
  { id: 'g-sell-estimating', module: 'sell', name: 'Estimating', description: 'Cost estimation and pricing', isDefault: true, members: ['1', '3'], permissions: permissions({ 'quotes.create': true, 'reports.access': true }) },
  { id: 'g-sell-cs', module: 'sell', name: 'Customer Service', description: 'Order updates and customer contact', isDefault: true, members: ['6'], permissions: permissions({ 'documents.scope': 'all', 'orders.create': true }) },

  { id: 'g-plan-scheduling', module: 'plan', name: 'Scheduling', description: 'Capacity and sequencing', isDefault: true, members: ['2', '3'], permissions: permissions({ 'documents.scope': 'all', 'jobs.assign': true, 'reports.access': true }) },
  { id: 'g-plan-engineering', module: 'plan', name: 'Engineering', description: 'Routing and process planning', isDefault: true, members: ['1', '7'], permissions: permissions({ 'documents.scope': 'all', 'jobs.assign': true }) },
  { id: 'g-plan-costing', module: 'plan', name: 'Costing', description: 'Cost rollups and margin checks', isDefault: true, members: ['3'], permissions: permissions({ 'reports.access': true }) },

  { id: 'g-make-production', module: 'make', name: 'Production', description: 'Daily production execution', isDefault: true, members: ['1', '2', '6', '7'], permissions: permissions({ 'documents.scope': 'all', 'jobs.assign': true, 'orders.create': true }) },
  { id: 'g-make-quality', module: 'make', name: 'Quality', description: 'Inspection and non-conformance', isDefault: true, members: ['1', '3'], permissions: permissions({ 'quality.approve': true, 'reports.access': true }) },
  { id: 'g-make-maintenance', module: 'make', name: 'Maintenance', description: 'Machine upkeep and service', isDefault: true, members: ['7'], permissions: permissions({ 'maintenance.schedule': true }) },
  { id: 'g-make-office', module: 'make', name: 'Office', description: 'Admin support for make workflows', isDefault: true, members: ['5', '2'], permissions: permissions({ 'reports.access': true, 'settings.access': true }) },

  { id: 'g-ship-warehouse', module: 'ship', name: 'Warehouse', description: 'Pick, pack, and stock flow', isDefault: true, members: ['6', '5'], permissions: permissions({ 'documents.scope': 'all', 'orders.create': true }) },
  { id: 'g-ship-shipping', module: 'ship', name: 'Shipping', description: 'Carrier booking and dispatch', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'orders.create': true, 'reports.access': true }) },
  { id: 'g-ship-cs', module: 'ship', name: 'Customer Service', description: 'Delivery updates and support', isDefault: true, members: ['1'], permissions: permissions({ 'documents.scope': 'all' }) },

  { id: 'g-book-ar', module: 'book', name: 'Accounts Receivable', description: 'Invoices and receipts', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'reports.access': true }) },
  { id: 'g-book-ap', module: 'book', name: 'Accounts Payable', description: 'Bills and payments', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'reports.access': true }) },
  { id: 'g-book-expenses', module: 'book', name: 'Expenses', description: 'Expense approvals and coding', isDefault: true, members: ['1', '3', '5'], permissions: permissions({ 'reports.access': true }) },

  { id: 'g-buy-purchasing', module: 'buy', name: 'Purchasing', description: 'Supplier ordering and terms', isDefault: true, members: ['5', '2'], permissions: permissions({ 'documents.scope': 'all', 'orders.create': true, 'reports.access': true }) },
  { id: 'g-buy-receiving', module: 'buy', name: 'Receiving', description: 'Goods receipt and checks', isDefault: true, members: ['6'], permissions: permissions({ 'documents.scope': 'all' }) },
  { id: 'g-buy-accounts', module: 'buy', name: 'Accounts', description: 'Vendor bills and reconciliation', isDefault: true, members: ['5'], permissions: permissions({ 'reports.access': true }) },

  { id: 'g-control-master-data', module: 'control', name: 'Master Data', description: 'Products, BOM, and references', isDefault: true, members: ['2', '4'], permissions: permissions({ 'documents.scope': 'all', 'settings.access': true, 'reports.access': true }) },
  { id: 'g-control-people-admin', module: 'control', name: 'People Admin', description: 'People and group administration', isDefault: true, members: ['4'], permissions: permissions({ 'documents.scope': 'all', 'settings.access': true, 'reports.access': true }) },
];

export const mockActivity: ActivityEvent[] = [
  { id: 'a1', actorName: 'Mike Thompson', message: 'Sarah added to Make > Quality', timestamp: '3 days ago' },
  { id: 'a2', actorName: 'David Lee', message: 'James invited to Ship > Warehouse', timestamp: '5 days ago' },
  { id: 'a3', actorName: 'Priya Sharma', message: 'Book > Expenses permissions updated', timestamp: '1 week ago' },
];
