import { Monitor, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { RadioGroup } from 'radix-ui'
import { useTheme } from './theme'
import type { Theme } from './theme'

const options: { value: Theme; label: string; Icon: LucideIcon }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

/** Icon-only theme choice. The caller positions it. The choice is stored for every page. */
export function ThemeSwitch() {
  const [theme, setTheme] = useTheme()

  return (
    <RadioGroup.Root
      aria-label="Theme"
      value={theme}
      onValueChange={(next) => setTheme(next as Theme)}
      className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-sm"
    >
      {options.map(({ value, label, Icon }) => (
        <RadioGroup.Item
          key={value}
          value={value}
          aria-label={label}
          className="grid size-8 place-items-center rounded-full transition-colors duration-150 hover:bg-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)] data-[state=checked]:bg-[var(--color-accent)] data-[state=checked]:text-[var(--color-accent-text)] data-[state=checked]:hover:bg-[var(--color-accent-hover)]"
        >
          <Icon aria-hidden="true" className="size-4" />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}
