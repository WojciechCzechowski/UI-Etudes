import { ArrowUp, AtSign, ListFilterPlus, X } from 'lucide-react'
import { Tabs } from 'radix-ui'
import { useState } from 'react'
import { modeOrder, modes } from './modes'
import type { Mode } from './modes'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]'
const pill = `border border-[var(--color-border)] bg-[var(--color-surface)] ${focusRing}`
const muted = 'bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]'

/**
 * One card for every mode. The mode picks what the card contains. There is no
 * component per tab, so a later animation has a single surface to morph.
 */
export function PromptComposer() {
  const [mode, setMode] = useState<Mode>('image')
  // Shared by all modes, so it survives a visit to one without a text field.
  const [prompt, setPrompt] = useState('')
  const config = modes[mode]

  return (
    <Tabs.Root
      value={mode}
      onValueChange={(value) => setMode(value as Mode)}
      className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_80%,transparent)] shadow-[0_20px_60px_-20px_rgb(0_0_0/0.3)] backdrop-blur-2xl"
    >
      {config.suggestions.length > 0 && (
        <ul
          aria-label="Suggestions"
          className="flex flex-wrap gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-4 py-3"
        >
          {config.suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => setPrompt(suggestion)}
                className={`${pill} flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium`}
              >
                <ListFilterPlus
                  aria-hidden="true"
                  className="size-4 text-[var(--color-text-muted)]"
                />
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <Tabs.List
            aria-label="Generation type"
            className={`flex rounded-2xl p-1 ${muted}`}
          >
            {modeOrder.map((value) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] data-[state=active]:bg-[var(--color-surface)] data-[state=active]:text-[var(--color-text)] data-[state=active]:shadow-sm sm:px-4 ${focusRing}`}
              >
                {modes[value].label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {config.brandKit ? (
            <div className={`flex gap-1 rounded-2xl p-1 ${muted}`}>
              <button
                type="button"
                className={`${pill} flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium`}
              >
                <AtSign aria-hidden="true" className="size-4" />
                Brand Kit
              </button>
              <button
                type="button"
                aria-label="Remove Brand Kit"
                className={`${pill} grid size-8 place-items-center rounded-xl`}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl p-1 ${muted}`}>
              <button
                type="button"
                aria-label="Prompt suggestions"
                className={`${pill} grid size-8 place-items-center rounded-xl`}
              >
                <ListFilterPlus aria-hidden="true" className="size-4" />
              </button>
            </div>
          )}
        </div>

        <ul aria-label="References" className="flex flex-wrap gap-2">
          {config.slots.map(({ label, Icon }) => (
            <li key={label}>
              <button
                type="button"
                className={`flex h-[74px] flex-col items-center justify-center gap-1.5 rounded-2xl px-5 text-sm text-[var(--color-text-muted)] ${muted} ${focusRing}`}
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </button>
            </li>
          ))}
        </ul>

        {config.placeholder && (
          <textarea
            aria-label="Prompt"
            rows={2}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={config.placeholder}
            className="resize-none bg-transparent px-1 py-2 text-lg placeholder:text-[var(--color-text-muted)] focus-visible:outline-none"
          />
        )}

        <div className="flex items-end justify-between gap-3">
          <ul
            aria-label="Settings"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {config.settings.map(({ label, Icon, disabled }, index) => (
              <li key={`${index}-${label}`}>
                <button
                  type="button"
                  aria-disabled={disabled || undefined}
                  className={`flex items-center gap-2 rounded-md text-sm ${focusRing} ${
                    disabled
                      ? 'text-[var(--color-text-muted)] opacity-60'
                      : 'text-[var(--color-text)]'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-[var(--color-text-muted)]"
                  />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center">
            {config.credits && (
              <span
                className={`-mr-5 rounded-full py-2.5 pr-8 pl-4 text-sm text-[var(--color-text-muted)] ${muted}`}
              >
                {config.credits}
              </span>
            )}
            <button
              type="button"
              aria-label="Generate"
              className={`relative grid size-11 place-items-center rounded-full bg-[var(--color-text)] text-[var(--color-bg)] ${focusRing}`}
            >
              <ArrowUp aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </Tabs.Root>
  )
}
