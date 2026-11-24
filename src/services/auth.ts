import { supabase } from './supabase'

function authClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase.auth
}

const callbackUrl = () => new URL('/auth/callback', window.location.origin).href

export async function signIn(email: string, password: string) {
  const { error } = await authClient().signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await authClient().signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(),
      data: { display_name: displayName.trim() || null },
    },
  })
  if (error) throw error
  return data.session
}

export async function resendConfirmation(email: string) {
  const { error } = await authClient().resend({ type: 'signup', email, options: { emailRedirectTo: callbackUrl() } })
  if (error) throw error
}

export async function requestPasswordReset(email: string) {
  const { error } = await authClient().resetPasswordForEmail(email, {
    redirectTo: new URL('/auth/update-password', window.location.origin).href,
  })
  if (error) throw error
}

export async function updatePassword(password: string) {
  const { error } = await authClient().updateUser({ password })
  if (error) throw error
}

export async function updateDisplayName(displayName: string) {
  const { error } = await authClient().updateUser({ data: { display_name: displayName.trim() || null } })
  if (error) throw error
}

export async function signOut() {
  const { error } = await authClient().signOut({ scope: 'local' })
  if (error) throw error
}
