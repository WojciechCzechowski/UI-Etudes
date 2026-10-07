import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageShell } from './shared/PageShell'
import './shared/tokens.css'
import { studies } from './studies/registry'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageShell title="UI Études">
      <ul className="space-y-4">
        {studies.map((study) => (
          <li key={study.slug}>
            <a className="font-medium underline" href={`./${study.slug}/`}>
              {study.title}
            </a>
            <p className="text-[var(--color-text-muted)]">{study.summary}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  </StrictMode>,
)
