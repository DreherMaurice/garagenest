import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { safeReturnPath } from '../../app/auth/auth-redirects'
import { useAuth } from '../../app/auth/useAuth'
import { useAuthAction } from '../../app/auth/useAuthAction'
import { AuthField } from '../../components/auth/AuthField'
import { AuthStatus } from '../../components/auth/AuthStatus'
import { GlassButton } from '../../components/glass/GlassButton'
import { PageHeader } from '../../components/ui/PageHeader'
import { requestPasswordReset, resendConfirmation, signIn, signUp } from '../../services/auth'

const headings = {
  login: { title: 'Anmelden', description: 'Willkommen zurück in deiner Garage.' },
  register: { title: 'Konto erstellen', description: 'Deine Garage beginnt mit deinem persönlichen Konto.' },
  reset: { title: 'Passwort vergessen?', description: 'Wir senden dir einen Link, mit dem du ein neues Passwort wählen kannst.' },
}

export function CredentialsPage({ mode }: { mode: keyof typeof headings }) {
  const { session, recoveringPassword, error: redirectError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const action = useAuthAction()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const returnPath = safeReturnPath(location.state?.from)

  if (session && mode !== 'reset') {
    return <Navigate to={recoveringPassword ? '/auth/update-password' : returnPath} replace />
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)
    if (mode === 'register' && password !== confirmation) {
      setValidationError('Die Passwörter stimmen nicht überein.')
      return
    }
    void action.run(async () => {
      const address = email.trim()
      if (mode === 'login') {
        await signIn(address, password)
        setPassword('')
        navigate(returnPath, { replace: true })
      } else if (mode === 'register') {
        const newSession = await signUp(address, password, displayName)
        setPassword('')
        setConfirmation('')
        if (newSession) navigate('/', { replace: true })
        else action.setMessage('Wenn die Registrierung möglich ist, erhältst du eine E-Mail. Bitte bestätige dort deine Adresse und kehre anschließend zur App zurück.')
      } else {
        await requestPasswordReset(address)
        action.setMessage('Falls zu dieser Adresse ein Konto besteht, erhältst du eine E-Mail mit einem Link zum Zurücksetzen. Bitte prüfe auch den Spam-Ordner.')
      }
    })
  }

  return (
    <div className="animate-page-in">
      <PageHeader {...headings[mode]} />
      <form className="space-y-5" onSubmit={submit} aria-busy={action.pending}>
        <fieldset className="auth-fields" disabled={action.pending}>
          <legend className="sr-only">{headings[mode].title}</legend>
          {mode === 'register' ? (
            <AuthField
              label="Anzeigename (optional)"
              autoComplete="nickname"
              maxLength={80}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          ) : null}
          <AuthField
            label="E-Mail"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {mode !== 'reset' ? (
            <AuthField
              label="Passwort"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 12 : undefined}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          ) : null}
          {mode === 'register' ? (
            <AuthField
              label="Passwort wiederholen"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          ) : null}
        </fieldset>
        {mode === 'register' ? <p className="text-sm text-label-secondary">Verwende mindestens 12 Zeichen für dein Passwort.</p> : null}
        <AuthStatus
          pending={action.pending}
          error={validationError || action.error || (!action.message ? redirectError : null)}
          message={action.message}
        />
        <GlassButton className="w-full" disabled={action.pending} type="submit">
          {mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Konto erstellen' : 'Link senden'}
        </GlassButton>
        {mode !== 'reset' ? (
          <button
            className="auth-secondary w-full"
            type="button"
            disabled={action.pending || !email.trim()}
            onClick={(event) => {
              const emailInput = event.currentTarget.form?.querySelector<HTMLInputElement>('input[type="email"]')
              if (!emailInput?.reportValidity()) return
              void action.run(async () => {
                await resendConfirmation(email.trim())
                action.setMessage('Falls noch eine Bestätigung erforderlich ist, erhältst du eine neue E-Mail.')
              })
            }}
          >
            Bestätigungs-E-Mail erneut senden
          </button>
        ) : null}
      </form>
      <nav className="mt-6 flex flex-col items-start gap-2 text-sm" aria-label="Kontooptionen">
        {mode === 'login' ? (
          <>
            <Link className="auth-secondary" to="/forgot-password">Passwort vergessen?</Link>
            <Link className="auth-secondary" to="/register">Neues Konto erstellen</Link>
          </>
        ) : (
          <Link className="auth-secondary" to="/login">Zur Anmeldung</Link>
        )}
      </nav>
    </div>
  )
}
