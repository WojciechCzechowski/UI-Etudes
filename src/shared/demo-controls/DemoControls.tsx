import { useState } from 'react'
import { useDemoSettings } from './DemoSettings'
import type { SlowMotion } from './DemoSettings'

const pendingOptions = [400, 1200, 3000]
const slowMotionOptions: SlowMotion[] = [1, 2, 4, 10]

const fieldClass =
  'rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1'

export function DemoControls() {
  const { settings, update } = useDemoSettings()
  const [open, setOpen] = useState(() => window.innerWidth >= 768)

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="fixed bottom-4 left-4 z-10 max-w-[calc(100vw-7rem)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm shadow-sm"
    >
      <summary className="cursor-pointer font-medium">Demo controls</summary>
      <div className="mt-3 flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.forceError}
            onChange={(event) => update({ forceError: event.target.checked })}
          />
          Trigger the validation error
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
              update({ reducedMotion: event.target.checked ? 'on' : 'system' })
            }
          />
          Preview reduced motion
        </label>
        <label className="flex items-center justify-between gap-3">
          Slow motion
          <select
            className={fieldClass}
            value={settings.slowMotion}
            onChange={(event) =>
              update({ slowMotion: Number(event.target.value) as SlowMotion })
            }
          >
            {slowMotionOptions.map((factor) => (
              <option key={factor} value={factor}>
                {factor}x
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-[var(--color-text-muted)]">
          Settings change only while the dialog is closed.
        </p>
      </div>
    </details>
  )
}
