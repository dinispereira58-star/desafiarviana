import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useCrmSettings } from '@/lib/useCrmSettings'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Bookings from '@/pages/Bookings'
import Clientes from '@/pages/Clientes'
import CalendarPage from '@/pages/Calendar'
import Publications from '@/pages/Publications'
import Site from '@/pages/Site'
import UserManagement from '@/pages/UserManagement'
import SettingsPage from '@/pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  useCrmSettings() // aplica as cores da marca (--color-brand/--color-brand-dark) globalmente
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/Bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/Clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
      <Route path="/Calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/Publications" element={<ProtectedRoute><Publications /></ProtectedRoute>} />
      <Route path="/Site" element={<ProtectedRoute><Site /></ProtectedRoute>} />
      <Route path="/UserManagement" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/Settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  )
}
