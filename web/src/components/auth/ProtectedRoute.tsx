import { useAccount } from '@/domains/conta/context/AccountContext'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  const { authenticated, loading } = useAccount()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-deep-rose border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
