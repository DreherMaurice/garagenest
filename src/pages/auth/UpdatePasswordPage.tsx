import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../app/auth/useAuth'
import { useAuthAction } from '../../app/auth/useAuthAction'
import { AuthField } from '../../components/auth/AuthField'
import { AuthStatus } from '../../components/auth/AuthStatus'
import { GlassButton } from '../../components/glass/GlassButton'
import { PageHeader } from '../../components/ui/PageHeader'
import { updatePassword } from '../../services/auth'

export function UpdatePasswordPage() {
  const { session, error } = useAuth()
  const action = useAuthAction()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)
    if (password !== confirmation) {
      setValidationError('Die Passwörter stimmen nicht überein.')
      return
    }
    void action.run(async () => {
      await updatePassword(password)
      setPassword('')
      setConfirmation('')
      action.setMessage('Dein Passwort wurde geändert.')
    })
  }

  return (
    <div>
      <PageHeader title="Neues Passwort" description="Wähle ein neues Passwort mit mindestens 12 Zeichen." />
      {error || !session ? (
        <div className="space-y-4">
          <AuthStatus error={error || 'Bitte öffne einen gültigen Link aus deiner E-Mail oder melde dich an.'} />
          <Link className="auth-secondary" to="/forgot-password">Neuen Link anfordern</Link>
        </div>
      ) : action.message ? (
        <div className="space-y-4">
          <AuthStatus message={action.message} />
          <GlassButton className="w-full" onClick={() => navigate('/', { replace: true })}>
            Weiter zur Garage
          </GlassButton>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={submit} aria-busy={action.pending}>
          <fieldset className="auth-fields" disabled={action.pending}>
            <legend className="sr-only">Neues Passwort festlegen</legend>
            <AuthField
              label="Neues Passwort"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <AuthField
              label="Passwort wiederholen"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </fieldset>
          <AuthStatus pending={action.pending} error={validationError || action.error} />
          <GlassButton className="w-full" type="submit" disabled={action.pending}>Passwort speichern</GlassButton>
        </form>
      )}
    </div>
  )
}
