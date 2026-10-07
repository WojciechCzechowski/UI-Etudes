import { useState } from 'react'
import { PageShell } from '../../shared/PageShell'
import { initialFolders } from './folders'
import { MorphingDialog } from './MorphingDialog'

const files = [
  ['Q3 invoice batch.pdf', '2.4 MB', 'Sep 29'],
  ['Studio lease 2026.pdf', '812 KB', 'Sep 24'],
  ['Train ticket Gdansk.pdf', '96 KB', 'Sep 21'],
  ['Hosting receipt September.pdf', '58 KB', 'Sep 19'],
  ['Passport scan.jpg', '3.1 MB', 'Sep 12'],
  ['Freelance contract Aldo.docx', '124 KB', 'Sep 9'],
  ['VAT return Q2.xlsx', '342 KB', 'Aug 30'],
  ['Insurance policy.pdf', '1.2 MB', 'Aug 22'],
  ['Conference badge.png', '640 KB', 'Aug 17'],
  ['Bank statement July.pdf', '218 KB', 'Aug 3'],
  ['Moving checklist.md', '4 KB', 'Jul 28'],
  ['Design invoice 0412.pdf', '77 KB', 'Jul 19'],
  ['Tax advisor notes.docx', '53 KB', 'Jul 11'],
  ['Laptop warranty.pdf', '1.8 MB', 'Jun 30'],
  ['Lisbon trip photos.zip', '48 MB', 'Jun 14'],
] as const

export function App() {
  const [folders] = useState(initialFolders)

  return (
    <PageShell title="Documents">
      <section aria-labelledby="folders-heading">
        <h2 id="folders-heading" className="text-sm font-medium">
          Folders
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {folders.map((folder) => (
            <li
              key={folder.name}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="font-medium">{folder.name}</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {folder.items} items
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="files-heading" className="mt-8 pb-32">
        <h2 id="files-heading" className="text-sm font-medium">
          Recent files
        </h2>
        <ul className="mt-3 divide-y divide-[var(--color-border)]">
          {files.map(([name, size, date]) => (
            <li key={name} className="flex items-baseline gap-4 py-3">
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <span className="text-sm text-[var(--color-text-muted)]">
                {size}
              </span>
              <span className="w-14 text-right text-sm text-[var(--color-text-muted)]">
                {date}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <MorphingDialog />
    </PageShell>
  )
}
