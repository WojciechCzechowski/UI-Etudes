import {
  DemoOptionGroup,
  DemoSection,
} from '../../shared/demo-controls/DemoControls'
import type { DemoOption } from '../../shared/demo-controls/DemoControls'

export type PromptSettings = {
  /** Fake time the suggestions take to arrive, in milliseconds. */
  suggestionsMs: number
}

export const defaultPromptSettings: PromptSettings = {
  suggestionsMs: 500,
}

const suggestionsOptions: DemoOption<number>[] = [
  { value: 0, label: 'Off' },
  { value: 500, label: '0.5 s' },
  { value: 1000, label: '1 s' },
  { value: 4000, label: '4 s' },
]

/** Short labels for the settings that differ from their defaults. */
export function describePrompt(settings: PromptSettings): string[] {
  if (settings.suggestionsMs === defaultPromptSettings.suggestionsMs) return []
  return [
    settings.suggestionsMs === 0
      ? 'Suggestions instant'
      : `Suggestions ${settings.suggestionsMs / 1000} s`,
  ]
}

type PromptControlsProps = {
  value: PromptSettings
  onChange: (value: PromptSettings) => void
}

/** The settings of this study, a section of the shared demo controls. */
export function PromptControls({ value, onChange }: PromptControlsProps) {
  return (
    <DemoSection legend="Composer">
      <DemoOptionGroup
        label="Suggestions loading time"
        value={value.suggestionsMs}
        options={suggestionsOptions}
        onChange={(suggestionsMs) => onChange({ ...value, suggestionsMs })}
      />
    </DemoSection>
  )
}
