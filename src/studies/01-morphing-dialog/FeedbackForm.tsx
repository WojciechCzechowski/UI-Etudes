import { AnimatePresence, motion } from 'motion/react'
import { Dialog } from 'radix-ui'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { stateFade } from '../../shared/motion'

type FeedbackFormProps = {
  onSubmit: (message: string) => Promise<void>
  onSent: () => void
}

const emptyMessage = 'Write a message first.'
const failedMessage = 'Could not send your message. Try again.'

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function FeedbackForm({ onSubmit, onSent }: FeedbackFormProps) {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()

  function fail(text: string) {
    setError(text)
    setPending(false)
    fieldRef.current?.focus()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // aria-disabled does not block submit, so ignore it here.
    if (pending) return

    const trimmed = message.trim()
    if (!trimmed) return fail(emptyMessage)

    setError(null)
    setPending(true)
    try {
      await onSubmit(trimmed)
      onSent()
    } catch (caught) {
      if (isAbort(caught)) return
      fail(failedMessage)
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
        <label htmlFor="feedback-message" className="text-sm font-medium">
          Your message
        </label>
        <textarea
          ref={fieldRef}
          id="feedback-message"
          name="message"
          rows={4}
          value={message}
          readOnly={pending}
          placeholder="For example: the export button did nothing."
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'feedback-message-error' : undefined}
          onChange={(event) => {
            setMessage(event.target.value)
            setError(null)
          }}
          className="resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 aria-invalid:border-[var(--color-danger)]"
        />
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              key={error}
              id="feedback-message-error"
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
      <output className="sr-only">{pending ? 'Sending message...' : ''}</output>
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
          {pending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}
