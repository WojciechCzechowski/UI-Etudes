import { Monitor, Moon, Settings, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Popover, RadioGroup } from 'radix-ui'
import { useId } from 'react'
import type { ReactNode } from 'react'
import {
  describeTweaks,
  useDemoSettings,
  useReduceMotion,
} from './DemoSettings'
import type { SlowMotion, Theme } from './DemoSettings'

export type DemoOption<T> = { value: T; label: string; Icon?: LucideIcon }

const themeOptions: DemoOption<Theme>[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

// Titled "Slow down by", so that "2x" reads as twice as slow, not twice as fast.
const slowMotionOptions: DemoOption<SlowMotion>[] = [
  { value: 1, label: 'Off' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
  { value: 8, label: '8x' },
]

type OptionGroupProps<T extends string | number> = {
  label: string
  value: T
  options: DemoOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  describedBy?: string
}

/** A radio group styled as a row of buttons: one click picks an option. */
export function DemoOptionGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
  describedBy,
}: OptionGroupProps<T>) {
  const labelId = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId}>{label}</span>
      <RadioGroup.Root
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        value={String(value)}
        disabled={disabled}
        onValueChange={(next) => {
          const option = options.find(({ value }) => String(value) === next)
          if (option) onChange(option.value)
        }}
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
        className="grid gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-1 data-[disabled]:opacity-50"
      >
        {options.map(({ value, label, Icon }) => (
          <RadioGroup.Item
            key={value}
            value={String(value)}
            className="flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)] data-[disabled]:cursor-default data-[disabled]:hover:bg-transparent data-[state=checked]:bg-[var(--color-accent)] data-[state=checked]:text-[var(--color-accent-text)] data-[state=checked]:hover:bg-[var(--color-accent-hover)]"
          >
            {Icon && <Icon aria-hidden="true" className="size-4" />}
            {label}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  )
}

type SectionProps = { legend: string; children: ReactNode }

/**
 * A labelled group of related settings. The wrapper owns the spacing and the
 * separator line: a legend ignores the padding of its fieldset, so padding on
 * the fieldset would end up between the legend and the controls.
 */
export function DemoSection({ legend, children }: SectionProps) {
  return (
    <div className="border-t border-[var(--color-border)] py-3 first:border-t-0 first:pt-0">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-3 p-0 text-xs font-medium text-[var(--color-text-muted)]">
          {legend}
        </legend>
        <div className="flex flex-col gap-3">{children}</div>
      </fieldset>
    </div>
  )
}

type DemoControlsProps = {
  /** Sections for settings that belong to one study, after the shared ones. */
  children?: ReactNode
  /** Short labels for the study's settings that differ from their defaults. */
  tweaks?: string[]
}

export function DemoControls({
  children,
  tweaks: studyTweaks = [],
}: DemoControlsProps) {
  const { settings, update } = useDemoSettings()
  const reduceMotion = useReduceMotion()
  const tweaks = [...describeTweaks(settings), ...studyTweaks]

  return (
    <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
      {tweaks.length > 0 && (
        <p
          id="demo-tweaks"
          className="max-w-48 text-right text-xs text-[var(--color-text-muted)] sm:max-w-xs"
        >
          {tweaks.join(' · ')}
        </p>
      )}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label="Demo settings"
            aria-describedby={tweaks.length > 0 ? 'demo-tweaks' : undefined}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm transition-colors duration-150 hover:bg-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Settings aria-hidden="true" className="size-5" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            aria-label="Demo settings"
            className="z-40 w-72 max-w-[calc(100vw-2rem)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-lg"
          >
            <div>
              <DemoSection legend="Appearance">
                <DemoOptionGroup
                  label="Theme"
                  value={settings.theme}
                  options={themeOptions}
                  onChange={(theme) => update({ theme })}
                />
              </DemoSection>
              <DemoSection legend="Motion">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion === 'on'}
                    onChange={(event) =>
                      update({
                        reducedMotion: event.target.checked ? 'on' : 'system',
                      })
                    }
                  />
                  Preview reduced motion
                </label>
                <div className="flex flex-col gap-1">
                  <DemoOptionGroup
                    label="Slow down by"
                    value={settings.slowMotion}
                    options={slowMotionOptions}
                    onChange={(slowMotion) => update({ slowMotion })}
                    disabled={reduceMotion}
                    describedBy={
                      reduceMotion ? 'demo-slow-motion-note' : undefined
                    }
                  />
                  {reduceMotion && (
                    <p
                      id="demo-slow-motion-note"
                      className="text-xs text-[var(--color-text-muted)]"
                    >
                      Slow motion does not apply with reduced motion.
                    </p>
                  )}
                </div>
              </DemoSection>
              {children}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
