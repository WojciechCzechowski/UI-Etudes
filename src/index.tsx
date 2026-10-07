import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageShell } from './shared/PageShell'
import './shared/tokens.css'

const studies = [
  {
    title: 'Morphing button to dialog',
    summary: 'A floating button that grows into a dialog and back.',
    href: './src/studies/01-morphing-dialog/index.html',
  },
]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageShell title="UI Études">
      <ul className="space-y-4">
        {studies.map((study) => (
          <li key={study.href}>
            <a className="font-medium underline" href={study.href}>
              {study.title}
            </a>
            <p className="text-[var(--color-text-muted)]">{study.summary}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  </StrictMode>,
)
