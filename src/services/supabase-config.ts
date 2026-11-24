export function getSupabaseConfig(url: string | undefined, key: string | undefined) {
  if (!url || !key) return null

  try {
    const parsed = new URL(url)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
    if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) return null
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') return null
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return null
    return { url: parsed.origin, key }
  } catch {
    return null
  }
}
