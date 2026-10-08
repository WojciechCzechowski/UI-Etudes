import { useEffect, useState } from 'react'
import type { Announcement } from './announcements'
import type { ToastStore } from './toastStore'

// How long a sentence stays in the region. Long enough for a screen reader to
// pick it up, short enough that the region does not grow during a burst.
const CLEAR_AFTER_MS = 10_000

type LiveRegionsProps = {
  store: ToastStore
}

/**
 * Two live regions that are always mounted: assertive for errors, polite for
 * the count of new information and success toasts. Radix reads a toast once
 * when it mounts and not when it is updated, so the study says everything
 * itself. Each sentence is a new paragraph, so the same text twice is
 * announced twice and a burst is queued by the screen reader instead of
 * overwritten.
 */
export function LiveRegions({ store }: LiveRegionsProps) {
  const [messages, setMessages] = useState<Announcement[]>([])

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const unsubscribe = store.subscribeAnnouncements((announcement) => {
      setMessages((current) => [...current, announcement])
      const timer = setTimeout(() => {
        timers.delete(timer)
        setMessages((current) =>
          current.filter(({ id }) => id !== announcement.id),
        )
      }, CLEAR_AFTER_MS)
      timers.add(timer)
    })
    return () => {
      unsubscribe()
      timers.forEach(clearTimeout)
    }
  }, [store])

  // `output` and `alert` read the whole region when they change unless atomic
  // is off. Only additions should be read.
  return (
    <>
      <output
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        className="sr-only"
      >
        {messages
          .filter(({ politeness }) => politeness === 'polite')
          .map(({ id, text }) => (
            <p key={id}>{text}</p>
          ))}
      </output>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="false"
        aria-relevant="additions"
        className="sr-only"
      >
        {messages
          .filter(({ politeness }) => politeness === 'assertive')
          .map(({ id, text }) => (
            <p key={id}>{text}</p>
          ))}
      </div>
    </>
  )
}
