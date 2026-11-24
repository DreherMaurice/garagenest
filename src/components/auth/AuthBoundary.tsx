import type { PropsWithChildren } from 'react'

import { useAuth } from '../../app/auth/useAuth'
import { supabase } from '../../services/supabase'
import { AuthStatus } from './AuthStatus'

export function AuthBoundary({ children }: PropsWithChildren) {
  const { status, error } = useAuth()
  if (!supabase) {
    return (
      <section className="mx-auto max-w-md space-y-3 px-5 py-8" aria-labelledby="setup-title">
        <h2 id="setup-title" className="text-lg font-semibold">Verbindung einrichten</h2>
        <p className="text-sm leading-6 text-label-secondary">
          Die Anmeldung ist noch nicht eingerichtet. Bitte hinterlege die Supabase-Projekt-URL
          und den öffentlichen Publishable Key in .env.local und starte die App neu.
          Die Anleitung steht in der README.
        </p>
      </section>
    )
  }
  if (status === 'loading') return <div className="mx-auto max-w-md px-5 py-8"><AuthStatus pending /></div>
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md space-y-4 px-5 py-8">
        <AuthStatus error={error || 'Deine Sitzung konnte nicht geladen werden.'} />
        <button className="auth-secondary" onClick={() => window.location.reload()}>Erneut versuchen</button>
      </div>
    )
  }
  return children
}
