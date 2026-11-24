export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/'
  const hasControlCharacters = [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 32 || code === 127
  })
  if (value.includes('\\') || hasControlCharacters) return '/'
  if (/^\/(login|register|forgot-password|auth)(\/|\?|#|$)/.test(value)) return '/'
  return value
}

export function getRedirectError(search: string, hash: string): string | null {
  const query = new URLSearchParams(search)
  const fragment = new URLSearchParams(hash.replace(/^#/, ''))
  return query.get('error_code') || fragment.get('error_code') ||
    query.get('error') || fragment.get('error') || null
}
