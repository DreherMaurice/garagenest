import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { AuthBoundary } from '../../components/auth/AuthBoundary'
import { useAuth } from './useAuth'

function SessionRoutes() {
  const { session, recoveringPassword } = useAuth()
  const location = useLocation()
  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }
  if (recoveringPassword) return <Navigate to="/auth/update-password" replace />
  return <Outlet />
}

export function RequireAuth() {
  return (
    <div className="min-h-dvh">
      <AuthBoundary><SessionRoutes /></AuthBoundary>
    </div>
  )
}
