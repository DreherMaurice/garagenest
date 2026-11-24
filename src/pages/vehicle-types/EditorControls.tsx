import { LoaderCircle } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { ConfirmDialog } from '../../components/glass/ConfirmDialog'

export function FormRow({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <label className="block border-b border-separator px-4 py-3 last:border-0">
      <span className="mb-1 block text-[13px] text-label-secondary">{label}</span>
      {children}
    </label>
  )
}

export function EditorStatus({ pending, error, message }: {
  pending?: boolean; error?: string | null; message?: string | null
}) {
  return (
    <>
      {pending ? <p className="flex items-center gap-2 text-sm text-label-secondary" role="status"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Bitte warten …</p> : null}
      {error ? <p className="text-sm leading-6 text-danger" role="alert">{error}</p> : null}
      {message ? <p className="text-sm leading-6 text-label-secondary" role="status">{message}</p> : null}
    </>
  )
}

export function DeleteConfirmation(props: {
  name: string; pending: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void
}) {
  return <ConfirmDialog {...props} />
}
