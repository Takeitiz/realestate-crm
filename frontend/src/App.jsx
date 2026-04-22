import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PropertyListPage from './pages/PropertyListPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import PropertyFormPage from './pages/PropertyFormPage'
import BuyerRequirementsPage from './pages/BuyerRequirementsPage'
import ChatSearchPage from './pages/ChatSearchPage'
import PitchGeneratorPage from './pages/PitchGeneratorPage'
import PublicPropertyPage from './pages/PublicPropertyPage'
import AppointmentsPage from './pages/AppointmentsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="properties" element={<PropertyListPage />} />
        <Route path="properties/new" element={<PropertyFormPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="properties/:id/edit" element={<PropertyFormPage />} />
        <Route path="buyers" element={<BuyerRequirementsPage />} />
        <Route path="search" element={<ChatSearchPage />} />
        <Route path="pitch" element={<PitchGeneratorPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
      </Route>
      {/* Public routes — no login required */}
      <Route path="/public/p/:token" element={<PublicPropertyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0d1117' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0d1117' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
