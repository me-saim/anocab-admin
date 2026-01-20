import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import UserForm from './pages/Users/UserForm';
import Admins from './pages/Admins/Admins';
import AdminForm from './pages/Admins/AdminForm';
import Blogs from './pages/Blogs/Blogs';
import BlogForm from './pages/Blogs/BlogForm';
import Catalog from './pages/Catalog/Catalog';
import CatalogForm from './pages/Catalog/CatalogForm';
import QRCodes from './pages/QRCodes/QRCodes';
import QRCodeForm from './pages/QRCodes/QRCodeForm';
import QRCodeView from './pages/QRCodes/QRCodeView';
import QRScans from './pages/QRScans/QRScans';
import RedeemTransactions from './pages/RedeemTransactions/RedeemTransactions';
import PaymentTransactions from './pages/PaymentTransactions/PaymentTransactions';
import CalculatorData from './pages/CalculatorData/CalculatorData';
import CalculatorDataForm from './pages/CalculatorData/CalculatorDataForm';
import './App.css';

const PrivateRoute = ({ children }) => {
  const admin = localStorage.getItem('admin');
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <UserForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <UserForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admins"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Admins />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admins/new"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <AdminForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admins/:id/edit"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <AdminForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Blogs />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/blogs/new"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <BlogForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/blogs/:id/edit"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <BlogForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Catalog />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog/new"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CatalogForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog/:id/edit"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CatalogForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/qr-codes"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <QRCodes />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/qr-codes/new"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <QRCodeForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/qr-codes/:id/edit"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <QRCodeForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/qr-codes/view/:ids"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <QRCodeView />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/qr-scans"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <QRScans />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/redeem-transactions"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <RedeemTransactions />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-transactions"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PaymentTransactions />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calculator-data"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CalculatorData />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calculator-data/new"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CalculatorDataForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calculator-data/:id/edit"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CalculatorDataForm />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
