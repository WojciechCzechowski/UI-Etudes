import {
  DemoOptionGroup,
  DemoSection,
} from '../../shared/demo-controls/DemoControls'
import type { DemoOption } from '../../shared/demo-controls/DemoControls'
import type { Loading } from './useThumbnail'

export type GridSettings = {
  loading: Loading
  /** Makes one thumbnail fail to load. */
  failOne: boolean
  columns: number | 'auto'
}

export const defaultGridSettings: GridSettings = {
  loading: 'normal',
  failOne: false,
  columns: 'auto',
}

const loadingOptions: DemoOption<Loading>[] = [
  { value: 'instant', label: 'Instant' },
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow' },
]

const columnOptions: DemoOption<number | 'auto'>[] = [
  { value: 'auto', label: 'Auto' },
  { value: 2, label: '2' },
  { value: 4, label: '4' },
  { value: 6, label: '6' },
]

/** Short labels for the settings that differ from their defaults. */
export function describeGrid(settings: GridSettings): string[] {
  const tweaks: string[] = []
  if (settings.loading !== defaultGridSettings.loading) {
    tweaks.push(`${settings.loading === 'slow' ? 'Slow' : 'Instant'} images`)
  }
  if (settings.failOne) tweaks.push('One image fails')
  if (settings.columns !== defaultGridSettings.columns) {
    tweaks.push(`${settings.columns} columns`)
  }
  return tweaks
}

type GridControlsProps = {
  value: GridSettings
  onChange: (value: GridSettings) => void
  onReload: () => void
}

/** The settings of this study, a section of the shared demo controls. */
export function GridControls({ value, onChange, onReload }: GridControlsProps) {
  return (
    <DemoSection legend="Grid">
      <DemoOptionGroup
        label="Image loading"
        value={value.loading}
        options={loadingOptions}
        onChange={(loading) => onChange({ ...value, loading })}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.failOne}
          onChange={(event) =>
            onChange({ ...value, failOne: event.target.checked })
          }
        />
        Make one image fail
      </label>
      <button
        type="button"
        onClick={onReload}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1.5 hover:bg-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)]"
      >
        Reload images
      </button>
      <DemoOptionGroup
        label="Columns"
        value={value.columns}
        options={columnOptions}
        onChange={(columns) => onChange({ ...value, columns })}
      />
    </DemoSection>
  )
}
