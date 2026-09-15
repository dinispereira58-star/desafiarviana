import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import Login from '@/pages/Login'
import Bookings from '@/pages/Bookings'
import Site from '@/pages/Site'

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
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/site" element={<ProtectedRoute><Site /></ProtectedRoute>} />
    </Routes>
  )
}
