import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Hub } from './hub/Hub'
import './shared/tokens.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Hub />
  </StrictMode>,
)
