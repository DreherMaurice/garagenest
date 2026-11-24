import { useGlassRef } from '@liquidlens/react'
import { useCallback, useEffect, useId, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

import { glassGeometry } from './glass-tokens'
import { GlassLegibility } from './GlassLegibility'

export function ConfirmDialog({ name, pending, error, onConfirm, onCancel }: {
  name: string; pending: boolean; error?: string | null
  onConfirm: () => void; onCancel: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const applyGlass = useGlassRef<HTMLDialogElement>(glassGeometry.dialog)
  const ref = useCallback((node: HTMLDialogElement | null) => {
    dialog.current = node
    applyGlass(node)
  }, [applyGlass])

  useEffect(() => {
    const node = dialog.current
    const previousFocus = document.activeElement
    node?.showModal()
    cancelButton.current?.focus()
    return () => {
      node?.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  return createPortal(
    <dialog
      ref={ref}
      data-glass=""
      data-lg-bezel={glassGeometry.dialog.bezel}
      className="lg-glass glass-surface glass-dialog"
      style={{ '--lg-radius': `${glassGeometry.dialog.radius}px` } as CSSProperties}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={pending}
      onCancel={(event) => { event.preventDefault(); if (!pending) onCancel() }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
        if (event.target === event.currentTarget && outside && !pending) onCancel()
      }}
    >
      <GlassLegibility />
      <div className="space-y-4 p-6">
        <h2 id={titleId} className="text-lg font-semibold">„{name}“ entfernen?</h2>
        <p id={descriptionId} className="text-sm leading-6 text-label-secondary">
          Der Eintrag wird archiviert. Vorhandene Definitionen und Revisionen bleiben erhalten.
        </p>
        {error ? <p role="alert" className="text-sm leading-6 text-danger">{error}</p> : null}
        {pending ? <p role="status" className="text-sm text-label-secondary">Wird entfernt …</p> : null}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-separator pt-3">
          <button ref={cancelButton} className="form-secondary" type="button" disabled={pending} onClick={onCancel}>Abbrechen</button>
          <button className="form-secondary text-danger" type="button" disabled={pending} onClick={onConfirm}>Entfernen bestätigen</button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
