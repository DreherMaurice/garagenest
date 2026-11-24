import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthState {
  session: Session | null
  status: 'loading' | 'ready' | 'error'
  error: string | null
  recoveringPassword: boolean
}

export const AuthContext = createContext<AuthState | null>(null)
