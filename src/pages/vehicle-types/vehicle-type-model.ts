export const fieldTypes = {
  text: 'Text', integer: 'Ganzzahl', decimal: 'Dezimalzahl',
  date: 'Datum', boolean: 'Ja/Nein', select: 'Dropdown',
} as const

export type FieldType = keyof typeof fieldTypes
export type VehicleTypeIcon = 'car' | 'motorcycle' | 'trailer' | 'caravan' | 'motorhome' | 'van' | 'other'

export interface VehicleType {
  id: string
  owner_id: string | null
  system_key: string | null
  name: string
  icon: VehicleTypeIcon
  sort_order: number
  archived_at: string | null
}

export interface FieldDefinition {
  id: string
  vehicle_type_id: string
  owner_id: string | null
  name: string
  data_type: FieldType
  unit: string | null
  required: boolean
  sort_order: number
  options: string[]
  revision: number
  archived_at: string | null
}

export type FieldInput = Pick<FieldDefinition, 'name' | 'data_type' | 'unit' | 'required' | 'options'>

export function validateField(input: FieldInput): string | null {
  if (!input.name.trim() || input.name.trim().length > 80) return 'Der Feldname muss 1 bis 80 Zeichen lang sein.'
  if (!Object.hasOwn(fieldTypes, input.data_type)) return 'Bitte wähle einen gültigen Datentyp.'
  if (input.unit && input.unit.trim().length > 24) return 'Die Einheit darf maximal 24 Zeichen lang sein.'
  if (input.data_type === 'select') {
    const options = input.options.map((value) => value.trim())
    if (!options.length || options.length > 50 || options.some((value) => !value || value.length > 80)) {
      return 'Bitte gib 1 bis 50 Auswahlmöglichkeiten mit jeweils maximal 80 Zeichen ein.'
    }
    if (new Set(options.map((value) => value.toLowerCase())).size !== options.length) {
      return 'Auswahlmöglichkeiten dürfen nicht doppelt vorkommen.'
    }
  } else if (input.options.length) return 'Nur Dropdown-Felder dürfen Auswahlmöglichkeiten besitzen.'
  return null
}

export function moveField(fields: FieldDefinition[], id: string, direction: -1 | 1) {
  const from = fields.findIndex((field) => field.id === id)
  const to = from + direction
  if (from < 0 || to < 0 || to >= fields.length) return fields
  const next = [...fields]
  const moved = next[from]
  next[from] = next[to]
  next[to] = moved
  return next
}
