import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import EquipmentDetailPage from './pages/EquipmentDetailPage'
import MyBookingsPage from './pages/MyBookingsPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

/** Layout wrapper — shows Navbar + Footer for non-auth pages */
function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

/** Redirect already-authenticated users away from login/register */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* ── Auth Pages (no Navbar/Footer) ── */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />

            {/* ── Main App Pages (with Navbar + Footer) ── */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <HomePage />
                </AppLayout>
              }
            />
            <Route
              path="/equipment/:id"
              element={
                <AppLayout>
                  <EquipmentDetailPage />
                </AppLayout>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                </AppLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['faculty', 'admin']} redirectTo="/">
                      <DashboardPage />
                    </RoleGuard>
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            {/* ── Fallback ── */}
            <Route
              path="*"
              element={
                <AppLayout>
                  <NotFoundPage />
                </AppLayout>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
