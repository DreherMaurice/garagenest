import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../app/auth/useAuth'
import { useAuthAction } from '../../app/auth/useAuthAction'
import { AuthField } from '../../components/auth/AuthField'
import { AuthStatus } from '../../components/auth/AuthStatus'
import { signOut, updateDisplayName } from '../../services/auth'

export function AccountSection() {
  const { session } = useAuth()
  const user = session?.user
  const storedName: unknown = user?.user_metadata.display_name
  const [displayName, setDisplayName] = useState(typeof storedName === 'string' ? storedName : '')
  const action = useAuthAction()

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void action.run(async () => {
      await updateDisplayName(displayName)
      action.setMessage('Dein Anzeigename wurde gespeichert.')
    })
  }

  return (
    <section className="mb-8 space-y-4" aria-labelledby="account-title">
      <h2 id="account-title" className="px-4 text-[13px] font-medium text-label-secondary">Benutzerkonto</h2>
      <form className="space-y-4" onSubmit={saveProfile} aria-busy={action.pending}>
        <fieldset className="auth-fields" disabled={action.pending}>
          <legend className="sr-only">Benutzerprofil</legend>
          <AuthField
            label="E-Mail"
            type="email"
            autoComplete="email"
            value={user?.email || ''}
            readOnly
          />
          <AuthField
            label="Anzeigename (optional)"
            autoComplete="nickname"
            maxLength={80}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </fieldset>
        <p className="px-4 text-[13px] text-label-secondary">
          {user?.email_confirmed_at ? 'E-Mail-Adresse bestätigt' : 'E-Mail-Adresse noch nicht bestätigt'}
        </p>
        <AuthStatus pending={action.pending} error={action.error} message={action.message} />
        <button className="auth-secondary" type="submit" disabled={action.pending}>Anzeigename speichern</button>
      </form>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-separator pt-3">
        <Link className="auth-secondary" to="/auth/update-password">Passwort ändern</Link>
        <button className="auth-secondary" type="button" disabled={action.pending} onClick={() => void action.run(signOut)}>
          Auf diesem Gerät abmelden
        </button>
      </div>
    </section>
  )
}
