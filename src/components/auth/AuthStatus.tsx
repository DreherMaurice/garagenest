import { LoaderCircle } from 'lucide-react'

export function AuthStatus({ error, message, pending = false }: {
  error?: string | null
  message?: string | null
  pending?: boolean
}) {
  return (
    <>
      {pending ? (
        <p className="flex items-center gap-2 text-sm text-label-secondary" role="status">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Bitte warten …
        </p>
      ) : null}
      {error ? <p className="text-sm leading-6 text-danger" role="alert">{error}</p> : null}
      {message ? <p className="text-sm leading-6 text-label-secondary" role="status">{message}</p> : null}
    </>
  )
}
