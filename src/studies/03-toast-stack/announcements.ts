import type { Toast } from './toastStore'

// Copy for the live regions. Errors go to the assertive region, everything
// else to the polite one.

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

export function announcementFor(toast: Toast): Announcement {
  return {
    id: `announcement-${counter++}`,
    politeness: toast.kind === 'error' ? 'assertive' : 'polite',
    text: announcementText(toast),
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
