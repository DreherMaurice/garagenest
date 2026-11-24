import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'

import { ListSection } from '../../components/ui/ListSection'
import { fieldTypes, type FieldDefinition } from './vehicle-type-model'

export function FieldList({ fields, title, editable = false, pending = false, onEdit, onDelete, onMove }: {
  fields: FieldDefinition[]; title: string; editable?: boolean; pending?: boolean
  onEdit?: (field: FieldDefinition) => void
  onDelete?: (field: FieldDefinition) => void
  onMove?: (id: string, direction: -1 | 1) => void
}) {
  return (
    <ListSection title={title}>
      {fields.map((field, index) => (
        <li key={field.id} className="border-b border-separator px-4 py-3 last:border-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="min-w-0 py-1">
              <h3 className="break-words text-base font-medium">{field.name}</h3>
              <p className="text-[13px] leading-5 text-label-secondary">
                {[fieldTypes[field.data_type], field.unit, field.required ? 'Pflichtfeld' : 'Optional'].filter(Boolean).join(' · ')}
              </p>
            </div>
            {editable ? (
              <div className="flex shrink-0 items-center">
                <button className="field-icon-button" type="button" aria-label={`${field.name} nach oben`} disabled={pending || index === 0} onClick={() => onMove?.(field.id, -1)}><ArrowUp className="size-4" aria-hidden="true" /></button>
                <button className="field-icon-button" type="button" aria-label={`${field.name} nach unten`} disabled={pending || index === fields.length - 1} onClick={() => onMove?.(field.id, 1)}><ArrowDown className="size-4" aria-hidden="true" /></button>
                <button className="field-icon-button" type="button" aria-label={`${field.name} bearbeiten`} disabled={pending} onClick={() => onEdit?.(field)}><Pencil className="size-4" aria-hidden="true" /></button>
                <button className="field-icon-button text-danger" type="button" aria-label={`${field.name} entfernen`} disabled={pending} onClick={() => onDelete?.(field)}><Trash2 className="size-4" aria-hidden="true" /></button>
              </div>
            ) : null}
          </div>
          {field.data_type === 'select' ? <p className="mt-1 break-words text-[13px] leading-5 text-label-secondary">{field.options.join(', ')}</p> : null}
        </li>
      ))}
      {!fields.length ? <li className="px-4 py-5 text-sm text-label-secondary">Noch keine Felder vorhanden.</li> : null}
    </ListSection>
  )
}
