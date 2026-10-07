import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { NewFolderForm } from './NewFolderForm'

export function MorphingDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="New folder"
        className="fixed right-4 bottom-4 grid size-14 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        {/* Wrapper only positions the surface. Inline style because Radix sets
            pointer-events inline on modal content and would override a class. */}
        <Dialog.Content
          style={{ pointerEvents: 'none' }}
          className="fixed inset-0 flex items-end justify-center md:items-center"
        >
          <div className="pointer-events-auto w-full rounded-t-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-xl md:max-w-md md:rounded-[var(--radius-lg)]">
            <Dialog.Title className="text-lg font-semibold">
              New folder
            </Dialog.Title>
            <Dialog.Description className="mt-1 mb-5 text-[var(--color-text-muted)]">
              Folders keep related files together. You can rename it later.
            </Dialog.Description>
            <NewFolderForm />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
