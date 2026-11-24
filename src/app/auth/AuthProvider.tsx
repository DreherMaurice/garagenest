import { useEffect, useState, type PropsWithChildren } from 'react'

import { supabase } from '../../services/supabase'
import { AuthContext, type AuthState } from './auth-context'
import { getAuthErrorMessage } from './auth-errors'
import { getRedirectError } from './auth-redirects'

// Capture before the SDK consumes the callback fragment. Never retain its tokens.
const redirectError = getRedirectError(window.location.search, window.location.hash)

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    session: null,
    status: supabase ? 'loading' : 'error',
    error: null,
    recoveringPassword: false,
  })

  useEffect(() => {
    const client = supabase
    if (!client) return
    let active = true
    let authEventReceived = false

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return
      authEventReceived = true
      setState((previous) => ({
        session,
        status: 'ready',
        error: event === 'INITIAL_SESSION' && redirectError ? getAuthErrorMessage({ code: redirectError }) : null,
        recoveringPassword: event === 'PASSWORD_RECOVERY' ||
          (previous.recoveringPassword && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED'),
      }))
    })

    // onAuthStateChange owns subsequent updates; do not overwrite a newer event.
    client.auth.getSession().then(({ data, error }) => {
      if (!active || authEventReceived) return
      setState({
        session: data.session,
        status: error ? 'error' : 'ready',
        error: error ? getAuthErrorMessage(error) :
          redirectError ? getAuthErrorMessage({ code: redirectError }) : null,
        recoveringPassword: false,
      })
    }).catch((error: unknown) => {
      if (!active || authEventReceived) return
      setState({ session: null, status: 'error', error: getAuthErrorMessage(error), recoveringPassword: false })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
