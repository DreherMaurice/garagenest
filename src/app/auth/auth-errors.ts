const messages: Record<string, string> = {
  invalid_credentials: 'E-Mail oder Passwort stimmen nicht überein.',
  email_not_confirmed: 'Bitte bestätige zuerst deine E-Mail-Adresse. Du kannst die Bestätigung unten erneut anfordern.',
  user_already_exists: 'Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte melde dich an.',
  email_exists: 'Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte melde dich an.',
  weak_password: 'Das Passwort erfüllt die Sicherheitsanforderungen nicht. Verwende mindestens 12 Zeichen.',
  same_password: 'Bitte wähle ein anderes Passwort als bisher.',
  otp_expired: 'Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen an.',
  access_denied: 'Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.',
  email_address_invalid: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  email_address_not_authorized: 'An diese Adresse kann derzeit keine E-Mail gesendet werden. Bitte kontaktiere den App-Betreiber.',
  signup_disabled: 'Die Registrierung ist derzeit nicht verfügbar.',
  email_provider_disabled: 'Die Anmeldung per E-Mail ist derzeit nicht verfügbar.',
  session_not_found: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  refresh_token_not_found: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const code = 'code' in error ? String(error.code) : ''
    if (code.startsWith('over_') || ('status' in error && error.status === 429)) {
      return 'Zu viele Versuche. Bitte warte einige Minuten und versuche es erneut.'
    }
    if (messages[code]) return messages[code]
    if (error instanceof TypeError || ('name' in error && error.name === 'AuthRetryableFetchError')) {
      return 'Der Server ist nicht erreichbar. Bitte prüfe deine Verbindung und versuche es erneut.'
    }
  }
  return 'Das hat leider nicht funktioniert. Bitte versuche es erneut.'
}
