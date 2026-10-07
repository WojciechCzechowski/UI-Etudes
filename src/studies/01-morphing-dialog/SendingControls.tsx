import {
  DemoOptionGroup,
  DemoSection,
} from '../../shared/demo-controls/DemoControls'
import type { DemoOption } from '../../shared/demo-controls/DemoControls'

export type SendingSettings = {
  /** Makes the send fail. */
  fail: boolean
  /** How long the pending state lasts, in milliseconds. */
  pendingMs: number
}

export const defaultSending: SendingSettings = { fail: false, pendingMs: 1200 }

const pendingOptions: DemoOption<number>[] = [
  { value: 400, label: '400 ms' },
  { value: 1200, label: '1200 ms' },
  { value: 3000, label: '3000 ms' },
]

/** Short labels for the settings that differ from their defaults. */
export function describeSending(sending: SendingSettings): string[] {
  const tweaks: string[] = []
  if (sending.fail) tweaks.push('Sending fails')
  if (sending.pendingMs !== defaultSending.pendingMs) {
    tweaks.push(`Pending ${sending.pendingMs} ms`)
  }
  return tweaks
}

type SendingControlsProps = {
  value: SendingSettings
  onChange: (value: SendingSettings) => void
}

/** The settings of this study, a section of the shared demo controls. */
export function SendingControls({ value, onChange }: SendingControlsProps) {
  return (
    <DemoSection legend="Sending">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.fail}
          onChange={(event) =>
            onChange({ ...value, fail: event.target.checked })
          }
        />
        Make sending fail
      </label>
      <DemoOptionGroup
        label="Pending duration"
        value={value.pendingMs}
        options={pendingOptions}
        onChange={(pendingMs) => onChange({ ...value, pendingMs })}
      />
    </DemoSection>
  )
}
