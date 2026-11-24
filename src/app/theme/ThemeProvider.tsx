import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react'

import {
  ThemeContext,
  themePreferences,
  type ResolvedTheme,
  type ThemePreference,
} from './theme-context'

const THEME_STORAGE_KEY = 'garage-theme'

function getStoredPreference(): ThemePreference {
  try {
    const storedPreference = localStorage.getItem(THEME_STORAGE_KEY)

    if (
      storedPreference &&
      themePreferences.includes(storedPreference as ThemePreference)
    ) {
      return storedPreference as ThemePreference
    }
  } catch {
    // The system preference remains the safe fallback when storage is unavailable.
  }

  return 'system'
}

function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') {
    return systemPrefersDark ? 'dark' : 'light'
  }

  return preference
}

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

function subscribeToSystemTheme(onChange: () => void) {
  systemThemeQuery.addEventListener('change', onChange)
  return () => systemThemeQuery.removeEventListener('change', onChange)
}

function getSystemPrefersDark() {
  return systemThemeQuery.matches
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<ThemePreference>(getStoredPreference)
  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark)
  const resolvedTheme = resolveTheme(preference, systemPrefersDark)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#f2f2f7')
  }, [resolvedTheme])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference)
    } catch {
      // The selected appearance still applies for the current session.
    }
  }, [preference])

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
