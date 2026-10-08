import type { Toast } from './toastStore'

// Copy for the live regions. An error is announced on its own, assertively.
// Information and success are only counted ("3 new notifications") in one
// polite sentence per burst. Their text is read when the user reaches the
// toast with the keyboard, so a new toast never interrupts what a screen
// reader is saying.

export type Announcement = {
  id: string
  politeness: 'polite' | 'assertive'
  text: string
}

let counter = 0

function sentence(text: string) {
  return /[.!?…]$/.test(text) ? text : `${text}.`
}

/** "Upload failed. report-q3.pdf is larger than 25 MB." */
export function announcementText(toast: {
  title: string
  description?: string
}) {
  return [toast.title, toast.description]
    .filter((part): part is string => Boolean(part))
    .map(sentence)
    .join(' ')
}

/** An error, said in full. */
export function announcementFor(toast: Toast): Announcement {
  return {
    id: `announcement-${counter++}`,
    politeness: 'assertive',
    text: announcementText(toast),
  }
}

/** "1 new notification", "8 new notifications". */
export function summaryText(count: number) {
  return `${count} new ${count === 1 ? 'notification' : 'notifications'}`
}

/** The count of a burst of information and success toasts. */
export function summaryFor(count: number): Announcement {
  return {
    id: `announcement-${counter++}`,
    politeness: 'polite',
    text: summaryText(count),
  }
}

/** Shown next to the pile while toasts wait for a free slot. */
export function waitingText(count: number) {
  return `${count} more waiting`
}

/** Accessible name of the close button. */
export function dismissLabel(title: string) {
  return `Dismiss: ${title}`
}
