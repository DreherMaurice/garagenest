import { Link, Navigate } from 'react-router-dom'

import { useAuth } from '../../app/auth/useAuth'
import { AuthStatus } from '../../components/auth/AuthStatus'
import { PageHeader } from '../../components/ui/PageHeader'

export function AuthCallbackPage() {
  const { session, error, recoveringPassword } = useAuth()
  if (!error && session) return <Navigate to={recoveringPassword ? '/auth/update-password' : '/'} replace />
  return (
    <div className="space-y-5">
      <PageHeader title="E-Mail bestätigen" />
      <AuthStatus error={error} message={!error ? 'Es wurde keine gültige Sitzung gefunden. Bitte melde dich an oder fordere eine neue Bestätigungs-E-Mail an.' : null} />
      <Link className="auth-secondary" to="/login">Zur Anmeldung</Link>
    </div>
  )
}
