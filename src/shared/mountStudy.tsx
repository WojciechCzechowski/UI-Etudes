import { StrictMode } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoSettingsProvider } from './demo-controls/DemoSettings'
import { StudyBackLink } from './StudyBackLink'
import './tokens.css'

/**
 * Mounts a study into #root with the pieces every study shares. A study that
 * wants the demo controls renders `DemoControls` itself, so it can add its own
 * sections and tweak labels.
 */
export function mountStudy(App: ComponentType) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <DemoSettingsProvider>
        <StudyBackLink />
        <App />
      </DemoSettingsProvider>
    </StrictMode>,
  )
}
