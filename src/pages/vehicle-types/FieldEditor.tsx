import { useState, type FormEvent } from 'react'

import { saveField } from '../../services/vehicle-types'
import { GlassButton } from '../../components/glass/GlassButton'
import { EditorStatus, FormRow } from './EditorControls'
import { useVehicleTypeAction } from './useVehicleTypeAction'
import { fieldTypes, validateField, type FieldDefinition, type FieldType } from './vehicle-type-model'

export function FieldEditor({ typeId, ownerId, field, nextPosition, onSaved, onCancel }: {
  typeId: string; ownerId: string; field?: FieldDefinition; nextPosition: number
  onSaved: () => void; onCancel: () => void
}) {
  const [name, setName] = useState(field?.name || '')
  const [kind, setKind] = useState<FieldType>(field?.data_type || 'text')
  const [unit, setUnit] = useState(field?.unit || '')
  const [required, setRequired] = useState(field?.required || false)
  const [choices, setChoices] = useState(field?.options.join('\n') || '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const action = useVehicleTypeAction()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = { name, data_type: kind, unit, required, options: kind === 'select' ? choices.split('\n').map((value) => value.trim()) : [] }
    const error = validateField(input)
    setValidationError(error)
    if (error) return
    void action.run(async () => {
      await saveField(typeId, ownerId, input, field, nextPosition)
      onSaved()
    })
  }

  return (
    <form className="space-y-4" onSubmit={submit} aria-busy={action.pending}>
      <h3 className="text-lg font-semibold">{field ? 'Feld bearbeiten' : 'Neues Feld'}</h3>
      <fieldset className="form-fields" disabled={action.pending}>
        <legend className="sr-only">Felddefinition</legend>
        <FormRow label="Name"><input className="form-control" maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} /></FormRow>
        <FormRow label="Datentyp">
          <select className="form-control" value={kind} onChange={(event) => setKind(event.target.value as FieldType)}>
            {Object.entries(fieldTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FormRow>
        <FormRow label="Einheit (optional)"><input className="form-control" maxLength={24} placeholder="z. B. kg" value={unit} onChange={(event) => setUnit(event.target.value)} /></FormRow>
        <label className="flex min-h-12 items-center justify-between gap-4 px-4 py-3 text-base">
          Pflichtfeld<input className="size-5 accent-accent" type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} />
        </label>
        {kind === 'select' ? (
          <FormRow label="Auswahlmöglichkeiten – eine pro Zeile">
            <textarea className="form-control min-h-32" required rows={4} value={choices} onChange={(event) => setChoices(event.target.value)} />
          </FormRow>
        ) : null}
      </fieldset>
      {field ? <p className="text-sm leading-6 text-label-secondary">Die Änderung erstellt eine neue Revision. Frühere Definitionen bleiben erhalten.</p> : null}
      <EditorStatus pending={action.pending} error={validationError || action.error} />
      <div className="flex flex-wrap items-center gap-4">
        <GlassButton className="w-full sm:w-auto" disabled={action.pending} type="submit">Feld speichern</GlassButton>
        <button className="form-secondary" disabled={action.pending} type="button" onClick={onCancel}>Abbrechen</button>
      </div>
    </form>
  )
}
