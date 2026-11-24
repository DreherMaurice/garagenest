import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getAuthErrorMessage } from '../src/app/auth/auth-errors.ts'
import { getRedirectError, safeReturnPath } from '../src/app/auth/auth-redirects.ts'
import { getSupabaseConfig } from '../src/services/supabase-config.ts'

test('Supabase accepts only public publishable keys and valid project origins', () => {
  const key = 'sb_publishable_test-only'
  assert.deepEqual(getSupabaseConfig('https://project.supabase.co', key), { url: 'https://project.supabase.co', key })
  assert.ok(getSupabaseConfig('http://localhost:54321', key))
  for (const unsafeKey of ['sb_secret_test', 'eyJ.service_role', '', undefined]) {
    assert.equal(getSupabaseConfig('https://project.supabase.co', unsafeKey), null)
  }
  for (const url of ['invalid', 'http://example.com', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?token=test', undefined]) {
    assert.equal(getSupabaseConfig(url, key), null)
  }
  assert.equal(getSupabaseConfig(undefined, undefined), null)
})

test('return paths stay inside the app and cannot loop through auth pages', () => {
  assert.equal(safeReturnPath('/vehicles?view=list'), '/vehicles?view=list')
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/\n/example.com', '/login', '/auth/callback#token', '/register?from=/', null, {}]) {
    assert.equal(safeReturnPath(path), '/')
  }
})

test('callback errors are read from both implicit fragments and query parameters', () => {
  assert.equal(getRedirectError('', '#error=access_denied&error_code=otp_expired'), 'otp_expired')
  assert.equal(getRedirectError('?error_code=otp_expired', ''), 'otp_expired')
  assert.equal(getRedirectError('', '#access_token=private'), null)
})

test('error messages cover verification, rate limits and connection errors without leaking server details', () => {
  assert.match(getAuthErrorMessage({ code: 'email_not_confirmed' }), /bestätige/)
  assert.match(getAuthErrorMessage({ status: 429 }), /Zu viele/)
  assert.match(getAuthErrorMessage({ code: 'otp_expired' }), /abgelaufen/)
  assert.match(getAuthErrorMessage(new TypeError('Failed to fetch')) , /Verbindung/)
  assert.equal(getAuthErrorMessage({ message: 'private internal detail' }), 'Das hat leider nicht funktioniert. Bitte versuche es erneut.')
})
