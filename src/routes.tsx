/**
 * Routes - Complete routing configuration for all modules
 */

import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { WelcomeDashboard } from './components/WelcomeDashboard';

// Sell Module
import { SellDashboard } from './components/sell/SellDashboard';
import { SellCRM } from './components/sell/SellCRM';
import { SellOpportunities } from './components/sell/SellOpportunities';
import { SellOrders } from './components/sell/SellOrders';
import { SellInvoices } from './components/sell/SellInvoices';
import { SellProducts } from './components/sell/SellProducts';
import { SellSettings } from './components/sell/SellSettings';

// Buy Module
import { BuyDashboard } from './components/buy/BuyDashboard';
import { BuyOrders } from './components/buy/BuyOrders';
import { BuyRequisitions } from './components/buy/BuyRequisitions';
import { BuyReceipts } from './components/buy/BuyReceipts';
import { BuySuppliers } from './components/buy/BuySuppliers';
import { BuyRFQs } from './components/buy/BuyRFQs';
import { BuyBills } from './components/buy/BuyBills';
import { BuyProducts } from './components/buy/BuyProducts';
import { BuyAgreements } from './components/buy/BuyAgreements';
import { BuyReports } from './components/buy/BuyReports';
import { BuySettings } from './components/buy/BuySettings';

// Plan Module
import { PlanDashboard } from './components/plan/PlanDashboard';
import { PlanActivities } from './components/plan/PlanActivities';
import { PlanPurchase } from './components/plan/PlanPurchase';
import { PlanQCPlanning } from './components/plan/PlanQCPlanning';
import { PlanProducts } from './components/plan/PlanProducts';
import { PlanSettings } from './components/plan/PlanSettings';

// Make Module
import { MakeDashboard } from './components/make/MakeDashboard';
import { MakeSchedule } from './components/make/MakeSchedule';
import { MakeShopFloor } from './components/make/MakeShopFloor';

// Control Module
import { ControlDashboard } from './components/control/ControlDashboard';
import { ControlLocations } from './components/control/ControlLocations';
import { ControlMachines } from './components/control/ControlMachines';
import { ControlInventory } from './components/control/ControlInventory';
import { ControlPurchase } from './components/control/ControlPurchase';
import { ControlPeople } from './components/control/ControlPeople';
import { ControlProducts } from './components/control/ControlProducts';
import { ControlBOMs } from './components/control/ControlBOMs';

// Design Module
import { DesignFactoryLayout } from './components/design/DesignFactoryLayout';
import { DesignProcessBuilder } from './components/design/DesignProcessBuilder';
import { DesignRoleDesigner } from './components/design/DesignRoleDesigner';
import { DesignInitialData } from './components/design/DesignInitialData';

// Book Module (existing)
import { BudgetOverview } from './components/book/BudgetOverview';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <WelcomeDashboard />,
      },
      
      // Sell Module Routes
      {
        path: 'sell',
        children: [
          { index: true, element: <SellDashboard /> },
          { path: 'crm', element: <SellCRM /> },
          { path: 'opportunities', element: <SellOpportunities /> },
          { path: 'orders', element: <SellOrders /> },
          { path: 'invoices', element: <SellInvoices /> },
          { path: 'products', element: <SellProducts /> },
          { path: 'settings', element: <SellSettings /> },
        ],
      },

      // Buy Module Routes
      {
        path: 'buy',
        children: [
          { index: true, element: <BuyDashboard /> },
          { path: 'orders', element: <BuyOrders /> },
          { path: 'requisitions', element: <BuyRequisitions /> },
          { path: 'receipts', element: <BuyReceipts /> },
          { path: 'suppliers', element: <BuySuppliers /> },
          { path: 'rfqs', element: <BuyRFQs /> },
          { path: 'bills', element: <BuyBills /> },
          { path: 'products', element: <BuyProducts /> },
          { path: 'agreements', element: <BuyAgreements /> },
          { path: 'reports', element: <BuyReports /> },
          { path: 'settings', element: <BuySettings /> },
        ],
      },

      // Plan Module Routes
      {
        path: 'plan',
        children: [
          { index: true, element: <PlanDashboard /> },
          { path: 'activities', element: <PlanActivities /> },
          { path: 'purchase', element: <PlanPurchase /> },
          { path: 'qc-planning', element: <PlanQCPlanning /> },
          { path: 'products', element: <PlanProducts /> },
          { path: 'settings', element: <PlanSettings /> },
        ],
      },

      // Make Module Routes
      {
        path: 'make',
        children: [
          { index: true, element: <MakeDashboard /> },
          { path: 'schedule', element: <MakeSchedule /> },
          { path: 'shop-floor', element: <MakeShopFloor /> },
        ],
      },

      // Control Module Routes
      {
        path: 'control',
        children: [
          { index: true, element: <ControlDashboard /> },
          { path: 'locations', element: <ControlLocations /> },
          { path: 'machines', element: <ControlMachines /> },
          { path: 'inventory', element: <ControlInventory /> },
          { path: 'purchase', element: <ControlPurchase /> },
          { path: 'people', element: <ControlPeople /> },
          { path: 'products', element: <ControlProducts /> },
          { path: 'boms', element: <ControlBOMs /> },
        ],
      },

      // Design Module Routes
      {
        path: 'design',
        children: [
          { index: true, element: <DesignFactoryLayout /> },
          { path: 'factory-layout', element: <DesignFactoryLayout /> },
          { path: 'process-builder', element: <DesignProcessBuilder /> },
          { path: 'role-designer', element: <DesignRoleDesigner /> },
          { path: 'initial-data', element: <DesignInitialData /> },
        ],
      },

      // Book Module Routes
      {
        path: 'book',
        children: [
          { index: true, element: <BudgetOverview /> },
          { path: 'budget', element: <BudgetOverview /> },
        ],
      },

      // 404 Catch-all
      {
        path: '*',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[#EF4444] mb-2">404 - Page Not Found</h1>
            <p className="text-[#737373]">The page you're looking for doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);