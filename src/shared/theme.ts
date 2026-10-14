import { useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

/**
 * The stored choice is read before first paint by a small inline script in the
 * <head> of every HTML entry (index.html and src/studies/*\/index.html), so
 * the page never flashes the wrong theme. Keep the key there in sync.
 */
export const THEME_KEY = 'ui-etudes-theme'

function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

/** Storage can be blocked or throw (private mode); the theme then lasts one visit. */
export function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return isTheme(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

/** `system` is the default, so it clears the key instead of storing it. */
export function storeTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage is unavailable. The theme still applies to this page.
  }
}

/** Overrides the OS theme through `data-theme` on <html>. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}

/** The stored theme, kept in sync with other tabs. Setting it stores and applies it. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === THEME_KEY || event.key === null) {
        setThemeState(readStoredTheme())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function setTheme(next: Theme) {
    storeTheme(next)
    setThemeState(next)
  }

  return [theme, setTheme]
}
