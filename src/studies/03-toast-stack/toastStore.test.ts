import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Announcement } from './announcements'
import { createToastStore, SUMMARY_WINDOW_MS } from './toastStore'
import type { ToastInput } from './toastStore'

const info = (title: string): ToastInput => ({ kind: 'info', title })
const error = (title: string): ToastInput => ({ kind: 'error', title })

function titles(toasts: { title: string }[]) {
  return toasts.map(({ title }) => title)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('bursts', () => {
  it('shows up to three toasts and queues the rest', () => {
    const store = createToastStore(3)
    for (const title of ['a', 'b', 'c', 'd', 'e']) store.show(info(title))

    const { active, queue } = store.getState()
    expect(titles(active)).toEqual(['a', 'b', 'c'])
    expect(titles(queue)).toEqual(['d', 'e'])
  })

  it('moves the next queued toast in when one is dismissed', () => {
    const store = createToastStore(3)
    const ids = ['a', 'b', 'c', 'd'].map((title) => store.show(info(title)))

    store.dismiss(ids[1])

    expect(titles(store.getState().active)).toEqual(['a', 'c', 'd'])
    expect(store.getState().queue).toEqual([])
  })

  it('puts an error ahead of queued toasts that are not errors', () => {
    const store = createToastStore(1)
    store.show(info('a'))
    store.show(info('b'))
    store.show(error('first error'))
    store.show(info('c'))
    store.show(error('second error'))

    expect(titles(store.getState().queue)).toEqual([
      'first error',
      'second error',
      'b',
      'c',
    ])
  })

  it('does not run timers for queued toasts', () => {
    const store = createToastStore(1)
    store.show(info('a'))
    store.show(info('b'))

    vi.advanceTimersByTime(4999)
    expect(titles(store.getState().queue)).toEqual(['b'])

    vi.advanceTimersByTime(1)
    expect(titles(store.getState().active)).toEqual(['b'])
    // The queued toast starts its own five seconds when it becomes active.
    vi.advanceTimersByTime(4999)
    expect(titles(store.getState().active)).toEqual(['b'])
    vi.advanceTimersByTime(1)
    expect(store.getState().active).toEqual([])
  })
})

describe('update in place', () => {
  it('keeps the id and the slot', () => {
    const store = createToastStore()
    store.show(info('a'))
    const id = store.show({ kind: 'progress', title: 'Uploading 3 files…' })
    store.show(info('c'))

    store.update(id, { kind: 'success', title: '3 files uploaded' })

    const { active } = store.getState()
    expect(active.map((toast) => toast.id)).toContain(id)
    expect(titles(active)).toEqual(['a', '3 files uploaded', 'c'])
    expect(active[1].kind).toBe('success')
  })

  it('updates a queued toast without announcing it', () => {
    const store = createToastStore(1)
    const heard: Announcement[] = []
    store.subscribeAnnouncements((announcement) => heard.push(announcement))
    store.show(error('a'))
    const id = store.show({ kind: 'progress', title: 'Uploading…' })

    store.update(id, { kind: 'error', title: 'Upload failed' })

    expect(heard.map(({ text }) => text)).toEqual(['a.'])
    store.dismissAll()
  })

  it('ignores an update for a toast that is gone', () => {
    const store = createToastStore()
    const id = store.show(info('a'))
    store.dismiss(id)
    const listener = vi.fn<() => void>()
    store.subscribe(listener)

    store.update(id, { title: 'late' })

    expect(listener).not.toHaveBeenCalled()
    expect(store.getState().active).toEqual([])
  })

  it('gives the toast a fresh timer when its words change', () => {
    const store = createToastStore()
    const id = store.show({ kind: 'progress', title: 'Uploading…' })
    vi.advanceTimersByTime(60_000)
    expect(store.getState().active).toHaveLength(1)

    store.update(id, { kind: 'success', title: 'Uploaded' })

    vi.advanceTimersByTime(4999)
    expect(store.getState().active).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(store.getState().active).toEqual([])
  })

  it('keeps the timer when only the progress changes', () => {
    const store = createToastStore()
    const id = store.show({ kind: 'info', title: 'Syncing', progress: 0 })
    vi.advanceTimersByTime(3000)

    store.update(id, { progress: 0.5 })

    vi.advanceTimersByTime(2000)
    expect(store.getState().active).toEqual([])
  })
})

describe('timers', () => {
  it('closes an info toast after five seconds and an error after eight', () => {
    const store = createToastStore()
    store.show(info('a'))
    store.show(error('b'))

    vi.advanceTimersByTime(5000)
    expect(titles(store.getState().active)).toEqual(['b'])

    vi.advanceTimersByTime(3000)
    expect(store.getState().active).toEqual([])
  })

  it('resumes with the time that was left after a pause', () => {
    const store = createToastStore()
    store.show(info('a'))

    vi.advanceTimersByTime(3000)
    store.pause('hover')
    vi.advanceTimersByTime(60_000)
    expect(titles(store.getState().active)).toEqual(['a'])

    store.resume('hover')
    vi.advanceTimersByTime(1999)
    expect(titles(store.getState().active)).toEqual(['a'])
    vi.advanceTimersByTime(1)
    expect(store.getState().active).toEqual([])
  })

  it('stays paused until every reason is gone', () => {
    const store = createToastStore()
    store.show(info('a'))

    store.pause('hover')
    store.pause('focus')
    store.resume('hover')
    vi.advanceTimersByTime(60_000)
    expect(titles(store.getState().active)).toEqual(['a'])

    store.resume('focus')
    vi.advanceTimersByTime(5000)
    expect(store.getState().active).toEqual([])
  })

  it('pauses while the tab is hidden and does not fire on return', () => {
    const store = createToastStore()
    store.show(info('a'))
    vi.advanceTimersByTime(4900)

    store.pause('hidden')
    vi.advanceTimersByTime(30_000)
    store.resume('hidden')

    expect(titles(store.getState().active)).toEqual(['a'])
    vi.advanceTimersByTime(100)
    expect(store.getState().active).toEqual([])
  })

  it('does not start the timer of a toast that arrives while paused', () => {
    const store = createToastStore()
    store.pause('hover')
    store.show(info('a'))

    vi.advanceTimersByTime(60_000)
    expect(titles(store.getState().active)).toEqual(['a'])

    store.resume('hover')
    vi.advanceTimersByTime(5000)
    expect(store.getState().active).toEqual([])
  })

  it('does not start the timer of a queued toast that is promoted while paused', () => {
    const store = createToastStore(1)
    const first = store.show(info('a'))
    store.show(info('b'))
    store.pause('focus')

    store.dismiss(first)
    vi.advanceTimersByTime(60_000)
    expect(titles(store.getState().active)).toEqual(['b'])

    store.resume('focus')
    vi.advanceTimersByTime(5000)
    expect(store.getState().active).toEqual([])
  })
})

describe('announcements', () => {
  function listen(store: ReturnType<typeof createToastStore>) {
    const heard: Announcement[] = []
    store.subscribeAnnouncements((announcement) => heard.push(announcement))
    return heard
  }

  const said = (heard: Announcement[]) =>
    heard.map(({ politeness, text }) => [politeness, text])

  it('says an error in full and at once, assertively', () => {
    const store = createToastStore()
    const heard = listen(store)

    store.show({
      kind: 'error',
      title: 'Upload failed',
      description: 'report-q3.pdf is larger than 25 MB.',
    })

    expect(said(heard)).toEqual([
      ['assertive', 'Upload failed. report-q3.pdf is larger than 25 MB.'],
    ])
  })

  it('only counts information and success, once the window has ended', () => {
    const store = createToastStore()
    const heard = listen(store)

    store.show({ kind: 'info', title: 'Link copied' })
    store.show({ kind: 'success', title: 'Draft saved' })
    expect(heard).toEqual([])

    vi.advanceTimersByTime(SUMMARY_WINDOW_MS - 1)
    expect(heard).toEqual([])
    vi.advanceTimersByTime(1)
    expect(said(heard)).toEqual([['polite', '2 new notifications']])
  })

  it('says "1 new notification" for a single toast', () => {
    const store = createToastStore()
    const heard = listen(store)

    store.show(info('Link copied'))
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(said(heard)).toEqual([['polite', '1 new notification']])
  })

  it('groups a burst into one sentence, queued toasts included', () => {
    const store = createToastStore(3)
    const heard = listen(store)

    for (let i = 0; i < 8; i++) {
      store.show(info(`n${i}`))
      vi.advanceTimersByTime(75)
    }
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(said(heard)).toEqual([['polite', '8 new notifications']])
  })

  it('does not count a queued toast again when it moves in', () => {
    const store = createToastStore(1)
    const heard = listen(store)
    const first = store.show(info('a'))
    store.show(info('b'))
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)
    expect(said(heard)).toEqual([['polite', '2 new notifications']])

    store.dismiss(first)
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS * 2)

    expect(heard).toHaveLength(1)
  })

  it('starts a new window for toasts that arrive after the first one ended', () => {
    const store = createToastStore()
    const heard = listen(store)

    store.show(info('a'))
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)
    store.show(info('b'))
    store.show(info('c'))
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(said(heard)).toEqual([
      ['polite', '1 new notification'],
      ['polite', '2 new notifications'],
    ])
  })

  it('keeps errors out of the count and says them straight away', () => {
    const store = createToastStore(4)
    const heard = listen(store)

    store.show(info('a'))
    store.show(error('Upload failed'))
    store.show(info('b'))
    expect(said(heard)).toEqual([['assertive', 'Upload failed.']])

    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)
    expect(said(heard)).toEqual([
      ['assertive', 'Upload failed.'],
      ['polite', '2 new notifications'],
    ])
  })

  it('does not say anything when an upload starts or makes progress', () => {
    const store = createToastStore()
    const heard = listen(store)
    const id = store.show({ kind: 'progress', title: 'Uploading 3 files…' })

    store.update(id, { progress: 0.5 })
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(heard).toEqual([])
  })

  it('counts an upload that succeeds, in place', () => {
    const store = createToastStore()
    const heard = listen(store)
    const id = store.show({ kind: 'progress', title: 'Uploading 3 files…' })

    store.update(id, { progress: 0.7 })
    store.update(id, { kind: 'success', title: '3 files uploaded' })
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(said(heard)).toEqual([['polite', '1 new notification']])
  })

  it('says an upload that fails, in place, as an error', () => {
    const store = createToastStore()
    const heard = listen(store)
    const id = store.show({ kind: 'progress', title: 'Uploading 3 files…' })

    store.update(id, { progress: 0.7 })
    store.update(id, { kind: 'error', title: 'Upload failed' })
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(said(heard)).toEqual([['assertive', 'Upload failed.']])
  })

  it('counts a queued upload that finishes while it waits', () => {
    const store = createToastStore(1)
    const heard = listen(store)
    store.show(error('a'))
    const id = store.show({ kind: 'progress', title: 'Uploading…' })

    store.update(id, { kind: 'success', title: 'Uploaded' })
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS)

    expect(said(heard)).toEqual([
      ['assertive', 'a.'],
      ['polite', '1 new notification'],
    ])
  })

  it('says a queued error when it becomes active, not when it is queued', () => {
    const store = createToastStore(1)
    const heard = listen(store)
    const first = store.show(error('a'))
    store.show(error('b'))
    expect(heard).toHaveLength(1)

    store.dismiss(first)

    expect(heard.map(({ text }) => text)).toEqual(['a.', 'b.'])
  })

  it('drops a count that has not been said when everything is dismissed', () => {
    const store = createToastStore()
    const heard = listen(store)

    store.show(info('a'))
    store.dismissAll()
    vi.advanceTimersByTime(SUMMARY_WINDOW_MS * 2)

    expect(heard).toEqual([])
  })

  it('says the same text twice when it is shown twice', () => {
    const store = createToastStore()
    const heard = listen(store)

    store.show(error('Upload failed'))
    store.show(error('Upload failed'))

    expect(heard).toHaveLength(2)
    expect(heard[0].id).not.toBe(heard[1].id)
  })
})
