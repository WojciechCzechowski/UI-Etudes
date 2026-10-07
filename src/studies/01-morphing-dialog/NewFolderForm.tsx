import { AnimatePresence, motion } from 'motion/react'
import { Dialog } from 'radix-ui'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { stateFade } from '../../shared/motion'
import { DuplicateFolderError } from './folders'

type NewFolderFormProps = {
  onSubmit: (name: string) => Promise<void>
  onCreated: (name: string) => void
}

const emptyNameMessage = 'Enter a folder name.'
const genericErrorMessage = 'Could not create the folder. Try again.'

function duplicateMessage(name: string) {
  return `A folder named "${name}" already exists here. Choose a different name.`
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function NewFolderForm({ onSubmit, onCreated }: NewFolderFormProps) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()

  function fail(message: string) {
    setError(message)
    setPending(false)
    inputRef.current?.focus()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // aria-disabled does not block submit, so ignore it here.
    if (pending) return

    const trimmed = name.trim()
    if (!trimmed) return fail(emptyNameMessage)

    setError(null)
    setPending(true)
    try {
      await onSubmit(trimmed)
      onCreated(trimmed)
    } catch (caught) {
      if (isAbort(caught)) return
      fail(
        caught instanceof DuplicateFolderError
          ? duplicateMessage(caught.folderName)
          : genericErrorMessage,
      )
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={pending}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="folder-name" className="text-sm font-medium">
          Folder name
        </label>
        <input
          ref={inputRef}
          id="folder-name"
          name="name"
          value={name}
          readOnly={pending}
          autoComplete="off"
          placeholder="Tax 2026"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'folder-name-error' : undefined}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 aria-invalid:border-[var(--color-danger)]"
        />
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              key={error}
              id="folder-name-error"
              role="alert"
              className="text-sm text-[var(--color-danger)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={scale(stateFade)}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <output className="sr-only">{pending ? 'Creating folder...' : ''}</output>
      <div className="flex justify-end gap-2">
        <Dialog.Close className="rounded-[var(--radius-sm)] px-4 py-2 font-medium hover:bg-[var(--color-border)]">
          Cancel
        </Dialog.Close>
        <button
          type="submit"
          aria-disabled={pending}
          className="flex min-w-28 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 font-medium text-[var(--color-accent-text)] aria-disabled:opacity-70"
        >
          {pending && !reduceMotion && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          {pending ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  )
}
