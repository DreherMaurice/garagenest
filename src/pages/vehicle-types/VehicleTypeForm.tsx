import { useState, type FormEvent } from 'react'

import { useAuth } from '../../app/auth/useAuth'
import { saveVehicleType } from '../../services/vehicle-types'
import { GlassButton } from '../../components/glass/GlassButton'
import { EditorStatus, FormRow } from './EditorControls'
import { useVehicleTypeAction } from './useVehicleTypeAction'
import { vehicleTypeIcons } from './vehicle-type-icons'
import type { VehicleType, VehicleTypeIcon } from './vehicle-type-model'

export function VehicleTypeForm({ vehicleType, onSaved }: {
  vehicleType?: VehicleType; onSaved: (value: VehicleType) => void
}) {
  const { session } = useAuth()
  const [name, setName] = useState(vehicleType?.name || '')
  const [icon, setIcon] = useState<VehicleTypeIcon>(vehicleType?.icon || 'other')
  const action = useVehicleTypeAction()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return
    void action.run(async () => {
      const value = await saveVehicleType(session.user.id, { name, icon }, vehicleType?.id)
      action.setMessage('Fahrzeugart gespeichert.')
      onSaved(value)
    })
  }

  return (
    <form className="space-y-4" onSubmit={submit} aria-busy={action.pending}>
      <fieldset className="form-fields" disabled={action.pending}>
        <legend className="sr-only">Fahrzeugart bearbeiten</legend>
        <FormRow label="Name"><input className="form-control" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></FormRow>
      </fieldset>
      <fieldset disabled={action.pending}>
        <legend className="mb-2 text-sm text-label-secondary">Icon</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(vehicleTypeIcons).map(([value, { label, icon: Icon }]) => (
            <label className="cursor-pointer" key={value}>
              <input className="peer sr-only" type="radio" name="type-icon" value={value} checked={icon === value} onChange={() => setIcon(value as VehicleTypeIcon)} />
              <span className="grid size-12 place-items-center rounded-xl border border-separator bg-surface text-label-secondary peer-checked:border-accent peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="sr-only">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <EditorStatus {...action} />
      <GlassButton className="w-full" disabled={action.pending || !name.trim()} type="submit">
        {vehicleType ? 'Änderungen speichern' : 'Fahrzeugart erstellen'}
      </GlassButton>
    </form>
  )
}
