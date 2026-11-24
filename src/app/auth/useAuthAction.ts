import { useAsyncAction } from '../useAsyncAction'
import { getAuthErrorMessage } from './auth-errors'

export function useAuthAction() {
  return useAsyncAction(getAuthErrorMessage)
}
