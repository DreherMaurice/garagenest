import type { FieldDefinition, FieldInput, VehicleType, VehicleTypeIcon } from '../pages/vehicle-types/vehicle-type-model'
import { validateField } from '../pages/vehicle-types/vehicle-type-model'
import { supabase } from './supabase'

function client() {
  if (!supabase) throw new Error('Supabase ist nicht eingerichtet.')
  return supabase
}

function singleRow<T>(rows: T[] | null): T {
  if (!rows || rows.length !== 1) throw Object.assign(new Error('Record not available'), { code: 'PGRST116' })
  return rows[0]
}

export function vehicleTypeError(error: unknown): string {
  if (error instanceof Error && error.name === 'FieldValidationError') return error.message
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
  if (['42P01', 'PGRST205', 'PGRST202'].includes(code)) return 'Die Fahrzeugarten-Datenbank ist noch nicht eingerichtet. Bitte führe die Migrationen laut README aus.'
  if (code === '23505') return 'Eine eigene Fahrzeugart mit diesem Namen ist bereits vorhanden.'
  if (code === '42501') return 'Diese Änderung ist nicht erlaubt. Bitte prüfe deine Anmeldung und lade die Seite neu.'
  if (['40001', 'PGRST116', '22P02'].includes(code)) return 'Die Daten wurden zwischenzeitlich geändert oder sind nicht mehr verfügbar. Bitte lade die Seite neu.'
  if (code === '23514') return 'Die Angaben sind ungültig. Bitte prüfe Name, Einheit und Auswahlmöglichkeiten.'
  return 'Die Daten konnten nicht gespeichert oder geladen werden. Bitte prüfe deine Verbindung und versuche es erneut.'
}

export async function loadVehicleTypes(signal: AbortSignal) {
  const { data, error } = await client().from('vehicle_types').select('*')
    .is('archived_at', null).order('sort_order').order('name').abortSignal(signal)
    .overrideTypes<VehicleType[], { merge: false }>()
  if (error) throw error
  return data
}

export async function loadVehicleType(id: string, signal: AbortSignal) {
  const { data, error } = await client().from('vehicle_types').select('*')
    .eq('id', id).is('archived_at', null).abortSignal(signal)
    .overrideTypes<VehicleType[], { merge: false }>()
  if (error) throw error
  return singleRow(data)
}

export async function saveVehicleType(ownerId: string, input: { name: string; icon: VehicleTypeIcon }, id?: string) {
  const values = { name: input.name.trim(), icon: input.icon }
  const query = id
    ? client().from('vehicle_types').update(values).eq('id', id).eq('owner_id', ownerId).is('archived_at', null)
    : client().from('vehicle_types').insert({ ...values, owner_id: ownerId })
  const { data, error } = await query.select('*').overrideTypes<VehicleType[], { merge: false }>()
  if (error) throw error
  return singleRow(data)
}

export async function archiveVehicleType(id: string, ownerId: string) {
  const { error } = await client().from('vehicle_types').update({ archived_at: new Date().toISOString() })
    .eq('id', id).eq('owner_id', ownerId).is('archived_at', null).select('id').single()
  if (error) throw error
}

export async function loadFields(typeId: string, signal: AbortSignal) {
  const { data, error } = await client().from('vehicle_field_definitions').select('*')
    .eq('vehicle_type_id', typeId).is('archived_at', null).order('sort_order').order('id')
    .abortSignal(signal).overrideTypes<FieldDefinition[], { merge: false }>()
  if (error) throw error
  return data
}

export async function saveField(typeId: string, ownerId: string, input: FieldInput, field?: FieldDefinition, position = 1000) {
  const validationError = validateField(input)
  if (validationError) {
    const error = new Error(validationError)
    error.name = 'FieldValidationError'
    throw error
  }
  const values = { ...input, name: input.name.trim(), unit: input.unit?.trim() || null, options: input.options.map((option) => option.trim()) }
  const query = field
    ? client().from('vehicle_field_definitions').update(values).eq('id', field.id)
      .eq('vehicle_type_id', typeId).eq('owner_id', ownerId).eq('revision', field.revision).is('archived_at', null)
    : client().from('vehicle_field_definitions').insert({ ...values, vehicle_type_id: typeId, owner_id: ownerId, sort_order: position })
  const { data, error } = await query.select('*').overrideTypes<FieldDefinition[], { merge: false }>()
  if (error) throw error
  return singleRow(data)
}

export async function archiveField(field: FieldDefinition, ownerId: string) {
  const { error } = await client().from('vehicle_field_definitions').update({ archived_at: new Date().toISOString() })
    .eq('id', field.id).eq('owner_id', ownerId).eq('revision', field.revision).is('archived_at', null).select('id').single()
  if (error) throw error
}

export async function reorderFields(typeId: string, fieldIds: string[]) {
  const { error } = await client().rpc('reorder_vehicle_fields', { p_vehicle_type_id: typeId, p_field_ids: fieldIds })
  if (error) throw error
}
