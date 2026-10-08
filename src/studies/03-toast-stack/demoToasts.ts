import type { ToastInput, ToastStore } from './toastStore'

// Fake notifications for the demo page. Realistic copy, no network.

const UPLOAD_TITLE = 'Uploading 3 files…'
const UPLOAD_FILES = 'report-q3.pdf, budget.xlsx and notes.md'
const TICK_MS = 100
// A failing upload stops here, so the bar shows how far it got.
const FAIL_AT = 0.7

export type UploadOptions = {
  /** How long the upload takes when it succeeds, in ms. */
  durationMs: number
  fail: boolean
}

/**
 * One toast that follows an upload: progress, then "uploaded" or an error, all
 * in the same toast. If the toast was dismissed on the way, the result still
 * gets shown in a new one, because an error must not be lost.
 * Returns a function that stops the upload.
 */
export function startUpload(
  store: ToastStore,
  { durationMs, fail }: UploadOptions,
): () => void {
  const id = store.show({
    kind: 'progress',
    title: UPLOAD_TITLE,
    description: UPLOAD_FILES,
    progress: 0,
  })
  const startedAt = Date.now()

  function isShown() {
    const { active, queue } = store.getState()
    return [...active, ...queue].some((toast) => toast.id === id)
  }

  function finish(result: ToastInput) {
    if (isShown()) store.update(id, result)
    else store.show(result)
  }

  const interval = setInterval(() => {
    const progress = Math.min(1, (Date.now() - startedAt) / durationMs)
    if (fail && progress >= FAIL_AT) {
      clearInterval(interval)
      finish({
        kind: 'error',
        title: 'Upload failed',
        description:
          'report-q3.pdf is larger than 25 MB. The other 2 files were uploaded.',
        progress: FAIL_AT,
      })
      return
    }
    if (progress >= 1) {
      clearInterval(interval)
      finish({
        kind: 'success',
        title: '3 files uploaded',
        description: UPLOAD_FILES,
        progress: 1,
      })
      return
    }
    if (isShown()) store.update(id, { progress })
  }, TICK_MS)

  return () => clearInterval(interval)
}

const messages: ToastInput[] = [
  {
    kind: 'success',
    title: 'Draft saved',
    description: 'Saved 4 seconds ago.',
  },
  {
    kind: 'info',
    title: 'Link copied',
    description: 'Anyone with the link can view.',
  },
  {
    kind: 'success',
    title: 'Invite sent',
    description: 'Maya Chen will get an email shortly.',
  },
  {
    kind: 'info',
    title: 'Settings updated',
    description: 'Applies to new projects.',
  },
  {
    kind: 'success',
    title: 'Comment posted',
    description: 'On “Q3 launch plan”.',
  },
  {
    kind: 'info',
    title: 'Back online',
    description: 'Your changes are syncing.',
  },
]

let next = 0

/** The next message in a fixed rotation, so a repeated click varies. */
export function nextMessage(): ToastInput {
  return messages[next++ % messages.length]
}

export const errorMessage: ToastInput = {
  kind: 'error',
  title: 'Could not reach the server',
  description: 'Check your connection. We will try again in 30 seconds.',
}

export const longMessage: ToastInput = {
  kind: 'info',
  title: 'Your export is ready',
  description:
    'The file has 12,480 rows and 18 columns. It includes every project you can see, and it was prepared from the data as it was at 09:41. Download it from the Exports page.',
}

/** Shows `count` messages, one every `gapMs`, with one error among them. */
export function burst(store: ToastStore, count = 8, gapMs = 75) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      store.show(i === 4 ? errorMessage : nextMessage())
    }, i * gapMs)
  }
}
