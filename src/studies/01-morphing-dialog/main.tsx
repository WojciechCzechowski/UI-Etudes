import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageShell } from '../../shared/PageShell'
import '../../shared/tokens.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageShell title="Morphing button to dialog">
      <p>Study 01 is in progress.</p>
    </PageShell>
  </StrictMode>,
)
