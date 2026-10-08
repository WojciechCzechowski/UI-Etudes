import {
  DemoOptionGroup,
  DemoSection,
} from '../../shared/demo-controls/DemoControls'
import type { DemoOption } from '../../shared/demo-controls/DemoControls'

export type ToastSettings = {
  /** Makes the upload fail. */
  failUploads: boolean
  /** How long an upload takes, in milliseconds. */
  uploadMs: number
}

export const defaultToastSettings: ToastSettings = {
  failUploads: false,
  uploadMs: 4000,
}

const uploadOptions: DemoOption<number>[] = [
  { value: 1500, label: '1.5 s' },
  { value: 4000, label: '4 s' },
  { value: 10000, label: '10 s' },
]

/** Short labels for the settings that differ from their defaults. */
export function describeToasts(settings: ToastSettings): string[] {
  const tweaks: string[] = []
  if (settings.failUploads) tweaks.push('Uploads fail')
  if (settings.uploadMs !== defaultToastSettings.uploadMs) {
    tweaks.push(`Upload ${settings.uploadMs / 1000} s`)
  }
  return tweaks
}

type ToastControlsProps = {
  value: ToastSettings
  onChange: (value: ToastSettings) => void
  onDismissAll: () => void
}

/** The settings of this study, a section of the shared demo controls. */
export function ToastControls({
  value,
  onChange,
  onDismissAll,
}: ToastControlsProps) {
  return (
    <DemoSection legend="Toasts">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.failUploads}
          onChange={(event) =>
            onChange({ ...value, failUploads: event.target.checked })
          }
        />
        Make uploads fail
      </label>
      <DemoOptionGroup
        label="Upload duration"
        value={value.uploadMs}
        options={uploadOptions}
        onChange={(uploadMs) => onChange({ ...value, uploadMs })}
      />
      <button
        type="button"
        onClick={onDismissAll}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)]"
      >
        Dismiss all toasts
      </button>
    </DemoSection>
  )
}
