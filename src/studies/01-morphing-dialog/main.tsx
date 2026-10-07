import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoControls } from '../../shared/demo-controls/DemoControls'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import '../../shared/tokens.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoSettingsProvider>
      <App />
      <DemoControls />
    </DemoSettingsProvider>
  </StrictMode>,
)
