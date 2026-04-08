/**
 * Routes - Complete routing configuration for all modules
 * Uses React.lazy for code splitting — each module loads on demand.
 */

import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { Layout } from './components/Layout';
import { WelcomeDashboard } from './components/WelcomeDashboard';

// ---------------------------------------------------------------------------
// Lazy-loaded module components
// ---------------------------------------------------------------------------

// Sell Module
const SellDashboard = React.lazy(() => import('./components/sell/SellDashboard').then(m => ({ default: m.SellDashboard })));
const SellCRM = React.lazy(() => import('./components/sell/SellCRM').then(m => ({ default: m.SellCRM })));
const SellOpportunities = React.lazy(() => import('./components/sell/SellOpportunities').then(m => ({ default: m.SellOpportunities })));
const SellOpportunityPage = React.lazy(() => import('./components/sell/SellOpportunityPage').then(m => ({ default: m.SellOpportunityPage })));
const SellOrders = React.lazy(() => import('./components/sell/SellOrders').then(m => ({ default: m.SellOrders })));
const SellInvoices = React.lazy(() => import('./components/sell/SellInvoices').then(m => ({ default: m.SellInvoices })));
const SellProducts = React.lazy(() => import('./components/sell/SellProducts').then(m => ({ default: m.SellProducts })));
const SellSettings = React.lazy(() => import('./components/sell/SellSettings').then(m => ({ default: m.SellSettings })));
const SellQuotes = React.lazy(() => import('./components/sell/SellQuotes').then(m => ({ default: m.SellQuotes })));
const SellActivities = React.lazy(() => import('./components/sell/SellActivities').then(m => ({ default: m.SellActivities })));
const SellNewQuote = React.lazy(() => import('./components/sell/SellNewQuote').then(m => ({ default: m.SellNewQuote })));
const SellProductDetail = React.lazy(() => import('./components/sell/SellProductDetail').then(m => ({ default: m.SellProductDetail })));
const SellCustomerDetail = React.lazy(() => import('./components/sell/SellCustomerDetail').then(m => ({ default: m.SellCustomerDetail })));
const SellOrderDetail = React.lazy(() => import('./components/sell/SellOrderDetail').then(m => ({ default: m.SellOrderDetail })));
const SellInvoiceDetail = React.lazy(() => import('./components/sell/SellInvoiceDetail').then(m => ({ default: m.SellInvoiceDetail })));
const SellNewInvoice = React.lazy(() => import('./components/sell/SellNewInvoice').then(m => ({ default: m.SellNewInvoice })));
const SellQuoteDetail = React.lazy(() => import('./components/sell/SellQuoteDetail').then(m => ({ default: m.SellQuoteDetail })));
const SellCustomerPortal = React.lazy(() => import('./components/sell/SellCustomerPortal').then(m => ({ default: m.SellCustomerPortal })));

// Buy Module
const BuyDashboard = React.lazy(() => import('./components/buy/BuyDashboard').then(m => ({ default: m.BuyDashboard })));
const BuyOrders = React.lazy(() => import('./components/buy/BuyOrders').then(m => ({ default: m.BuyOrders })));
const BuyRequisitions = React.lazy(() => import('./components/buy/BuyRequisitions').then(m => ({ default: m.BuyRequisitions })));
const BuyReceipts = React.lazy(() => import('./components/buy/BuyReceipts').then(m => ({ default: m.BuyReceipts })));
const BuySuppliers = React.lazy(() => import('./components/buy/BuySuppliers').then(m => ({ default: m.BuySuppliers })));
const BuyRFQs = React.lazy(() => import('./components/buy/BuyRFQs').then(m => ({ default: m.BuyRFQs })));
const BuyBills = React.lazy(() => import('./components/buy/BuyBills').then(m => ({ default: m.BuyBills })));
const BuyProducts = React.lazy(() => import('./components/buy/BuyProducts').then(m => ({ default: m.BuyProducts })));
const BuyAgreements = React.lazy(() => import('./components/buy/BuyAgreements').then(m => ({ default: m.BuyAgreements })));
const BuyReports = React.lazy(() => import('./components/buy/BuyReports').then(m => ({ default: m.BuyReports })));
const BuySettings = React.lazy(() => import('./components/buy/BuySettings').then(m => ({ default: m.BuySettings })));
const BuyRequisitionDetail = React.lazy(() => import('./components/buy/BuyRequisitionDetail').then(m => ({ default: m.BuyRequisitionDetail })));
const BuySupplierDetail = React.lazy(() => import('./components/buy/BuySupplierDetail').then(m => ({ default: m.BuySupplierDetail })));
const BuyOrderDetail = React.lazy(() => import('./components/buy/BuyOrderDetail').then(m => ({ default: m.BuyOrderDetail })));
const BuyProductDetail = React.lazy(() => import('./components/buy/BuyProductDetail').then(m => ({ default: m.BuyProductDetail })));
const BuyMrpSuggestions = React.lazy(() => import('./components/buy/BuyMrpSuggestions').then(m => ({ default: m.BuyMrpSuggestions })));
const BuyPlanningGrid = React.lazy(() => import('./components/buy/BuyPlanningGrid').then(m => ({ default: m.BuyPlanningGrid })));
const BuyVendorComparison = React.lazy(() => import('./components/buy/BuyVendorComparison').then(m => ({ default: m.BuyVendorComparison })));
const BuyReorderRules = React.lazy(() => import('./components/buy/BuyReorderRules').then(m => ({ default: m.BuyReorderRules })));

// Plan Module
const PlanDashboard = React.lazy(() => import('./components/plan/PlanDashboard').then(m => ({ default: m.PlanDashboard })));
const PlanJobs = React.lazy(() => import('./components/plan/PlanJobs').then(m => ({ default: m.PlanJobs })));
const PlanJobDetail = React.lazy(() => import('./components/plan/PlanJobDetail').then(m => ({ default: m.PlanJobDetail })));
const PlanSchedule = React.lazy(() => import('./components/plan/PlanSchedule').then(m => ({ default: m.PlanSchedule })));
const PlanPurchase = React.lazy(() => import('./components/plan/PlanPurchase').then(m => ({ default: m.PlanPurchase })));
const PlanQCPlanning = React.lazy(() => import('./components/plan/PlanQCPlanning').then(m => ({ default: m.PlanQCPlanning })));
const PlanProducts = React.lazy(() => import('./components/plan/PlanProducts').then(m => ({ default: m.PlanProducts })));
const PlanProductDetail = React.lazy(() => import('./components/plan/PlanProductDetail').then(m => ({ default: m.PlanProductDetail })));
const PlanSettings = React.lazy(() => import('./components/plan/PlanSettings').then(m => ({ default: m.PlanSettings })));
const ProductStudio = React.lazy(() => import('./components/plan/product-studio/ProductStudio').then(m => ({ default: m.ProductStudio })));
const ProductStudioV2 = React.lazy(() => import('./components/plan/product-studio/blockly-v2/ProductStudioV2').then(m => ({ default: m.ProductStudioV2 })));
// PlanLibraries statically imports MaterialLibrary + FinishLibrary
const PlanLibraries = React.lazy(() => import('./components/plan/PlanLibraries').then(m => ({ default: m.PlanLibraries })));
// PlanMachineIO statically imports PlanCADImport + PlanNCConnect
const PlanMachineIO = React.lazy(() => import('./components/plan/PlanMachineIO').then(m => ({ default: m.PlanMachineIO })));
const PlanWhatIf = React.lazy(() => import('./components/plan/PlanWhatIf').then(m => ({ default: m.PlanWhatIf })));
const PlanNesting = React.lazy(() => import('./components/plan/PlanNesting').then(m => ({ default: m.PlanNesting })));
const PlanMrp = React.lazy(() => import('./components/plan/PlanMrp').then(m => ({ default: m.PlanMrp })));
const PlanSheetCalculator = React.lazy(() => import('./components/plan/PlanSheetCalculator').then(m => ({ default: m.PlanSheetCalculator })));

// Make Module
const MakeDashboard = React.lazy(() => import('./components/make/MakeDashboard').then(m => ({ default: m.MakeDashboard })));
const MakeSchedule = React.lazy(() => import('./components/make/MakeSchedule').then(m => ({ default: m.MakeSchedule })));
const MakeManufacturingOrders = React.lazy(() => import('./components/make/MakeManufacturingOrders').then(m => ({ default: m.MakeManufacturingOrders })));
const MakeManufacturingOrderDetail = React.lazy(() => import('./components/make/MakeManufacturingOrderDetail').then(m => ({ default: m.MakeManufacturingOrderDetail })));
const MakeTimeClock = React.lazy(() => import('./components/make/MakeTimeClock').then(m => ({ default: m.MakeTimeClock })));
const MakeQuality = React.lazy(() => import('./components/make/MakeQuality').then(m => ({ default: m.MakeQuality })));
const MakeProducts = React.lazy(() => import('./components/make/MakeProducts').then(m => ({ default: m.MakeProducts })));
const MakeProductDetail = React.lazy(() => import('./components/make/MakeProductDetail').then(m => ({ default: m.MakeProductDetail })));
const MakeSettings = React.lazy(() => import('./components/make/MakeSettings').then(m => ({ default: m.MakeSettings })));
const MakeShopFloor = React.lazy(() => import('./components/make/MakeShopFloor').then(m => ({ default: m.MakeShopFloor })));
const MakeScanStation = React.lazy(() => import('./components/make/MakeScanStation').then(m => ({ default: m.MakeScanStation })));
const MakeScrapAnalysis = React.lazy(() => import('./components/make/MakeScrapAnalysis').then(m => ({ default: m.MakeScrapAnalysis })));
const MakeJobTraveler = React.lazy(() => import('./components/make/MakeJobTraveler').then(m => ({ default: m.MakeJobTraveler })));
const MakeCapa = React.lazy(() => import('./components/make/MakeCapa').then(m => ({ default: m.MakeCapa })));

// Ship Module
const ShipDashboard = React.lazy(() => import('./components/ship/ShipDashboard').then(m => ({ default: m.ShipDashboard })));
const ShipOrders = React.lazy(() => import('./components/ship/ShipOrders').then(m => ({ default: m.ShipOrders })));
const ShipPackaging = React.lazy(() => import('./components/ship/ShipPackaging').then(m => ({ default: m.ShipPackaging })));
const ShipShipping = React.lazy(() => import('./components/ship/ShipShipping').then(m => ({ default: m.ShipShipping })));
const ShipTracking = React.lazy(() => import('./components/ship/ShipTracking').then(m => ({ default: m.ShipTracking })));
const ShipReturns = React.lazy(() => import('./components/ship/ShipReturns').then(m => ({ default: m.ShipReturns })));
const ShipWarehouse = React.lazy(() => import('./components/ship/ShipWarehouse').then(m => ({ default: m.ShipWarehouse })));
const ShipReports = React.lazy(() => import('./components/ship/ShipReports').then(m => ({ default: m.ShipReports })));
const ShipSettings = React.lazy(() => import('./components/ship/ShipSettings').then(m => ({ default: m.ShipSettings })));
const ShipCarrierRates = React.lazy(() => import('./components/ship/ShipCarrierRates').then(m => ({ default: m.ShipCarrierRates })));
const ShipScanToShip = React.lazy(() => import('./components/ship/ShipScanToShip').then(m => ({ default: m.ShipScanToShip })));

// Control Module
const ControlDashboard = React.lazy(() => import('./components/control/ControlDashboard').then(m => ({ default: m.ControlDashboard })));
const ControlLocations = React.lazy(() => import('./components/control/ControlLocations').then(m => ({ default: m.ControlLocations })));
const ControlMachines = React.lazy(() => import('./components/control/ControlMachines').then(m => ({ default: m.ControlMachines })));
const ControlInventory = React.lazy(() => import('./components/control/ControlInventory').then(m => ({ default: m.ControlInventory })));
const ControlPurchase = React.lazy(() => import('./components/control/ControlPurchase').then(m => ({ default: m.ControlPurchase })));
const ControlPeople = React.lazy(() => import('./components/control/ControlPeople').then(m => ({ default: m.ControlPeople })));
const ControlProducts = React.lazy(() => import('./components/control/ControlProducts').then(m => ({ default: m.ControlProducts })));
const ControlBOMs = React.lazy(() => import('./components/control/ControlBOMs').then(m => ({ default: m.ControlBOMs })));
const ControlWorkflowDesigner = React.lazy(() => import('./components/control/ControlWorkflowDesigner').then(m => ({ default: m.ControlWorkflowDesigner })));
const ControlFactoryDesigner = React.lazy(() => import('./components/control/ControlFactoryDesigner').then(m => ({ default: m.ControlFactoryDesigner })));
const ControlEmptyStates = React.lazy(() => import('./components/control/ControlEmptyStates').then(m => ({ default: m.ControlEmptyStates })));
const ControlProcessBuilder = React.lazy(() => import('./components/control/ControlProcessBuilder').then(m => ({ default: m.ControlProcessBuilder })));
const ControlRoleDesigner = React.lazy(() => import('./components/control/ControlRoleDesigner').then(m => ({ default: m.ControlRoleDesigner })));
const ControlGamification = React.lazy(() => import('./components/control/ControlGamification').then(m => ({ default: m.ControlGamification })));
const ControlShiftManager = React.lazy(() => import('./components/control/ControlShiftManager').then(m => ({ default: m.ControlShiftManager })));
const ControlMaintenance = React.lazy(() => import('./components/control/ControlMaintenance').then(m => ({ default: m.ControlMaintenance })));
const ControlTooling = React.lazy(() => import('./components/control/ControlTooling').then(m => ({ default: m.ControlTooling })));
const ControlDocuments = React.lazy(() => import('./components/control/ControlDocuments').then(m => ({ default: m.ControlDocuments })));
const MirrorWorksBridge = React.lazy(() => import('./components/control/MirrorWorksBridge').then(m => ({ default: m.MirrorWorksBridge })));
const BridgeWizard = React.lazy(() => import('./components/bridge/BridgeWizard').then(m => ({ default: m.BridgeWizard })));
const Notifications = React.lazy(() => import('./components/Notifications').then(m => ({ default: m.Notifications })));

// Book Module
const BudgetOverview = React.lazy(() => import('./components/book/BudgetOverview').then(m => ({ default: m.BudgetOverview })));
const BookDashboard = React.lazy(() => import('./components/book/BookDashboard').then(m => ({ default: m.BookDashboard })));
const BookInvoices = React.lazy(() => import('./components/book/BookInvoices').then(m => ({ default: m.BookInvoices })));
const ExpenseKanban = React.lazy(() => import('./components/book/ExpenseKanban').then(m => ({ default: m.ExpenseKanban })));
const PurchaseOrders = React.lazy(() => import('./components/book/PurchaseOrders').then(m => ({ default: m.PurchaseOrders })));
const JobProfitability = React.lazy(() => import('./components/book/JobProfitability').then(m => ({ default: m.JobProfitability })));
const StockValuation = React.lazy(() => import('./components/book/StockValuation').then(m => ({ default: m.StockValuation })));
const ReportsGallery = React.lazy(() => import('./components/book/ReportsGallery').then(m => ({ default: m.ReportsGallery })));
const BookSettings = React.lazy(() => import('./components/book/BookSettings').then(m => ({ default: m.BookSettings })));
const InvoiceDetail = React.lazy(() => import('./components/book/InvoiceDetail').then(m => ({ default: m.InvoiceDetail })));
const JobCostDetail = React.lazy(() => import('./components/book/JobCostDetail').then(m => ({ default: m.JobCostDetail })));
const BookWipValuation = React.lazy(() => import('./components/book/BookWipValuation').then(m => ({ default: m.BookWipValuation })));
const BookCostVariance = React.lazy(() => import('./components/book/BookCostVariance').then(m => ({ default: m.BookCostVariance })));

// ---------------------------------------------------------------------------
// Suspense wrapper for lazy routes
// ---------------------------------------------------------------------------
function L({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>}>{children}</Suspense>;
}

// Redirect old `/plan/product-studio/v2/:productId` deep links to the new
// canonical `/plan/product-studio/:productId` URL while preserving the id.
function ProductStudioV2Redirect() {
  const { productId } = useParams<{ productId: string }>();
  return <Navigate to={`/plan/product-studio/${productId ?? ''}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <WelcomeDashboard />,
      },

      // Main Dashboard Route
      {
        path: 'dashboard',
        element: <WelcomeDashboard />,
      },

      // Sell Module Routes
      {
        path: 'sell',
        children: [
          { index: true, element: <L><SellDashboard /></L> },
          { path: 'crm', element: <L><SellCRM /></L> },
          { path: 'crm/:id', element: <L><SellCustomerDetail /></L> },
          { path: 'opportunities', element: <L><SellOpportunities /></L> },
          { path: 'opportunities/:id', element: <L><SellOpportunityPage /></L> },
          { path: 'orders', element: <L><SellOrders /></L> },
          { path: 'orders/:id', element: <L><SellOrderDetail /></L> },
          { path: 'activities', element: <L><SellActivities /></L> },
          { path: 'invoices', element: <L><SellInvoices /></L> },
          { path: 'invoices/new', element: <L><SellNewInvoice /></L> },
          { path: 'invoices/:id', element: <L><SellInvoiceDetail /></L> },
          { path: 'products', element: <L><SellProducts /></L> },
          { path: 'products/:id', element: <L><SellProductDetail /></L> },
          { path: 'quotes', element: <L><SellQuotes /></L> },
          { path: 'quotes/new', element: <L><SellNewQuote /></L> },
          { path: 'quotes/:id', element: <L><SellQuoteDetail /></L> },
          { path: 'portal', element: <L><SellCustomerPortal /></L> },
          { path: 'settings', element: <L><SellSettings /></L> },
        ],
      },

      // Buy Module Routes
      {
        path: 'buy',
        children: [
          { index: true, element: <L><BuyDashboard /></L> },
          { path: 'orders', element: <L><BuyOrders /></L> },
          { path: 'orders/:id', element: <L><BuyOrderDetail /></L> },
          { path: 'requisitions', element: <L><BuyRequisitions /></L> },
          { path: 'requisitions/:id', element: <L><BuyRequisitionDetail /></L> },
          { path: 'receipts', element: <L><BuyReceipts /></L> },
          { path: 'suppliers', element: <L><BuySuppliers /></L> },
          { path: 'suppliers/:id', element: <L><BuySupplierDetail /></L> },
          { path: 'rfqs', element: <L><BuyRFQs /></L> },
          { path: 'bills', element: <L><BuyBills /></L> },
          { path: 'products', element: <L><BuyProducts /></L> },
          { path: 'products/:id', element: <L><BuyProductDetail /></L> },
          { path: 'agreements', element: <L><BuyAgreements /></L> },
          { path: 'mrp-suggestions', element: <L><BuyMrpSuggestions /></L> },
          { path: 'planning-grid', element: <L><BuyPlanningGrid /></L> },
          { path: 'vendor-comparison', element: <L><BuyVendorComparison /></L> },
          { path: 'reorder-rules', element: <L><BuyReorderRules /></L> },
          { path: 'reports', element: <L><BuyReports /></L> },
          { path: 'settings', element: <L><BuySettings /></L> },
        ],
      },

      // Plan Module Routes
      {
        path: 'plan',
        children: [
          { index: true, element: <L><PlanDashboard /></L> },
          { path: 'jobs', element: <L><PlanJobs /></L> },
          { path: 'jobs/:id', element: <L><PlanJobDetail /></L> },
          // Activities folded into Schedule's calendar view
          { path: 'activities', element: <Navigate to="/plan/schedule?view=calendar" replace /> },
          { path: 'schedule', element: <L><PlanSchedule /></L> },
          // CAD import + NC Connect unified under /plan/machine-io
          { path: 'machine-io', element: <L><PlanMachineIO /></L> },
          { path: 'nc-connect', element: <Navigate to="/plan/machine-io?tab=nc-connect" replace /> },
          { path: 'cad-import', element: <Navigate to="/plan/machine-io?tab=cad-import" replace /> },
          { path: 'purchase', element: <L><PlanPurchase /></L> },
          { path: 'qc-planning', element: <L><PlanQCPlanning /></L> },
          // Product Studio is now exclusively the Blockly-based v2 editor.
          // Legacy v1 + spike routes are kept as redirects so any saved
          // bookmarks land on the new editor instead of 404'ing.
          { path: 'product-studio', element: <L><ProductStudioV2 /></L> },
          { path: 'product-studio/:productId', element: <L><ProductStudioV2 /></L> },
          { path: 'product-studio/v2', element: <Navigate to="/plan/product-studio" replace /> },
          { path: 'product-studio/v2/:productId', element: <ProductStudioV2Redirect /> },
          { path: 'product-studio/blockly-spike', element: <Navigate to="/plan/product-studio" replace /> },
          { path: 'product-studio/legacy', element: <L><ProductStudio /></L> },
          { path: 'product-studio/legacy/:productId', element: <L><ProductStudio /></L> },
          // Material + Finish library unified under /plan/libraries
          { path: 'libraries', element: <L><PlanLibraries /></L> },
          { path: 'material-library', element: <Navigate to="/plan/libraries?tab=materials" replace /> },
          { path: 'finish-library', element: <Navigate to="/plan/libraries?tab=finishes" replace /> },
          { path: 'what-if', element: <L><PlanWhatIf /></L> },
          { path: 'nesting', element: <L><PlanNesting /></L> },
          { path: 'mrp', element: <L><PlanMrp /></L> },
          { path: 'sheet-calculator', element: <L><PlanSheetCalculator /></L> },
          { path: 'products', element: <L><PlanProducts /></L> },
          { path: 'products/:id', element: <L><PlanProductDetail /></L> },
          { path: 'settings', element: <L><PlanSettings /></L> },
        ],
      },

      // Make Module Routes
      {
        path: 'make',
        children: [
          { index: true, element: <L><MakeDashboard /></L> },
          { path: 'schedule', element: <L><MakeSchedule /></L> },
          { path: 'shop-floor', element: <L><MakeShopFloor /></L> },
          { path: 'manufacturing-orders', element: <L><MakeManufacturingOrders /></L> },
          { path: 'manufacturing-orders/:id', element: <L><MakeManufacturingOrderDetail /></L> },
          { path: 'time-clock', element: <L><MakeTimeClock /></L> },
          { path: 'quality', element: <L><MakeQuality /></L> },
          { path: 'scan', element: <L><MakeScanStation /></L> },
          { path: 'scrap-analysis', element: <L><MakeScrapAnalysis /></L> },
          { path: 'job-traveler/:id', element: <L><MakeJobTraveler /></L> },
          { path: 'capa', element: <L><MakeCapa /></L> },
          { path: 'products', element: <L><MakeProducts /></L> },
          { path: 'products/:id', element: <L><MakeProductDetail /></L> },
          { path: 'settings', element: <L><MakeSettings /></L> },
        ],
      },

      // Ship Module Routes
      {
        path: 'ship',
        children: [
          { index: true, element: <L><ShipDashboard /></L> },
          { path: 'orders', element: <L><ShipOrders /></L> },
          { path: 'packaging', element: <L><ShipPackaging /></L> },
          { path: 'shipping', element: <L><ShipShipping /></L> },
          { path: 'tracking', element: <L><ShipTracking /></L> },
          { path: 'carrier-rates', element: <L><ShipCarrierRates /></L> },
          { path: 'scan-to-ship', element: <L><ShipScanToShip /></L> },
          { path: 'returns', element: <L><ShipReturns /></L> },
          { path: 'warehouse', element: <L><ShipWarehouse /></L> },
          { path: 'reports', element: <L><ShipReports /></L> },
          { path: 'settings', element: <L><ShipSettings /></L> },
        ],
      },

      // Bridge — full wizard (PLAT 01)
      {
        path: 'bridge',
        element: (
          <L>
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
              <BridgeWizard />
            </div>
          </L>
        ),
      },

      // Control Module Routes (includes former Design module: factory designer, process builder, MirrorWorks Bridge)
      {
        path: 'control',
        children: [
          { index: true, element: <L><ControlDashboard /></L> },
          { path: 'mirrorworks-bridge', element: (
            <L>
              <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <BridgeWizard />
              </div>
            </L>
          ) },
          { path: 'factory-layout', element: <L><ControlFactoryDesigner /></L> },
          { path: 'process-builder', element: <L><ControlProcessBuilder /></L> },
          { path: 'locations', element: <L><ControlLocations /></L> },
          { path: 'machines', element: <L><ControlMachines /></L> },
          { path: 'inventory', element: <L><ControlInventory /></L> },
          { path: 'purchase', element: <L><ControlPurchase /></L> },
          { path: 'people', element: <L><ControlPeople /></L> },
          { path: 'products', element: <L><ControlProducts /></L> },
          { path: 'boms', element: <L><ControlBOMs /></L> },
          { path: 'role-designer', element: <L><ControlRoleDesigner /></L> },
          { path: 'workflow-designer', element: <L><ControlWorkflowDesigner /></L> },
          { path: 'shifts', element: <L><ControlShiftManager /></L> },
          { path: 'maintenance', element: <L><ControlMaintenance /></L> },
          { path: 'tooling', element: <L><ControlTooling /></L> },
          { path: 'documents', element: <L><ControlDocuments /></L> },
          { path: 'gamification', element: <L><ControlGamification /></L> },
          { path: 'empty-states', element: <L><ControlEmptyStates /></L> },
        ],
      },

      // Notifications
      {
        path: 'notifications',
        element: <L><Notifications /></L>,
      },

      // Legacy /design URLs → Control (bookmarks)
      {
        path: 'design',
        children: [
          { index: true, element: <Navigate to="/control/factory-layout" replace /> },
          { path: 'factory-layout', element: <Navigate to="/control/factory-layout" replace /> },
          { path: 'process-builder', element: <Navigate to="/control/process-builder" replace /> },
          { path: 'initial-data', element: <Navigate to="/control/mirrorworks-bridge" replace /> },
        ],
      },

      // Book Module Routes
      {
        path: 'book',
        children: [
          { index: true, element: <L><BookDashboard /></L> },
          { path: 'budget', element: <L><BudgetOverview /></L> },
          { path: 'invoices', element: <L><BookInvoices /></L> },
          { path: 'invoices/:id', element: <L><InvoiceDetail onBack={() => window.history.back()} /></L> },
          { path: 'expenses', element: <L><ExpenseKanban /></L> },
          { path: 'purchases', element: <L><PurchaseOrders /></L> },
          { path: 'job-costs', element: <L><JobProfitability /></L> },
          { path: 'job-costs/:id', element: <L><JobCostDetail onBack={() => window.history.back()} /></L> },
          { path: 'wip', element: <L><BookWipValuation /></L> },
          { path: 'cost-variance', element: <L><BookCostVariance /></L> },
          { path: 'stock-valuation', element: <L><StockValuation /></L> },
          { path: 'reports', element: <L><ReportsGallery /></L> },
          { path: 'settings', element: <L><BookSettings /></L> },
        ],
      },

      // 404 Catch-all
      {
        path: '*',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">404 - Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);
