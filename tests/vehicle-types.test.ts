import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fieldTypes, moveField, validateField, type FieldDefinition, type FieldInput, type FieldType } from '../src/pages/vehicle-types/vehicle-type-model.ts'

const textField: FieldInput = { name: 'Reifendruck', data_type: 'decimal', unit: 'bar', required: false, options: [] }

test('field validation accepts supported types and rejects invalid definitions', () => {
  assert.equal(validateField(textField), null)
  for (const kind of Object.keys(fieldTypes) as FieldType[]) {
    assert.equal(validateField({ ...textField, data_type: kind, options: kind === 'select' ? ['Option'] : [] }), null)
  }
  assert.ok(validateField({ ...textField, data_type: 'constructor' as FieldType }))
  assert.equal(validateField({ ...textField, data_type: 'select', options: ['Sommer', 'Winter'] }), null)
  for (const input of [
    { ...textField, name: ' ' },
    { ...textField, name: 'x'.repeat(81) },
    { ...textField, unit: 'x'.repeat(25) },
    { ...textField, options: ['not a dropdown'] },
    { ...textField, data_type: 'select' as const, options: [] },
    { ...textField, data_type: 'select' as const, options: ['Sommer', ' sommer '] },
    { ...textField, data_type: 'select' as const, options: [''] },
  ]) assert.ok(validateField(input))
})

test('ordering preserves field identity and definitions without mutating loaded data', () => {
  const fields: FieldDefinition[] = ['a', 'b', 'c'].map((id, index) => ({
    ...textField, id, vehicle_type_id: 'type', owner_id: 'owner', revision: 1,
    archived_at: null, sort_order: index,
  }))
  const reordered = moveField(fields, 'b', -1)
  assert.deepEqual(reordered.map((field) => field.id), ['b', 'a', 'c'])
  assert.deepEqual(fields.map((field) => field.id), ['a', 'b', 'c'])
  assert.equal(reordered[0], fields[1])
  assert.equal(moveField(fields, 'a', -1), fields)
  assert.equal(moveField(fields, 'c', 1), fields)
  assert.equal(moveField(fields, 'missing', 1), fields)
})
