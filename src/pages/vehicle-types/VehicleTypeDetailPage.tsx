import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../app/auth/useAuth'
import { PageHeader } from '../../components/ui/PageHeader'
import { archiveField, archiveVehicleType, loadFields, loadVehicleType, reorderFields } from '../../services/vehicle-types'
import { DeleteConfirmation, EditorStatus } from './EditorControls'
import { FieldEditor } from './FieldEditor'
import { FieldList } from './FieldList'
import { useVehicleTypeAction } from './useVehicleTypeAction'
import { useVehicleTypeData } from './useVehicleTypeData'
import { VehicleTypeForm } from './VehicleTypeForm'
import { moveField, type FieldDefinition } from './vehicle-type-model'

export function VehicleTypeDetailPage() {
  const { typeId = '' } = useParams()
  // Reset editor state when navigating directly between detail URLs.
  return <VehicleTypeDetail key={typeId} typeId={typeId} />
}

function VehicleTypeDetail({ typeId }: { typeId: string }) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const load = useCallback(async (signal: AbortSignal) => {
    const [type, fields] = await Promise.all([loadVehicleType(typeId, signal), loadFields(typeId, signal)])
    return { type, fields }
  }, [typeId])
  const state = useVehicleTypeData(load)
  const action = useVehicleTypeAction()
  const [editor, setEditor] = useState<string | 'new' | null>(null)
  const [deleting, setDeleting] = useState<FieldDefinition | 'type' | null>(null)

  if (!state.data) {
    return (
      <div className="space-y-5">
        <Link className="form-secondary" to="/settings/vehicle-types">Zurück zu Fahrzeugarten</Link>
        <EditorStatus pending={state.loading} error={state.error} />
        {state.error ? <button className="form-secondary" onClick={state.reload}>Erneut laden</button> : null}
      </div>
    )
  }
  if (!session) return null
  const { type, fields } = state.data
  const ownerId = session.user.id
  const ownFields = fields.filter((field) => field.owner_id === ownerId)
  const standardFields = fields.filter((field) => !field.owner_id)
  const editingField = ownFields.find((field) => field.id === editor)
  const nextPosition = Math.max(999, ...ownFields.map((field) => field.sort_order)) + 1

  function fieldSaved() {
    setEditor(null)
    action.setMessage('Feld gespeichert.')
    state.reload()
  }

  return (
    <div className="animate-page-in space-y-8">
      <Link className="form-secondary" to="/settings/vehicle-types">Zurück zu Fahrzeugarten</Link>
      <PageHeader title={type.name} description={type.owner_id ? 'Eigene Fahrzeugart und individuelle Felder verwalten.' : 'Standardfelder ansehen und persönliche Felder ergänzen.'} />
      {type.owner_id === ownerId ? <VehicleTypeForm vehicleType={type} onSaved={state.reload} /> : null}
      {standardFields.length ? <FieldList title="Standardfelder · schreibgeschützt" fields={standardFields} /> : null}
      <EditorStatus {...action} />
      <FieldList
        title={type.owner_id ? 'Felder' : 'Persönliche Zusatzfelder'}
        fields={ownFields}
        editable
        pending={action.pending || editor !== null || deleting !== null}
        onEdit={(field) => setEditor(field.id)}
        onDelete={setDeleting}
        onMove={(id, direction) => void action.run(async () => {
          const next = moveField(ownFields, id, direction)
          await reorderFields(typeId, next.map((field) => field.id))
          action.setMessage('Reihenfolge gespeichert.')
          state.reload()
        })}
      />
      {editor === 'new' || editingField ? (
        <FieldEditor
          key={editingField ? `${editingField.id}:${editingField.revision}` : 'new'}
          typeId={typeId}
          ownerId={ownerId}
          field={editingField}
          nextPosition={nextPosition}
          onSaved={fieldSaved}
          onCancel={() => setEditor(null)}
        />
      ) : (
        <button className="form-secondary" type="button" disabled={action.pending || deleting !== null} onClick={() => setEditor('new')}>Feld hinzufügen</button>
      )}
      {deleting ? (
        <DeleteConfirmation
          error={action.error}
          name={deleting === 'type' ? type.name : deleting.name}
          pending={action.pending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void action.run(async () => {
            if (deleting === 'type') {
              await archiveVehicleType(typeId, ownerId)
              navigate('/settings/vehicle-types', { replace: true })
            } else {
              await archiveField(deleting, ownerId)
              setDeleting(null)
              action.setMessage('Feld entfernt. Frühere Revisionen bleiben erhalten.')
              state.reload()
            }
          })}
        />
      ) : null}
      {type.owner_id === ownerId && deleting === null ? (
        <div className="border-t border-separator pt-4">
          <button className="form-secondary text-danger" type="button" disabled={action.pending || editor !== null} onClick={() => setDeleting('type')}>Fahrzeugart löschen</button>
        </div>
      ) : null}
    </div>
  )
}
