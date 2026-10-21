import { useState } from 'react'
import { PageShell } from '../../shared/PageShell'
import { DemoControls } from '../../shared/demo-controls/DemoControls'
import { PromptComposer } from './PromptComposer'
import {
  defaultPromptSettings,
  describePrompt,
  PromptControls,
} from './PromptControls'

// Stand-ins for the generations behind the composer: a gradient per card.
const cards = [
  { hues: [250, 320], height: 'h-64' },
  { hues: [20, 50], height: 'h-44' },
  { hues: [160, 200], height: 'h-56' },
  { hues: [290, 340], height: 'h-72' },
  { hues: [210, 260], height: 'h-48' },
  { hues: [40, 10], height: 'h-60' },
  { hues: [120, 170], height: 'h-52' },
  { hues: [330, 20], height: 'h-44' },
]

export function App() {
  const [settings, setSettings] = useState(defaultPromptSettings)

  return (
    <PageShell
      title="Morphing prompt composer"
      floating={
        <>
          <DemoControls tweaks={describePrompt(settings)}>
            <PromptControls value={settings} onChange={setSettings} />
          </DemoControls>
          <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-3xl px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <PromptComposer suggestionsDelayMs={settings.suggestionsMs} />
          </div>
        </>
      }
    >
      <p className="leading-relaxed">
        One composer card that changes what it holds when you switch between
        Image, Video and Lip sync. This is the static version: no motion yet.
      </p>
      <div className="mt-6 columns-2 gap-3 [&>*]:mb-3">
        {cards.map(({ hues: [from, to], height }) => (
          <div
            key={from}
            aria-hidden="true"
            className={`${height} break-inside-avoid rounded-[var(--radius-md)]`}
            style={{
              background: `linear-gradient(135deg, oklch(0.75 0.14 ${from}), oklch(0.55 0.16 ${to}))`,
            }}
          />
        ))}
      </div>
      <div className="pb-[28rem]" />
    </PageShell>
  )
}
