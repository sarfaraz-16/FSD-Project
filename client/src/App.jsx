import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import LoginGateway from './pages/Auth/LoginGateway';
import PortalLogin from './pages/Auth/PortalLogin';
import Dashboard from './pages/Dashboard/Dashboard';
import Forbidden from './pages/Error/403';

import Products from './pages/Inventory/Products';
import Categories from './pages/Inventory/Categories';
import StockLogs from './pages/Inventory/StockLogs';

import SalesList from './pages/Sales/SalesList';
import SalesOrderForm from './pages/Sales/SalesOrderForm';
import SalesOrderDetail from './pages/Sales/SalesOrderDetail';
import Customers from './pages/Sales/Customers';

import PurchaseList from './pages/Purchases/PurchaseList';
import PurchaseOrderForm from './pages/Purchases/PurchaseOrderForm';
import PurchaseOrderDetail from './pages/Purchases/PurchaseOrderDetail';
import Suppliers from './pages/Purchases/Suppliers';

import HRLayout from './pages/HR/HRLayout';
import Employees from './pages/HR/Employees';
import Users from './pages/HR/Users';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Support from './pages/Support/Support';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginGateway />} />
          <Route path="/login/:portalRole" element={<PortalLogin />} />
          <Route path="/403" element={<Forbidden />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              <Route element={<RoleRoute roles={['admin', 'manager', 'staff']} />}>
                <Route path="/inventory" element={<Products />} />
                <Route path="/inventory/categories" element={<Categories />} />
                <Route path="/inventory/stock-logs" element={<StockLogs />} />
                
                <Route path="/sales" element={<SalesList />} />
                <Route path="/sales/new" element={<SalesOrderForm />} />
                <Route path="/sales/customers" element={<Customers />} />
                <Route path="/sales/:id" element={<SalesOrderDetail />} />
              </Route>

              <Route element={<RoleRoute roles={['admin', 'manager']} />}>
                <Route path="/purchases" element={<PurchaseList />} />
                <Route path="/purchases/new" element={<PurchaseOrderForm />} />
                <Route path="/purchases/suppliers" element={<Suppliers />} />
                <Route path="/purchases/:id" element={<PurchaseOrderDetail />} />
                
                <Route path="/hr" element={<HRLayout />}>
                  <Route index element={<Employees />} />
                  <Route path="users" element={<RoleRoute roles={['admin']}><Users /></RoleRoute>} />
                </Route>
                
                <Route path="/reports" element={<Reports />} />
              </Route>
              
              <Route element={<RoleRoute roles={['admin']} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              <Route path="/support" element={<Support />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
