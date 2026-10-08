import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageShell } from './shared/PageShell'
import './shared/tokens.css'
import { studies } from './studies/registry'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageShell title="UI Études">
      <p className="text-lg text-[var(--color-text-muted)]">
        Small, finished interaction studies in React.
      </p>
      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          An étude is a short piece of music written to practise one technical
          problem. The word is French for &ldquo;study&rdquo;. The best ones,
          Chopin&rsquo;s among them, turned out to be worth performing in their
          own right.
        </p>
        <p>
          Each étude here takes one real interaction problem from product work
          and solves it properly, including the parts that usually get skipped.
          Together they show how I approach the craft: motion that explains what
          changed, layouts that work from a phone to a desktop, full keyboard
          and screen reader support, and designed behaviour for interruption,
          reduced motion and errors.
        </p>
        <p>
          This is not a component library. There is nothing to install. Every
          study is self-contained, small enough to read in one sitting and meant
          to be copied.
        </p>
      </div>
      <h2 className="mt-10 text-lg font-semibold">Studies</h2>
      <ul className="mt-4 space-y-4">
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
