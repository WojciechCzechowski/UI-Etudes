import { StrictMode } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoControls } from './demo-controls/DemoControls'
import { DemoSettingsProvider } from './demo-controls/DemoSettings'
import { StudyBackLink } from './StudyBackLink'
import './tokens.css'

/** Mounts a study into #root with the pieces every study shares. */
export function mountStudy(App: ComponentType) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <DemoSettingsProvider>
        <StudyBackLink />
        <App />
        <DemoControls />
      </DemoSettingsProvider>
    </StrictMode>,
  )
}
