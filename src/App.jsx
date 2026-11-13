import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded pages for code-splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ReportLost = lazy(() => import('./pages/ReportLost'));
const ReportFound = lazy(() => import('./pages/ReportFound'));
const BrowseItems = lazy(() => import('./pages/BrowseItems'));
const AIMatching = lazy(() => import('./pages/AIMatching'));
const MyActivity = lazy(() => import('./pages/MyActivity'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ItemManagement = lazy(() => import('./pages/ItemManagement'));
const OwnershipVerification = lazy(() => import('./pages/OwnershipVerification'));
const SystemManagement = lazy(() => import('./pages/SystemManagement'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading NEXORA..." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* General User routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-lost"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                    <ReportLost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-found"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                    <ReportFound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                    <BrowseItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-matching"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                    <AIMatching />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-activity"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                    <MyActivity />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/items"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <ItemManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verification"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <OwnershipVerification />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin routes */}
              <Route
                path="/system"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <SystemManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
