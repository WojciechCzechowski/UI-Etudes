import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'

const next: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const icons = { system: Monitor, light: Sun, dark: Moon }

/** Overrides the OS theme through `data-theme` on <html>. Not persisted. */
export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }, [theme])

  const Icon = icons[theme]
  const label = `Theme: ${theme}. Switch to ${next[theme]}.`

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next[theme])}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  )
}
