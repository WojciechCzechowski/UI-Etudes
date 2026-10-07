import { Settings } from 'lucide-react'
import { Popover } from 'radix-ui'
import {
  describeTweaks,
  useDemoSettings,
  useReduceMotion,
} from './DemoSettings'
import type { SlowMotion } from './DemoSettings'

const pendingOptions = [400, 1200, 3000]
const slowMotionOptions: SlowMotion[] = [1, 2, 4, 10]

const fieldClass =
  'rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 disabled:opacity-50'

export function DemoControls() {
  const { settings, update } = useDemoSettings()
  const reduceMotion = useReduceMotion()
  const tweaks = describeTweaks(settings)

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
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Settings aria-hidden="true" className="size-5" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            aria-label="Demo settings"
            className="z-40 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-lg"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.forceError}
                onChange={(event) =>
                  update({ forceError: event.target.checked })
                }
              />
              Make sending fail
            </label>
            <label className="flex items-center justify-between gap-3">
              Pending duration
              <select
                className={fieldClass}
                value={settings.pendingMs}
                onChange={(event) =>
                  update({ pendingMs: Number(event.target.value) })
                }
              >
                {pendingOptions.map((ms) => (
                  <option key={ms} value={ms}>
                    {ms} ms
                  </option>
                ))}
              </select>
            </label>
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
              <label className="flex items-center justify-between gap-3">
                Slow motion
                <select
                  className={fieldClass}
                  value={settings.slowMotion}
                  disabled={reduceMotion}
                  aria-describedby={
                    reduceMotion ? 'demo-slow-motion-note' : undefined
                  }
                  onChange={(event) =>
                    update({
                      slowMotion: Number(event.target.value) as SlowMotion,
                    })
                  }
                >
                  {slowMotionOptions.map((factor) => (
                    <option key={factor} value={factor}>
                      {factor}x
                    </option>
                  ))}
                </select>
              </label>
              {reduceMotion && (
                <p
                  id="demo-slow-motion-note"
                  className="text-xs text-[var(--color-text-muted)]"
                >
                  Slow motion does not apply with reduced motion.
                </p>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Settings change only while the dialog is closed.
            </p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
